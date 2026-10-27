#!/usr/bin/env python3
"""Score a public-mode GBP Scorecard audit deterministically.

The scorer validates the audit, removes N/A checks from the denominator,
normalizes category weights to 100, applies deterministic hard caps, and
separates the public score from owner-data questions.

Usage:
  python3 score.py --input audit.filled.json --out scores.json --strict
  python3 score.py --input audit.filled.json --markdown scorecard.md
  python3 score.py --help

Owner-data questions never change the public score.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

SCORER_VERSION = "1.0.0"
DEFAULT_RUBRIC = Path(__file__).resolve().parent.parent / "references" / "rubric.json"
EVIDENCE_STATES = {"verified", "strong_signal", "owner_data_required", "not_applicable"}
SCORED_CONFIDENCE = {"verified", "strong_signal"}
PRIORITY = {"critical": 0, "high": 1, "medium": 2, "low": 3}
FORBIDDEN_KEYS = re.compile(
    r"^(?:api[_-]?key|apikey|authorization|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|cookie|set-cookie)$",
    re.I,
)
SECRET_VALUE = re.compile(
    r"(?:AIza[0-9A-Za-z_-]{30,}|GOCSPX-[0-9A-Za-z_-]{20,}|-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|"
    r"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,})\b|"
    r"Authorization\s*:\s*Bearer\s+\S{12,})"
)


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def is_number(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def round_to(value: float, places: int) -> float:
    quantum = Decimal("1." + "0" * places) if places else Decimal("1")
    return float(Decimal(str(value)).quantize(quantum, rounding=ROUND_HALF_UP))


def applicability(item: dict, config: dict, facts: dict | None = None, actions: dict | None = None) -> tuple[bool, str]:
    """Return (applicable, reason). Structural absence is N/A, not a second penalty.

    A conditional check is scored only when its configured condition is enabled.
    A check with `requires` inspects an action or destination that must exist to
    be observable. If it does not exist, the missing action is already scored by
    its own check; this check is excluded to avoid counting the same defect twice.
    """
    if item.get("applicability") == "conditional":
        condition = item.get("condition")
        if not condition:
            return False, "conditional check has no condition"
        if not bool(config.get(condition, False)):
            return False, f"condition not enabled: {condition}"

    requires = item.get("requires")
    if requires and facts is not None and actions is not None:
        observed = {
            "website_present": bool((actions.get("website") or {}).get("present")),
            "website_resolves": bool(facts.get("website_action_usable")),
            "booking_present": bool((actions.get("booking") or {}).get("present")),
            "booking_resolves": bool(facts.get("booking_action_usable")),
        }
        if not observed.get(requires, False):
            return False, f"not observable: {requires}"
    return True, ""


def scan_forbidden(value, pointer: str = "$", errors: list[str] | None = None) -> list[str]:
    errors = errors if errors is not None else []
    if isinstance(value, dict):
        for key, entry in value.items():
            if FORBIDDEN_KEYS.match(str(key)):
                errors.append(f"{pointer}.{key}: forbidden credential-like field")
            scan_forbidden(entry, f"{pointer}.{key}", errors)
    elif isinstance(value, list):
        for index, entry in enumerate(value):
            scan_forbidden(entry, f"{pointer}[{index}]", errors)
    elif isinstance(value, str) and SECRET_VALUE.search(value):
        errors.append(f"{pointer}: credential-like string (value redacted)")
    return errors


def validate(audit: dict, rubric: dict) -> list[str]:
    errors: list[str] = []
    if not isinstance(audit, dict):
        return ["audit must be a JSON object"]
    errors.extend(scan_forbidden(audit))
    if audit.get("schema_version") != "1.0":
        errors.append("schema_version must be '1.0' (unknown versions fail safely)")
    if audit.get("audit_mode") != "public":
        errors.append("audit_mode must be 'public'; connected mode is not part of the public score")

    run = audit.get("run") or {}
    for key in ["run_id", "started_at", "collector_version", "rubric_version"]:
        if not run.get(key):
            errors.append(f"run.{key} is required")
    if run.get("rubric_version") != rubric.get("version"):
        errors.append(f"run.rubric_version does not match rubric {rubric.get('version')}")
    if run.get("source_mode") not in {"fixture", "live"}:
        errors.append("run.source_mode must be fixture or live")
    if not isinstance(run.get("synthetic"), bool):
        errors.append("run.synthetic must be a boolean")

    business = audit.get("business") or {}
    for key in ["name", "trade", "market"]:
        if not business.get(key):
            errors.append(f"business.{key} is required")
    config = audit.get("configuration") or {}
    for key in ["trade", "market"]:
        if not config.get(key):
            errors.append(f"configuration.{key} is required")
    for key in [
        "service_business",
        "online_booking_expected",
        "messaging_expected",
        "emergency_service",
        "physical_storefront",
        "after_hours_expected",
        "content_posts_expected",
    ]:
        if not isinstance(config.get(key), bool):
            errors.append(f"configuration.{key} must be a boolean")
    preferred = config.get("preferred_actions")
    if not isinstance(preferred, list) or not preferred:
        errors.append("configuration.preferred_actions must be a non-empty array")
    if business.get("trade") and config.get("trade") and business.get("trade") != config.get("trade"):
        errors.append("business.trade and configuration.trade must match")
    if business.get("market") and config.get("market") and business.get("market") != config.get("market"):
        errors.append("business.market and configuration.market must match")

    sources = audit.get("sources")
    source_ids: set[str] = set()
    if not isinstance(sources, list) or not sources:
        errors.append("sources must be a non-empty array")
    else:
        for index, source in enumerate(sources):
            if not isinstance(source, dict):
                errors.append(f"sources[{index}] must be an object")
                continue
            sid = source.get("id")
            if not isinstance(sid, str) or not re.fullmatch(r"[a-z0-9][a-z0-9_-]{0,63}", sid):
                errors.append(f"sources[{index}].id is invalid")
            elif sid in source_ids:
                errors.append(f"sources[{index}].id is duplicated")
            else:
                source_ids.add(sid)
            if source.get("type") not in {
                "places_api",
                "destination_http",
                "public_profile",
                "review_sample",
                "media_sample",
                "fixture",
            }:
                errors.append(f"sources[{index}].type is invalid")
            for key in ["collected_at", "collector_version"]:
                if not source.get(key):
                    errors.append(f"sources[{index}].{key} is required")
            completeness = source.get("field_completeness")
            if not is_number(completeness) or not 0 <= completeness <= 100:
                errors.append(f"sources[{index}].field_completeness must be 0-100")

    profile = audit.get("profile") or {}
    if profile.get("business_status") not in {
        "OPERATIONAL",
        "CLOSED_TEMPORARILY",
        "CLOSED_PERMANENTLY",
        "UNKNOWN",
    }:
        errors.append("profile.business_status is invalid")
    if profile.get("location_mode") not in {"storefront", "service_area", "unknown"}:
        errors.append("profile.location_mode is invalid")

    actions = audit.get("actions") or {}
    for key in ["phone", "website", "booking", "messaging", "directions", "other"]:
        if not isinstance(actions.get(key), dict):
            errors.append(f"actions.{key} must be an object")
    phone = actions.get("phone") or {}
    website = actions.get("website") or {}
    booking = actions.get("booking") or {}
    other = actions.get("other") or {}
    if not isinstance(phone.get("present"), bool) or not isinstance(phone.get("usable"), bool):
        errors.append("actions.phone.present and usable must be booleans")
    if website.get("destination_state") not in {"resolves", "dead", "unrelated", "insecure", "missing"}:
        errors.append("actions.website.destination_state is invalid")
    if not isinstance(website.get("present"), bool) or not isinstance(website.get("usable"), bool):
        errors.append("actions.website.present and usable must be booleans")
    if booking.get("destination_state") not in {"resolves", "dead", "unrelated", "missing", "not_observed"}:
        errors.append("actions.booking.destination_state is invalid")
    if not isinstance(booking.get("present"), bool) or not isinstance(booking.get("usable"), bool):
        errors.append("actions.booking.present and usable must be booleans")
    if not isinstance(booking.get("is_primary"), bool):
        errors.append("actions.booking.is_primary must be a boolean")
    if not isinstance(other.get("usable"), bool):
        errors.append("actions.other.usable must be a boolean")
    if website.get("present") is True and website.get("destination_state") == "missing":
        errors.append("actions.website cannot be present with destination_state=missing")
    if website.get("present") is False and website.get("destination_state") != "missing":
        errors.append("actions.website must be missing when present=false")
    if website.get("usable") != (website.get("destination_state") == "resolves"):
        errors.append("actions.website.usable must equal (destination_state == 'resolves')")
    if booking.get("usable") != (booking.get("destination_state") == "resolves"):
        errors.append("actions.booking.usable must equal (destination_state == 'resolves')")

    facts = audit.get("facts") or {}
    required_facts = [
        "profile_status",
        "phone_action_usable",
        "website_action_usable",
        "booking_action_usable",
        "other_action_usable",
        "identity_consistent",
        "website_destination_state",
        "booking_is_primary_action",
        "booking_destination_state",
    ]
    for key in required_facts:
        if key not in facts:
            errors.append(f"facts.{key} is required")
    for key in ["phone_action_usable", "website_action_usable", "booking_action_usable", "other_action_usable", "identity_consistent", "booking_is_primary_action"]:
        if key in facts and not isinstance(facts[key], bool):
            errors.append(f"facts.{key} must be a boolean")
    if facts.get("profile_status") not in {"OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY", "UNKNOWN"}:
        errors.append("facts.profile_status is invalid")
    if facts.get("website_destination_state") not in {"resolves", "dead", "unrelated", "insecure", "missing"}:
        errors.append("facts.website_destination_state is invalid")
    if facts.get("booking_destination_state") not in {"resolves", "dead", "unrelated", "missing", "not_observed"}:
        errors.append("facts.booking_destination_state is invalid")

    # Facts must be a restatement of structured observations, not an independent
    # way to hide or manufacture a cap trigger.
    checks = [
        (facts.get("profile_status"), profile.get("business_status"), "profile_status"),
        (facts.get("phone_action_usable"), phone.get("usable"), "phone_action_usable"),
        (facts.get("website_action_usable"), website.get("usable"), "website_action_usable"),
        (facts.get("booking_action_usable"), booking.get("usable"), "booking_action_usable"),
        (facts.get("other_action_usable"), other.get("usable"), "other_action_usable"),
        (facts.get("website_destination_state"), website.get("destination_state"), "website_destination_state"),
        (facts.get("booking_is_primary_action"), booking.get("is_primary"), "booking_is_primary_action"),
        (facts.get("booking_destination_state"), booking.get("destination_state"), "booking_destination_state"),
        (facts.get("identity_consistent"), (audit.get("handoff") or {}).get("identity_match"), "identity_consistent"),
    ]
    for fact, observed, label in checks:
        if fact != observed:
            errors.append(f"facts.{label} conflicts with the structured observation")

    profile = audit.get("profile") or {}
    if not isinstance(profile.get("name"), str) or not profile.get("name"):
        errors.append("profile.name is required")
    if not isinstance(profile.get("primary_category"), str) or not profile.get("primary_category"):
        errors.append("profile.primary_category is required")
    for key in ["additional_categories", "attributes", "regular_hours"]:
        if not isinstance(profile.get(key), list) or any(not isinstance(entry, str) for entry in profile[key]):
            errors.append(f"profile.{key} must be an array of strings")
    if "description" in profile and not isinstance(profile["description"], str):
        errors.append("profile.description must be a string")

    handoff = audit.get("handoff") or {}
    for key in ["https", "resolves", "identity_match"]:
        if not isinstance(handoff.get(key), bool):
            errors.append(f"handoff.{key} must be a boolean")
    for key in ["final_url", "destination_title", "notes"]:
        if key in handoff and not isinstance(handoff[key], str):
            errors.append(f"handoff.{key} must be a string")

    review = audit.get("reviews") or {}
    if review.get("rating") is not None and (not is_number(review.get("rating")) or not 0 <= review["rating"] <= 5):
        errors.append("reviews.rating must be null or 0-5")
    if not isinstance(review.get("count"), int) or isinstance(review.get("count"), bool) or review["count"] < 0:
        errors.append("reviews.count must be a non-negative integer")
    if not isinstance(review.get("sample"), list):
        errors.append("reviews.sample must be an array")
    else:
        for index, entry in enumerate(review["sample"]):
            if not isinstance(entry, dict):
                errors.append(f"reviews.sample[{index}] must be an object")
                continue
            if not isinstance(entry.get("rating"), int) or isinstance(entry.get("rating"), bool) or not 1 <= entry["rating"] <= 5:
                errors.append(f"reviews.sample[{index}].rating must be 1-5")
            if not isinstance(entry.get("published_at"), str) or not entry.get("published_at"):
                errors.append(f"reviews.sample[{index}].published_at is required")
            if not isinstance(entry.get("owner_response"), bool):
                errors.append(f"reviews.sample[{index}].owner_response must be a boolean")
            if "service_terms" in entry and (not isinstance(entry["service_terms"], list) or any(not isinstance(term, str) for term in entry["service_terms"])):
                errors.append(f"reviews.sample[{index}].service_terms must be an array of strings")
    distribution = review.get("distribution")
    if not isinstance(distribution, dict):
        errors.append("reviews.distribution must be an object")
    else:
        for key, value in distribution.items():
            if key not in {"1", "2", "3", "4", "5"} or not isinstance(value, int) or isinstance(value, bool) or value < 0:
                errors.append("reviews.distribution must use keys 1-5 and non-negative integers")

    media = audit.get("media") or {}
    for key in ["count", "business_owned_count", "recent_count"]:
        if not isinstance(media.get(key), int) or isinstance(media.get(key), bool) or media[key] < 0:
            errors.append(f"media.{key} must be a non-negative integer")
    if not isinstance(media.get("categories"), list) or any(not isinstance(entry, str) for entry in media["categories"]):
        errors.append("media.categories must be an array of strings")

    measurement = audit.get("measurement") or {}
    for key in ["website_source_parameter", "booking_source_parameter"]:
        if measurement.get(key) is not None and not isinstance(measurement.get(key), str):
            errors.append(f"measurement.{key} must be a string or null")

    check_values = audit.get("checks")
    if not isinstance(check_values, dict):
        errors.append("checks must be an object")
        return errors

    item_ids = {item["id"] for item in rubric["items"]}
    unknown = sorted(set(check_values) - item_ids)
    for cid in unknown:
        errors.append(f"{cid}: unknown check id")
    missing = sorted(item_ids - set(check_values))
    if missing:
        errors.append(f"missing checks: {', '.join(missing)}")

    for item in rubric["items"]:
        cid = item["id"]
        check = check_values.get(cid)
        if check is None:
            continue
        if not isinstance(check, dict):
            errors.append(f"{cid}: check must be an object")
            continue
        applies, reason = applicability(item, config, facts, actions)
        declared = check.get("applicable")
        if not isinstance(declared, bool):
            errors.append(f"{cid}: applicable must be a boolean")
        elif declared != applies:
            errors.append(f"{cid}: applicable={declared} conflicts with configuration ({applies})")
        if check.get("needs_review") is True:
            errors.append(f"{cid}: needs_review must be false in a scored audit")
        if not applies:
            if check.get("score") is not None:
                errors.append(f"{cid}: N/A check must have score=null")
            if check.get("confidence") != "not_applicable":
                errors.append(f"{cid}: N/A confidence must be not_applicable")
            if not check.get("na_reason") and not reason:
                errors.append(f"{cid}: N/A check needs na_reason")
            continue
        score = check.get("score")
        if isinstance(score, bool) or not isinstance(score, int):
            errors.append(f"{cid}: score must be an integer")
            continue
        if score not in item["allowed"] or score > item["max"]:
            errors.append(f"{cid}: score {score} not allowed (allowed: {item['allowed']})")
        evidence = check.get("evidence")
        if not isinstance(evidence, list) or not evidence:
            errors.append(f"{cid}: evidence must be a non-empty array")
        elif any(not isinstance(entry, str) or not entry.strip() for entry in evidence):
            errors.append(f"{cid}: every evidence entry must be a non-empty string")
        refs = check.get("evidence_refs")
        if not isinstance(refs, list) or not refs:
            errors.append(f"{cid}: evidence_refs must be a non-empty array")
        else:
            for ref in refs:
                if ref not in source_ids:
                    errors.append(f"{cid}: evidence_refs contains unknown source {ref}")
        confidence = check.get("confidence")
        if confidence not in SCORED_CONFIDENCE:
            errors.append(f"{cid}: confidence must be verified or strong_signal")
        if item.get("evaluation") == "deterministic" and confidence != "verified":
            errors.append(f"{cid}: a deterministic check must use confidence=verified")

    limitations = audit.get("limitations")
    if limitations is not None and not isinstance(limitations, list):
        errors.append("limitations must be an array when present")
    return errors


def cap_clause(clause: dict, facts: dict) -> bool:
    value = facts.get(clause.get("fact"))
    if "equals" in clause:
        return value == clause["equals"]
    if "in" in clause:
        return value in clause["in"]
    return False


def cap_triggered(cap: dict, facts: dict) -> bool:
    return all(cap_clause(clause, facts) for clause in cap.get("trigger", {}).get("all", []))


def band_for(score: int, rubric: dict) -> dict:
    for entry in sorted(rubric["bands"], key=lambda b: b["min"], reverse=True):
        if score >= entry["min"]:
            return entry
    return rubric["bands"][-1]


def compute(audit: dict, rubric: dict) -> dict:
    config = audit["configuration"]
    checks = audit["checks"]
    facts = audit["facts"]
    actions = audit["actions"]
    sources = {source["id"]: source for source in audit["sources"]}
    fixes = {fix["checkId"]: fix for fix in rubric.get("fixes", [])}
    items = rubric["items"]

    active_caps = [cap for cap in rubric["caps"] if cap_triggered(cap, facts)]
    category_caps: dict[str, list[dict]] = {}
    for cap in active_caps:
        if cap["scope"] == "category":
            category_caps.setdefault(cap["category"], []).append(cap)

    categories = []
    findings = []
    coverage = []
    checks_out = []
    recoverable = []

    for cat in rubric["categories"]:
        cat_items = [item for item in items if item["cat"] == cat["id"]]
        applicable_max = 0
        earned = 0
        na_items = []
        for item in cat_items:
            applies, reason = applicability(item, config, facts, actions)
            check = checks.get(item["id"]) or {}
            if not applies:
                na_items.append(item["id"])
                coverage.append(coverage_row(item, check, False, reason))
                checks_out.append(check_row(item, check, False, reason))
                continue
            applicable_max += item["max"]
            score = check.get("score") or 0
            earned += score
            lost = item["max"] - score
            fix = fixes.get(item["id"], {})
            if lost > 0:
                recoverable.append(
                    {
                        "id": item["id"],
                        "title": item["title"],
                        "category": item["cat"],
                        "stage": item.get("journeyStage"),
                        "lost": lost,
                        "max": item["max"],
                        "score": score,
                        "severity": item.get("severity"),
                        "priority": fix.get("priority"),
                        "fix": fix.get("fix") or item.get("recommendedIntervention"),
                        "radModules": fix.get("radModules", []),
                        "ownerDataRequired": False,
                    }
                )
            findings.append(finding_row(item, check, fix))
            coverage.append(coverage_row(item, check, True, ""))
            checks_out.append(check_row(item, check, True, ""))

        normalized_before = round_to(cat["max"] * earned / applicable_max, 2) if applicable_max else 0.0
        category_cap = min([cap["max"] for cap in category_caps.get(cat["id"], [])], default=None)
        normalized = round_to(min(normalized_before, category_cap), 2) if category_cap is not None else normalized_before
        categories.append(
            {
                "id": cat["id"],
                "name": cat["name"],
                "question": cat.get("question", ""),
                "earned": earned,
                "max": cat["max"],
                "applicable_max": applicable_max,
                "normalized": normalized,
                "normalized_before_cap": normalized_before,
                "category_cap": category_cap,
                "applicable": applicable_max > 0,
                "na_checks": na_items,
                "percent": round_to(100 * earned / applicable_max, 1) if applicable_max else None,
            }
        )

    applicable_weight = sum(cat["max"] for cat in categories if cat["applicable"])
    raw_total = round_to(sum(cat["normalized"] for cat in categories), 2)
    total = round_to(raw_total * 100 / applicable_weight, 1) if applicable_weight else 0.0

    overall_caps = [cap for cap in active_caps if cap["scope"] == "overall"]
    cap = min([entry["max"] for entry in overall_caps], default=100)
    final = round_to(min(total, cap), 1)
    display = int(round_to(final, 0))
    band = band_for(display, rubric)

    caps_out = []
    for cap_entry in rubric["caps"]:
        active = cap_entry in active_caps
        if cap_entry["scope"] == "overall":
            before = total
            after = min(total, cap_entry["max"])
        else:
            category = next(c for c in categories if c["id"] == cap_entry["category"])
            before = category["normalized_before_cap"]
            after = min(before, cap_entry["max"])
        caps_out.append(
            {
                "id": cap_entry["id"],
                "label": cap_entry["label"],
                "scope": cap_entry["scope"],
                "category": cap_entry.get("category"),
                "max": cap_entry["max"],
                "active": active,
                "binding": active and after < before,
                "effect_before": before,
                "effect_after": after,
                "rationale": cap_entry["rationale"],
                "triggered_by": cap_entry.get("checks", []),
            }
        )

    journey = []
    for stage in sorted(rubric.get("journey", []), key=lambda s: s["order"]):
        stage_items = [item for item in items if item["id"] in stage.get("checks", [])]
        applicable = [item for item in stage_items if applicability(item, config, facts, actions)[0]]
        stage_max = sum(item["max"] for item in applicable)
        stage_earned = sum((checks.get(item["id"]) or {}).get("score") or 0 for item in applicable)
        if not applicable:
            status = "owner_data_required" if stage.get("ownerData") else "observed_unscored"
        elif stage.get("ownerData"):
            status = "scored_plus_owner_data"
        else:
            status = stage.get("coverageStatus", "scored")
        journey.append(
            {
                "id": stage["id"],
                "order": stage["order"],
                "label": stage["label"],
                "customerQuestion": stage.get("customerQuestion", ""),
                "status": status,
                "coverageStatus": stage.get("coverageStatus"),
                "checks": [item["id"] for item in applicable],
                "na_checks": [item["id"] for item in stage_items if item not in applicable],
                "ownerData": stage.get("ownerData", []),
                "earned": stage_earned,
                "max": stage_max,
                "percent": round_to(100 * stage_earned / stage_max, 1) if stage_max else None,
            }
        )

    owner_required = []
    for entry in rubric.get("ownerData", []):
        owner_required.append(
            {
                "id": entry["id"],
                "stage": entry.get("journeyStage"),
                "title": entry["title"],
                "confidence": "owner_data_required",
                "publicScoreImpact": "none",
                "whyItMatters": entry.get("whyItMatters", ""),
                "questions": entry.get("questions", []),
            }
        )

    triggered_modules = {module for finding in recoverable for module in finding.get("radModules", [])}
    opportunities = []
    for opportunity in rubric.get("opportunities", []):
        opportunities.append(
            {
                "id": opportunity["id"],
                "label": opportunity["label"],
                "radModule": opportunity["radModule"],
                "scored": False,
                "recommended": opportunity["radModule"] in triggered_modules,
                "why": opportunity["why"],
                "evidence": opportunity["evidence"],
            }
        )

    meta = {
        "run_id": audit["run"]["run_id"],
        "client": audit["business"]["name"],
        "trade": audit["business"]["trade"],
        "market": audit["business"]["market"],
        "audit_mode": "public",
        "synthetic": audit["run"]["synthetic"],
        "rubric_version": rubric["version"],
        "collector_version": audit["run"]["collector_version"],
        "started_at": audit["run"].get("started_at", ""),
        "source_mode": audit["run"].get("source_mode"),
        "place_id": audit["business"].get("place_id", ""),
        "website": audit["business"].get("website", ""),
    }

    verified = [finding for finding in findings if finding["confidence"] == "verified" and finding["lost"] > 0]
    strong = [finding for finding in findings if finding["confidence"] == "strong_signal" and finding["lost"] > 0]
    recommendations = sorted(
        recoverable,
        key=lambda row: (PRIORITY.get(row.get("priority"), 9), -row["lost"], row["id"]),
    )

    return {
        "schema_version": "1.0",
        "framework": "gbp-journey",
        "audit_mode": "public",
        "rubric_version": rubric["version"],
        "rubric_title": rubric.get("title", "Google Business Profile Scorecard"),
        "scorer_version": SCORER_VERSION,
        "meta": meta,
        "sources": [
            {
                "id": entry.get("id"),
                "type": entry.get("type"),
                "collected_at": entry.get("collected_at"),
                "collector_version": entry.get("collector_version"),
                "field_completeness": entry.get("field_completeness"),
                "endpoint": entry.get("endpoint", ""),
            }
            for entry in audit["sources"]
        ],
        "categories": categories,
        "checks": checks_out,
        "findings": sorted(findings, key=lambda row: (PRIORITY.get(row.get("priority"), 9), -row["lost"], row["id"])),
        "verifiedFindings": sorted(verified, key=lambda row: (-row["lost"], row["id"])),
        "strongSignals": sorted(strong, key=lambda row: (-row["lost"], row["id"])),
        "recommendations": recommendations,
        "ownerDataRequired": owner_required,
        "journey": journey,
        "coverage": coverage,
        "opportunities": opportunities,
        "normalization": {
            "method": "applicability_aware_category_normalization_with_caps",
            "applicable_weight": applicable_weight,
            "raw_total": raw_total,
            "na_checks": [row["id"] for row in coverage if not row["applicable"]],
            "category_caps": [
                {"category": category, "cap": min(entry["max"] for entry in entries)}
                for category, entries in sorted(category_caps.items())
            ],
        },
        "caps": caps_out,
        "total": total,
        "total_max": 100,
        "final": final,
        "display": display,
        "band": band["band"],
        "band_label": band["label"],
        "cap": cap,
        "cap_active": bool(active_caps),
        "cap_binding": final < total,
        "cap_applied": bool(active_caps),
    }


def finding_row(item: dict, check: dict, fix: dict) -> dict:
    score = check.get("score") or 0
    return {
        "id": item["id"],
        "title": item["title"],
        "category": item["cat"],
        "stage": item.get("journeyStage"),
        "score": score,
        "max": item["max"],
        "lost": item["max"] - score,
        "severity": item.get("severity"),
        "priority": fix.get("priority"),
        "confidence": check.get("confidence"),
        "evaluation": item.get("evaluation"),
        "evidence": check.get("evidence") or [],
        "evidence_refs": check.get("evidence_refs") or [],
        "recommendedIntervention": item.get("recommendedIntervention"),
        "fix": fix.get("fix") or item.get("recommendedIntervention"),
        "radModules": fix.get("radModules", []),
        "ownerDataRequired": False,
    }


def coverage_row(item: dict, check: dict, applies: bool, reason: str) -> dict:
    return {
        "id": item["id"],
        "name": item["title"],
        "category": item["cat"],
        "journeyStage": item.get("journeyStage"),
        "evidenceType": item.get("evidenceType", []),
        "evaluation": item.get("evaluation"),
        "applicability": item.get("applicability"),
        "condition": item.get("condition"),
        "requires": item.get("requires"),
        "applicable": applies,
        "naReason": "" if applies else (check.get("na_reason") or reason),
        "severity": item.get("severity"),
        "confidence": check.get("confidence") if applies else "not_applicable",
        "scoring": "scored" if applies else "excluded",
        "ownerData": False,
    }


def check_row(item: dict, check: dict, applies: bool, reason: str) -> dict:
    return {
        "id": item["id"],
        "title": item["title"],
        "category": item["cat"],
        "stage": item.get("journeyStage"),
        "max": item["max"],
        "score": check.get("score") if applies else None,
        "applicable": applies,
        "na_reason": "" if applies else (check.get("na_reason") or reason),
        "confidence": check.get("confidence") if applies else "not_applicable",
        "evidence": check.get("evidence") or [],
        "evidence_refs": check.get("evidence_refs") or [],
        "evaluation": item.get("evaluation"),
        "severity": item.get("severity"),
        "recommendedIntervention": item.get("recommendedIntervention"),
        "ownerData": False,
    }


def scorecard_markdown(result: dict) -> str:
    meta = result["meta"]
    lines = [
        f"# Google Business Profile Scorecard — {meta['client']}",
        "",
    ]
    if meta.get("synthetic"):
        lines += ["> **Synthetic example. Not a real business.**", ""]
    lines.append(
        f"**Score: {result['display']} / 100 — {result['band']} ({result['band_label']})**"
    )
    if result["cap_binding"]:
        active = ", ".join(cap["label"] for cap in result["caps"] if cap["binding"])
        lines.append(f"**Cap applied:** raw {result['total']} capped at {result['cap']} ({active})")
    if result["normalization"]["na_checks"]:
        lines.append(
            f"**Excluded as N/A:** {', '.join(result['normalization']['na_checks'])} "
            "(weights normalized)"
        )
    lines += [
        "",
        "| Category | Earned | Applicable | Weight | Normalized | % |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for category in result["categories"]:
        percent = f"{category['percent']:.0f}%" if category["percent"] is not None else "N/A"
        lines.append(
            f"| {category['id']}. {category['name']} | {category['earned']} | {category['applicable_max']} | "
            f"{category['max']} | {category['normalized']:.2f} | {percent} |"
        )
    lines += [
        "",
        f"**Audit mode:** {result['audit_mode']} · **Rubric:** v{result['rubric_version']} · "
        f"**Scorer:** v{result['scorer_version']} · **Run:** {meta['run_id']}",
        "",
    ]
    if result["verifiedFindings"]:
        lines += ["## Verified findings", ""]
        for finding in result["verifiedFindings"][:10]:
            lines.append(
                f"- **{finding['id']} {finding['title']}** — {finding['score']}/{finding['max']} "
                f"({finding['stage']}, {finding['severity']})"
            )
        lines.append("")
    if result["ownerDataRequired"]:
        lines += ["## Revenue opportunities to investigate (owner data required)", ""]
        for entry in result["ownerDataRequired"]:
            lines.append(f"- **{entry['title']}** — {entry['whyItMatters']}")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Score a public-mode GBP Scorecard audit.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""examples:
  python3 score.py --input audit.filled.json --out scores.json --markdown scorecard.md --strict
  python3 score.py --input audit.filled.json
""",
    )
    parser.add_argument("--input", required=True, help="Path to the filled audit JSON")
    parser.add_argument("--out", help="Write scores.json here")
    parser.add_argument("--markdown", help="Write scorecard.md here")
    parser.add_argument("--rubric", default=str(DEFAULT_RUBRIC), help="Rubric JSON")
    parser.add_argument("--strict", action="store_true", help="Accepted for pipeline compatibility; validation is always strict")
    parser.add_argument("--version", action="version", version=f"%(prog)s {SCORER_VERSION}")
    args = parser.parse_args()

    try:
        rubric = load_json(Path(args.rubric))
        audit = load_json(Path(args.input))
    except FileNotFoundError as exc:
        print(f"error: file not found: {exc.filename}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as exc:
        print(f"error: invalid JSON: {exc}", file=sys.stderr)
        return 2

    errors = validate(audit, rubric)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        print(f"\n{len(errors)} validation error(s); no score was written.", file=sys.stderr)
        return 1

    result = compute(audit, rubric)
    payload = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(payload, encoding="utf-8")
        print(f"wrote {out}")
    if args.markdown:
        markdown = Path(args.markdown)
        markdown.parent.mkdir(parents=True, exist_ok=True)
        markdown.write_text(scorecard_markdown(result), encoding="utf-8")
        print(f"wrote {markdown}")
    if not args.out and not args.markdown:
        print(payload, end="")

    print(
        f"score: {result['display']} / 100 · {result['band']} ({result['band_label']}) · "
        f"raw {result['total']} · cap {result['cap']} · N/A {len(result['normalization']['na_checks'])}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
