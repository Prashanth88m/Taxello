import test from "node:test";
import assert from "node:assert/strict";
import { calculateEstimate, calculateIndiaTax, countryProfiles, formatCurrency, isIncomeOverLimit, MAX_ANNUAL_INCOME, parseIncome } from "./taxCalculator.js";

test("income parsing rejects empty, negative, non-finite, and malformed values while accepting zero", () => {
  assert.equal(parseIncome(""), null);
  assert.equal(parseIncome("  "), null);
  assert.equal(parseIncome("-1"), null);
  assert.equal(parseIncome("Infinity"), null);
  assert.equal(parseIncome("not a number"), null);
  assert.equal(parseIncome("1e6"), null);
  assert.equal(parseIncome("1.5"), null);
  assert.equal(parseIncome("0"), 0);
  assert.equal(parseIncome("1000000"), 1000000);
});

test("annual income accepts the documented maximum and rejects values above it", () => {
  assert.equal(parseIncome(String(MAX_ANNUAL_INCOME)), MAX_ANNUAL_INCOME);
  assert.equal(isIncomeOverLimit(String(MAX_ANNUAL_INCOME)), false);
  assert.equal(parseIncome(String(MAX_ANNUAL_INCOME + 1)), null);
  assert.equal(isIncomeOverLimit(String(MAX_ANNUAL_INCOME + 1)), true);
  assert.equal(parseIncome("9".repeat(400)), null);
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

test("maximum and ordinary estimates remain finite and invalid formatting is safe", () => {
  const maximumEstimate = calculateEstimate(String(MAX_ANNUAL_INCOME), "IN", "business");
  const ordinaryEstimate = calculateEstimate("1000000", "IN", "business");
  assert.ok([maximumEstimate.tax, maximumEstimate.cess, maximumEstimate.total].every(Number.isFinite));
  assert.ok([ordinaryEstimate.tax, ordinaryEstimate.cess, ordinaryEstimate.total].every(Number.isFinite));
  assert.equal(calculateIndiaTax(Infinity), null);
  assert.equal(formatCurrency(Infinity, countryProfiles.IN), "—");
  assert.equal(formatCurrency(NaN, countryProfiles.IN), "—");
  assert.match(formatCurrency(maximumEstimate.total, countryProfiles.IN), /^\u20B9[\d,]+$/);
});
