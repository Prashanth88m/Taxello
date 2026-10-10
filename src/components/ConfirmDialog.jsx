import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", busyLabel = "Please wait...", cancelLabel = "Cancel", busy = false, onConfirm, onCancel, danger = false }) {
  const reduceMotion = useReducedMotion();
  const cancelRef = useRef(null);
  const previousFocus = useRef(null);
  const onCancelRef = useRef(onCancel);
  const busyRef = useRef(busy);

  useEffect(() => {
    onCancelRef.current = onCancel;
    busyRef.current = busy;
  }, [onCancel, busy]);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    cancelRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape" && !busyRef.current) onCancelRef.current();
      if (event.key === "Tab") {
        const dialog = document.querySelector("[data-confirm-dialog]");
        const controls = dialog?.querySelectorAll("button:not(:disabled)") ?? [];
        if (controls.length < 2) return;
        if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls[controls.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
          event.preventDefault();
          controls[0].focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open]);

  return <AnimatePresence>
    {open && <motion.div className="confirm-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <motion.section
        className="confirm-dialog"
        data-confirm-dialog
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.985 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3, scale: 0.99 }}
        transition={{ duration: reduceMotion ? 0.1 : 0.17, ease: "easeOut" }}
      >
        <span className={`confirm-icon${danger ? " confirm-icon-danger" : ""}`}><AlertTriangle size={19} /></span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button ref={cancelRef} type="button" className="confirm-cancel" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className={`confirm-accept${danger ? " confirm-accept-danger" : ""}`} onClick={onConfirm} disabled={busy}>{busy ? busyLabel : confirmLabel}</button>
        </div>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}
