#!/usr/bin/env python3
"""Validate the canonical GBP Scorecard rubric without external dependencies.

Usage:
  python3 validate_rubric.py
  python3 validate_rubric.py --rubric path/to/rubric.json

Exit 0 = valid, 1 = invalid, 2 = unreadable input.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_RUBRIC = HERE.parent / "references" / "rubric.json"
CHECK_ID = re.compile(r"GBP-(?:ID|SVC|CON|TRU|CNT|HND|MSR)-\d{2}$")
OWNER_ID = re.compile(r"OD-[A-Z0-9-]+$")
CONDITIONS = {
    "online_booking_expected",
    "messaging_expected",
    "emergency_service",
    "physical_storefront",
    "after_hours_expected",
    "content_posts_expected",
}
FACTS = {
    "profile_status",
    "phone_action_usable",
    "website_action_usable",
    "booking_action_usable",
    "other_action_usable",
    "identity_consistent",
    "website_destination_state",
    "booking_is_primary_action",
    "booking_destination_state",
}


def validate(rubric: dict) -> list[str]:
    errors: list[str] = []
    if not re.fullmatch(r"\d+\.\d+\.\d+", str(rubric.get("version", ""))):
        errors.append("version must be semver")
    if rubric.get("schema_version") != "1.0":
        errors.append("schema_version must be 1.0")
    if rubric.get("total") != 100:
        errors.append("total must be 100")

    categories = rubric.get("categories", [])
    if not isinstance(categories, list) or not categories:
        errors.append("categories are required")
        return errors
    if sum(c.get("max", 0) for c in categories) != 100:
        errors.append("category maxima must sum to 100")
    cat_ids = [c.get("id") for c in categories]
    if len(set(cat_ids)) != len(cat_ids):
        errors.append("category ids must be unique")
    for cat in categories:
        if not cat.get("name") or not cat.get("question"):
            errors.append(f"category {cat.get('id')}: name and question are required")

    conditions = {c.get("key") for c in rubric.get("conditions", [])}
    if conditions != CONDITIONS:
        errors.append(f"conditions must be exactly {sorted(CONDITIONS)}")

    items = rubric.get("items", [])
    if not 40 <= len(items) <= 60:
        errors.append(f"expected 40-60 checks, found {len(items)}")
    item_ids = [i.get("id") for i in items]
    if len(set(item_ids)) != len(item_ids):
        errors.append("item ids must be unique")
    stage_ids = {s.get("id") for s in rubric.get("journey", [])}
    by_cat = defaultdict(int)
    by_id = {i.get("id"): i for i in items}

    for item in items:
        cid = item.get("id", "?")
        if not CHECK_ID.fullmatch(str(cid)):
            errors.append(f"{cid}: id must look like GBP-XXX-00")
        if item.get("cat") not in cat_ids:
            errors.append(f"{cid}: unknown category")
        if item.get("journeyStage") not in stage_ids:
            errors.append(f"{cid}: unknown journeyStage")
        maximum = item.get("max")
        if not isinstance(maximum, int) or maximum <= 0:
            errors.append(f"{cid}: max must be a positive integer")
            continue
        by_cat[item.get("cat")] += maximum
        allowed = item.get("allowed")
        if not isinstance(allowed, list) or not allowed:
            errors.append(f"{cid}: allowed must be a non-empty array")
            continue
        if maximum not in allowed:
            errors.append(f"{cid}: allowed must include max")
        if len(set(allowed)) != len(allowed):
            errors.append(f"{cid}: allowed must be unique")
        if any(not isinstance(v, int) or v < 0 or v > maximum for v in allowed):
            errors.append(f"{cid}: allowed values must be integers from 0 to max")
        anchors = item.get("anchors")
        if not isinstance(anchors, dict):
            errors.append(f"{cid}: anchors must be an object")
        else:
            for value in allowed:
                text = anchors.get(str(value))
                if not isinstance(text, str) or not text.strip():
                    errors.append(f"{cid}: missing anchor for {value}")
            for key in anchors:
                if key not in {str(v) for v in allowed}:
                    errors.append(f"{cid}: anchor {key} is not in allowed")
        for key in [
            "title",
            "evidenceType",
            "evaluation",
            "applicability",
            "severity",
            "evidence",
            "principle",
            "recommendedIntervention",
        ]:
            value = item.get(key)
            if value in (None, "", []):
                errors.append(f"{cid}: {key} is required")
        if item.get("evaluation") not in {"deterministic", "model_judgment"}:
            errors.append(f"{cid}: evaluation must be deterministic or model_judgment")
        if item.get("applicability") not in {"required", "conditional"}:
            errors.append(f"{cid}: applicability must be required or conditional")
        if item.get("severity") not in {"critical", "high", "medium", "low"}:
            errors.append(f"{cid}: invalid severity")
        if item.get("applicability") == "conditional":
            if item.get("condition") not in CONDITIONS:
                errors.append(f"{cid}: conditional check needs a known condition")
        elif item.get("condition"):
            errors.append(f"{cid}: only a conditional check may declare condition")
        if not isinstance(item.get("evidenceType"), list):
            errors.append(f"{cid}: evidenceType must be an array")
        if item.get("radModule") is not None and not isinstance(item["radModule"], str):
            errors.append(f"{cid}: radModule must be a string")
        if item.get("requires") is not None and item["requires"] not in {
            "website_present",
            "website_resolves",
            "booking_present",
            "booking_resolves",
        }:
            errors.append(f"{cid}: invalid requires value")

    for cat in categories:
        if by_cat[cat["id"]] != cat["max"]:
            errors.append(
                f"category {cat['id']}: item maxima {by_cat[cat['id']]} do not equal weight {cat['max']}"
            )

    journey = rubric.get("journey", [])
    if not journey:
        errors.append("journey is required")
    orders = [s.get("order") for s in journey]
    if len(set(orders)) != len(orders):
        errors.append("journey order values must be unique")
    owner_ids = {o.get("id") for o in rubric.get("ownerData", [])}
    mapped = []
    for stage in journey:
        for key in ["id", "label", "customerQuestion", "coverageStatus"]:
            if not stage.get(key):
                errors.append(f"journey {stage.get('id', '?')}: {key} is required")
        if stage.get("coverageStatus") not in {
            "scored",
            "diagnostic",
            "conditional",
            "owner_data_required",
            "observed_unscored",
            "not_applicable",
        }:
            errors.append(f"journey {stage.get('id')}: invalid coverageStatus")
        for cid in stage.get("checks", []):
            if cid not in by_id:
                errors.append(f"journey {stage.get('id')}: unknown check {cid}")
            else:
                mapped.append(cid)
                if by_id[cid].get("journeyStage") != stage.get("id"):
                    errors.append(
                        f"journey {stage.get('id')}: {cid} declares journeyStage {by_id[cid].get('journeyStage')}"
                    )
        for oid in stage.get("ownerData", []):
            if oid not in owner_ids:
                errors.append(f"journey {stage.get('id')}: unknown ownerData {oid}")
    for cid in item_ids:
        if cid not in mapped:
            errors.append(f"{cid}: not mapped to a journey stage")
    duplicates = [cid for cid, count in Counter(mapped).items() if count > 1]
    if duplicates:
        errors.append(f"checks mapped to more than one journey stage: {', '.join(sorted(duplicates))}")

    owner = rubric.get("ownerData", [])
    if not owner:
        errors.append("ownerData is required")
    for entry in owner:
        oid = entry.get("id", "?")
        if not OWNER_ID.fullmatch(str(oid)):
            errors.append(f"{oid}: owner data id must look like OD-NAME")
        if entry.get("journeyStage") not in stage_ids:
            errors.append(f"{oid}: unknown journeyStage")
        for key in ["title", "whyItMatters", "questions"]:
            if entry.get(key) in (None, "", []):
                errors.append(f"{oid}: {key} is required")
        if not isinstance(entry.get("questions"), list):
            errors.append(f"{oid}: questions must be an array")

    opportunities = rubric.get("opportunities", [])
    if not opportunities:
        errors.append("opportunities are required")
    if len({o.get("id") for o in opportunities}) != len(opportunities):
        errors.append("opportunity ids must be unique")
    for opportunity in opportunities:
        if not opportunity.get("radModule") or not opportunity.get("why"):
            errors.append(f"opportunity {opportunity.get('id')}: radModule and why are required")

    fixes = rubric.get("fixes", [])
    if not fixes:
        errors.append("fixes are required")
    fix_ids = {f.get("checkId") for f in fixes}
    for item in items:
        if item.get("id") not in fix_ids:
            errors.append(f"{item.get('id')}: no fix mapping")
    for fix in fixes:
        if fix.get("checkId") not in by_id:
            errors.append(f"fix: unknown check {fix.get('checkId')}")
        if fix.get("priority") not in {"critical", "high", "medium", "low"}:
            errors.append(f"fix {fix.get('checkId')}: invalid priority")
        if not fix.get("fix") or not isinstance(fix.get("radModules"), list):
            errors.append(f"fix {fix.get('checkId')}: fix and radModules are required")

    caps = rubric.get("caps", [])
    if len({c.get("id") for c in caps}) != len(caps):
        errors.append("cap ids must be unique")
    for cap in caps:
        cid = cap.get("id", "?")
        if cap.get("scope") not in {"overall", "category"}:
            errors.append(f"cap {cid}: scope must be overall or category")
        if cap.get("scope") == "category" and cap.get("category") not in cat_ids:
            errors.append(f"cap {cid}: unknown category")
        if not isinstance(cap.get("max"), int) or not 0 <= cap["max"] <= 100:
            errors.append(f"cap {cid}: max must be 0-100")
        for key in ["label", "rationale", "checks"]:
            if cap.get(key) in (None, "", []):
                errors.append(f"cap {cid}: {key} is required")
        for check in cap.get("checks", []):
            if check not in by_id:
                errors.append(f"cap {cid}: unknown check {check}")
        trigger = cap.get("trigger") or {}
        clauses = trigger.get("all")
        if not isinstance(clauses, list) or not clauses:
            errors.append(f"cap {cid}: trigger.all must be a non-empty array")
            continue
        for clause in clauses:
            if clause.get("fact") not in FACTS:
                errors.append(f"cap {cid}: unknown fact {clause.get('fact')}")
            if "equals" not in clause and "in" not in clause:
                errors.append(f"cap {cid}: clause needs equals or in")

    bands = rubric.get("bands", [])
    if not bands or min(b.get("min", -1) for b in bands) != 0:
        errors.append("bands must start at 0")
    if not any(b.get("min") == 90 for b in bands):
        errors.append("bands must include min=90")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a GBP Scorecard rubric JSON file.")
    parser.add_argument("--rubric", default=str(DEFAULT_RUBRIC))
    args = parser.parse_args()
    try:
        rubric = json.loads(Path(args.rubric).read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"error: rubric not found: {args.rubric}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as exc:
        print(f"error: invalid JSON: {exc}", file=sys.stderr)
        return 2

    errors = validate(rubric)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1
    counts = Counter(i.get("applicability") for i in rubric.get("items", []))
    print(
        f"ok: rubric v{rubric.get('version')} · {len(rubric.get('items', []))} checks · "
        f"{len(rubric.get('journey', []))} journey stages · {len(rubric.get('ownerData', []))} owner-data prompts · "
        f"{len(rubric.get('opportunities', []))} opportunities · {dict(counts)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
