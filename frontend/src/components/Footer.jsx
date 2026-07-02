import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-col" style={{ maxWidth: '300px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              CareerTracker
            </h4>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              Your AI career platform to build ATS-ready resumes, optimize LinkedIn, and land jobs faster.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '20px' }}>
              <Link to="/"><FaTwitter /></Link>
              <Link to="/"><FaLinkedin /></Link>
              <Link to="/"><FaGithub /></Link>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><Link to="/">Features</Link></li>
              <li><Link to="/">Resume Builder</Link></li>
              <li><Link to="/">Cover Letters</Link></li>
              <li><Link to="/">Pricing</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/">Blog</Link></li>
              <li><Link to="/">Help Center</Link></li>
              <li><Link to="/">Career Advice</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">Careers</Link></li>
              <li><Link to="/">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CareerTracker AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
