#!/usr/bin/env python3
"""Render the canonical fix library from rubric.json."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_RUBRIC = HERE.parent / "references" / "rubric.json"
DEFAULT_OUT = HERE.parent / "references" / "fix-library.md"
DOCS_OUT = HERE.parent.parent.parent.parent / "docs" / "fix-library.md"


def render(rubric: dict) -> str:
    by_id = {item["id"]: item for item in rubric["items"]}
    lines = [
        "# Fix Library",
        "",
        "> **Generated from `rubric.json`.** Do not edit by hand. Run `python3 render_fix_library.py`.",
        "",
        "The fix library is a deterministic mapping from a failed check to a bounded intervention. It is not a sales menu. A recommendation is evidence-backed only when the corresponding check lost points and the evidence supports the finding.",
        "",
        "A RAD module is metadata. The scorecard remains useful without RAD, and the existence of an optional RAD service is never the reason a business loses points.",
        "",
        "## Priority order",
        "",
        "| Priority | Meaning |",
        "|---|---|",
        "| critical | Can stop a customer from reaching or acting with the business. |",
        "| high | Materially weakens comprehension, trust, or action. |",
        "| medium | Creates friction or ambiguity, but a workaround exists. |",
        "| low | Improves polish or clarity without changing the core path. |",
        "",
        "## Check mappings",
        "",
        "| Check | Priority | Failure | Fix | Potential RAD modules |",
        "|---|---|---|---|---|",
    ]
    for fix in sorted(rubric["fixes"], key=lambda f: (["critical", "high", "medium", "low"].index(f["priority"]), f["checkId"])):
        item = by_id[fix["checkId"]]
        modules = ", ".join(f"`{module}`" for module in fix["radModules"]) or "—"
        lines.append(
            f"| {fix['checkId']} | {fix['priority']} | {item['title']} | {fix['fix']} | {modules} |"
        )
    lines += [
        "",
        "## Opportunity flags",
        "",
        "These are never scored. Recommend them only when the evidence and the business model support them.",
        "",
        "| Opportunity | RAD module | Why it may matter |",
        "|---|---|---|",
    ]
    for opportunity in rubric["opportunities"]:
        lines.append(f"| {opportunity['label']} | `{opportunity['radModule']}` | {opportunity['why']} |")
    lines += [
        "",
        "## How to use a mapping",
        "",
        "1. Confirm the check is applicable and lost points.",
        "2. Confirm the evidence state: VERIFIED or STRONG SIGNAL.",
        "3. Use the check's recommended intervention, not a generic checklist fix.",
        "4. Keep the report's points claim within the recoverable points.",
        "5. Treat the RAD module as an optional implementation path, not a diagnosis.",
        "",
        "## What not to do",
        "",
        "- Do not recommend a module merely because it exists.",
        "- Do not claim a revenue lift from a fix.",
        "- Do not bundle unrelated checks into one oversized claim.",
        "- Do not use a model to choose a service; use the deterministic mapping.",
        "- Do not recommend a fix that requires private data the audit does not have.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Render the GBP fix library.")
    parser.add_argument("--rubric", default=str(DEFAULT_RUBRIC))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--docs-out", default=str(DOCS_OUT))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        rubric = json.loads(Path(args.rubric).read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    rendered = render(rubric)
    docs_rendered = (
        '---\ndescription: "Deterministic GBP check-to-fix mappings, priority order, and optional RAD modules. Evidence and score limits stay in the report."\n---\n\n'
        + rendered
    )
    outputs = [(Path(args.out), rendered), (Path(args.docs_out), docs_rendered)]
    if args.check:
        for out, expected in outputs:
            current = out.read_text(encoding="utf-8") if out.exists() else ""
            if current != expected:
                print(f"error: {out} is stale. Run: python3 {Path(__file__).name}", file=sys.stderr)
                return 1
            print(f"ok: {out} is current")
        return 0
    for out, expected in outputs:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(expected, encoding="utf-8")
        print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
