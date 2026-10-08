import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { ToastContext } from "./ToastContext";
import "./Toast.css";

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const nextId = useRef(0);

  const showToast = useCallback((message, type = "success") => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);
  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(dismissToast, 4000);
    return () => window.clearTimeout(timeout);
  }, [toast, dismissToast]);

  const ToastIcon = toast?.type === "error" ? AlertCircle : CheckCircle2;

  return <ToastContext.Provider value={contextValue}>
    {children}
    <div className="taxello-toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false}>
        {toast && <motion.div
          key={toast.id}
          className={`taxello-toast taxello-toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <ToastIcon size={19} aria-hidden="true" />
          <span>{toast.type === "success" ? `✓ ${toast.message}` : toast.message}</span>
          <button type="button" onClick={dismissToast} aria-label="Dismiss notification"><X size={17} /></button>
        </motion.div>}
      </AnimatePresence>
    </div>
  </ToastContext.Provider>;
}
