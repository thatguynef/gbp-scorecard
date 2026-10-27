#!/usr/bin/env python3
"""Render references/portable-checklist.md from the canonical rubric.

The portable checklist is for a human or external browser agent collecting
public evidence without the repository's scripts. It never replaces the
scorer or the evidence rules.

Usage:
  python3 render_portable.py
  python3 render_portable.py --check
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_RUBRIC = HERE.parent / "references" / "rubric.json"
DEFAULT_OUT = HERE.parent / "references" / "portable-checklist.md"


def render(rubric: dict) -> str:
    lines = [
        "# Portable GBP Audit Checklist",
        "",
        "> **Generated from `rubric.json`.** Do not edit by hand. This is a collection companion, not a replacement for the scorer.",
        "",
        f"Rubric v{rubric['version']} · {len(rubric['items'])} checks · {rubric['total']} points",
        "",
        "## Before you start",
        "",
        "- Record the audit mode: **public**. Do not use an authenticated Google session in Public Mode.",
        "- Record the run timestamp, collector version, business name, place ID, trade, market, and configuration.",
        "- Use only supported APIs or non-destructive public observation. Never post, reply, book, submit a form, call, text, or change a profile.",
        "- Quote or cite evidence for every score. If a fact is not observable, do not invent it.",
        "- Use `verified` only for a directly observed or safely measured fact. Use `strong_signal` when the observation is real but the consequence is not proven.",
        "- Owner-data questions never reduce the public score.",
        "",
        "## Evidence states",
        "",
        "| State | Use when |",
        "|---|---|",
        "| VERIFIED | Directly observed or safely measured. |",
        "| STRONG SIGNAL | The observation is real, but the business consequence cannot be proven from public data. |",
        "| OWNER DATA REQUIRED | The question needs CRM, call, messaging, scheduling, or financial data. |",
        "| NOT APPLICABLE | The check does not reasonably apply to this business, category, geography, configuration, or mode. |",
        "",
    ]
    for stage in sorted(rubric["journey"], key=lambda s: s["order"]):
        stage_checks = [i for i in rubric["items"] if i["id"] in stage.get("checks", [])]
        lines += [f"## {stage['order']}. {stage['label']}", "", f"*{stage['customerQuestion']}*", ""]
        if stage["coverageStatus"] == "owner_data_required":
            lines += [
                "This stage is not scored from public data. Ask the owner:",
                "",
            ]
            for oid in stage.get("ownerData", []):
                entry = next(o for o in rubric["ownerData"] if o["id"] == oid)
                lines.append(f"- **{entry['title']}** ({oid})")
                for question in entry["questions"]:
                    lines.append(f"  - {question}")
            lines.append("")
            continue
        for item in stage_checks:
            parts = []
            if item.get("condition"):
                parts.append(f"only if `{item['condition']}`")
            if item.get("requires"):
                parts.append(f"only when `{item['requires']}`")
            condition = (" · " + " · ".join(parts)) if parts else ""
            lines += [
                f"### {item['id']} — {item['title']} ({item['max']} pts)",
                "",
                f"*{item['principle']}* · {item['severity']} · {item['evaluation']}{condition}",
                "",
                "| Score | Anchor |",
                "|---:|---|",
            ]
            for value in item["allowed"]:
                lines.append(f"| {value} | {item['anchors'][str(value)]} |")
            lines += [
                "",
                f"**Capture:** {item['evidence']}",
                "",
                f"**If weak:** {item['recommendedIntervention']}",
                "",
            ]
        if stage.get("ownerData"):
            lines += ["**Also ask the owner (not scored):**", ""]
            for oid in stage["ownerData"]:
                entry = next(o for o in rubric["ownerData"] if o["id"] == oid)
                lines.append(f"- {entry['title']} ({oid})")
            lines.append("")
    lines += [
        "## Owner-data questions",
        "",
        "| ID | Stage | Question | Why it matters |",
        "|---|---|---|---|",
    ]
    for entry in rubric["ownerData"]:
        lines.append(f"| {entry['id']} | {entry['journeyStage']} | {entry['title']} | {entry['whyItMatters']} |")
    lines += [
        "",
        "## Opportunity flags",
        "",
        "These are never scored. Recommend them separately if the evidence supports them.",
        "",
        "| Flag | RAD module | Why |",
        "|---|---|---|",
    ]
    for opportunity in rubric["opportunities"]:
        lines.append(f"| {opportunity['label']} | `{opportunity['radModule']}` | {opportunity['why']} |")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Render the portable GBP checklist.")
    parser.add_argument("--rubric", default=str(DEFAULT_RUBRIC))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        rubric = json.loads(Path(args.rubric).read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    rendered = render(rubric)
    out = Path(args.out)
    if args.check:
        current = out.read_text(encoding="utf-8") if out.exists() else ""
        if current != rendered:
            print(f"error: {out} is stale. Run: python3 {Path(__file__).name}", file=sys.stderr)
            return 1
        print(f"ok: {out} is current")
        return 0
    out.write_text(rendered, encoding="utf-8")
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
