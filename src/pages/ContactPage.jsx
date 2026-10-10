import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageForm from "../components/PageForm";
import PhoneInput from "../components/PhoneInput";
import ServiceSelect from "../components/ServiceSelect";
import { postApiRequest } from "../lib/api";
import { useToast } from "../components/ToastContext";
import { plans } from "../data/plans";
import "./PageStyles.css";

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const requestedPlanId = searchParams.get("plan");
  const requestedPlan = plans.find((plan) => plan.id === requestedPlanId);
  const planEnquiryOptions = plans.map((plan) => `Plan enquiry — ${plan.name}`);
  const [submitting, setSubmitting] = useState(false);
  const [phoneInputKey, setPhoneInputKey] = useState(0);
  const [service, setService] = useState(() => requestedPlan ? `Plan enquiry — ${requestedPlan.name}` : "");
  const [serviceError, setServiceError] = useState(false);
  const serviceControlRef = useRef(null);
  const submissionInProgress = useRef(false);
  const { showToast } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    if (!service) {
      setServiceError(true);
      serviceControlRef.current?.focus();
      return;
    }
    submissionInProgress.current = true;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);

    try {
      await postApiRequest("/api/contact", values);
      showToast("Enquiry submitted successfully", "success");
      form.reset();
      setPhoneInputKey((key) => key + 1);
      setService("");
      setServiceError(false);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }

  return <>
  <PageForm eyebrow="CONTACT TAXELLO" title="How can we help?" intro="Ask about tax filing, bookkeeping, business accounting, payroll, tax planning or another service need." onSubmit={handleSubmit}>
    <label>Full name<input name="name" autoComplete="name" required /></label>
    <div className="form-row">
      <label>Email<input type="email" name="email" autoComplete="email" required /></label>
      <div className="phone-form-field"><span>Phone</span><PhoneInput key={phoneInputKey} resetKey={phoneInputKey} /></div>
    </div>
    <div className="page-form-custom-field"><span id="contact-service-label">Service</span><ServiceSelect value={service} additionalOptions={planEnquiryOptions} onChange={(nextService) => { setService(nextService); setServiceError(false); }} error={serviceError} controlRef={serviceControlRef} labelledBy="contact-service-label" />{serviceError && <small id="contact-service-error" className="service-select-error" role="alert">Please select a service.</small>}</div>
    <label>Message<textarea name="message" rows="5" placeholder="Tell us what you need help with." /></label>
    <button className="form-submit" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send enquiry"} <span>{"\u2192"}</span></button>
    <p className="form-note">Share the service you need, relevant context, and any deadlines or records that may help us understand your request.</p>
  </PageForm>
  <section className="contact-next-steps"><div className="about-story-inner"><span className="page-eyebrow">AFTER YOU SEND YOUR ENQUIRY</span><h2>A clear next step starts with useful context.</h2><div className="contact-next-grid"><article><h3>What to include</h3><p>Tell us whether your request is personal or business-related, which service you are asking about, and what you would like help with.</p></article><article><h3>How it is handled</h3><p>Your message is saved for TAXELLO follow-up so the request can be reviewed with the information you provided.</p></article><article><h3>What happens next</h3><p>A TAXELLO representative can follow up to clarify scope, supporting information, and possible next steps. No response-time guarantee is implied.</p></article></div></div></section>
  </>;
}
