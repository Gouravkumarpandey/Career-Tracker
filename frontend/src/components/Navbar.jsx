import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaExternalLinkAlt } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">C</div>
          <span>Careerflow.ai</span>
        </Link>
        
        {/* Hamburger Menu Icon */}
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </div>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/" onClick={() => setIsOpen(false)}>AI Resume Builder</Link>
            <Link to="/" onClick={() => setIsOpen(false)}>Features <FaChevronDown size={10} /></Link>
            <Link to="/" onClick={() => setIsOpen(false)}>Services <FaChevronDown size={10} /></Link>
            <Link to="/" onClick={() => setIsOpen(false)}>For Orgs <FaChevronDown size={10} /></Link>
            <Link to="/" onClick={() => setIsOpen(false)}>Resources <FaChevronDown size={10} /></Link>
            <Link to="/" onClick={() => setIsOpen(false)}>Human Data <FaExternalLinkAlt size={10} /></Link>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>LOG IN</Link>
            <Link to="/signup" className="btn btn-primary" onClick={() => setIsOpen(false)}>SIGN UP</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
