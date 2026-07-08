import React from 'react';
import { FiMenu, FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search jobs, skills, or people..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="add-btn">
          <FiPlus />
          <span>New Entry</span>
        </button>
        <button className="header-icon-btn">
          <FiBell />
          <span className="notification-badge"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
