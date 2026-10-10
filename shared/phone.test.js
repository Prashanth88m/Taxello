import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, phoneLinkNumber } from "./phone.js";

test("supported stored international numbers normalize once for telephone links", () => {
  assert.equal(normalizePhone("+91 9988776655"), "+91 9988776655");
  assert.equal(phoneLinkNumber("+91 9988776655"), "919988776655");
  assert.equal(phoneLinkNumber("+1 (415) 555-2671"), "14155552671");
});

test("unsupported, malformed, and overlong numbers do not produce contact links", () => {
  for (const value of ["", "+91 9988776655978268326", "+999 123456789", "9988776655", "+91 1234567890"]) {
    assert.equal(phoneLinkNumber(value), null);
  }
});
