import { Link } from "react-router-dom";
import "./BrandLogo.css";

function TaxelloWordmark() {
  return <span className="taxello-brand-wordmark">TAXELLO</span>;
}

export default function BrandLogo({ size = "standard", onClick }) {
  return (
    <Link to="/" className={`taxello-brand taxello-brand-${size}`} aria-label="TAXELLO home" onClick={onClick}>
      <TaxelloWordmark />
    </Link>
  );
}
