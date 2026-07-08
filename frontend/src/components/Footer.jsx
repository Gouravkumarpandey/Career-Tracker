import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top CTA Banner */}
      <div className="footer-cta-banner">
        <div className="container">
          <div className="footer-cta-inner">
            <div>
              <h2>Ready to land your dream job?</h2>
              <p>Join thousands of professionals who accelerated their careers with CareerTracker.</p>
            </div>
            <Link to="/signup" className="btn btn-primary footer-cta-btn">Get Started Free →</Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Brand Column */}
            <div className="footer-brand-col">
              <div className="footer-logo">
                <div className="footer-logo-icon">C</div>
                <span>CareerTracker</span>
              </div>
              <p className="footer-tagline">
                Your all-in-one career platform. Get skill-based job recommendations, track your applications, and prepare for interviews — all in one place.
              </p>
              <div className="footer-socials">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FaTwitter /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a>
              </div>
            </div>

            {/* Product Links */}
            <div className="footer-links-col">
              <h5>Product</h5>
              <ul>
                <li><Link to="/">Job Tracker</Link></li>
                <li><Link to="/">AI Resume Builder</Link></li>
                <li><Link to="/">Resume Tailor</Link></li>
                <li><Link to="/">Interview Prep</Link></li>
                <li><Link to="/">Job Recommendations</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="footer-links-col">
              <h5>Resources</h5>
              <ul>
                <li><Link to="/">Blog</Link></li>
                <li><Link to="/">Resume Templates</Link></li>
                <li><Link to="/">Career Advice</Link></li>
                <li><Link to="/">Help Center</Link></li>
                <li><Link to="/">Community</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="footer-links-col">
              <h5>Company</h5>
              <ul>
                <li><Link to="/">About Us</Link></li>
                <li><Link to="/">Careers</Link></li>
                <li><Link to="/">Press</Link></li>
                <li><Link to="/">Contact</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
                <li><Link to="/">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-newsletter-col">
              <h5>Stay in the Loop</h5>
              <p>Get weekly career tips and job search strategies delivered to your inbox.</p>
              <div className="footer-newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button type="button">Subscribe</button>
              </div>
              <div className="footer-app-badges">
                <img
                  src="https://e7.pngegg.com/pngimages/912/1019/png-clipart-app-store-google-play-apple-apple-text-logo.png"
                  alt="Download on App Store & Google Play"
                />
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="footer-divider" />

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} CareerTracker AI. All rights reserved. Made with ❤️ in India.</p>
            <div className="footer-bottom-links">
              <Link to="/">Privacy</Link>
              <Link to="/">Terms</Link>
              <Link to="/">Cookies</Link>
              <Link to="/">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
