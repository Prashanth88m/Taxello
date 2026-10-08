import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calculator as CalculatorIcon, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { fadeUp, revealViewport } from "../../motionPresets";
import "./Calculator.css";

const countryProfiles = {
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

function calculateIndiaTax(taxableIncome) {
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

  // Illustrative application of Section 87A rebate.
  if (taxableIncome <= 1200000) {
    tax = 0;
  }

  // Health & Education Cess
  const cess = tax * 0.04;

  return { tax, cess, total: tax + cess };
}

function formatCurrency(value, profile) {
  const formattedNumber = new Intl.NumberFormat(profile.locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `${profile.symbol}${formattedNumber}`;
}

function Calculator() {
  const [income, setIncome] = useState("");
  const [employment, setEmployment] = useState("salary");
  const [country, setCountry] = useState("IN");
  const profile = countryProfiles[country];

  const result = useMemo(() => {
    if (income === "") return null;

    const grossIncome = Math.max(0, Number(income) || 0);
    if (!profile.hasTaxRules) {
      return { grossIncome, hasTaxRules: false };
    }

    // Keep the existing illustrative Indian standard deduction unchanged.
    const standardDeduction = employment === "salary" ? Math.min(75000, grossIncome) : 0;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction);
    const taxResult = calculateIndiaTax(taxableIncome);

    return {
      grossIncome,
      standardDeduction,
      taxableIncome,
      hasTaxRules: true,
      ...taxResult,
    };
  }, [income, employment, profile]);

  return (
    <section className="taxello-calculator" id="calculator">
      <div className="calculator-orb calculator-orb-one"></div>
      <div className="calculator-orb calculator-orb-two"></div>

      <div className="calculator-container">
        <motion.div
          className="calculator-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <div className="calculator-label"><span></span>TAXELLO TAX ESTIMATOR<span></span></div>
          <h2>See your tax position<br /><span>at a glance.</span></h2>
          <p>
            {country === "IN"
              ? "Enter a few basic details to get an illustrative estimate using the India new-regime profile."
              : "Currency updates for your selected country. A country-specific tax calculation is not configured for this demo."}
          </p>
        </motion.div>

        <motion.div
          className="calculator-glass"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <div className="calculator-form">
            <div className="calculator-form-header">
              <div className="calculator-icon"><CalculatorIcon size={20} /></div>
              <div><span>Quick estimate</span><strong>Your financial snapshot</strong></div>
            </div>

            <div className="calculator-field">
              <label htmlFor="calculator-country">Country / currency</label>
              <select id="calculator-country" value={country} onChange={(event) => setCountry(event.target.value)}>
                {Object.entries(countryProfiles).map(([code, item]) => (
                  <option key={code} value={code}>{item.name} ({item.currency})</option>
                ))}
              </select>
            </div>

            <div className="calculator-field">
              <label htmlFor="income">Annual income ({profile.currency})</label>
              <div className="income-input">
                <span className="calculator-currency-symbol" aria-hidden="true">{profile.symbol}</span>
                <input
                  id="income"
                  type="number"
                  min="0"
                  value={income}
                  placeholder={profile.example}
                  onChange={(event) => setIncome(event.target.value)}
                />
              </div>
            </div>

            {country === "IN" && <div className="calculator-field">
              <label htmlFor="employment">Income type</label>
              <select id="employment" value={employment} onChange={(event) => setEmployment(event.target.value)}>
                <option value="salary">Salaried individual</option>
                <option value="business">Business / profession</option>
              </select>
            </div>}

            <div className="calculator-note">
              <Info size={15} />
              <span>{country === "IN"
                ? <>Salaried users are shown with an illustrative \u20B975,000 standard deduction. {profile.profileLabel}.</>
                : <>Tax rules vary by country and tax year. {profile.profileLabel}; no foreign tax estimate is shown.</>}</span>
            </div>
          </div>

          <div className="calculator-result">
            <div className="result-top">
              <span>{country === "IN" ? "Estimated tax" : "Tax estimate"}</span>
              <span className="result-badge">{profile.currency} · {country === "IN" ? "Illustrative" : "Not configured"}</span>
            </div>

            <motion.div
              className={`result-number${result && !result.hasTaxRules ? " result-unavailable" : ""}`}
              key={`${country}-${result?.total ?? (result ? "unavailable" : "empty")}-${employment}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {result
                ? result.hasTaxRules ? formatCurrency(result.total, profile) : "Not configured"
                : `${profile.symbol} \u2014`}
            </motion.div>

            <p>{result
              ? result.hasTaxRules
                ? "Illustrative estimate including 4% health & education cess."
                : "No result is calculated because current country-specific tax rules are not configured."
              : "Enter your income above to see an illustrative estimate."}</p>

            <div className="result-breakdown">
              <div><span>Gross income</span><strong>{result ? formatCurrency(result.grossIncome, profile) : "\u2014"}</strong></div>
              <div><span>Taxable income</span><strong>{result?.hasTaxRules ? formatCurrency(result.taxableIncome, profile) : result ? "Unavailable" : "\u2014"}</strong></div>
              <div><span>Estimated cess</span><strong>{result?.hasTaxRules ? formatCurrency(result.cess, profile) : result ? "Unavailable" : "\u2014"}</strong></div>
            </div>

            <Link to="/contact" className="calculator-cta">Discuss your taxes<ArrowRight size={17} /></Link>
          </div>
        </motion.div>

        <p className="calculator-disclaimer">
          This calculator provides an illustrative estimate for website demonstration purposes only. It is not tax advice and does not account for every exemption, deduction, special-rate income, surcharge, marginal relief or individual tax circumstance. Tax rules vary by country and tax year; country-specific estimates are not configured outside India.
        </p>
      </div>
    </section>
  );
}

export default Calculator;
