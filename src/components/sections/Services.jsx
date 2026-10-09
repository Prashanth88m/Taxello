import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Services.css";
import { fadeUp, revealViewport } from "../../motionPresets";
import { services } from "../../data/services";

function ServiceCard({ service, cardRef }) {
  const Icon = service.icon;

  return (
    <article
      ref={cardRef}
      className="service-card"
    >
      <Link className="service-card-link" to={`/services/${service.slug}`}>
        <span className="service-top">
          <span className="service-number">{service.number}</span>
          <span className="service-icon"><Icon size={20} strokeWidth={1.7} /></span>
        </span>
        <span className="service-body">
          <span className="service-title">{service.title}</span>
          <span className="service-summary">{service.summary}</span>
        </span>
        <span className="service-card-prompt">View service <ArrowUpRight size={15} /></span>
      </Link>
    </article>
  );
}

function Services({ preview = false }) {
  const visibleServices = preview ? services.slice(0, 3) : services;
  const [railIndex, setRailIndex] = useState(0);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  const scrollToService = (index) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    setRailIndex(index);
    if (!track || !card) return;

    track.scrollTo({
      left: Math.max(
        0,
        card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft
          - (track.clientWidth - card.offsetWidth) / 2,
      ),
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  return (
    <section className={`taxello-services${preview ? " taxello-services-preview" : ""}`} id="services">
      <div className="services-orb services-orb-one" />
      <div className="services-orb services-orb-two" />
      <div className="services-container">
        <motion.div className="services-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport}>
          <div className="services-label"><span />OUR SERVICES<span /></div>
          <h2>Everything you need<br /><span>to stay financially clear.</span></h2>
          <p>From individual tax returns to business accounting, TAXELLO brings essential financial services together in one simple experience.</p>
        </motion.div>

        <div className="services-rail-heading">
          <p>{preview ? "Explore a service to see how TAXELLO can help." : "Explore our services and find the support that fits your needs."}</p>
          {!preview && (
            <div className="services-rail-controls" aria-label="Service card controls">
              <button type="button" aria-label="Previous service" disabled={railIndex === 0} onClick={() => scrollToService(Math.max(0, railIndex - 1))}><ArrowLeft size={17} /></button>
              <span>{String(railIndex + 1).padStart(2, "0")} <i>/</i> {String(visibleServices.length).padStart(2, "0")}</span>
              <button type="button" aria-label="Next service" disabled={railIndex === visibleServices.length - 1} onClick={() => scrollToService(Math.min(visibleServices.length - 1, railIndex + 1))}><ArrowRight size={17} /></button>
            </div>
          )}
        </div>

        <div className="services-grid" ref={trackRef} role="region" aria-label="TAXELLO services">
          {visibleServices.map((service, index) => (
            <ServiceCard
              key={service.number}
              service={service}
              cardRef={(node) => { cardRefs.current[index] = node; }}
            />
          ))}
        </div>

        {preview && <Link className="section-more-link" to="/services">View all services <ArrowUpRight size={17} /></Link>}
      </div>
    </section>
  );
}

export default Services;
