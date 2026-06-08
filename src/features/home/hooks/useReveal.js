import { useEffect } from "react";

export default function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    });

    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
  }, []);
}
