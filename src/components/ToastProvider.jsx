import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ToastContext } from "./ToastContext";
import "./Toast.css";

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const nextId = useRef(0);
  const reduceMotion = useReducedMotion();

  const showToast = useCallback((message, type = "success") => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);
  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    if (!toast || toast.type === "error") return undefined;
    const timeout = window.setTimeout(dismissToast, 4000);
    return () => window.clearTimeout(timeout);
  }, [toast, dismissToast]);

  const ToastIcon = toast?.type === "error" ? AlertCircle : CheckCircle2;

  return <ToastContext.Provider value={contextValue}>
    {children}
    <div className={`taxello-toast-region${location.pathname.startsWith("/admin") ? " taxello-toast-region-admin" : ""}`} aria-live={toast?.type === "error" ? "assertive" : "polite"} aria-atomic="true">
      <AnimatePresence initial={false}>
        {toast && <motion.div
          key={toast.id}
          className={`taxello-toast taxello-toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: "easeOut" }}
        >
          <ToastIcon size={19} aria-hidden="true" />
          <span>{toast.message}</span>
          <button type="button" onClick={dismissToast} aria-label="Dismiss notification"><X size={17} /></button>
        </motion.div>}
      </AnimatePresence>
    </div>
  </ToastContext.Provider>;
}
