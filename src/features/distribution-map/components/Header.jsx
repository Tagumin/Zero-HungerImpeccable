import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="back-btn" title="Back to Home">
          &larr; Back
        </Link>
        <div className="header-logo">🍃</div>
        <h1 className="header-title">Food Distribution Route Optimization</h1>
      </div>
    </header>
  );
};

export default Header;