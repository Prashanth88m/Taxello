import test from "node:test";
import assert from "node:assert/strict";
import { canTransitionAdminStatus, isValidAdminStatus } from "./adminWorkflow.js";

test("contact and purchase transitions follow their supported lifecycle", () => {
  assert.equal(canTransitionAdminStatus("contacts", "new", "accepted"), true);
  assert.equal(canTransitionAdminStatus("contacts", "accepted", "in_progress"), true);
  assert.equal(canTransitionAdminStatus("purchases", "pending", "accepted"), true);
  assert.equal(canTransitionAdminStatus("purchases", "accepted", "in_progress"), true);
  assert.equal(canTransitionAdminStatus("purchases", "in_progress", "completed"), true);
  assert.equal(canTransitionAdminStatus("purchases", "completed", "accepted"), false);
  assert.equal(canTransitionAdminStatus("purchases", "cancelled", "in_progress"), false);
});

test("unknown historical status may be preserved as-is but not changed to an unsupported value", () => {
  assert.equal(canTransitionAdminStatus("contacts", "legacy_hold", "legacy_hold"), true);
  assert.equal(canTransitionAdminStatus("contacts", "legacy_hold", "accepted"), false);
  assert.equal(isValidAdminStatus("purchases", "contacted"), true);
  assert.equal(isValidAdminStatus("purchases", "unknown"), false);
});
