import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

const contactServices = [
  "Individual tax returns",
  "Business tax & accounting",
  "Bookkeeping",
  "Payroll services",
  "Tax planning",
  "Compliance & advisory",
  "Other enquiry",
];

export default function ServiceSelect({ value, onChange, error = false, controlRef, labelledBy, additionalOptions = [] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const initialFocusIndex = useRef(0);
  const options = [...contactServices, ...additionalOptions];
  const selectedIndex = options.indexOf(value);

  useEffect(() => {
    if (!open) return undefined;
    optionRefs.current[initialFocusIndex.current]?.focus();
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function openMenu() {
    const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
    initialFocusIndex.current = focusIndex;
    setActiveIndex(focusIndex);
    setOpen(true);
  }

  function choose(index) {
    onChange(options[index]);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu();
    } else if ((event.key === "Enter" || event.key === " ") && !open) {
      event.preventDefault();
      openMenu();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleMenuKeyDown(event) {
    if (event.target === triggerRef.current) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const current = options.indexOf(value) === activeIndex ? activeIndex : Math.max(0, optionRefs.current.indexOf(document.activeElement));
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActiveIndex(next);
      optionRefs.current[next]?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const index = optionRefs.current.indexOf(document.activeElement);
      if (index >= 0) choose(index);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return <div className="service-select" ref={rootRef} onKeyDown={handleMenuKeyDown}>
    <input type="hidden" name="service" value={value} />
    <button
      ref={(node) => { triggerRef.current = node; if (controlRef) controlRef.current = node; }}
      className={`service-select-trigger${error ? " is-invalid" : ""}`}
      type="button"
      role="combobox"
      aria-labelledby={labelledBy}
      aria-controls="contact-service-options"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-required="true"
      aria-invalid={error}
      aria-describedby={error ? "contact-service-error" : undefined}
      onClick={() => { if (open) setOpen(false); else openMenu(); }}
      onKeyDown={handleTriggerKeyDown}
      onBlur={(event) => { if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false); }}
    >
      <span className={value ? "service-select-value" : "service-select-placeholder"}>{value || "Select a service"}</span>
      <motion.span className="service-select-chevron" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: .18 }}><ChevronDown size={18} /></motion.span>
    </button>
    <AnimatePresence>
      {open && <motion.ul id="contact-service-options" className="service-select-options" role="listbox" aria-labelledby={labelledBy} initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} transition={{ duration: .18 }}>
        {options.map((service, index) => <li
          key={service}
          ref={(node) => { optionRefs.current[index] = node; }}
          role="option"
          tabIndex={activeIndex === index ? 0 : -1}
          aria-selected={value === service}
          className={value === service ? "is-selected" : ""}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => choose(index)}
        >{service}{value === service && <Check size={16} aria-hidden="true" />}</li>)}
      </motion.ul>}
    </AnimatePresence>
  </div>;
}
