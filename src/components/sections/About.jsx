import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./About.css";
import { Link } from "react-router-dom";
import { fadeLeft, fadeRight, fadeUp, revealViewport } from "../../motionPresets";
import aboutWorkspace from "../../assets/images/about-financial-workspace.webp";

function About({ preview = false }) {
  if (preview) {
    return (
      <section className="taxello-about about-preview" id="about">
        <div className="about-container">
          <div className="about-heading">
            <div className="section-label"><span />WHY TAXELLO</div>
            <h2>Financial clarity<br /><span>without the complexity.</span></h2>
            <p>Taxello brings tax and accounting together in a clear experience, helping people and businesses understand their numbers and make confident decisions.</p>
          </div>
          <div className="about-preview-points">
            <article><span>01</span><h3>Understand your numbers</h3><p>Clear explanations that help make complex information useful.</p></article>
            <article><span>02</span><h3>Stay organised</h3><p>Structured support for tax and everyday accounting tasks.</p></article>
            <article><span>03</span><h3>Plan with confidence</h3><p>A clearer view of your finances to support better decisions.</p></article>
          </div>
          <Link to="/about" className="about-link">More about Taxello <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="taxello-about" id="about">

      <div className="about-glow about-glow-one"></div>
      <div className="about-glow about-glow-two"></div>

      <div className="about-container">

        {/* Heading */}
        <motion.div
          className="about-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <div className="section-label">
            <span></span>
            WHY TAXELLO
          </div>

          <h2>
            Financial clarity
            <br />
            <span>without the complexity.</span>
          </h2>

          <p>
            Taxello brings tax and accounting services together
            in one clear experience, helping individuals and
            businesses understand their numbers and make
            confident financial decisions.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="about-layout">

          {/* Left — visual */}
          <motion.div
            className="about-visual"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >

            <div className="visual-glow"></div>

            <img
              className="about-workspace-image"
              src={aboutWorkspace}
              alt="An accounting workspace with a financial dashboard, organized documents and calculator"
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 900px) 90vw, 48vw"
            />

            <div className="glass-document">

              <div className="document-header">
                <div>
                  <span>TAXELLO</span>
                  <strong>Financial Overview</strong>
                </div>

                <div className="document-icon">
                  <FileText size={19} />
                </div>
              </div>

              <div className="document-line large"></div>
              <div className="document-line"></div>

              <div className="document-summary">

                <div className="summary-box">
                  <span>Tax planning</span>
                  <strong>Organised</strong>
                  <CheckCircle2 size={16} />
                </div>

                <div className="summary-box">
                  <span>Accounting</span>
                  <strong>On track</strong>
                  <CheckCircle2 size={16} />
                </div>

              </div>

              <div className="document-chart">

                <div className="chart-heading">
                  <span>Financial activity</span>
                  <span>Illustrative</span>
                </div>

                <div className="about-bars">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>

              </div>

              <div className="document-footer">
                <ShieldCheck size={16} />
                <span>Clear information. Smarter decisions.</span>
              </div>

            </div>

            <div className="about-floating-card">
              <Sparkles size={18} />

              <div>
                <span>Taxello approach</span>
                <strong>Simple & transparent</strong>
              </div>
            </div>

          </motion.div>

          {/* Right — points */}
          <motion.div
            className="about-content"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >

            <motion.div className="about-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={0} whileHover={{ y: -4, transition: { duration: 0.25 } }}>
              <div className="about-card-number">01</div>

              <div>
                <h3>Understand your numbers</h3>

                <p>
                  We turn complicated financial information into
                  clear, practical information you can actually use.
                </p>
              </div>
            </motion.div>

            <motion.div className="about-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={0.06} whileHover={{ y: -4, transition: { duration: 0.25 } }}>
              <div className="about-card-number">02</div>

              <div>
                <h3>Stay organised</h3>

                <p>
                  From tax returns to accounting responsibilities,
                  keep your financial tasks structured and easier
                  to manage.
                </p>
              </div>
            </motion.div>

            <motion.div className="about-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={0.12} whileHover={{ y: -4, transition: { duration: 0.25 } }}>
              <div className="about-card-number">03</div>

              <div>
                <h3>Make confident decisions</h3>

                <p>
                  With a clearer view of your finances, you can
                  focus on what matters instead of getting lost
                  in the paperwork.
                </p>
              </div>
            </motion.div>

            <Link to="/services" className="about-link">
              Explore our services
              <ArrowUpRight size={17} />
            </Link>

          </motion.div>

        </div>

      </div>
    </section>
  );
}

export default About;
