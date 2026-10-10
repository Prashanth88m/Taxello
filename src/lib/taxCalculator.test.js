import test from "node:test";
import assert from "node:assert/strict";
import { calculateEstimate, countryProfiles, formatCurrency, parseIncome } from "./taxCalculator.js";

test("income parsing rejects empty, negative, non-finite, and malformed values while accepting zero", () => {
  assert.equal(parseIncome(""), null);
  assert.equal(parseIncome("  "), null);
  assert.equal(parseIncome("-1"), null);
  assert.equal(parseIncome("Infinity"), null);
  assert.equal(parseIncome("not a number"), null);
  assert.equal(parseIncome("0"), 0);
  assert.equal(parseIncome("1000000"), 1000000);
});

test("India retains the existing illustrative salary deduction and calculation", () => {
  const salary = calculateEstimate("1300000", "IN", "salary");
  const business = calculateEstimate("1300000", "IN", "business");
  assert.equal(salary.standardDeduction, 75000);
  assert.equal(salary.taxableIncome, 1225000);
  assert.equal(salary.total, 66300);
  assert.equal(business.standardDeduction, 0);
  assert.equal(calculateEstimate("0", "IN", "business").total, 0);
});

test("other supported countries remain currency-only and do not use India slabs", () => {
  for (const country of ["US", "GB", "CA", "AU"]) {
    const estimate = calculateEstimate("100000", country, "salary");
    assert.equal(estimate.hasTaxRules, false);
    assert.equal("total" in estimate, false);
  }
  assert.equal(countryProfiles.IN.symbol, "\u20B9");
  assert.equal(countryProfiles.US.symbol, "$");
  assert.equal(countryProfiles.GB.symbol, "\u00A3");
  assert.equal(countryProfiles.CA.symbol, "C$");
  assert.equal(countryProfiles.AU.symbol, "A$");
});

test("currency display uses Indian digit grouping", () => {
  assert.equal(formatCurrency(1234567, countryProfiles.IN), "\u20B912,34,567");
});
