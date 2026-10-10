import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calculator as CalculatorIcon, Info } from "lucide-react";
import { Link } from "react-router-dom";
import GlassSelect from "../GlassSelect";
import { fadeUp, revealViewport } from "../../motionPresets";
import { calculateEstimate, countryProfiles, formatCurrency, isIncomeOverLimit, MAX_ANNUAL_INCOME, parseIncome } from "../../lib/taxCalculator";
import "./Calculator.css";

function Calculator() {
  const [income, setIncome] = useState("");
  const [employment, setEmployment] = useState("salary");
  const [country, setCountry] = useState("IN");
  const profile = countryProfiles[country];
  const validIncome = parseIncome(income);
  const invalidIncome = income.trim() !== "" && validIncome === null;
  const overIncomeLimit = isIncomeOverLimit(income);

  const result = useMemo(() => {
    return calculateEstimate(income, country, employment);
  }, [income, employment, country]);

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
              : "Currency updates for your selected country. A country-specific tax calculation is not configured for the selected country."}
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
              <GlassSelect
                id="calculator-country"
                ariaLabel="Country and currency"
                value={country}
                onChange={setCountry}
                options={Object.entries(countryProfiles).map(([code, item]) => ({ value: code, label: `${item.name} (${item.currency})` }))}
              />
            </div>

            <div className="calculator-field">
              <label htmlFor="income">Annual income ({profile.currency})</label>
              <div className="income-input">
                <span className="calculator-currency-symbol" aria-hidden="true">{profile.symbol}</span>
                <input
                  id="income"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={income}
                  placeholder={profile.example}
                  aria-invalid={invalidIncome}
                  aria-describedby={invalidIncome ? "income-error" : undefined}
                  onChange={(event) => {
                    const nextIncome = event.target.value;
                    if (/^\d*$/.test(nextIncome)) setIncome(nextIncome);
                  }}
                />
              </div>
              {invalidIncome && <small id="income-error" className="calculator-input-error" role="alert">
                {overIncomeLimit
                  ? `Maximum supported annual income is ${formatCurrency(MAX_ANNUAL_INCOME, profile)}.`
                  : "Enter a whole amount using digits only."}
              </small>}
            </div>

            {country === "IN" && <div className="calculator-field">
              <label htmlFor="employment">Income type</label>
              <GlassSelect
                id="employment"
                ariaLabel="Income type"
                value={employment}
                onChange={setEmployment}
                options={[
                  { value: "salary", label: "Salaried individual" },
                  { value: "business", label: "Business / profession" },
                ]}
              />
            </div>}

            <div className="calculator-note">
              <Info size={15} />
              <span>{country === "IN"
                ? <>Salaried users are shown with an illustrative {"\u20B9"}75,000 standard deduction. {profile.profileLabel}.</>
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
              <div><span>Total income</span><strong>{result ? formatCurrency(result.grossIncome, profile) : "\u2014"}</strong></div>
              <div><span>Taxable income</span><strong>{result?.hasTaxRules ? formatCurrency(result.taxableIncome, profile) : result ? "Unavailable" : "\u2014"}</strong></div>
              <div><span>Estimated cess</span><strong>{result?.hasTaxRules ? formatCurrency(result.cess, profile) : result ? "Unavailable" : "\u2014"}</strong></div>
              <div><span>Effective tax rate</span><strong>{result?.hasTaxRules && result.grossIncome > 0 ? `${((result.total / result.grossIncome) * 100).toFixed(1)}%` : result?.hasTaxRules ? "0%" : result ? "Unavailable" : "\u2014"}</strong></div>
            </div>

            <Link to="/contact" className="calculator-cta">Discuss your taxes<ArrowRight size={17} /></Link>
          </div>
        </motion.div>

        <p className="calculator-disclaimer">
          This calculator provides an illustrative estimate only. It is not tax advice and does not account for every exemption, deduction, special-rate income, surcharge, marginal relief or individual tax circumstance. Tax rules vary by country and tax year; country-specific estimates are not configured outside India.
        </p>
      </div>
    </section>
  );
}

export default Calculator;
