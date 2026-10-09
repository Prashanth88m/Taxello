import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { services } from "../data/services";
import "./ServiceDetailPage.css";

export default function ServiceDetailPage() {
  const { serviceSlug } = useParams();
  const service = services.find((item) => item.slug === serviceSlug);

  if (!service) return <Navigate to="/services" replace />;

  const Icon = service.icon;

  return (
    <main className="service-detail-page">
      <div className="service-detail-container">
        <Link className="service-detail-back" to="/services"><ArrowLeft size={16} /> All services</Link>
        <header className="service-detail-heading">
          <div className="service-detail-icon"><Icon size={25} strokeWidth={1.7} /></div>
          <span className="page-eyebrow">SERVICE {service.number}</span>
          <h1>{service.title}</h1>
          <p>{service.description}</p>
        </header>

        <div className="service-detail-cards">
          <section className="service-detail-card">
            <span className="page-eyebrow">WHO IT IS FOR</span>
            <p>{service.who}</p>
          </section>
          <section className="service-detail-card">
            <span className="page-eyebrow">HOW TAXELLO CAN HELP</span>
            <p>{service.support}</p>
          </section>
          <section className="service-detail-card">
            <span className="page-eyebrow">TYPICAL TASKS</span>
            <p>{service.tasks}</p>
          </section>
          <section className="service-detail-card">
            <span className="page-eyebrow">POTENTIAL BENEFIT</span>
            <p>{service.benefit}</p>
          </section>
        </div>

        <div className="service-detail-cta">
          <div>
            <h2>Have a question about this service?</h2>
            <p>Send TAXELLO an enquiry to discuss what support may suit your needs.</p>
          </div>
          <Link className="page-primary-link" to={`/contact?service=${encodeURIComponent(service.title)}`}>
            Make an enquiry <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
