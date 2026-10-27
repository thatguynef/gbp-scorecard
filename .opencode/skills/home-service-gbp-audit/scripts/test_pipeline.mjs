#!/usr/bin/env node
/** Offline pipeline tests for the GBP Scorecard. */

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, "..", "..", "..", "..");
const RUBRIC = path.join(HERE, "..", "references", "rubric.json");
const FIXTURE = path.join(HERE, "fixtures", "acme-plumbing.audit.json");
const RAW_FIXTURE = path.join(HERE, "fixtures", "acme-plumbing.raw.json");
const EXAMPLE = path.join(ROOT, "examples", "acme-plumbing");
const COLLECT = path.join(HERE, "collect.mjs");
const SCORE = path.join(HERE, "score.py");
const RENDER = path.join(HERE, "render.mjs");
const VERIFY = path.join(HERE, "verify.mjs");
const PRIVACY = path.join(ROOT, "scripts", "privacy_scan.mjs");
const SCHEMAS = path.join(ROOT, "scripts", "check_schemas.mjs");

const temp = (label) => fs.mkdtempSync(path.join(os.tmpdir(), `gbp-${label}-`));
const run = (command, args, options = {}) =>
  spawnSync(command, args, { encoding: "utf8", cwd: ROOT, ...options });

test("rubric validator accepts the canonical rubric", () => {
  const result = run("python3", [path.join(HERE, "validate_rubric.py")]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /49 checks/);
});

test("golden fixture scores 68 / C and is deterministic", () => {
  const dir = temp("score");
  try {
    const outA = path.join(dir, "a.json");
    const outB = path.join(dir, "b.json");
    for (const out of [outA, outB]) {
      const result = run("python3", [SCORE, "--input", FIXTURE, "--rubric", RUBRIC, "--out", out, "--strict"]);
      assert.equal(result.status, 0, result.stderr);
    }
    assert.equal(fs.readFileSync(outA, "utf8"), fs.readFileSync(outB, "utf8"));
    const scores = JSON.parse(fs.readFileSync(outA, "utf8"));
    assert.equal(scores.display, 68);
    assert.equal(scores.band, "C");
    assert.equal(scores.total, 68.4);
    assert.equal(scores.ownerDataRequired.length, 5);
    assert.ok(scores.ownerDataRequired.every((entry) => entry.publicScoreImpact === "none"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("fixture collector needs no credentials and emits a pending worksheet", () => {
  const dir = temp("collect");
  try {
    const out = path.join(dir, "run");
    const env = { ...process.env };
    delete env.GOOGLE_MAPS_API_KEY;
    const result = run(process.execPath, [COLLECT, "--fixture", RAW_FIXTURE, "--out", out, "--run-id", "test-run"], { env });
    assert.equal(result.status, 0, result.stderr);
    const audit = JSON.parse(fs.readFileSync(path.join(out, "audit.json"), "utf8"));
    assert.equal(audit.run.source_mode, "fixture");
    assert.equal(audit.review.status, "pending");
    assert.equal(Object.keys(audit.checks).length, 49);
    const pending = Object.values(audit.checks).filter((check) => check.needs_review);
    assert.ok(pending.length > 0);
    assert.ok(pending.every((check) => check.score === null));
    assert.equal(audit.observations.actions.website.destination_state, "resolves");
    const schema = run(process.execPath, [SCHEMAS, "--raw-audit", path.join(out, "audit.json")]);
    assert.equal(schema.status, 0, schema.stderr + schema.stdout);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("live mode fails clearly without an API key and never invents a run", () => {
  const dir = temp("live");
  try {
    const env = { ...process.env };
    delete env.GOOGLE_MAPS_API_KEY;
    const result = run(process.execPath, [COLLECT, "--business", "Example", "--trade", "plumbing", "--city", "Example City", "--out", path.join(dir, "run")], { env });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /GOOGLE_MAPS_API_KEY/);
    assert.ok(!fs.existsSync(path.join(dir, "run", "audit.json")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("renderer produces the one-pager and full report from structured scores", () => {
  const dir = temp("render");
  try {
    const onePage = path.join(dir, "one-page.md");
    const report = path.join(dir, "full-report.md");
    let result = run(process.execPath, [RENDER, "--scores", path.join(EXAMPLE, "scores.json"), "--content", path.join(EXAMPLE, "content.json"), "--out", onePage]);
    assert.equal(result.status, 0, result.stderr);
    result = run(process.execPath, [RENDER, "--mode", "full", "--scores", path.join(EXAMPLE, "scores.json"), "--content", path.join(EXAMPLE, "content.json"), "--out", report]);
    assert.equal(result.status, 0, result.stderr);
    const oneText = fs.readFileSync(onePage, "utf8");
    const fullText = fs.readFileSync(report, "utf8");
    assert.match(oneText, /^# 68 \/ 100/m);
    assert.match(oneText, /VERIFIED/);
    assert.match(oneText, /STRONG SIGNAL/);
    assert.match(oneText, /OWNER DATA REQUIRED/);
    assert.match(fullText, /Profile Findings/);
    assert.equal([...fullText.matchAll(/^\| GBP-/gm)].length, 49);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("verifier passes the synthetic example with mutations and fixture checks", () => {
  const dir = temp("verify");
  try {
    const out = path.join(dir, "verification.json");
    const result = run(process.execPath, [
      VERIFY,
      "--run", EXAMPLE,
      "--filled", path.join(EXAMPLE, "audit.filled.json"),
      "--scores", path.join(EXAMPLE, "scores.json"),
      "--content", path.join(EXAMPLE, "content.json"),
      "--report", path.join(EXAMPLE, "full-report.md"),
      "--one-page", path.join(EXAMPLE, "one-page.md"),
      "--out", out,
      "--mutation", "--fixture", "--synthetic",
    ]);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const record = JSON.parse(fs.readFileSync(out, "utf8"));
    assert.equal(record.result, "pass");
    assert.equal(record.mutation_tests, "pass");
    assert.equal(record.fixture.pass, true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("judgment merger accepts only applicable model-judgment checks", () => {
  const dir = temp("judgment");
  try {
    const audit = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
    const input = path.join(dir, "audit.json");
    const proposal = path.join(dir, "judgment.json");
    const out = path.join(dir, "reviewed.json");
    fs.writeFileSync(input, JSON.stringify(audit), "utf8");
    fs.writeFileSync(proposal, JSON.stringify({
      schema_version: "1.0",
      audit_mode: "public",
      model: { name: "synthetic-reviewer", provider: "fixture" },
      checks: {
        "GBP-SVC-04": {
          score: 2,
          confidence: "strong_signal",
          evidence: ["Synthetic test evidence."],
          evidence_refs: ["places"],
        },
      },
    }), "utf8");
    const ok = run(process.execPath, [path.join(HERE, "apply_judgment.mjs"), "--audit", input, "--judgment", proposal, "--out", out, "--allow-partial"]);
    assert.equal(ok.status, 0, ok.stderr);
    const reviewed = JSON.parse(fs.readFileSync(out, "utf8"));
    assert.equal(reviewed.checks["GBP-SVC-04"].score, 2);
    assert.equal(reviewed.checks["GBP-SVC-04"].review.method, "model_judgment");

    fs.writeFileSync(proposal, JSON.stringify({
      schema_version: "1.0",
      audit_mode: "public",
      model: { name: "synthetic-reviewer" },
      checks: {
        "GBP-CON-01": {
          score: 4,
          confidence: "verified",
          evidence: ["Deterministic test."],
          evidence_refs: ["places"],
        },
      },
    }), "utf8");
    const bad = run(process.execPath, [path.join(HERE, "apply_judgment.mjs"), "--audit", input, "--judgment", proposal, "--out", out, "--allow-partial"]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /deterministic check cannot be model-judged/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("privacy scanner fails on a synthetic secret and never prints it", () => {
  const dir = temp("privacy-bad");
  try {
    const key = `AIza${"A".repeat(35)}`;
    fs.writeFileSync(path.join(dir, "leak.md"), `key = "${key}"\n`, "utf8");
    const result = run(process.execPath, [PRIVACY, "--dir", dir]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Google API key/);
    assert.ok(!result.stderr.includes(key), "scanner must redact the value");
    assert.ok(!result.stdout.includes(key), "scanner must redact the value");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("privacy scanner passes a clean synthetic directory", () => {
  const dir = temp("privacy-clean");
  try {
    fs.writeFileSync(path.join(dir, "notes.md"), "Synthetic business. Phone (555) 010-0200. No credentials.\n", "utf8");
    const result = run(process.execPath, [PRIVACY, "--dir", dir]);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /no hard privacy findings/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("repository privacy scan and schema check pass", () => {
  const privacy = run(process.execPath, [PRIVACY]);
  assert.equal(privacy.status, 0, privacy.stderr + privacy.stdout);
  const schemas = run(process.execPath, [SCHEMAS]);
  assert.equal(schemas.status, 0, schemas.stderr + schemas.stdout);
});

test("score.py rejects a malformed audit without writing a score", () => {
  const dir = temp("bad-audit");
  try {
    const audit = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
    audit.checks["GBP-CON-03"].evidence_refs = ["unknown-source"];
    const input = path.join(dir, "audit.json");
    const out = path.join(dir, "scores.json");
    fs.writeFileSync(input, JSON.stringify(audit), "utf8");
    const result = run("python3", [SCORE, "--input", input, "--out", out, "--strict"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unknown source/);
    assert.ok(!fs.existsSync(out));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
