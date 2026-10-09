import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./sections/Footer.css";
import ctaWorkspace from "../assets/images/cta-financial-workspace.webp";
import { fadeUp, revealViewport } from "../motionPresets";

export default function FinalCTA() {
  return <section className="home-final-cta" id="contact">
    <div className="home-final-cta-inner">
      <motion.img
        className="home-final-cta-image"
        src={ctaWorkspace}
        alt=""
        aria-hidden="true"
        width="1600"
        height="600"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 800px) 100vw, 1100px"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      <div className="home-final-cta-overlay" aria-hidden="true" />
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}><span>READY WHEN YOU ARE</span><h2>Let's make tax<br /><strong>simpler.</strong></h2><p>Get started with TAXELLO and take the complexity out of your tax and accounting tasks.</p></motion.div>
      <motion.div className="home-cta-link-wrap" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={.12}><Link to="/pricing" className="home-cta-button">Get Started <ArrowUpRight size={18} /></Link></motion.div>
    </div>
  </section>;
}
