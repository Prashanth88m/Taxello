import { useRef, useState } from "react";
import PageForm from "../components/PageForm";
import PhoneInput from "../components/PhoneInput";
import { postApiRequest } from "../lib/api";
import { useToast } from "../components/ToastContext";
import "./PageStyles.css";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [phoneInputKey, setPhoneInputKey] = useState(0);
  const submissionInProgress = useRef(false);
  const { showToast } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);

    try {
      await postApiRequest("/api/contact", values);
      showToast("Enquiry submitted successfully", "success");
      form.reset();
      setPhoneInputKey((key) => key + 1);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }

  return <PageForm eyebrow="CONTACT TAXELLO" title="How can we help?" intro="Send us a note about the support you are looking for and we'll be ready to follow up." onSubmit={handleSubmit}>
    <label>Full name<input name="name" autoComplete="name" required /></label>
    <div className="form-row">
      <label>Email<input type="email" name="email" autoComplete="email" required /></label>
      <div className="phone-form-field"><span>Phone</span><PhoneInput key={phoneInputKey} resetKey={phoneInputKey} /></div>
    </div>
    <label>Service<select name="service" defaultValue="" required><option value="" disabled>Select a service</option><option>Individual tax returns</option><option>Business tax & accounting</option><option>Bookkeeping</option><option>Payroll services</option><option>Tax planning</option><option>Compliance & advisory</option><option>Other enquiry</option></select></label>
    <label>Message<textarea name="message" rows="5" required placeholder="Tell us what you need help with." /></label>
    <button className="form-submit" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send enquiry"} <span>{"\u2192"}</span></button>
    <p className="form-note">Your enquiry is saved to TAXELLO's local database for follow-up.</p>
  </PageForm>;
}
