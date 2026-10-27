#!/usr/bin/env node
/**
 * Public-mode collector for the GBP Scorecard.
 *
 * Fixture mode performs no network access and needs no credentials. Live mode
 * uses the Google Places API (New) and a non-destructive destination fetch.
 * The collector never logs, stores, or passes credentials to artifacts.
 *
 *   node collect.mjs --fixture scripts/fixtures/acme-plumbing.raw.json
 *   GOOGLE_MAPS_API_KEY=... node collect.mjs --business "Example Co." --trade plumbing --city "Example City, CA"
 *
 * Non-destructive: no form submission, booking, call, text, post, reply, or profile mutation.
 */

import dns from "node:dns/promises";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const COLLECTOR_VERSION = "1.0.0";
const PLACES_BASE = "https://places.googleapis.com/v1";
const USER_AGENT = "gbp-scorecard/1.0 (+https://github.com/thatguynef/gbp-scorecard)";
const MAX_BODY = 256 * 1024;
const MAX_API_BODY = 2 * 1024 * 1024;

const HELP = `GBP Scorecard public collector ${COLLECTOR_VERSION}

Usage:
  node collect.mjs --fixture <raw.json> [--out <dir>] [--run-id <id>]
  GOOGLE_MAPS_API_KEY=... node collect.mjs --business <name> --trade <trade> --city <city> [options]

Required for live mode:
  --business <name>        Business name for search
  --trade <trade>          Trade, e.g. plumbing, hvac, roofing
  --city <city>            City or market
  --place-id <id>          Skip search and fetch this place directly

Recommended:
  --config <json>          Applicability configuration (see config/market.example.json)
  --website <url>          Override the destination only if the profile has no website
  --state <state>          Appended to the city in the search query
  --out <dir>              Output directory (default: .audit/<slug>/<run-id>)
  --run-id <id>            Run id (default: local date-time)

Modes:
  --fixture <path>         Read synthetic observations; zero network and zero credentials
  --mode public            Only public mode is implemented in V1

Environment:
  GOOGLE_MAPS_API_KEY      Places API (New) key; never written to disk
  GBP_PLACES_TIMEOUT_MS    Request timeout, default 10000
  GBP_DESTINATION_TIMEOUT_MS Destination timeout, default 10000

Non-destructive by design. The destination inspects HTTP metadata only.
`;

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = process.argv[i + 1];
  if (value === undefined || value.startsWith("--")) return true;
  return value;
}
const has = (name) => process.argv.includes(`--${name}`);

if (has("help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

const fixturePath = arg("fixture");
if (fixturePath === true) {
  console.error("error: --fixture requires a path");
  process.exit(2);
}
const mode = String(arg("mode", "public"));
if (mode !== "public") {
  console.error("error: only --mode public is implemented in V1. Connected/authorized mode is a documented future mode; it must never silently alter the public score.");
  process.exit(2);
}

const numericEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 1000 ? Math.floor(value) : fallback;
};
const PLACES_TIMEOUT_MS = numericEnv("GBP_PLACES_TIMEOUT_MS", 10000);
const DESTINATION_TIMEOUT_MS = numericEnv("GBP_DESTINATION_TIMEOUT_MS", 10000);

const localRunId = (now = new Date()) =>
  new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace(/:/g, "");
const RUN_ID = String(arg("run-id", localRunId()));
const nowIso = new Date().toISOString();

const RUBRIC_PATH = path.join(import.meta.dirname, "..", "references", "rubric.json");
const RUBRIC = JSON.parse(fs.readFileSync(RUBRIC_PATH, "utf8"));

const DEFAULT_CONFIG = {
  trade: "",
  market: "",
  service_business: true,
  online_booking_expected: false,
  messaging_expected: false,
  emergency_service: false,
  physical_storefront: false,
  after_hours_expected: false,
  content_posts_expected: false,
  preferred_actions: ["call", "website"],
};

function loadConfig(configPath, trade, market) {
  const config = { ...DEFAULT_CONFIG, trade, market };
  if (configPath && configPath !== true) {
    try {
      const loaded = JSON.parse(fs.readFileSync(path.resolve(configPath), "utf8"));
      for (const key of Object.keys(DEFAULT_CONFIG)) {
        if (key in loaded) config[key] = loaded[key];
      }
    } catch (error) {
      console.error(`error: could not read --config: ${error.message}`);
      process.exit(2);
    }
  }
  for (const key of [
    "service_business",
    "online_booking_expected",
    "messaging_expected",
    "emergency_service",
    "physical_storefront",
    "after_hours_expected",
    "content_posts_expected",
  ]) {
    if (typeof config[key] !== "boolean") {
      console.error(`error: configuration.${key} must be a boolean`);
      process.exit(2);
    }
  }
  if (!Array.isArray(config.preferred_actions) || !config.preferred_actions.length) {
    console.error("error: configuration.preferred_actions must be a non-empty array");
    process.exit(2);
  }
  return config;
}

function slugFrom(value) {
  return String(value || "business")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "business";
}

function assertPublicHttpUrl(raw, label) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (error) {
    throw new Error(`${label} is not a valid URL`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`${label} must use http or https`);
  if (parsed.username || parsed.password) throw new Error(`${label} must not contain credentials`);
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error(`${label} must not target a local host`);
  }
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error(`${label} must not target a private or reserved IP`);
  }
  return parsed;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10 || parts[0] === 127 || parts[0] === 0) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    if (parts[0] >= 224) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    if (normalized === "::1" || normalized === "::") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
    if (normalized.startsWith("::ffff:")) return isPrivateIp(normalized.slice(7));
    return false;
  }
  return false;
}

async function assertPublicDns(host, label) {
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error(`${label} resolves to a private or reserved address`);
    return;
  }
  let records;
  try {
    records = await dns.lookup(host, { all: true });
  } catch {
    throw new Error(`${label} hostname could not be resolved`);
  }
  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new Error(`${label} resolves to a private or reserved address`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readBounded(response, limit) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (received + value.byteLength > limit) {
        chunks.push(value.slice(0, limit - received));
        received = limit;
        await reader.cancel();
        break;
      }
      chunks.push(value);
      received += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

async function fetchBounded(url, options = {}, timeoutMs = 10000, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          ...(options.headers || {}),
        },
      });
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < retries) {
          await sleep(300 * 3 ** attempt);
          continue;
        }
      }
      return response;
    } catch (error) {
      lastError = error.name === "AbortError" ? new Error("request timed out") : error;
      if (attempt < retries) await sleep(300 * 3 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error("request failed");
}

function source(id, type, endpoint, completeness) {
  const record = {
    id,
    type,
    collected_at: nowIso,
    collector_version: COLLECTOR_VERSION,
    field_completeness: completeness,
  };
  if (endpoint) record.endpoint = endpoint;
  return record;
}

async function placesRequest(pathname, options, fieldMask) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set. Live mode needs a Places API (New) key; fixture mode needs none.");
  }
  const response = await fetchBounded(
    `${PLACES_BASE}${pathname}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
        ...(options.headers || {}),
      },
    },
    PLACES_TIMEOUT_MS,
    2,
  );
  if (!response.ok) {
    throw new Error(`Places API request failed (HTTP ${response.status}). Check API enablement, key restrictions, and quota.`);
  }
  const text = await readBounded(response, MAX_API_BODY);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Places API returned a non-JSON or oversized response.");
  }
}

const DETAILS_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "shortFormattedAddress",
  "types",
  "primaryType",
  "primaryTypeDisplayName",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours",
  "currentOpeningHours",
  "businessStatus",
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "photos",
  "reviews",
  "editorialSummary",
  "priceLevel",
  "location",
].join(",");

const SEARCH_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.primaryTypeDisplayName",
  "places.businessStatus",
  "places.rating",
  "places.userRatingCount",
].join(",");

function textOf(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.text || "";
}

function serviceTerms(text) {
  if (!text) return [];
  const terms = [
    "drain", "water heater", "leak", "repipe", "re-pipe", "sewer", "toilet", "faucet",
    "hvac", "furnace", "air conditioning", "roof", "gutter", "electrical", "panel",
    "pest", "termite", "garage door", "landscaping", "cleaning", "restoration",
    "emergency", "installation", "repair", "maintenance",
  ];
  const lower = String(text).toLowerCase();
  return [...new Set(terms.filter((term) => lower.includes(term)))].slice(0, 8);
}

async function searchPlace(business, trade, market) {
  const body = {
    textQuery: [business, trade, market].filter(Boolean).join(" "),
    pageSize: 3,
  };
  const response = await placesRequest("/places:searchText", {
    method: "POST",
    body: JSON.stringify(body),
  }, SEARCH_MASK);
  const places = response.places || [];
  if (!places.length) throw new Error("Places search returned no match. Check the business name and market.");
  return places[0];
}

async function placeDetails(placeId) {
  return placesRequest(`/places/${encodeURIComponent(placeId)}`, { method: "GET" }, DETAILS_MASK);
}

async function inspectDestination(rawUrl) {
  const parsed = assertPublicHttpUrl(rawUrl, "destination");
  await assertPublicDns(parsed.hostname, "destination");
  const result = {
    https: parsed.protocol === "https:",
    resolves: false,
    final_url: parsed.href,
    status: null,
    identity_match: null,
    destination_title: "",
    notes: "",
    source_parameter: null,
  };
  for (const [key, value] of parsed.searchParams.entries()) {
    if (/^(utm_source|source|src|ref)$/i.test(key)) {
      result.source_parameter = key;
      break;
    }
  }
  let current = parsed;
  for (let hop = 0; hop < 4; hop += 1) {
    const response = await fetchBounded(current.href, {
      method: "GET",
      headers: { Accept: "text/html,application/xhtml+xml" },
    }, DESTINATION_TIMEOUT_MS, 1);
    result.status = response.status;
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      const next = new URL(location, current);
      assertPublicHttpUrl(next.href, "destination redirect");
      await assertPublicDns(next.hostname, "destination redirect");
      current = next;
      result.final_url = current.href;
      result.https = result.https && current.protocol === "https:";
      continue;
    }
    result.resolves = response.status >= 200 && response.status < 400;
    if (!result.https) {
      result.notes = "Destination is served over HTTP rather than HTTPS.";
      return result;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      result.notes = `Destination returned ${contentType || "an unknown content type"}; no HTML identity inspection was possible.`;
      return result;
    }
    const html = await readBounded(response, MAX_BODY);
    result.destination_title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim().slice(0, 200);
    result.notes = "Non-destructive HTTP metadata inspection only; no form, booking, call, or message was submitted.";
    return result;
  }
  result.resolves = false;
  result.notes = "Destination exceeded the redirect limit or returned no usable response.";
  return result;
}

function buildActions(place, destination) {
  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";
  const website = place.websiteUri || "";
  return {
    phone: { present: Boolean(phone), usable: Boolean(phone), number: phone },
    website: {
      present: Boolean(website),
      usable: Boolean(website && destination?.resolves && destination?.https),
      url: website,
      destination_state: website ? (destination?.resolves ? "resolves" : "dead") : "missing",
    },
    booking: { present: null, usable: null, is_primary: null, url: null, destination_state: "not_observed" },
    messaging: { present: null, usable: null, url: null },
    directions: { present: null, usable: null, url: null },
    other: { present: null, usable: null, label: null },
  };
}

function buildObservations(place, destination) {
  const reviews = (place.reviews || []).map((review) => ({
    rating: Number(review.rating) || 0,
    published_at: review.publishTime || "",
    owner_response: null,
    owner_response_at: null,
    service_terms: serviceTerms(review.text?.text || review.originalText?.text || ""),
  }));
  return {
    profile: {
      business_status: place.businessStatus || "UNKNOWN",
      name: textOf(place.displayName),
      primary_category: textOf(place.primaryTypeDisplayName) || place.primaryType || "",
      additional_categories: Array.isArray(place.types) ? place.types.slice(0, 12) : [],
      description: textOf(place.editorialSummary),
      attributes: [],
      regular_hours: place.regularOpeningHours?.weekdayDescriptions || [],
      location_mode: place.formattedAddress ? "storefront" : "unknown",
    },
    actions: buildActions(place, destination),
    handoff: {
      https: Boolean(destination?.https),
      resolves: Boolean(destination?.resolves),
      final_url: destination?.final_url || "",
      identity_match: null,
      destination_title: destination?.destination_title || "",
      notes: destination?.notes || "No destination was available to inspect.",
    },
    reviews: {
      rating: typeof place.rating === "number" ? place.rating : null,
      count: typeof place.userRatingCount === "number" ? place.userRatingCount : 0,
      owner_response_count: null,
      distribution: {},
      sample: reviews,
    },
    media: {
      count: Array.isArray(place.photos) ? place.photos.length : 0,
      business_owned_count: null,
      recent_count: null,
      categories: [],
    },
    measurement: {
      website_source_parameter: destination?.source_parameter || null,
      booking_source_parameter: null,
      notes: "Source parameters are observable only when present in a public action URL.",
    },
  };
}

function rawChecks(config, observations) {
  const checks = {};
  const notes = [];
  const websitePresent = Boolean(observations?.actions?.website?.present);
  const websiteResolves = Boolean(observations?.actions?.website?.usable);
  const bookingPresent = observations?.actions?.booking?.present === true;
  const bookingResolves = observations?.actions?.booking?.usable === true;
  const requirements = {
    website_present: websitePresent,
    website_resolves: websiteResolves,
    booking_present: bookingPresent,
    booking_resolves: bookingResolves,
  };
  for (const item of RUBRIC.items) {
    const conditionalOff = item.applicability === "conditional" && !config[item.condition];
    const structurallyOff = item.requires && requirements[item.requires] === false;
    if (conditionalOff || structurallyOff) {
      checks[item.id] = {
        applicable: false,
        score: null,
        confidence: "not_applicable",
        needs_review: false,
        na_reason: conditionalOff
          ? `condition not enabled: ${item.condition}`
          : `not observable: ${item.requires}`,
        evidence: [],
        evidence_refs: [],
      };
      continue;
    }
    checks[item.id] = {
      applicable: item.applicability === "conditional" ? true : null,
      score: null,
      confidence: "needs_review",
      needs_review: true,
      evidence: [],
      evidence_refs: [],
      notes: "Review the public profile and destination, then record a score, evidence, evidence_refs, and confidence.",
    };
    notes.push(`${item.id}: ${item.evidence}`);
  }
  return { checks, notes };
}

async function liveCollect() {
  const business = String(arg("business", ""));
  const trade = String(arg("trade", ""));
  const city = String(arg("city", ""));
  const state = String(arg("state", ""));
  const market = String(arg("market", city ? [city, state].filter(Boolean).join(", ") : ""));
  if (!business || !trade || (!city && !arg("place-id"))) {
    console.error("error: live mode requires --business, --trade, and either --city or --place-id");
    process.exit(2);
  }
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error("error: GOOGLE_MAPS_API_KEY is not set. Set it in your shell; never put it in a tracked file.");
    process.exit(2);
  }
  const config = loadConfig(arg("config"), trade, market);
  let place;
  let match;
  if (arg("place-id")) {
    place = await placeDetails(String(arg("place-id")));
    match = { id: place.id, displayName: place.displayName };
  } else {
    match = await searchPlace(business, trade, market);
    place = await placeDetails(match.id);
  }
  const website = String(arg("website", place.websiteUri || ""));
  let destination = null;
  if (website) {
    try {
      destination = await inspectDestination(website);
    } catch (error) {
      destination = {
        https: website.startsWith("https://"),
        resolves: false,
        final_url: website,
        status: null,
        identity_match: null,
        destination_title: "",
        notes: `Destination not inspected: ${error.message}`,
        source_parameter: null,
      };
    }
  }
  const observations = buildObservations(place, destination);
  const sources = [
    source("places", "places_api", `${PLACES_BASE}/places/${encodeURIComponent(place.id || match.id)}`, 84),
  ];
  if (website) {
    sources.push(source("destination", "destination_http", destination?.final_url || website, destination?.resolves ? 72 : 30));
  }
  return {
    business: {
      name: textOf(place.displayName) || business,
      trade,
      market,
      place_id: place.id || match.id,
      website,
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      address: place.formattedAddress || "",
    },
    configuration: config,
    observations,
    sources,
    synthetic: false,
    sourceMode: "live",
    notes: [
      "Places API does not expose the full services list, attributes, owner responses, posts, or all action types. Review those on the public profile before scoring.",
      "Places API does not expose a booking action. Absence from the API is not evidence that booking is absent.",
      "No destination form, booking, call, text, or message was submitted.",
    ],
  };
}

function fixtureCollect() {
  let fixture;
  try {
    fixture = JSON.parse(fs.readFileSync(path.resolve(fixturePath), "utf8"));
  } catch (error) {
    console.error(`error: could not read --fixture: ${error.message}`);
    process.exit(2);
  }
  if (!fixture.business || !fixture.configuration || !fixture.observations) {
    console.error("error: fixture must contain business, configuration, and observations");
    process.exit(2);
  }
  if (fixture.synthetic !== true) {
    console.error("error: a tracked fixture must set synthetic=true");
    process.exit(2);
  }
  const sources = Array.isArray(fixture.sources) && fixture.sources.length
    ? fixture.sources.map((entry) => ({
        ...entry,
        collected_at: entry.collected_at || fixture.collected_at || "2026-01-01T00:00:00Z",
        collector_version: entry.collector_version || COLLECTOR_VERSION,
      }))
    : [source("fixture", "fixture", null, 100)];
  return {
    business: fixture.business,
    configuration: fixture.configuration,
    observations: fixture.observations,
    sources,
    synthetic: true,
    sourceMode: "fixture",
    notes: fixture.notes || [
      "Synthetic fixture. No network access, no credentials, no production data.",
      "Checks remain unset until a reviewer fills the worksheet.",
    ],
    startedAt: fixture.collected_at || "2026-01-01T00:00:00Z",
    runId: RUN_ID,
  };
}

async function main() {
  const collected = fixturePath ? fixtureCollect() : await liveCollect();
  const slug = slugFrom(collected.business.name || collected.business.place_id || "business");
  const outArg = arg("out", path.join(".audit", slug, RUN_ID));
  if (outArg === true) {
    console.error("error: --out requires a path");
    process.exit(2);
  }
  const outDir = path.resolve(outArg);
  fs.mkdirSync(outDir, { recursive: true });

  const { checks, notes } = rawChecks(collected.configuration, collected.observations);
  const startedAt = collected.startedAt || nowIso;
  const audit = {
    schema_version: "1.0",
    audit_mode: "public",
    run: {
      run_id: RUN_ID,
      started_at: startedAt,
      finished_at: collected.sourceMode === "fixture" ? startedAt : nowIso,
      collector_version: COLLECTOR_VERSION,
      rubric_version: RUBRIC.version,
      source_mode: collected.sourceMode,
      synthetic: collected.synthetic,
    },
    business: collected.business,
    configuration: collected.configuration,
    sources: collected.sources,
    observations: collected.observations,
    review: {
      status: "pending",
      notes: [...collected.notes, ...notes],
    },
    checks,
  };
  const run = {
    run_id: RUN_ID,
    schema_version: "1.0",
    audit_mode: "public",
    source_mode: collected.sourceMode,
    synthetic: collected.synthetic,
    collector_version: COLLECTOR_VERSION,
    rubric_version: RUBRIC.version,
    started_at: startedAt,
    finished_at: collected.sourceMode === "fixture" ? startedAt : nowIso,
    business: collected.business,
    sources: collected.sources.map((entry) => ({ id: entry.id, type: entry.type, field_completeness: entry.field_completeness })),
    non_destructive: true,
    review_required: true,
  };

  fs.writeFileSync(path.join(outDir, "audit.json"), JSON.stringify(audit, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outDir, "run.json"), JSON.stringify(run, null, 2) + "\n", "utf8");
  console.log(`wrote ${path.join(outDir, "audit.json")}`);
  console.log(`wrote ${path.join(outDir, "run.json")}`);
  if (collected.sourceMode === "fixture") {
    console.log("fixture mode: no network, no credentials, checks pending review");
  } else {
    console.log("live public mode: Places API + non-destructive destination inspection; checks pending review");
  }
  console.log("Next: review the public profile and destination, fill checks, facts, evidence, and confidence, then score.");
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
