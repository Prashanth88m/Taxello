import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, CircleHelp, FileCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fadeUp, revealViewport } from "../../motionPresets";
import "./HomeOverview.css";

const audiences = [
  { icon: FileCheck2, title: "Individuals", text: "Organise income details and prepare for a clearer tax filing process." },
  { icon: BookOpenCheck, title: "Independent professionals", text: "Keep records and recurring financial tasks easier to review." },
  { icon: BriefcaseBusiness, title: "Small businesses", text: "Bring bookkeeping, payroll and tax-related responsibilities into a more structured routine." },
];

export default function HomeOverview() {
  return <>
    <section className="home-overview-section"><div className="home-overview-inner">
      <motion.header variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}><span className="page-eyebrow">A CLEARER PROCESS</span><h2>Less time untangling tasks.<br /><span>More clarity on what comes next.</span></h2><p>Tax and accounting work is easier to manage when information is organised, responsibilities are visible, and next steps are explained in plain language.</p></motion.header>
      <div className="home-audience-grid">{audiences.map(({ icon: Icon, title, text }, index) => <motion.article key={title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={index * .08}><Icon size={21} /><h3>{title}</h3><p>{text}</p></motion.article>)}</div>
    </div></section>
    <section className="home-process-section"><div className="home-overview-inner home-process-layout">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}><span className="page-eyebrow">HOW IT WORKS</span><h2>A straightforward way to begin.</h2><p>Start with the information you already have. The enquiry helps clarify the service, scope, and useful next step.</p><Link className="page-primary-link" to="/contact">Ask about a service <ArrowRight size={17} /></Link></motion.div>
      <div className="home-process-steps">{[["01", "Choose a starting point", "Explore a service or select the plan closest to your needs."], ["02", "Share useful context", "Tell us what you need help with and include relevant details."], ["03", "Discuss next steps", "A TAXELLO representative can follow up to understand scope and options."]].map(([number, title, text], index) => <motion.article key={number} variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={index * .08}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></motion.article>)}</div>
    </div></section>
    <section className="home-calculator-callout"><div className="home-overview-inner home-calculator-inner"><div><span className="page-eyebrow">A QUICK STARTING POINT</span><h2>Explore an illustrative tax estimate.</h2><p>Enter an annual income to see an estimate based on the illustrative India profile. The calculator is for guidance only, not tax advice.</p></div><Link className="page-primary-link" to="/calculator">Open the calculator <CircleHelp size={17} /></Link></div></section>
  </>;
}
