import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaExternalLinkAlt } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">C</div>
          <span>Careerflow.ai</span>
        </Link>
        <div className="nav-links">
          <Link to="/">AI Resume Builder</Link>
          <Link to="/">Features <FaChevronDown size={10} /></Link>
          <Link to="/">Services <FaChevronDown size={10} /></Link>
          <Link to="/">For Orgs <FaChevronDown size={10} /></Link>
          <Link to="/">Resources <FaChevronDown size={10} /></Link>
          <Link to="/">Human Data <FaExternalLinkAlt size={10} /></Link>
        </div>
        <div className="nav-actions">
          <Link to="/signup" className="btn btn-outline">LOG IN</Link>
          <Link to="/signup" className="btn btn-primary">SIGN UP</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
