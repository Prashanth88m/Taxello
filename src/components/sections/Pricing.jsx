import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import "./Pricing.css";
import { Link } from "react-router-dom";
import { plans } from "../../data/plans";
import { fadeUp, revealViewport } from "../../motionPresets";

function Pricing({ preview = false }) {
  return (
    <section className="taxello-pricing" id="pricing">
      <div className="pricing-orb pricing-orb-one"></div>
      <div className="pricing-orb pricing-orb-two"></div>

      <div className="pricing-container">
        <motion.div
          className="pricing-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <div className="pricing-label">
            <span></span>
            SIMPLE PRICING
            <span></span>
          </div>

          <h2>
            Choose the right
            <br />
            <span>level of support.</span>
          </h2>

          <p>
            Clear plans for individuals and businesses, with
            straightforward pricing and no unnecessary complexity.
          </p>
        </motion.div>

        <div className="pricing-grid">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.article
                className={`pricing-card ${
                  plan.popular ? "pricing-card-popular" : ""
                }`}
                key={plan.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
                custom={index * 0.06}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    MOST POPULAR
                  </div>
                )}

                <div className="pricing-card-top">
                  <div className="pricing-icon">
                    <Icon size={20} />
                  </div>

                  <span>{plan.name}</span>
                </div>

                <div className="pricing-price">
                  <span className="currency">₹</span>
                  <strong>{plan.price}</strong>
                  <small>/{plan.period}</small>
                </div>

                <p className="pricing-description">
                  {plan.description}
                </p>

                <div className="pricing-divider"></div>

                <div className="pricing-features">
                  {plan.features.map((feature) => (
                    <div
                      className="pricing-feature"
                      key={feature}
                    >
                      <Check size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  className={`pricing-button ${
                    plan.popular ? "pricing-button-primary" : ""
                  }`}
                  to={`/contact?plan=${plan.id}`}
                >
                  Select Plan
                  <ArrowRight size={17} />
                </Link>
              </motion.article>
            );
          })}
        </div>

        {preview && <Link className="section-more-link" to="/pricing">Compare all plans <ArrowRight size={17} /></Link>}

        <p className="pricing-note">
          Listed prices are the current plan enquiry prices. Any additional service scope can be discussed before work begins; online payment is not currently collected.
        </p>
      </div>
    </section>
  );
}

export default Pricing;
