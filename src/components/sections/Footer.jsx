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
              <h4>Contact TAXELLO</h4>
              <p className="footer-contact-copy">Reach out through our enquiry form.</p>
              <Link to="/contact">Send an enquiry</Link>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 TAXELLO. Tax and accounting support.
          </span>

          <span>
            Clear information. Practical next steps.
          </span>
        </div>
      </footer>
    </>
  );
}

export default Footer;
