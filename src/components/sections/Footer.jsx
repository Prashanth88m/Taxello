import "./Footer.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandLogo from "../BrandLogo";
import { fadeUp, revealViewport } from "../../motionPresets";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">

          <motion.div className="footer-brand" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}>
            <BrandLogo size="large" />

            <p>
              Tax and accounting, made clear.
            </p>
          </motion.div>

          <div className="footer-links">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}>
              <h4>Explore</h4>

              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/services">Services</Link>
              <Link to="/calculator">Calculator</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/contact">Contact</Link>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={.08}>
              <h4>Services</h4>
              <Link to="/services">Individual tax returns</Link>
              <Link to="/services">Business accounting</Link>
              <Link to="/services">Bookkeeping & payroll</Link>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={.16}>
              <h4>Contact TAXELLO</h4>
              <p className="footer-contact-copy">Reach out through our enquiry form.</p>
              <Link to="/contact">Send an enquiry</Link>
            </motion.div>
          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 TAXELLO. Tax and accounting support.
          </span>

          <span>
            Clear information. Practical next steps.
          </span>
        </div>
      </footer>
    </>
  );
}

export default Footer;
