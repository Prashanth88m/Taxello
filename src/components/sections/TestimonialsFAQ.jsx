import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "./TestimonialsFAQ.css";
import { fadeUp, revealViewport } from "../../motionPresets";

const faqs = [
  { question: "What services does TAXELLO provide?", answer: "The service categories include individual tax return support, business tax and accounting, bookkeeping, payroll, tax planning, and compliance guidance." },
  { question: "Who can use TAXELLO?", answer: "The service enquiry process is intended for individuals, freelancers, and small businesses looking for help organising tax or accounting tasks." },
  { question: "What is bookkeeping?", answer: "Bookkeeping is the regular recording and organisation of business income and expenses, helping keep financial records ready for review and reporting." },
  { question: "What is tax filing?", answer: "Tax filing is preparing and submitting the relevant return based on a person’s or business’s income and supporting information. Requirements depend on individual circumstances and applicable rules." },
  { question: "How does the enquiry process work?", answer: "Choose a service or plan, share the details needed to understand your request, and submit the form. A TAXELLO representative can follow up to discuss scope and next steps." },
  { question: "Is the calculator an official tax calculator?", answer: "No. It provides an illustrative India estimate and is not tax advice or an official assessment. Rules vary by country and tax year." },
  { question: "Does TAXELLO collect payment online?", answer: "No. Online payment is not currently collected. A representative can follow up regarding a selected plan." },
  { question: "Can I request a specific service?", answer: "Yes. Select the closest matching service in the contact form and describe your needs. You can choose Other enquiry if you are unsure." },
  { question: "Can businesses use TAXELLO?", answer: "Yes. Business enquiries can cover bookkeeping, accounting organisation, payroll support, tax planning, and compliance-related guidance." },
  { question: "What happens after I submit an enquiry?", answer: "Your request is stored for follow-up. Include enough context for the team to understand the service you need; a representative can then discuss suitable next steps." },
];

function TestimonialsFAQ() {
  const [openFAQ, setOpenFAQ] = useState(-1);
  return <section className="testimonials-faq">
    <div className="tf-container">
      <div className="testimonial-side">
        <div className="section-label"><span></span>OUR APPROACH</div>
        <h2>Clear service.<br /><span>Better understanding.</span></h2>
        <motion.div className="testimonial-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} whileHover={{ y: -4, transition: { duration: 0.25 } }}>
          <Quote size={28} />
          <p>We aim to make tax and accounting tasks easier to understand through organised information, clear explanations, and practical next steps.</p>
          <div className="testimonial-person"><div className="avatar">T</div><div><strong>The TAXELLO approach</strong><span>Service philosophy</span></div></div>
          <small className="testimonial-disclaimer">Sample service statement; no customer testimonial or claim is implied.</small>
        </motion.div>
      </div>
      <div className="faq-side">
        <div className="section-label"><span></span>FAQ</div>
        <h3>Frequently asked questions</h3>
        <div className="faq-list">{faqs.map((faq, index) => <motion.div className={`faq-item ${openFAQ === index ? "faq-open" : ""}`} key={faq.question} variants={fadeUp} initial="hidden" whileInView="visible" viewport={revealViewport} custom={index * 0.04}>
          <button type="button" aria-expanded={openFAQ === index} onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}><span>{faq.question}</span><motion.span animate={{ rotate: openFAQ === index ? 180 : 0 }} transition={{ duration: 0.22 }}><ChevronDown size={18} /></motion.span></button>
          <AnimatePresence initial={false}>{openFAQ === index && <motion.div className="faq-answer" key="answer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24, ease: "easeInOut" }}><p>{faq.answer}</p></motion.div>}</AnimatePresence>
        </motion.div>)}</div>
      </div>
    </div>
  </section>;
}

export default TestimonialsFAQ;
