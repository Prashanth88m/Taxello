import Navbar from "./components/Navbar";
import Footer from "./components/sections/Footer";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import CalculatorPage from "./pages/CalculatorPage";
import PricingPage from "./pages/PricingPage";
import PurchasePage from "./pages/PurchasePage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import FloatingNav from "./components/FloatingNav";
import ScrollToTop from "./components/ScrollToTop";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main className="app-main" key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <FloatingNav />
    </>
  );
}

export default App;
