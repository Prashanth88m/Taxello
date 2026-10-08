import { Link } from "react-router-dom";
import About from "../components/sections/About";
import TestimonialsFAQ from "../components/sections/TestimonialsFAQ";
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
    <TestimonialsFAQ />
  </>;
}
