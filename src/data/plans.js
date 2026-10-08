import { Crown, Sparkles } from "lucide-react";

export const plans = [
  {
    name: "Essential",
    price: "499",
    period: "one-time",
    description: "A simple starting point for individuals who need straightforward tax filing support.",
    icon: Sparkles,
    features: ["Individual tax return support", "Basic document review", "Tax computation", "Filing assistance", "Email support"],
  },
  {
    name: "Professional",
    price: "1,499",
    period: "one-time",
    popular: true,
    description: "For individuals with more complex income, investments or additional tax requirements.",
    icon: Crown,
    features: ["Everything in Essential", "Capital gains support", "Multiple income sources", "Detailed tax review", "Priority support"],
  },
  {
    name: "Business",
    price: "2,999",
    period: "per month",
    description: "A practical package for small businesses that need ongoing accounting and tax support.",
    icon: Crown,
    features: ["Business accounting support", "Monthly bookkeeping", "Tax planning assistance", "Financial reports", "Priority business support"],
  },
];
