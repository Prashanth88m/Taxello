import { useRef, useState } from "react";

const phoneCountries = [
  { id: "IN", name: "India", callingCode: "+91", min: 10, max: 10, pattern: /^[6-9]\d{9}$/, example: "9988776655" },
  { id: "US", name: "United States", callingCode: "+1", min: 10, max: 10, pattern: /^[2-9]\d{9}$/, example: "2025550123" },
  { id: "GB", name: "United Kingdom", callingCode: "+44", min: 9, max: 10, pattern: /^[1-9]\d{8,9}$/, example: "7700900123" },
  { id: "CA", name: "Canada", callingCode: "+1", min: 10, max: 10, pattern: /^[2-9]\d{9}$/, example: "4165550123" },
  { id: "AU", name: "Australia", callingCode: "+61", min: 9, max: 9, pattern: /^[2-9]\d{8}$/, example: "412345678" },
  { id: "SG", name: "Singapore", callingCode: "+65", min: 8, max: 8, pattern: /^[3689]\d{7}$/, example: "81234567" },
  { id: "AE", name: "UAE", callingCode: "+971", min: 9, max: 9, pattern: /^[2-9]\d{8}$/, example: "501234567" },
];

function getPhoneError(countryId, nationalNumber) {
  if (!nationalNumber) return "";

  const country = phoneCountries.find((item) => item.id === countryId);
  if (nationalNumber.length < country.min) {
    return `${country.name} numbers need at least ${country.min} digits.`;
  }
  if (nationalNumber.length > country.max) {
    return `${country.name} numbers cannot exceed ${country.max} digits.`;
  }
  if (!country.pattern.test(nationalNumber)) {
    return `Check the phone number format for ${country.name}.`;
  }
  return "";
}

export default function PhoneInput({ required = false, resetKey = 0 }) {
  const [countryId, setCountryId] = useState("IN");
  const [nationalNumber, setNationalNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const inputRef = useRef(null);
  const country = phoneCountries.find((item) => item.id === countryId);
  const phoneValue = nationalNumber ? `${country.callingCode} ${nationalNumber}` : "";
  const visibleMessage = validationMessage || (required && touched && !nationalNumber ? "Phone number is required." : "");
  const inputId = `phone-national-${resetKey}`;
  const messageId = `${inputId}-message`;

  function updateNumber(event) {
    const digits = event.target.value.replace(/\D/g, "");
    const error = getPhoneError(countryId, digits);
    event.target.setCustomValidity(error);
    setNationalNumber(digits);
    setValidationMessage(error);
  }

  function updateCountry(event) {
    const nextCountryId = event.target.value;
    const error = getPhoneError(nextCountryId, nationalNumber);
    inputRef.current?.setCustomValidity(error);
    setCountryId(nextCountryId);
    setValidationMessage(error);
  }

  function handleBlur() {
    setTouched(true);
    if (required && !nationalNumber) {
      inputRef.current?.setCustomValidity("Phone number is required.");
    }
  }

  return <div className="phone-input-container">
    <div className="phone-input-control">
      <select aria-label="Country calling code" value={countryId} onChange={updateCountry}>
        {phoneCountries.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.callingCode})</option>)}
      </select>
      <input
        ref={inputRef}
        id={inputId}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        aria-label="National phone number"
        aria-invalid={Boolean(visibleMessage)}
        aria-describedby={messageId}
        required={required}
        value={nationalNumber}
        placeholder={country.example}
        onChange={updateNumber}
        onBlur={handleBlur}
      />
      <input type="hidden" name="phone" value={phoneValue} />
    </div>
    <small id={messageId} className={visibleMessage ? "phone-input-error" : "phone-input-hint"} aria-live="polite">
      {visibleMessage || `Enter ${country.min === country.max ? country.min : `${country.min}-${country.max}`} digits.`}
    </small>
  </div>;
}
