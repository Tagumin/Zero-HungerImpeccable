export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-brand">Harvest.AI</div>
          <p className="footer-tagline">
            Intelligent agriculture for the next generation of farmers
          </p>
        </div>
        <div className="footer-nav-col">
          <div className="footer-nav-group">
            <div className="footer-nav-title">Platform</div>
            <ul className="footer-links">
              <li><a href="#">Precision Engine</a></li>
              <li><a href="#">Decision Support</a></li>
              <li><a href="#">Threat Detection</a></li>
            </ul>
          </div>
          <div className="footer-nav-group">
            <div className="footer-nav-title">Company</div>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Documentation</a></li>
            </ul>
          </div>
          <div className="footer-nav-group">
            <div className="footer-nav-title">Legal</div>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} CropMind AI. All rights reserved.</p>
      </div>
    </footer>
  );
}