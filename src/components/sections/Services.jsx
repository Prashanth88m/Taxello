import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
  ChevronDown,
  FileText,
  Landmark,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import "./Services.css";
import { Link } from "react-router-dom";
import { fadeUp, revealViewport } from "../../motionPresets";

const services = [
  {
    number: "01",
    icon: FileText,
    title: "Individual Tax Returns",
    description:
      "Clear and straightforward tax return support for individuals, with a focus on accuracy and simplicity.",
    who: "Individuals and salaried people preparing an annual return or organising income details.",
    support: "Document organisation, income review, tax computation and guided filing preparation.",
    tasks: "Income summaries, deduction records, supporting documents and return-ready information.",
    benefit: "A more structured filing process and clearer understanding of the information being submitted.",
  },
  {
    number: "02",
    icon: Landmark,
    title: "Business Tax & Accounting",
    description:
      "Practical accounting and tax support to help businesses stay organised and financially clear.",
    who: "Small businesses seeking a dependable way to organise records and tax responsibilities.",
    support: "Accounting coordination, periodic record review and practical tax planning discussions.",
    tasks: "Income and expense summaries, reconciliations, reporting preparation and compliance calendars.",
    benefit: "More useful records for routine decisions and a clearer view of upcoming responsibilities.",
  },
  {
    number: "03",
    icon: ReceiptText,
    title: "Bookkeeping",
    description:
      "Keep your financial records organised with a structured approach to everyday bookkeeping.",
    who: "Owners and independent professionals who need current, organised transaction records.",
    support: "A consistent process for categorising and reviewing routine financial activity.",
    tasks: "Recording income and expenses, organising receipts and preparing summaries for review.",
    benefit: "Less time searching for records and a stronger foundation for reporting and planning.",
  },
  {
    number: "04",
    icon: WalletCards,
    title: "Payroll Services",
    description:
      "Reliable payroll support designed to make employee payments and records easier to manage.",
    who: "Small teams that want payroll tasks and supporting records handled in an organised way.",
    support: "Payroll record coordination and preparation of routine payment information.",
    tasks: "Employee inputs, payment schedules, payroll summaries and supporting documentation.",
    benefit: "A repeatable payroll workflow with clearer records for internal review.",
  },
  {
    number: "05",
    icon: Calculator,
    title: "Tax Planning",
    description:
      "Plan ahead with a clearer understanding of your tax position and financial responsibilities.",
    who: "Individuals and business owners who want to review likely tax obligations before deadlines.",
    support: "An organised review of available income and expense information with practical planning discussion.",
    tasks: "Reviewing records, identifying information gaps and discussing relevant planning questions.",
    benefit: "More time to organise documents and consider options with appropriate professional guidance.",
  },
  {
    number: "06",
    icon: ShieldCheck,
    title: "Compliance & Advisory",
    description:
      "Stay on top of important financial and compliance responsibilities with practical guidance.",
    who: "Individuals and businesses who need help tracking recurring documentation and compliance tasks.",
    support: "A clear view of requested records, upcoming tasks and questions that need specialist review.",
    tasks: "Compliance checklists, document coordination and advisory discussions within the agreed scope.",
    benefit: "A more orderly process and fewer last-minute gaps in the information being prepared.",
  },
];

function ServiceCard({ service, index, preview }) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const Icon = service.icon;

  return <motion.article
    className="service-card"
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
    custom={index * 0.06}
    whileHover={reduceMotion ? undefined : { y: -5, transition: { duration: 0.28 } }}
  >
    <div className="service-top"><span className="service-number">{service.number}</span><div className="service-icon"><Icon size={20} strokeWidth={1.7} /></div></div>
    <div className="service-body"><h3>{service.title}</h3><p>{service.description}</p></div>
    {!preview && <>
      <AnimatePresence initial={false}>
        {expanded && <motion.div className="service-detail-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .24, ease: "easeInOut" }}>
          <p><strong>Who it is for</strong>{service.who}</p>
          <p><strong>How TAXELLO can help</strong>{service.support}</p>
          <p><strong>Typical tasks</strong>{service.tasks}</p>
          <p><strong>Benefit</strong>{service.benefit}</p>
          <Link to="/contact">Discuss this service <ArrowUpRight size={15} /></Link>
        </motion.div>}
      </AnimatePresence>
    </>}
    {preview
      ? <Link className="service-bottom" to="/services"><span>Explore service</span><span className="service-arrow"><ArrowUpRight size={17} /></span></Link>
      : <button className="service-bottom service-detail-action" type="button" onClick={() => setExpanded((isExpanded) => !isExpanded)} aria-expanded={expanded}><span>{expanded ? "Hide details" : "Who it helps and what is included"}</span><motion.span className="service-arrow" animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : .2 }}><ChevronDown size={17} /></motion.span></button>}
  </motion.article>;
}

function Services({ preview = false }) {
  return (
    <section className="taxello-services" id="services">
      <div className="services-orb services-orb-one"></div>
      <div className="services-orb services-orb-two"></div>

      <div className="services-container">

        <motion.div
          className="services-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <div className="services-label">
            <span></span>
            OUR SERVICES
            <span></span>
          </div>

          <h2>
            Everything you need
            <br />
            <span>to stay financially clear.</span>
          </h2>

          <p>
            From individual tax returns to business accounting,
            TAXELLO brings essential financial services together
            in one simple experience.
          </p>
        </motion.div>

        <div className="services-grid">
          {(preview ? services.slice(0, 3) : services).map((service, index) => <ServiceCard key={service.number} service={service} index={index} preview={preview} />)}
        </div>

        {preview && <Link className="section-more-link" to="/services">View all services <ArrowUpRight size={17} /></Link>}

      </div>
    </section>
  );
}

export default Services;
