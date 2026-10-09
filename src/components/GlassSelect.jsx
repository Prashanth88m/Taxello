import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import "./GlassSelect.css";

export default function GlassSelect({
  id,
  name,
  value,
  options,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  className = "",
}) {
  const generatedId = useId();
  const listId = `${generatedId}-options`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const reduceMotion = useReducedMotion();
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    optionRefs.current[activeIndex]?.focus();

    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [activeIndex, open]);

  function openMenu(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(index) {
    onChange(options[index].value);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openMenu(selectedIndex);
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActiveIndex(nextIndex);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(activeIndex);
    }
  }

  return (
    <div ref={rootRef} className={`glass-select ${className}`} onKeyDown={handleKeyDown}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        id={id}
        className="glass-select-trigger"
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open ? `${listId}-option-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className="glass-select-value">{selectedOption?.label ?? "Select an option"}</span>
        <motion.span className="glass-select-chevron" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : .18 }}>
          <ChevronDown size={17} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            className="glass-select-options"
            role="listbox"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : .16 }}
          >
            {options.map((option, index) => (
              <li
                id={`${listId}-option-${index}`}
                key={option.value}
                ref={(node) => { optionRefs.current[index] = node; }}
                className={index === selectedIndex ? "is-selected" : ""}
                role="option"
                tabIndex={index === activeIndex ? 0 : -1}
                aria-selected={index === selectedIndex}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {index === selectedIndex && <Check size={16} aria-hidden="true" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
