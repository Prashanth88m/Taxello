import { Crown, Sparkles } from "lucide-react";

export const plans = [
  {
    name: "Essential",
    price: "499",
    period: "one-time",
    description: "For individuals seeking guided support with a straightforward tax return and organised document review.",
    icon: Sparkles,
    features: ["Individual tax return support", "Basic document review", "Tax computation", "Filing assistance", "Email support"],
  },
  {
    name: "Professional",
    price: "1,499",
    period: "one-time",
    popular: true,
    description: "For individuals with multiple income sources or investments who want a detailed review and priority support.",
    icon: Crown,
    features: ["Everything in Essential", "Capital gains support", "Multiple income sources", "Detailed tax review", "Priority support"],
  },
  {
    name: "Business",
    price: "2,999",
    period: "per month",
    description: "For small businesses looking for ongoing bookkeeping, accounting organisation and practical tax planning support.",
    icon: Crown,
    features: ["Business accounting support", "Monthly bookkeeping", "Tax planning assistance", "Financial reports", "Priority business support"],
  },
];
