import { Mail, Phone } from "lucide-react";
import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">

          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              TAX<span>ELLO</span>
            </Link>

            <p>
              Tax and accounting, made clear.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Explore</h4>

              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/services">Services</Link>
              <Link to="/calculator">Calculator</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/contact">Contact</Link>
            </div>

            <div>
              <h4>Services</h4>
              <Link to="/services">Individual tax returns</Link>
              <Link to="/services">Business accounting</Link>
              <Link to="/services">Bookkeeping & payroll</Link>
            </div>

            <div>
              <h4>Demo contact details</h4>

              <a href="mailto:hello@taxello.example">
                <Mail size={15} />
                hello@taxello.example <span className="demo-note">demo</span>
              </a>

              <a href="tel:+910000000000">
                <Phone size={15} />
                +91 00000 00000 <span className="demo-note">demo</span>
              </a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Taxello. Project website.
          </span>

          <span>
            Built with React
          </span>
        </div>
      </footer>
    </>
  );
}

export default Footer;
