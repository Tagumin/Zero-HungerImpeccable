import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Hero, About, Challenges, Mission, Features } from "@/features/home";

export default function HomePage() {
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
