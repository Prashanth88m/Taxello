import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import "./Hero.css";
import { Link } from "react-router-dom";
import heroWorkspace from "../../assets/images/hero-financial-workspace.webp";
import { fadeUp } from "../../motionPresets";

const heroSequence = {
  hidden: {},
  visible: { transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
};

function Hero() {
  return (
    <section className="taxello-hero" id="home">

      {/* Background atmosphere */}
      <div className="hero-orb hero-orb-blue" />
      <div className="hero-orb hero-orb-purple" />
      <div className="hero-orb hero-orb-orange"></div>

      <div className="hero-grid"></div>

      <div className="taxello-hero-container">

        <motion.div
          className="hero-top-label"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span></span>
          TAX & ACCOUNTING SERVICES
          <span></span>
        </motion.div>

        <motion.div
          className="hero-main-content"
          variants={heroSequence}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-small-title" variants={fadeUp}>
            SIMPLE. CLEAR. CONFIDENT.
          </motion.div>

          <motion.h1 variants={fadeUp}>
            Tax made simple.
            <br />
            <span>Accounting made clear.</span>
          </motion.h1>

          <motion.p variants={fadeUp}>
            Taxello helps individuals and businesses manage tax,
            accounting and financial responsibilities with a
            simpler, clearer approach.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>

            <Link to="/pricing" className="hero-main-button">
              Get Started
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/calculator" className="hero-outline-button">
              <Calculator size={17} />
              Tax Calculator
            </Link>

          </motion.div>

          <motion.div className="hero-assurance" variants={fadeUp}>

            <div>
              <CheckCircle2 size={17} />
              Clear process
            </div>

            <div>
              <CheckCircle2 size={17} />
              Practical solutions
            </div>

            <div>
              <CheckCircle2 size={17} />
              Less complexity
            </div>

          </motion.div>
        </motion.div>

        {/* Tax visual */}
        <motion.div
          className="hero-tax-visual"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >

          <img
            className="hero-workspace-image"
            src={heroWorkspace}
            alt="A dark modern workspace with an abstract financial dashboard, documents and calculator"
            width="1600"
            height="686"
            fetchPriority="high"
            decoding="async"
            sizes="(max-width: 700px) 100vw, (max-width: 1200px) 90vw, 1000px"
          />

          <div className="floating-info floating-info-one">
            <CheckCircle2 size={18} />

            <div>
              <span>Tax return</span>
              <strong>Organised</strong>
            </div>
          </div>

          <div className="floating-info floating-info-two">
            <Calculator size={18} />

            <div>
              <span>Tax planning</span>
              <strong>Made simpler</strong>
            </div>
          </div>

        </motion.div>

        <div className="hero-bottom-label">
          <span>INDIVIDUALS</span>
          <i></i>
          <span>BUSINESSES</span>
          <i></i>
          <span>PROFESSIONALS</span>
        </div>

      </div>
    </section>
  );
}

export default Hero;
