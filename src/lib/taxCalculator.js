export const countryProfiles = {
  IN: {
    name: "India",
    currency: "INR",
    symbol: "\u20B9",
    locale: "en-IN",
    example: "e.g. 1000000",
    profileLabel: "Illustrative India new-regime profile",
    hasTaxRules: true,
  },
  US: {
    name: "United States",
    currency: "USD",
    symbol: "$",
    locale: "en-US",
    example: "e.g. 100000",
    profileLabel: "Country-specific rules not configured",
    hasTaxRules: false,
  },
  GB: {
    name: "United Kingdom",
    currency: "GBP",
    symbol: "\u00A3",
    locale: "en-GB",
    example: "e.g. 80000",
    profileLabel: "Country-specific rules not configured",
    hasTaxRules: false,
  },
  CA: {
    name: "Canada",
    currency: "CAD",
    symbol: "C$",
    locale: "en-CA",
    example: "e.g. 100000",
    profileLabel: "Country-specific rules not configured",
    hasTaxRules: false,
  },
  AU: {
    name: "Australia",
    currency: "AUD",
    symbol: "A$",
    locale: "en-AU",
    example: "e.g. 100000",
    profileLabel: "Country-specific rules not configured",
    hasTaxRules: false,
  },
};

// Guardrail for this personal-income estimator: support up to one billion
// currency units (₹100 crore for the default India profile) without accepting
// inputs beyond a useful, safely presentable range.
export const MAX_ANNUAL_INCOME = 1_000_000_000;

export function isIncomeOverLimit(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return false;
  const normalized = value.replace(/^0+(?=\d)/, "");
  const maximum = String(MAX_ANNUAL_INCOME);
  return normalized.length > maximum.length || (normalized.length === maximum.length && normalized > maximum);
}

export function parseIncome(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value) || isIncomeOverLimit(value)) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function calculateIndiaTax(taxableIncome) {
  if (!Number.isFinite(taxableIncome) || taxableIncome < 0 || taxableIncome > MAX_ANNUAL_INCOME) return null;
  let tax;

  if (taxableIncome <= 400000) {
    tax = 0;
  } else if (taxableIncome <= 800000) {
    tax = (taxableIncome - 400000) * 0.05;
  } else if (taxableIncome <= 1200000) {
    tax = 20000 + (taxableIncome - 800000) * 0.10;
  } else if (taxableIncome <= 1600000) {
    tax = 60000 + (taxableIncome - 1200000) * 0.15;
  } else if (taxableIncome <= 2000000) {
    tax = 120000 + (taxableIncome - 1600000) * 0.20;
  } else if (taxableIncome <= 2400000) {
    tax = 200000 + (taxableIncome - 2000000) * 0.25;
  } else {
    tax = 300000 + (taxableIncome - 2400000) * 0.30;
  }

  // Preserve the existing illustrative Section 87A rebate and cess logic.
  if (taxableIncome <= 1200000) tax = 0;
  const cess = tax * 0.04;
  return { tax, cess, total: tax + cess };
}

export function calculateEstimate(value, country, employment) {
  const grossIncome = parseIncome(value);
  if (grossIncome === null) return null;

  const profile = countryProfiles[country];
  if (!profile) return null;
  if (!profile.hasTaxRules) return { grossIncome, hasTaxRules: false };

  const standardDeduction = employment === "salary" ? Math.min(75000, grossIncome) : 0;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);
  const taxResult = calculateIndiaTax(taxableIncome);
  if (!taxResult || ![taxResult.tax, taxResult.cess, taxResult.total].every(Number.isFinite)) return null;
  return { grossIncome, standardDeduction, taxableIncome, hasTaxRules: true, ...taxResult };
}

export function formatCurrency(value, profile) {
  if (!Number.isFinite(value) || !profile || !profile.locale || !profile.symbol) return "—";
  const formattedNumber = new Intl.NumberFormat(profile.locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `${profile.symbol}${formattedNumber}`;
}
