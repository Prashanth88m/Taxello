import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "../motionPresets";
import "./PageStyles.css";

const legalContent = {
  privacy: {
    eyebrow: "PRIVACY OVERVIEW",
    title: "How enquiry information is used.",
    paragraphs: [
      "When you submit a TAXELLO contact or plan enquiry, the form sends the name, email, phone number, selected service or plan, and message or requirements you provide to the TAXELLO application for follow-up.",
      "Enquiry records are stored by the application and can be viewed by an authenticated administrator. The public forms do not process payments. Avoid including passwords, bank credentials, or other highly sensitive information in a message.",
      "This page is a plain-language product overview, not a complete privacy policy. Detailed retention, rights, and jurisdiction-specific terms should be confirmed before relying on it as a formal notice. For an enquiry about information you submitted, use the contact form.",
    ],
  },
  terms: {
    eyebrow: "TERMS OVERVIEW",
    title: "Information before you get started.",
    paragraphs: [
      "The website describes TAXELLO service categories and plan enquiry prices. Submitting a form sends a request for follow-up; it does not collect payment or by itself confirm a booking, scope of work, or professional engagement.",
      "The tax calculator provides an illustrative estimate only. It is not tax advice, an official assessment, or a substitute for reviewing your circumstances and the rules that apply to your tax year.",
      "This page is a plain-language product overview, not a complete set of legal terms. Scope, fees, responsibilities, and other engagement terms should be confirmed directly before any service work begins.",
    ],
  },
};

export default function LegalPage({ type }) {
  const content = legalContent[type] ?? legalContent.privacy;
  return <section className="legal-page page-details">
    <motion.div className="page-details-inner" variants={fadeUp} initial="hidden" animate="visible">
      <span className="page-eyebrow">{content.eyebrow}</span>
      <h1>{content.title}</h1>
      {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <Link className="page-primary-link" to="/contact">Contact TAXELLO <span aria-hidden="true">→</span></Link>
    </motion.div>
  </section>;
}
