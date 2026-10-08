import { Link } from "react-router-dom";
import About from "../components/sections/About";
import TestimonialsFAQ from "../components/sections/TestimonialsFAQ";
import { motion } from "framer-motion";
import { fadeUp, revealViewport } from "../motionPresets";
import "./PageStyles.css";

export default function AboutPage() {
  return <>
    <About />
    <section className="page-details">
      <div className="page-details-inner">
        <span className="page-eyebrow">A CLEARER WAY FORWARD</span>
        <h2>Practical support for every financial step.</h2>
        <p>Taxello brings tax, bookkeeping and accounting support into one considered experience. We focus on clear explanations, organised processes and useful guidance for individuals and growing businesses.</p>
        <p>Whether you are preparing a return, managing day-to-day records or planning ahead, our goal is to make the work easier to understand and act on.</p>
        <Link className="page-primary-link" to="/services">Explore our services <span>↗</span></Link>
      </div>
    </section>
    <section className="about-story-section"><div className="about-story-inner">
      <motion.header variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}><span className="page-eyebrow">WHAT TAXELLO IS</span><h2>Support that makes financial work easier to navigate.</h2><p>TAXELLO is a tax and accounting service concept built around practical help: organising information, clarifying the work involved, and making the next step easier to understand.</p></motion.header>
      <div className="about-story-grid">
        <motion.article variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}><span>THE CHALLENGE</span><h3>Important tasks can become hard to track.</h3><p>Returns, receipts, payroll details and recurring compliance tasks often live in different places. When records are scattered, it can be difficult to know what is complete and what information is still needed.</p></motion.article>
        <motion.article variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={.08}><span>OUR APPROACH</span><h3>Organise first. Explain clearly.</h3><p>We focus on making requests understandable, keeping supporting information structured, and discussing a realistic scope before moving into service work.</p></motion.article>
        <motion.article variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={.16}><span>OUR PHILOSOPHY</span><h3>Transparency throughout.</h3><p>Clear communication matters: what information is needed, what support is included, and which questions require specific professional review.</p></motion.article>
      </div>
    </div></section>
    <section className="about-process-section"><div className="about-story-inner about-process-inner">
      <div><span className="page-eyebrow">A PRACTICAL WORKING PROCESS</span><h2>From a question to a clearer plan.</h2><p>The process begins with a conversation about your needs. Scope and next steps can then be discussed based on the information available.</p></div>
      <ol>{[["Understand the request", "Share the task, deadline, and what you already have."], ["Organise the details", "Identify relevant records and any information gaps."], ["Discuss the support", "Confirm the work that fits the request and outline next steps."], ["Keep the process clear", "Stay aligned on information, responsibilities, and follow-up."]].map(([title, text], index) => <motion.li key={title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={index * .06}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></motion.li>)}</ol>
    </div></section>
    <section className="about-audience-section"><div className="about-story-inner"><span className="page-eyebrow">WHO IT IS DESIGNED FOR</span><h2>Useful support for different kinds of financial work.</h2><div className="about-audience-list"><p><strong>Individuals</strong> preparing tax information and seeking clear filing support.</p><p><strong>Independent professionals</strong> looking to organise transactions and recurring records.</p><p><strong>Small businesses</strong> managing bookkeeping, payroll, accounting and tax-related tasks.</p></div><p className="about-scope-note">The right service depends on your circumstances and the scope agreed for your enquiry.</p><Link className="page-primary-link" to="/contact">Tell us what you need <span>→</span></Link></div></section>
    <TestimonialsFAQ />
  </>;
}
