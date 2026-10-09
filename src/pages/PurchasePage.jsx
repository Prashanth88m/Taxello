import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { plans } from "../data/plans";
import PageForm from "../components/PageForm";
import PhoneInput from "../components/PhoneInput";
import GlassSelect from "../components/GlassSelect";
import { postApiRequest } from "../lib/api";
import { useToast } from "../components/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import "./PageStyles.css";

export default function PurchasePage() {
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const initialPlan = plans.some((plan) => plan.name === requestedPlan) ? requestedPlan : "Essential";
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [submitting, setSubmitting] = useState(false);
  const [phoneInputKey, setPhoneInputKey] = useState(0);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const submissionInProgress = useRef(false);
  const { showToast } = useToast();
  const selectedPlanDetails = plans.find((plan) => plan.name === selectedPlan);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setPendingPurchase({ values, form });
  }

  async function confirmPurchase() {
    if (submissionInProgress.current || !pendingPurchase) return;
    submissionInProgress.current = true;
    setSubmitting(true);

    try {
      await postApiRequest("/api/purchases", pendingPurchase.values);
      showToast("Purchase request submitted successfully", "success");
      pendingPurchase.form.reset();
      setSelectedPlan(initialPlan);
      setPhoneInputKey((key) => key + 1);
      setPendingPurchase(null);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }

  return <>
  <PageForm eyebrow="PLAN ENQUIRY" title="Let's get started." intro="Tell us a little about what you need. Our team can confirm the right service and next steps." onSubmit={handleSubmit}>
    <div className="purchase-plan-summary"><span>Selected plan</span><strong>{selectedPlanDetails.name} {"\u2014 \u20B9"}{selectedPlanDetails.price}{selectedPlanDetails.name === "Business" ? "/month" : ""}</strong></div>
    <label>Full name<input name="name" autoComplete="name" required /></label>
    <div className="form-row">
      <label>Email<input type="email" name="email" autoComplete="email" required /></label>
      <div className="phone-form-field"><span>Phone number</span><PhoneInput key={phoneInputKey} resetKey={phoneInputKey} required /></div>
    </div>
    <label>Selected plan<GlassSelect name="plan" ariaLabel="Selected plan" value={selectedPlan} onChange={setSelectedPlan} options={plans.map((plan) => ({ value: plan.name, label: `${plan.name} — ₹${plan.price}${plan.name === "Business" ? "/month" : ""}` }))} /></label>
    <label>Additional requirements<textarea name="requirements" rows="5" placeholder="Share anything that will help us understand your needs." /></label>
    <button className="form-submit" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send plan enquiry"} <span>{"\u2192"}</span></button>
    <p className="form-note">Online payment is not currently collected. A TAXELLO representative can follow up regarding the selected plan.</p>
  </PageForm>
  <ConfirmDialog open={Boolean(pendingPurchase)} title="Submit this plan request?" message={`Submit your ${selectedPlanDetails.name} plan enquiry? Online payment is not currently collected.`} confirmLabel="Submit request" busy={submitting} onCancel={() => setPendingPurchase(null)} onConfirm={confirmPurchase} />
  </>;
}
