#!/usr/bin/env node
/**
 * Entrypoint for a GBP Scorecard run.
 *
 * It collects deterministic public observations, creates a local report
 * directory, and prints the exact review/score/render/verify commands. The
 * stages remain independently runnable. It never scores an unfilled worksheet.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const HELP = `GBP Scorecard — audit entrypoint 1.0.0

Usage:
  npm run audit -- --business "Example Co." --trade plumbing --city "Example City, CA" [options]
  npm run audit -- --fixture .opencode/skills/home-service-gbp-audit/scripts/fixtures/acme-plumbing.raw.json [options]

Required live mode:
  --business <name>
  --trade <trade>
  --city <city>            Or --place-id

Recommended:
  --config <json>          Applicability configuration
  --website <url>          Only when the profile has no website
  --state <state>
  --slug <slug>            Output slug, default: slugified business
  --run-id <id>            Default: local date-time
  --out <dir>              Raw output, default: .audit/<slug>/<run-id>
  --report-dir <dir>       Report package, default: reports/<slug>/<run-id>
  --fixture <raw.json>     Synthetic fixture; zero network and zero credentials
  --prepare                Copy the raw worksheet to audit.filled.json for review
  --help

The collector is read-only. It does not submit forms, book, call, text, post,
reply, or change a Google Business Profile.
`;

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (value === undefined || value.startsWith("--")) return true;
  return value;
}
const has = (name) => process.argv.includes(`--${name}`);
const shellQuote = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;
const localRunId = (now = new Date()) =>
  new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace(/:/g, "");

if (has("help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

const fixture = arg("fixture");
const business = arg("business");
const trade = arg("trade");
const city = arg("city");
const placeId = arg("place-id");
if (!fixture && (!business || !trade || (!city && !placeId))) {
  console.error("error: live mode requires --business, --trade, and --city or --place-id\n");
  console.error(HELP);
  process.exit(2);
}
if (fixture === true) {
  console.error("error: --fixture requires a path");
  process.exit(2);
}

const slug = String(arg("slug", String(business || "fixture").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "business"));
const runId = String(arg("run-id", localRunId()));
const out = String(arg("out", path.join(".audit", slug, runId)));
const reportDirArg = arg("report-dir");
const reportDir = String(reportDirArg || path.join("reports", slug, runId));
if (reportDirArg === true) {
  console.error("error: --report-dir requires a path");
  process.exit(2);
}

const collectPath = path.join(
  import.meta.dirname,
  "..",
  ".opencode",
  "skills",
  "home-service-gbp-audit",
  "scripts",
  "collect.mjs",
);
const collectArgs = [collectPath, "--out", out, "--run-id", runId];
if (fixture) {
  collectArgs.push("--fixture", String(fixture));
} else {
  collectArgs.push("--business", String(business), "--trade", String(trade));
  if (city && city !== true) collectArgs.push("--city", String(city));
  if (placeId && placeId !== true) collectArgs.push("--place-id", String(placeId));
  const config = arg("config");
  if (config && config !== true) collectArgs.push("--config", String(config));
  const website = arg("website");
  if (website && website !== true) collectArgs.push("--website", String(website));
  const state = arg("state");
  if (state && state !== true) collectArgs.push("--state", String(state));
}

console.log(`\nCollecting public observations\nRaw directory: ${out}\n`);
const result = spawnSync(process.execPath, collectArgs, { stdio: "inherit" });
if (result.error) {
  console.error(`error: could not start collector: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);

fs.mkdirSync(reportDir, { recursive: true });
const auditPath = path.resolve(out, "audit.json");
const filledPath = path.resolve(reportDir, "audit.filled.json");
const scoresPath = path.resolve(reportDir, "scores.json");
const contentPath = path.resolve(reportDir, "content.json");
const onePagePath = path.resolve(reportDir, "one-page.md");
const fullReportPath = path.resolve(reportDir, "full-report.md");
const verificationPath = path.resolve(reportDir, "verification.json");
if (has("prepare") && fs.existsSync(auditPath)) {
  fs.copyFileSync(auditPath, filledPath);
  console.log(`\nPrepared worksheet: ${filledPath}`);
  console.log("Fill every applicable check, add facts and source references, then score.");
}

const skill = ".opencode/skills/home-service-gbp-audit/scripts";
console.log(`\nReport directory: ${reportDir}\n
1. Review the public profile and destination. Fill ${auditPath}
   Save the completed audit as ${filledPath}
2. Score:
   python3 ${shellQuote(path.join(skill, "score.py"))} \\
     --input ${shellQuote(filledPath)} --out ${shellQuote(scoresPath)} \\
     --markdown ${shellQuote(path.join(reportDir, "scorecard.md"))} --strict
3. Write ${contentPath}, then render:
   node ${shellQuote(path.join(skill, "render.mjs"))} \\
     --scores ${shellQuote(scoresPath)} --content ${shellQuote(contentPath)} \\
     --out ${shellQuote(onePagePath)}
   node ${shellQuote(path.join(skill, "render.mjs"))} --mode full \\
     --scores ${shellQuote(scoresPath)} --content ${shellQuote(contentPath)} \\
     --out ${shellQuote(fullReportPath)}
4. Verify:
   node ${shellQuote(path.join(skill, "verify.mjs"))} --run ${shellQuote(reportDir)} \\
     --filled ${shellQuote(filledPath)} --scores ${shellQuote(scoresPath)} \\
     --content ${shellQuote(contentPath)} --report ${shellQuote(fullReportPath)} \\
     --one-page ${shellQuote(onePagePath)} --out ${shellQuote(verificationPath)} \\
     --mutation --synthetic
`);
