import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/sections/Footer";
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AboutPage from "./pages/AboutPage";
import CalculatorPage from "./pages/CalculatorPage";
import PricingPage from "./pages/PricingPage";
import PurchasePage from "./pages/PurchasePage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import FloatingNav from "./components/FloatingNav";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const isAdminRoute = normalizedPath === "/admin" || normalizedPath.startsWith("/admin/");

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <FloatingNav />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          className={isAdminRoute ? "app-main app-main-admin" : "app-main"}
          key={isAdminRoute ? "/admin-workspace" : location.pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -2 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
