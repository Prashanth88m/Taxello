import { motion } from "framer-motion";
import { BriefcaseBusiness, CreditCard, House, Mail } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import "./FloatingNav.css";

const links = [
  { to: "/", label: "Home", Icon: House, end: true },
  { to: "/services", label: "Services", Icon: BriefcaseBusiness },
  { to: "/pricing", label: "Pricing", Icon: CreditCard },
  { to: "/contact", label: "Contact", Icon: Mail },
];

export default function FloatingNav() {
  const { pathname } = useLocation();
  return (
    <nav className="floating-nav" aria-label="Main navigation">
      {links.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `floating-nav-link${isActive || (to === "/pricing" && pathname === "/purchase") ? " is-active" : ""}`}>
          {({ isActive }) => <>
            {(isActive || (to === "/pricing" && pathname === "/purchase")) && <motion.span className="floating-nav-highlight" layoutId="floating-nav-highlight" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </>}
        </NavLink>
      ))}
    </nav>
  );
}
