import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import "./pages/CropRecommendation.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Challenges from "./components/Challenges";
import Mission from "./components/Mission";
import Features from "./components/Features";
import Footer from "./components/Footer";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseCare from "./pages/DiseaseCare";

function HomePage() {
  useEffect(() => {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const observeAll = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        if (!el.classList.contains("visible")) {
          revealObs.observe(el);
        }
      });
    };

    observeAll();

    // Re-run observation when React swaps components (HMR or navigation)
    const mutObs = new MutationObserver(observeAll);
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      revealObs.disconnect();
      mutObs.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Challenges />
      <Mission />
      <Features />
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/disease-care" element={<DiseaseCare />} />
      </Routes>
    </BrowserRouter>
  );
}
