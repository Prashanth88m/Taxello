import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
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
  },
  {
    number: "02",
    icon: Landmark,
    title: "Business Tax & Accounting",
    description:
      "Practical accounting and tax support to help businesses stay organised and financially clear.",
  },
  {
    number: "03",
    icon: ReceiptText,
    title: "Bookkeeping",
    description:
      "Keep your financial records organised with a structured approach to everyday bookkeeping.",
  },
  {
    number: "04",
    icon: WalletCards,
    title: "Payroll Services",
    description:
      "Reliable payroll support designed to make employee payments and records easier to manage.",
  },
  {
    number: "05",
    icon: Calculator,
    title: "Tax Planning",
    description:
      "Plan ahead with a clearer understanding of your tax position and financial responsibilities.",
  },
  {
    number: "06",
    icon: ShieldCheck,
    title: "Compliance & Advisory",
    description:
      "Stay on top of important financial and compliance responsibilities with practical guidance.",
  },
];

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
          {(preview ? services.slice(0, 3) : services).map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                className="service-card"
                key={service.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
                custom={index * 0.06}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
              >
                <div className="service-top">
                  <span className="service-number">
                    {service.number}
                  </span>

                  <div className="service-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>
                </div>

                <div className="service-body">
                  <h3>{service.title}</h3>

                  <p>{service.description}</p>
                </div>

                <div className="service-bottom">
                  <span>Explore service</span>

                  <div className="service-arrow">
                    <ArrowUpRight size={17} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {preview && <Link className="section-more-link" to="/services">View all services <ArrowUpRight size={17} /></Link>}

      </div>
    </section>
  );
}

export default Services;
