import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DiseaseCareSection from "./DiseaseCareSection";
import Footer from "@/components/layout/Footer";

function DiseaseNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <svg width="32" height="27" viewBox="0 0 32 27" fill="none">
            <path
              d="M16 2L30 25H2L16 2Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <path d="M16 9L24 23H8L16 9Z" fill="var(--amber)" />
          </svg>
          <span className="logo-text">Harvest.AI</span>
        </Link>

        <button
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/#about" onClick={closeMenu}>
              About
            </Link>
          </li>
          <li>
            <Link to="/#features" onClick={closeMenu}>
              Features
            </Link>
          </li>
          <li>
            <Link
              to="/#contact"
              className="btn-primary-nav"
              onClick={closeMenu}
            >
              Get Started
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default function DiseaseCarePage() {
  return (
    <>
      <DiseaseNavbar />
      <DiseaseCareSection />
      <Footer />
    </>
  );
}
