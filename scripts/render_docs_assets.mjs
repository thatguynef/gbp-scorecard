#!/usr/bin/env node
/** Generate the deterministic documentation artwork from the shared visual tokens. */

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "docs", "assets");
fs.mkdirSync(OUT, { recursive: true });

const C = {
  ink: "#0B0B0C",
  surface: "#141416",
  card: "#1C1C1F",
  paper: "#F7F7F5",
  muted: "#A6A6AA",
  red: "#FF3B3B",
  soft: "#FF8F8F",
  green: "#3FBF7F",
  amber: "#F5C766",
};

const svg = (width, height, title, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="92%" cy="0%" r="80%">
      <stop offset="0" stop-color="${C.red}" stop-opacity="0.24"/>
      <stop offset="1" stop-color="${C.red}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${body}
</svg>
`;

const banner = svg(1200, 320, "GBP Scorecard — find where the public profile leaks ready local customers", `
  <rect width="1200" height="320" fill="${C.ink}"/>
  <rect width="1200" height="320" fill="url(#grid)"/>
  <rect width="1200" height="320" fill="url(#glow)"/>
  <g transform="translate(64 56)">
    <path d="M18 0C8.1 0 0 8.1 0 18c0 13.5 18 34 18 34s18-20.5 18-34C36 8.1 27.9 0 18 0Z" fill="${C.red}"/>
    <circle cx="18" cy="18" r="6" fill="${C.ink}"/>
  </g>
  <text x="120" y="92" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="15" letter-spacing="4">GBP SCORECARD</text>
  <text x="64" y="166" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="48" font-weight="700" letter-spacing="-1.8">Find where the public profile</text>
  <text x="64" y="218" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="48" font-weight="700" letter-spacing="-1.8">leaks ready local customers.</text>
  <text x="64" y="270" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18">Identity · Services · Reputation · Content · Conversion · Handoff · Measurement</text>
  <text x="1136" y="270" text-anchor="end" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="2">PUBLIC MODE</text>
`);

const journeyStages = [
  ["1", "Identify"],
  ["2", "Understand"],
  ["3", "Trust"],
  ["4", "Act"],
  ["5", "Handoff"],
  ["6", "Response"],
  ["7", "Book"],
  ["8", "Customer"],
  ["9", "Review"],
  ["10", "Measure"],
];
let journeyBoxes = "";
journeyStages.forEach(([number, label], index) => {
  const row = index < 5 ? 0 : 1;
  const col = index % 5;
  const x = 56 + col * 220;
  const y = 82 + row * 116;
  const scored = ["1", "2", "3", "4", "5", "10"].includes(number);
  journeyBoxes += `
    <rect x="${x}" y="${y}" width="190" height="82" rx="10" fill="${C.card}" stroke="${scored ? C.red : "#2A2A2E"}" stroke-opacity="${scored ? "0.65" : "1"}"/>
    <text x="${x + 16}" y="${y + 24}" fill="${scored ? C.soft : C.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" letter-spacing="2">${number.padStart(2, "0")} · ${scored ? "SCORED" : "OWNER DATA"}</text>
    <text x="${x + 16}" y="${y + 56}" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="23" font-weight="600">${label}</text>
  `;
});
const journey = svg(1200, 330, "The GBP customer journey from identify through measure, with owner-data stages marked", `
  <rect width="1200" height="330" fill="${C.ink}"/>
  <rect width="1200" height="330" fill="url(#grid)"/>
  <text x="56" y="44" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="3">THE PUBLIC PROFILE JOURNEY</text>
  ${journeyBoxes}
`);

const preview = svg(1200, 820, "Synthetic Acme Plumbing GBP report showing 68 out of 100 and three labeled findings", `
  <rect width="1200" height="820" fill="${C.ink}"/>
  <rect width="1200" height="820" fill="url(#grid)"/>
  <rect x="36" y="36" width="1128" height="748" rx="18" fill="${C.surface}" stroke="#2A2A2E"/>
  <text x="76" y="90" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="3">SYNTHETIC SAMPLE REPORT</text>
  <text x="76" y="138" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="34" font-weight="700">Google Business Profile Scorecard</text>
  <text x="76" y="176" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18">Acme Plumbing (synthetic) · Example County, CA</text>
  <rect x="76" y="208" width="300" height="150" rx="12" fill="${C.card}" stroke="#2A2A2E"/>
  <text x="100" y="268" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="68" font-weight="700">68</text>
  <text x="204" y="266" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="20">/ 100</text>
  <text x="100" y="306" fill="${C.amber}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="2">C · AVERAGE</text>
  <text x="100" y="334" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14">Public profile score</text>
  <g transform="translate(408 208)">
    <text x="0" y="20" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="2">THE THREE BIGGEST REVENUE LEAKS</text>
    <rect x="0" y="42" width="680" height="94" rx="10" fill="${C.card}" stroke="#2A2A2E"/>
    <text x="20" y="72" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="19" font-weight="600">No direct booking action on the profile</text>
    <text x="20" y="104" fill="${C.green}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="1">VERIFIED</text>
    <text x="150" y="104" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13">A ready customer can call, but cannot book.</text>
    <rect x="0" y="150" width="680" height="94" rx="10" fill="${C.card}" stroke="#2A2A2E"/>
    <text x="20" y="180" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="19" font-weight="600">After-hours demand has no next step</text>
    <text x="20" y="212" fill="${C.amber}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="1">STRONG SIGNAL</text>
    <text x="180" y="212" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13">Hours end at 7pm; no path after that.</text>
    <rect x="0" y="258" width="680" height="94" rx="10" fill="${C.card}" stroke="#2A2A2E"/>
    <text x="20" y="288" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="19" font-weight="600">Speed-to-lead is unknown</text>
    <text x="20" y="320" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="1">OWNER DATA REQUIRED</text>
    <text x="238" y="320" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13">A question for the phone and CRM, not a score penalty.</text>
  </g>
  <g transform="translate(76 500)">
    <text x="0" y="0" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="2">SCORE BREAKDOWN</text>
    ${["Identity & Accuracy|15|13", "Relevance & Services|18|14", "Conversion & Actionability|22|15", "Reputation & Trust|20|12", "Content & Freshness|10|6", "Handoff & Continuity|10|8", "Measurement|5|2"].map((row, index) => {
      const [name, max, score] = row.split("|");
      const x = (index % 4) * 260;
      const y = 28 + Math.floor(index / 4) * 74;
      return `<g transform="translate(${x} ${y})">
        <rect width="238" height="58" rx="8" fill="${C.card}"/>
        <text x="14" y="23" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12">${name}</text>
        <text x="14" y="46" fill="${C.paper}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="17">${score} / ${max}</text>
      </g>`;
    }).join("")}
  </g>
  <text x="76" y="752" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12">Synthetic example. Not a real business. Public Mode · Evidence first · Owner data separate.</text>
`);

const social = svg(1200, 630, "GBP Scorecard — evidence-based diagnosis for local home-service profiles", `
  <rect width="1200" height="630" fill="${C.ink}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="72" y="120" fill="${C.soft}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="16" letter-spacing="4">GBP SCORECARD</text>
  <text x="72" y="240" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="64" font-weight="700" letter-spacing="-2">Does the public profile</text>
  <text x="72" y="316" fill="${C.paper}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="64" font-weight="700" letter-spacing="-2">create trust and enable action?</text>
  <text x="72" y="392" fill="${C.muted}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="22">100 points · 7 categories · evidence states · deterministic caps</text>
  <rect x="72" y="440" width="310" height="54" rx="8" fill="${C.red}"/>
  <text x="227" y="474" text-anchor="middle" fill="${C.ink}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18" font-weight="700">Diagnose the profile</text>
  <text x="72" y="552" fill="${C.muted}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="2">SYNTHETIC EXAMPLES · PUBLIC MODE · NO CREDENTIALS IN ARTIFACTS</text>
`);

const logo = svg(64, 64, "GBP Scorecard", `
  <rect width="64" height="64" rx="14" fill="${C.ink}"/>
  <path d="M32 12c-8 0-14 6-14 14 0 10.5 14 26 14 26s14-15.5 14-26c0-8-6-14-14-14Z" fill="${C.red}"/>
  <circle cx="32" cy="26" r="5" fill="${C.ink}"/>
`);
const favicon = svg(32, 32, "GBP Scorecard", `
  <rect width="32" height="32" rx="8" fill="${C.ink}"/>
  <path d="M16 5c-4.4 0-8 3.6-8 8 0 5.8 8 14 8 14s8-8.2 8-14c0-4.4-3.6-8-8-8Z" fill="${C.red}"/>
  <circle cx="16" cy="13" r="2.8" fill="${C.ink}"/>
`);

const sanitizeSvg = (content) =>
  content
    .replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, "&amp;")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");
const files = {
  "banner.svg": banner,
  "journey.svg": journey,
  "scorecard-preview.svg": preview,
  "social-preview.svg": social,
  "logo.svg": logo,
  "favicon.svg": favicon,
};
let stale = 0;
for (const [file, content] of Object.entries(files)) {
  const out = path.join(OUT, file);
  const rendered = sanitizeSvg(content).trimStart();
  if (process.argv.includes("--check")) {
    const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (current !== rendered) {
      console.error(`stale docs/assets/${file}`);
      stale += 1;
    } else {
      console.log(`ok docs/assets/${file}`);
    }
  } else {
    fs.writeFileSync(out, rendered, "utf8");
    console.log(`wrote docs/assets/${file}`);
  }
}
if (stale) {
  console.error(`\n${stale} stale asset(s). Run: node scripts/render_docs_assets.mjs`);
  process.exit(1);
}
if (process.argv.includes("--check")) console.log("ok: documentation assets are current");
