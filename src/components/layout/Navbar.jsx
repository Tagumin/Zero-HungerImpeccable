import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
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
            <path d="M16 2L30 25H2L16 2Z" stroke="white" strokeWidth="2" fill="none" />
            <path d="M16 9L24 23H8L16 9Z" fill="var(--amber)" />
          </svg>
          <span className="logo-text">Harvest.AI</span>
        </Link>

        <button
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li><a href="#features" onClick={closeMenu}>Features</a></li>
          <li>
            <a href="#contact" className="btn-primary-nav" onClick={closeMenu}>
              Get Started
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
