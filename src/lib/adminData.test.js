import test from "node:test";
import assert from "node:assert/strict";
import { countBucket, getRequestBucket, matchesStatusFilter, recordsToCsv, statusFilterValues, sumRequestedPlanValue } from "./adminData.js";

test("request buckets are mutually exclusive and include accepted/in-progress work as open", () => {
  const contacts = ["new", "contacted", "accepted", "in_progress", "completed", "resolved", "cancelled", "legacy"].map((status) => ({ status }));
  const groups = ["open", "completed", "cancelled", "other"];
  assert.equal(groups.reduce((sum, bucket) => sum + countBucket(contacts, "contact", bucket), 0), contacts.length);
  assert.equal(getRequestBucket("contact", "resolved"), "completed");
  assert.equal(getRequestBucket("purchase", "accepted"), "open");
  assert.equal(getRequestBucket("purchase", "in_progress"), "open");
});

test("purchase filters omit legacy Contacted while the legacy status remains searchable as Open", () => {
  assert.equal(statusFilterValues("purchase").includes("contacted"), false);
  assert.equal(matchesStatusFilter({ status: "contacted" }, "purchase", "open"), true);
});

test("requested plan value uses stored values and excludes cancelled, unknown, and invalid records", () => {
  const result = sumRequestedPlanValue([
    { plan: "Essential", amount: 499, status: "pending" },
    { plan: "Professional", amount: 1499, status: "completed" },
    { plan: "Business", amount: 2999, status: "cancelled" },
    { plan: "Unknown", amount: null, status: "pending" },
    { plan: "Essential", amount: "not-a-number", status: "pending" },
  ], ["Essential", "Professional", "Business"]);
  assert.deepEqual(result, { total: 1998, included: 2, excludedCancelled: 1, excludedUnknownOrInvalid: 2 });
});

test("CSV escapes quotes, preserves Unicode, and neutralizes spreadsheet formulas", () => {
  const csv = recordsToCsv([{ id: 5, name: "=2+3", email: "a\"b@example.com", phone: "+91 9988776655", service: "Tax – return", status: "new", created_at: "2026-10-10", message: "@SUM(A1:A2)" }], "contact");
  assert.match(csv, /"'=2\+3"/);
  assert.match(csv, /"a""b@example\.com"/);
  assert.match(csv, /Tax – return/);
  assert.match(csv, /"'@SUM\(A1:A2\)"/);
});
