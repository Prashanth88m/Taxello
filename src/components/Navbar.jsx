import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          TAXELLO
        </Link>

        <div className="desktop-nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/calculator">Calculator</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>

        <Link to="/contact" className="desktop-nav-cta">Get Started <ArrowRight size={16} /></Link>

        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
          <span>More</span>
        </button>
      </div>

      {menuOpen && <div className="mobile-navigation" id="mobile-navigation">
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        <NavLink to="/calculator" onClick={closeMenu}>Tax Calculator</NavLink>
        <NavLink to="/purchase" onClick={closeMenu}>Purchase</NavLink>
      </div>}
    </nav>
  );
}

export default Navbar;
