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
      </div>
    </header>
  );
};

export default Header;
