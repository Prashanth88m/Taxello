import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  CreditCard,
  House,
  Mail,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import "./FloatingNav.css";

const links = [
  { to: "/", label: "Home", Icon: House, end: true },
  { to: "/services", label: "Services", Icon: BriefcaseBusiness },
  { to: "/about", label: "About", Icon: UserRound },
  { to: "/calculator", label: "Calculator", Icon: Calculator },
  { to: "/pricing", label: "Pricing", Icon: CreditCard },
  { to: "/contact", label: "Contact", Icon: Mail },
];

export default function FloatingNav() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const activePath = pathname === "/purchase" ? "/pricing" : pathname;
  const activeIndex = links.findIndex(({ to }) => to === activePath);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="floating-nav" aria-label="Main navigation">
      <div className="floating-nav-capsule">
        <BrandLogo onClick={closeMenu} />
        <span className="floating-nav-divider" aria-hidden="true" />

        <div className="floating-nav-links" style={{ "--active-offset": `${activeIndex * 100}%` }}>
          {activeIndex >= 0 && <span className="floating-nav-highlight" aria-hidden="true" />}
          {links.map(({ to, label, Icon, end }) => {
            const active = activePath === to;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-current={active ? "page" : undefined}
                className={`floating-nav-link${active ? " is-active" : ""}`}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>

        <Link to="/pricing" className="floating-nav-cta" onClick={closeMenu}>
          Get Started <ArrowRight size={15} aria-hidden="true" />
        </Link>

        <button
          className="floating-nav-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="floating-nav-mobile-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="floating-nav-mobile-menu"
            className="floating-nav-mobile-menu"
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.16 }}
          >
            {links.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-current={activePath === to ? "page" : undefined}
                className={activePath === to ? "is-active" : ""}
                onClick={closeMenu}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            <Link to="/pricing" className="floating-nav-mobile-cta" onClick={closeMenu}>
              Get Started <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
