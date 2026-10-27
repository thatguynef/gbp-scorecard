#!/usr/bin/env python3
"""Unit tests for the deterministic GBP scorer."""

from __future__ import annotations

import copy
import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
FIXTURE = HERE / "fixtures" / "acme-plumbing.audit.json"
RUBRIC = HERE.parent / "references" / "rubric.json"

spec = importlib.util.spec_from_file_location("gbp_score", HERE / "score.py")
score = importlib.util.module_from_spec(spec)
spec.loader.exec_module(score)


class ScorerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rubric = json.loads(RUBRIC.read_text(encoding="utf-8"))
        cls.audit = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def fresh(self):
        return copy.deepcopy(self.audit), copy.deepcopy(self.rubric)

    def test_golden_fixture_is_68_c(self):
        audit, rubric = self.fresh()
        errors = score.validate(audit, rubric)
        self.assertEqual(errors, [])
        result = score.compute(audit, rubric)
        self.assertEqual(result["display"], 68)
        self.assertEqual(result["band"], "C")
        self.assertEqual(result["total"], 68.4)
        self.assertEqual(len(result["normalization"]["na_checks"]), 5)

    def test_category_math_reconciles(self):
        audit, rubric = self.fresh()
        result = score.compute(audit, rubric)
        normalized = sum(category["normalized"] for category in result["categories"])
        applicable_weight = sum(category["max"] for category in result["categories"] if category["applicable"])
        self.assertAlmostEqual(result["total"], round(normalized * 100 / applicable_weight, 1), places=1)
        self.assertEqual(result["total_max"], 100)

    def test_owner_data_never_appears_in_checks(self):
        audit, rubric = self.fresh()
        result = score.compute(audit, rubric)
        self.assertFalse(any(check["id"].startswith("OD-") for check in result["checks"]))
        self.assertTrue(all(entry["publicScoreImpact"] == "none" for entry in result["ownerDataRequired"]))
        self.assertFalse(any(entry.get("scored") for entry in result["ownerDataRequired"]))

    def test_optional_booking_checks_are_normalized_away(self):
        audit, rubric = self.fresh()
        audit["configuration"]["online_booking_expected"] = False
        for cid in ["GBP-CON-03", "GBP-HND-04", "GBP-MSR-02"]:
            audit["checks"][cid] = {
                "applicable": False,
                "score": None,
                "confidence": "not_applicable",
                "na_reason": "condition not enabled: online_booking_expected",
                "evidence": [],
                "evidence_refs": [],
            }
        self.assertEqual(score.validate(audit, rubric), [])
        result = score.compute(audit, rubric)
        self.assertIn("GBP-CON-03", result["normalization"]["na_checks"])
        self.assertIn("GBP-HND-04", result["normalization"]["na_checks"])
        self.assertIn("GBP-MSR-02", result["normalization"]["na_checks"])
        self.assertLess(result["categories"][2]["applicable_max"], 22)

    def test_profile_closed_cap_binds(self):
        audit, rubric = self.fresh()
        audit["profile"]["business_status"] = "CLOSED_PERMANENTLY"
        audit["facts"]["profile_status"] = "CLOSED_PERMANENTLY"
        result = score.compute(audit, rubric)
        self.assertTrue(result["cap_active"])
        self.assertTrue(result["cap_binding"])
        self.assertLessEqual(result["final"], 25)
        active = {cap["id"] for cap in result["caps"] if cap["active"]}
        self.assertIn("profile_closed", active)

    def test_no_action_path_cap_binds(self):
        audit, rubric = self.fresh()
        audit["actions"]["phone"] = {"present": True, "usable": False, "number": "(555) 010-0200"}
        audit["actions"]["website"] = {"present": True, "usable": False, "url": "https://acme-plumbing.example/", "destination_state": "dead"}
        audit["actions"]["booking"] = {"present": False, "usable": False, "is_primary": False, "url": "", "destination_state": "missing"}
        audit["actions"]["other"] = {"present": False, "usable": False, "label": ""}
        audit["facts"].update({
            "phone_action_usable": False,
            "website_action_usable": False,
            "booking_action_usable": False,
            "other_action_usable": False,
            "website_destination_state": "dead",
            "booking_destination_state": "missing",
        })
        audit["handoff"]["identity_match"] = True
        result = score.compute(audit, rubric)
        self.assertLessEqual(result["final"], 30)
        self.assertIn("no_action_path", {cap["id"] for cap in result["caps"] if cap["active"]})

    def test_identity_mismatch_is_a_category_cap(self):
        audit, rubric = self.fresh()
        audit["handoff"]["identity_match"] = False
        audit["facts"]["identity_consistent"] = False
        result = score.compute(audit, rubric)
        category_a = result["categories"][0]
        self.assertLessEqual(category_a["normalized"], 6)
        self.assertEqual(category_a["category_cap"], 6)
        self.assertIn("major_identity_mismatch", {cap["id"] for cap in result["caps"] if cap["active"]})

    def test_broken_primary_site_caps_handoff_not_conversion(self):
        audit, rubric = self.fresh()
        audit["actions"]["website"] = {"present": True, "usable": False, "url": "https://acme-plumbing.example/", "destination_state": "dead"}
        audit["facts"]["website_action_usable"] = False
        audit["facts"]["website_destination_state"] = "dead"
        result = score.compute(audit, rubric)
        category_f = next(category for category in result["categories"] if category["id"] == "F")
        self.assertLessEqual(category_f["normalized"], 4)
        self.assertIn("primary_site_broken", {cap["id"] for cap in result["caps"] if cap["active"]})

    def test_dead_booking_primary_caps_conversion(self):
        audit, rubric = self.fresh()
        audit["actions"]["booking"] = {
            "present": True,
            "usable": False,
            "is_primary": True,
            "url": "https://acme-plumbing.example/book",
            "destination_state": "dead",
        }
        audit["facts"].update({
            "booking_action_usable": False,
            "booking_is_primary_action": True,
            "booking_destination_state": "dead",
        })
        result = score.compute(audit, rubric)
        category_c = next(category for category in result["categories"] if category["id"] == "C")
        self.assertLessEqual(category_c["normalized"], 10)
        self.assertIn("dead_booking_primary", {cap["id"] for cap in result["caps"] if cap["active"]})

    def test_structural_na_prevents_duplicate_penalty(self):
        audit, rubric = self.fresh()
        audit["actions"]["booking"] = {"present": False, "usable": False, "is_primary": False, "url": "", "destination_state": "missing"}
        audit["facts"].update({"booking_action_usable": False, "booking_destination_state": "missing"})
        audit["checks"]["GBP-HND-04"] = {
            "applicable": False,
            "score": None,
            "confidence": "not_applicable",
            "na_reason": "not observable: booking_present",
            "evidence": [],
            "evidence_refs": [],
        }
        audit["checks"]["GBP-MSR-02"] = {
            "applicable": False,
            "score": None,
            "confidence": "not_applicable",
            "na_reason": "not observable: booking_resolves",
            "evidence": [],
            "evidence_refs": [],
        }
        self.assertEqual(score.validate(audit, rubric), [])
        result = score.compute(audit, rubric)
        self.assertIn("GBP-HND-04", result["normalization"]["na_checks"])
        self.assertIn("GBP-MSR-02", result["normalization"]["na_checks"])

    def test_deterministic_check_must_be_verified(self):
        audit, rubric = self.fresh()
        audit["checks"]["GBP-CON-01"]["confidence"] = "strong_signal"
        errors = score.validate(audit, rubric)
        self.assertTrue(any("deterministic" in error for error in errors))

    def test_missing_evidence_refs_fail(self):
        audit, rubric = self.fresh()
        audit["checks"]["GBP-CON-03"]["evidence_refs"] = []
        errors = score.validate(audit, rubric)
        self.assertTrue(any("evidence_refs" in error for error in errors))

    def test_unknown_schema_version_fails_safely(self):
        audit, rubric = self.fresh()
        audit["schema_version"] = "9.9"
        errors = score.validate(audit, rubric)
        self.assertTrue(any("schema_version" in error for error in errors))

    def test_fact_conflict_fails(self):
        audit, rubric = self.fresh()
        audit["facts"]["booking_action_usable"] = True
        errors = score.validate(audit, rubric)
        self.assertTrue(any("booking_action_usable" in error for error in errors))

    def test_credential_value_is_rejected_without_echo(self):
        audit, rubric = self.fresh()
        audit["sources"][0]["notes"] = "AIza" + "A" * 35
        errors = score.validate(audit, rubric)
        self.assertTrue(any("credential-like" in error for error in errors))
        self.assertFalse(any("A" * 35 in error for error in errors))

    def test_malformed_review_sample_fails(self):
        audit, rubric = self.fresh()
        audit["reviews"]["sample"][0]["rating"] = 9
        errors = score.validate(audit, rubric)
        self.assertTrue(any("reviews.sample[0].rating" in error for error in errors))

    def test_measurement_parameter_must_be_string_or_null(self):
        audit, rubric = self.fresh()
        audit["measurement"]["website_source_parameter"] = 42
        errors = score.validate(audit, rubric)
        self.assertTrue(any("measurement.website_source_parameter" in error for error in errors))

    def test_half_up_display_rounding(self):
        self.assertEqual(score.round_to(68.5, 0), 69)
        self.assertEqual(score.round_to(68.4, 0), 68)

    def test_opportunities_are_unscored(self):
        audit, rubric = self.fresh()
        result = score.compute(audit, rubric)
        self.assertTrue(all(entry["scored"] is False for entry in result["opportunities"]))
        before = result["display"]
        audit["opportunities"] = [{"id": "financing"}]
        result2 = score.compute(audit, rubric)
        self.assertEqual(result2["display"], before)


if __name__ == "__main__":
    unittest.main()
