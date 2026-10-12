import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Services.css";
import { fadeUp, revealViewport } from "../../motionPresets";
import { services } from "../../data/services";

const ServiceCard = memo(function ServiceCard({ service, index, offset, position, onSelect, loading, fetchPriority, reducedMotion }) {
  const isSelected = position === "center";
  const isVisible = Math.abs(offset) <= 1;
  const transition = { duration: reducedMotion ? 0.01 : 0.4, ease: [0.4, 0, 0.2, 1] };

  return (
    <motion.article
      initial={false}
      animate={{
        opacity: isSelected ? 1 : isVisible ? 0.78 : 0,
        scale: isSelected ? 1.035 : isVisible ? 0.97 : 0.94,
        borderColor: isSelected ? "rgba(200, 188, 255, .4)" : "rgba(221, 216, 255, .12)",
      }}
      transition={{ ...transition, borderColor: { duration: reducedMotion ? 0.01 : 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className={`service-card service-card-${position}`}
      data-offset={offset}
      aria-hidden={!isVisible}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <button
        className="service-card-select"
        type="button"
        tabIndex={isVisible ? 0 : -1}
        aria-label={`${isSelected ? "Selected" : "Select"} service: ${service.title}`}
        aria-pressed={isSelected}
        onClick={() => onSelect(index)}
      >
        <span className="service-image-wrap">
          <img className="service-image" src={service.image} alt={service.imageAlt} width="740" height="528" loading={loading} fetchPriority={fetchPriority} decoding="async" />
          <span className="service-image-shade" />
          <span className="service-number">{service.number}</span>
        </span>
        <span className="service-body">
          <span className="service-title">{service.title}</span>
          <span className="service-summary">{service.summary}</span>
        </span>
      </button>
      <Link className="service-card-prompt" tabIndex={isVisible ? 0 : -1} to={`/services/${service.slug}`}>Learn more <ArrowUpRight size={15} /></Link>
    </motion.article>
  );
});

function Services({ preview = false }) {
  const visibleServices = useMemo(() => preview ? services.slice(0, 3) : services, [preview]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [navigationDirection, setNavigationDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const wheelGesture = useRef({ deltaX: 0, selected: false, resetTimer: null });
  const selectedIndexRef = useRef(0);
  const carouselRef = useRef(null);
  const wrapIndex = useCallback((index) => (index + visibleServices.length) % visibleServices.length, [visibleServices.length]);
  const stepService = useCallback((direction) => {
    const nextIndex = wrapIndex(selectedIndexRef.current + direction);
    selectedIndexRef.current = nextIndex;
    setNavigationDirection(direction);
    setSelectedIndex(nextIndex);
  }, [wrapIndex]);
  const selectService = useCallback((index) => {
    if (index === selectedIndexRef.current) return;
    const direction = index === wrapIndex(selectedIndexRef.current + 1) ? 1 : -1;
    selectedIndexRef.current = wrapIndex(index);
    setNavigationDirection(direction);
    setSelectedIndex(wrapIndex(index));
  }, [wrapIndex]);
  const handleCarouselWheel = useCallback((event) => {
    const gesture = wheelGesture.current;
    const gestureEndMs = 140;
    const unitX = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1;
    const unitY = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const deltaX = event.deltaX * unitX;
    const deltaY = event.deltaY * unitY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const horizontalIntent = absX >= 1.5 && absX > absY * 1.2;

    if (!horizontalIntent) {
      if (absY > absX * 1.2) gesture.deltaX = 0;
      return;
    }

    window.clearTimeout(gesture.resetTimer);
    gesture.resetTimer = window.setTimeout(() => {
      gesture.deltaX = 0;
      gesture.selected = false;
      gesture.resetTimer = null;
    }, gestureEndMs);
    if (event.cancelable) event.preventDefault();

    if (gesture.selected) return;

    gesture.deltaX += deltaX;
    if (Math.abs(gesture.deltaX) >= 36 && visibleServices.length > 1) {
      const direction = gesture.deltaX > 0 ? 1 : -1;
      gesture.deltaX = 0;
      gesture.selected = true;
      stepService(direction);
    }
  }, [stepService, visibleServices.length]);
  useEffect(() => {
    const carousel = carouselRef.current;
    const gesture = wheelGesture.current;
    if (!carousel) return undefined;
    carousel.addEventListener("wheel", handleCarouselWheel, { passive: false });
    return () => {
      carousel.removeEventListener("wheel", handleCarouselWheel);
      window.clearTimeout(gesture.resetTimer);
    };
  }, [handleCarouselWheel]);
  const previousIndex = wrapIndex(selectedIndex - 1);
  const nextIndex = wrapIndex(selectedIndex + 1);
  const cards = visibleServices.map((service, index) => {
    let offset = wrapIndex(index - selectedIndex);
    if (offset > visibleServices.length / 2) offset -= visibleServices.length;
    if (visibleServices.length % 2 === 0 && offset === visibleServices.length / 2 && navigationDirection < 0) {
      offset = -offset;
    }

    const position = offset === 0 ? "center" : Math.abs(offset) === 1 ? (offset < 0 ? "previous" : "next") : "hidden";
    return { service, index, offset, position };
  });

  const handleCarouselKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepService(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepService(1);
    }
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
        </div>

        <div ref={carouselRef} className={`services-carousel${reduceMotion ? " services-reduced-motion" : ""}`} role="region" aria-label="TAXELLO services carousel" aria-roledescription="carousel" tabIndex={0} onKeyDown={handleCarouselKeyDown}>
          <button className="services-carousel-arrow services-carousel-previous" type="button" aria-label={`Previous service: ${visibleServices[previousIndex].title}`} onClick={() => stepService(-1)}>
            <ArrowLeft size={19} />
          </button>
          <div className="services-stage">
            {cards.map(({ service, index, offset, position }) => (
              <ServiceCard
                key={service.slug}
                service={service}
                index={index}
                offset={offset}
                position={position}
                onSelect={selectService}
                loading={preview ? "lazy" : "eager"}
                fetchPriority={!preview && position === "center" ? "high" : "auto"}
                reducedMotion={reduceMotion}
              />
            ))}
          </div>
          <button className="services-carousel-arrow services-carousel-next" type="button" aria-label={`Next service: ${visibleServices[nextIndex].title}`} onClick={() => stepService(1)}>
            <ArrowRight size={19} />
          </button>
          <span className="services-carousel-status" aria-live="polite" aria-atomic="true">{String(selectedIndex + 1).padStart(2, "0")} <i>/</i> {String(visibleServices.length).padStart(2, "0")} <span className="sr-only"> {visibleServices[selectedIndex].title} selected</span></span>
        </div>

        {preview && <Link className="section-more-link" to="/services">View all services <ArrowUpRight size={17} /></Link>}
      </div>
    </section>
  );
}

export default Services;
