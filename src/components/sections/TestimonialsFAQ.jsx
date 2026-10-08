import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "./TestimonialsFAQ.css";
import { fadeUp, revealViewport } from "../../motionPresets";

function TestimonialsFAQ() {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqs = [
    {
      question: "What tax services does Taxello provide?",
      answer:
        "Taxello is designed to provide individual tax, business accounting, bookkeeping, payroll, GST, TDS and tax planning services.",
    },
    {
      question: "Can Taxello help with business accounting?",
      answer:
        "Yes. Our business-focused services are designed to help with bookkeeping, accounting organisation, payroll and tax-related responsibilities.",
    },
    {
      question: "Can I estimate my tax online?",
      answer:
        "Yes. Our illustrative tax calculator gives you a quick estimate based on the income amount you enter.",
    },
    {
      question: "Is the calculator an official tax assessment?",
      answer:
        "No. The calculator is an illustrative project feature and should not be treated as professional tax advice or an official tax assessment.",
    },
  ];

  return (
    <section className="testimonials-faq">
      <div className="tf-container">

        <div className="testimonial-side">
          <div className="section-label">
            <span></span>
            CLIENT EXPERIENCE
          </div>

          <h2>
            Clear service.
            <br />
            <span>Better experience.</span>
          </h2>

          <motion.div className="testimonial-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} whileHover={{ y: -4, transition: { duration: 0.25 } }}>
            <Quote size={28} />

            <p>
              “Taxello made the whole process feel much easier to
              understand. Everything was explained clearly and
              the experience felt straightforward.”
            </p>

            <div className="testimonial-person">
              <div className="avatar">A</div>

              <div>
                <strong>Alex Morgan</strong>
                <span>Sample client testimonial</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="faq-side">
          <div className="section-label">
            <span></span>
            FAQ
          </div>

          <h3>Frequently asked questions</h3>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div
                className={`faq-item ${
                  openFAQ === index ? "faq-open" : ""
                }`}
                key={faq.question}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
                custom={index * 0.04}
              >
                <button
                  type="button"
                  aria-expanded={openFAQ === index}
                  onClick={() =>
                    setOpenFAQ(
                      openFAQ === index ? -1 : index
                    )
                  }
                >
                  <span>{faq.question}</span>

                  <motion.span animate={{ rotate: openFAQ === index ? 180 : 0 }} transition={{ duration: 0.22 }}><ChevronDown size={18} /></motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {openFAQ === index && <motion.div className="faq-answer" key="answer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24, ease: "easeInOut" }}><p>{faq.answer}</p></motion.div>}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default TestimonialsFAQ;
