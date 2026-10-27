#!/usr/bin/env node
/**
 * Render a GBP Scorecard one-pager or full report from scores.json + content.json.
 *
 * The renderer owns the tables, IDs, and score strings. content.json owns the
 * prose. A leaked finding with no check ID, an unsupported check, a confidence
 * mismatch, or a fix that claims more points than are recoverable is rejected.
 *
 *   node render.mjs --scores scores.json --content content.json --out one-page.md
 *   node render.mjs --mode full --scores scores.json --content content.json --out full-report.md
 */

import fs from "node:fs";
import path from "node:path";

const HELP = `GBP Scorecard renderer 1.0.0

Usage:
  node render.mjs --scores <json> --content <json> --out <md> [options]

Required:
  --scores <json>     scores.json from score.py
  --content <json>    Reviewer/model prose, leak IDs, fixes, journey notes
  --out <md>          Output Markdown file

Optional:
  --mode one-page|full  Default: one-page
  --template <md>       Override the default template
  --help                Show this help

The renderer never invents business facts.
`;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = process.argv[i + 1];
  if (value === undefined || value.startsWith("--")) return true;
  return value;
}
const scoresPath = arg("scores");
const contentPath = arg("content");
const outPath = arg("out");
const mode = String(arg("mode", "one-page"));
if (!scoresPath || !contentPath || !outPath) {
  console.error("error: --scores, --content, and --out are required");
  process.exit(2);
}
if (!["one-page", "full"].includes(mode)) {
  console.error("error: --mode must be one-page or full");
  process.exit(2);
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
let scores;
let content;
try {
  scores = readJson(scoresPath);
  content = readJson(contentPath);
} catch (error) {
  console.error(`error: could not read input JSON: ${error.message}`);
  process.exit(2);
}
if (scores.schema_version !== "1.0" || scores.framework !== "gbp-journey") {
  console.error("error: unsupported scores schema; expected GBP Scorecard 1.0");
  process.exit(2);
}

const errors = [];
const checks = new Map((scores.checks || []).map((check) => [check.id, check]));
const ownerIds = new Set((scores.ownerDataRequired || []).map((entry) => entry.id));
const opportunityIds = new Set((scores.opportunities || []).map((entry) => entry.id));
const stageLabels = new Map((scores.journey || []).map((stage) => [stage.label.toLowerCase(), stage]));
const escapeCell = (value) => String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
const escapeInline = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const confidenceLabel = (value) => String(value || "").replaceAll("_", " ").toUpperCase();
const stageName = (value) =>
  ({
    identify: "Identify",
    understand: "Understand",
    trust: "Trust",
    act: "Act",
    handoff: "Handoff",
    response: "Response",
    book: "Book",
    customer: "Customer",
    review: "Review",
    measure: "Measure",
  }[value] || String(value || "—"));
const statusLabel = (value) =>
  ({
    scored: "Scored",
    scored_plus_owner_data: "Scored + owner data",
    owner_data_required: "Owner data required",
    observed_unscored: "Observed, not scored",
    conditional: "Conditional",
    diagnostic: "Diagnostic",
    not_applicable: "Not applicable",
  }[value] || String(value || "").replaceAll("_", " "));

function scoreValue(check) {
  return check.applicable ? `${check.score}/${check.max}` : "N/A";
}

function validateContent() {
  if (!content.client || !content.verdict || !content.date) errors.push("content needs client, verdict, and date");
  const leaks = content.leaks;
  if (!Array.isArray(leaks) || leaks.length !== 3) errors.push("content.leaks must contain exactly three findings");
  for (const [index, leak] of (leaks || []).entries()) {
    const label = leak.title || `leak ${index + 1}`;
    if (!leak.title || !leak.what || !leak.evidence || !leak.why || !leak.fix) {
      errors.push(`${label}: title, what, evidence, why, and fix are required`);
    }
    if (leak.checkId && leak.ownerDataId) errors.push(`${label}: use checkId or ownerDataId, not both`);
    if (!leak.checkId && !leak.ownerDataId) errors.push(`${label}: a checkId or ownerDataId is required`);
    if (leak.checkId) {
      const check = checks.get(leak.checkId);
      if (!check) errors.push(`${label}: unknown checkId ${leak.checkId}`);
      else {
        if (!check.applicable) errors.push(`${label}: ${leak.checkId} is not applicable and cannot be a leak`);
        if (check.lost <= 0) errors.push(`${label}: ${leak.checkId} has no lost points`);
        if (leak.confidence && leak.confidence !== check.confidence) {
          errors.push(`${label}: confidence ${leak.confidence} does not match ${check.confidence}`);
        }
      }
    }
    if (leak.ownerDataId && !ownerIds.has(leak.ownerDataId)) {
      errors.push(`${label}: unknown ownerDataId ${leak.ownerDataId}`);
    }
    if (leak.ownerDataId && leak.confidence && leak.confidence !== "owner_data_required") {
      errors.push(`${label}: an owner-data leak must use confidence owner_data_required`);
    }
  }
  for (const [index, fix] of (content.fixes || []).entries()) {
    const label = fix.fix || `fix ${index + 1}`;
    if (!fix.fix || !Array.isArray(fix.checks) || !fix.checks.length) {
      errors.push(`${label}: fix text and check IDs are required`);
      continue;
    }
    let recoverable = 0;
    for (const cid of fix.checks) {
      const check = checks.get(cid);
      if (!check) errors.push(`${label}: unknown check ${cid}`);
      else recoverable += check.lost;
    }
    if (!Number.isInteger(fix.points) || fix.points < 0) errors.push(`${label}: points must be a non-negative integer`);
    if (fix.points > recoverable) errors.push(`${label}: claims +${fix.points} but only ${recoverable} points are recoverable`);
    if (!["S", "M", "L"].includes(fix.effort)) errors.push(`${label}: effort must be S, M, or L`);
  }
  for (const [index, opportunity] of (content.opportunities || []).entries()) {
    if (!opportunityIds.has(opportunity.id)) errors.push(`opportunity ${index + 1}: unknown id ${opportunity.id}`);
    if (!opportunity.why) errors.push(`opportunity ${index + 1}: why is required`);
  }
  for (const finding of content.findings || []) {
    if (!checks.has(finding.id)) errors.push(`finding: unknown check ${finding.id}`);
  }
  if (errors.length) {
    for (const error of errors) console.error(`error: ${error}`);
    console.error(`\n${errors.length} content error(s); no report written.`);
    process.exit(1);
  }
}
validateContent();

function leakBlocks() {
  return content.leaks
    .map((leak, index) => {
      const lines = [`### ${index + 1}. ${escapeInline(leak.title)}`, ""];
      if (leak.stage) lines.push(`**Stage:** ${escapeInline(leak.stage)}`);
      if (leak.checkId) lines.push(`**Check:** ${leak.checkId}`);
      if (leak.ownerDataId) lines.push(`**Owner data:** ${leak.ownerDataId} · **Not scored**`);
      lines.push("");
      lines.push(`**What is happening:** ${escapeInline(leak.what)}`);
      lines.push("");
      lines.push(`**Evidence:** ${escapeInline(leak.evidence)}`);
      lines.push("");
      lines.push(`**Why it matters:** ${escapeInline(leak.why)}`);
      lines.push("");
      lines.push(`**Fix:** ${escapeInline(leak.fix)}`);
      lines.push("");
      lines.push(`**Confidence:** ${confidenceLabel(leak.confidence)}`);
      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

function journeyTable() {
  const supplied = new Map((content.journey || []).map((row) => [String(row.stage || "").toLowerCase(), row]));
  const lines = ["| Stage | Status | What was observed |", "|---|---|---|"];
  for (const stage of scores.journey || []) {
    const custom = supplied.get(stage.label.toLowerCase()) || {};
    const status = custom.status || stage.status;
    const summary = custom.summary || (stage.percent !== null ? `${stage.percent}% of applicable points` : "Not scored from public data");
    lines.push(`| ${stage.label} | ${statusLabel(status)} | ${escapeCell(summary)} |`);
  }
  return lines.join("\n");
}

function scoreTable(detailed = false) {
  if (detailed) {
    const lines = ["| Category | Earned | Applicable | Weight | Normalized |", "|---|---:|---:|---:|---:|"];
    for (const category of scores.categories) {
      lines.push(
        `| ${category.id}. ${category.name} | ${category.earned} | ${category.applicable_max} | ${category.max} | ${Number(category.normalized).toFixed(2)} |`
      );
    }
    lines.push(`| **Total** | **${scores.final}** | **100** | **100** | **${Number(scores.total).toFixed(2)}** |`);
    return lines.join("\n");
  }
  const lines = ["| Area | Score |", "|---|---|"];
  for (const category of scores.categories) {
    lines.push(`| ${category.name} | ${Number(category.normalized).toFixed(1)} / ${category.max} |`);
  }
  lines.push(`| **Total** | **${scores.display} / 100** |`);
  return lines.join("\n");
}

function strengths() {
  if (Array.isArray(content.strengths) && content.strengths.length) {
    return content.strengths.map((entry) => `- ${escapeInline(entry)}`).join("\n");
  }
  const strong = (scores.categories || []).filter((category) => category.percent !== null && category.percent >= 75);
  return strong.length
    ? strong.map((category) => `- ${category.name}: ${category.normalized.toFixed(1)} / ${category.max}`).join("\n")
    : "- No category reached 75% of its applicable points.";
}

function fixesTable() {
  const lines = ["| # | Fix | Checks | Points | Effort |", "|---|---|---|---|---|"];
  (content.fixes || []).forEach((fix, index) => {
    lines.push(
      `| ${index + 1} | ${escapeCell(fix.fix)} | ${(fix.checks || []).join(", ")} | +${fix.points} | ${fix.effort} |`
    );
  });
  return lines.join("\n");
}

function ownerData(limit = null) {
  const supplied = new Map((content.ownerData || []).map((entry) => [entry.id, entry]));
  let entries = (scores.ownerDataRequired || []).map((entry) => ({ ...entry, ...(supplied.get(entry.id) || {}) }));
  if (limit) entries = entries.slice(0, limit);
  if (!entries.length) return "_No owner-data opportunities supplied._";
  return entries
    .map((entry) => {
      const questions = (entry.questions || []).map((question) => `  - ${question}`).join("\n");
      const head = `**${entry.title}**${entry.stage ? ` (${entry.stage})` : ""} — ${entry.why || entry.whyItMatters || ""}`;
      return questions ? `${head}\n${questions}` : head;
    })
    .join("\n\n");
}

function capNote() {
  const active = (scores.caps || []).filter((cap) => cap.active);
  if (!active.length) return "";
  const binding = active.filter((cap) => cap.binding);
  if (!binding.length) return `**Hard cap trigger observed:** ${active.map((cap) => cap.label).join("; ")}. The cap is active but not binding.`;
  const overall = binding.filter((cap) => cap.scope === "overall");
  if (overall.length) {
    return `**Hard cap:** ${overall.map((cap) => cap.label).join("; ")}. Score capped at ${scores.cap} / 100.`;
  }
  const categories = binding.map((cap) => `${cap.label} (category ${cap.category} capped at ${cap.max})`).join("; ");
  return `**Category cap:** ${categories}. Effective score: ${scores.display} / 100.`;
}

function capsTable() {
  const active = (scores.caps || []).filter((cap) => cap.active);
  if (!active.length) return "_No hard cap is active._";
  const lines = ["| Cap | Scope | Max | Binding | Why |", "|---|---|---:|---|---|"];
  for (const cap of active) {
    lines.push(`| ${cap.label} | ${cap.scope === "overall" ? "Overall" : `Category ${cap.category}`} | ${cap.max} | ${cap.binding ? "Yes" : "No"} | ${escapeCell(cap.rationale)} |`);
  }
  return lines.join("\n");
}

function findingsTable() {
  const supplied = new Map((content.findings || []).map((entry) => [entry.id, entry]));
  const lines = ["| ID | Stage | Score | Confidence | What was observed | Fix |", "|---|---|---|---|---|---|"];
  for (const check of scores.checks || []) {
    const finding = supplied.get(check.id) || {};
    const observed = check.applicable
      ? finding.observed || (check.evidence || []).join("; ")
      : `N/A: ${check.na_reason || "not applicable"}`;
    const fix = check.applicable ? finding.fix || check.recommendedIntervention || "—" : "—";
    lines.push(
      `| ${check.id} | ${stageName(check.stage)} | ${scoreValue(check)} | ${check.applicable ? confidenceLabel(check.confidence) : "NOT APPLICABLE"} | ${escapeCell(observed)} | ${escapeCell(fix)} |`
    );
  }
  return lines.join("\n");
}

function opportunityBlocks() {
  const entries = content.opportunities || [];
  if (!entries.length) return "_No optional opportunities selected._";
  return entries
    .map((entry) => `- **${escapeInline(entry.label)}** (\`${entry.radModule}\`) — ${escapeInline(entry.why)}\n\n  Not scored. An optional RAD service is never the reason a business loses points.`)
    .join("\n");
}

function provenance() {
  const sources = (scores.sources || [])
    .map((source) => `| ${source.id} | ${source.type} | ${source.field_completeness}% | ${source.collected_at} |`)
    .join("\n");
  return [
    "| Source | Type | Field completeness | Collected |",
    "|---|---|---:|---|",
    sources,
    "",
    `**Audit mode:** ${scores.audit_mode} · **Rubric:** v${scores.rubric_version} · **Collector:** v${scores.meta.collector_version} · **Scorer:** v${scores.scorer_version}`,
    "",
    "Public Mode observes only public data. It does not post, reply, book, call, text, submit a form, or change a profile. Owner-data questions are reported separately and never reduce the public score.",
  ].join("\n");
}

function limitations(limit = null) {
  let entries = Array.isArray(content.limitations) ? content.limitations : [];
  if (limit) entries = entries.slice(0, limit);
  return entries.length ? entries.map((entry) => `- ${escapeInline(entry)}`).join("\n") : "- Public data cannot prove revenue outcomes.";
}

const defaultTemplate = path.join(
  import.meta.dirname,
  "..",
  "references",
  mode === "full" ? "report-template.md" : "one-page-template.md"
);
const templatePath = arg("template", defaultTemplate);
let template;
try {
  template = fs.readFileSync(templatePath, "utf8");
} catch (error) {
  console.error(`error: could not read template: ${error.message}`);
  process.exit(2);
}

const replacements = {
  CLIENT: content.client,
  SYNTHETIC_LABEL: scores.meta.synthetic ? "> **Synthetic example — not a real business.**" : "",
  URL: content.url || scores.meta.website || "",
  TRADE: content.trade || scores.meta.trade,
  MARKET: content.market || scores.meta.market,
  DATE: content.date,
  SCORE: String(scores.display),
  BAND: `${scores.band} (${scores.band_label})`,
  CAP_NOTE: capNote(),
  CAPS_TABLE: capsTable(),
  VERDICT: content.verdict,
  LEAKS: leakBlocks(),
  JOURNEY_TABLE: journeyTable(),
  SCORE_TABLE: scoreTable(mode === "full"),
  STRENGTHS: strengths(),
  FIXES_TABLE: fixesTable(),
  FIX_NOTE: content.fixNote || "",
  OWNER_DATA: ownerData(mode === "one-page" ? 2 : null),
  NEXT_STEPS: (content.nextSteps || []).map((step, index) => `${index + 1}. ${step}`).join("\n") || "_No next steps supplied._",
  LIMITATIONS: limitations(mode === "one-page" ? 3 : null),
  FULL_REPORT_LINK: "full-report.md",
  RUBRIC_VERSION: scores.rubric_version,
  VERSIONS: `Collector v${scores.meta.collector_version} · Scorer v${scores.scorer_version}`,
  RUN_ID: scores.meta.run_id,
  FOOTER: content.footer || "Synthetic example for documentation. Not a real business.",
  EXECUTIVE_SUMMARY: (content.executiveSummary || []).map((entry) => `- ${escapeInline(entry)}`).join("\n") || "- See findings.",
  FINDINGS_TABLE: findingsTable(),
  OPPORTUNITIES: opportunityBlocks(),
  PROVENANCE: provenance(),
};

let output = template;
for (const [key, value] of Object.entries(replacements)) {
  output = output.replaceAll(`{{${key}}}`, String(value));
}
if (/\{\{[A-Z0-9_]+\}\}/.test(output)) {
  const missing = [...output.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((match) => match[1]);
  console.error(`error: unfilled template placeholder(s): ${[...new Set(missing)].join(", ")}`);
  process.exit(1);
}

const out = path.resolve(outPath);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, output.endsWith("\n") ? output : `${output}\n`, "utf8");
console.log(`wrote ${out}`);
