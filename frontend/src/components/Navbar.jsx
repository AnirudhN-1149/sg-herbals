import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

const LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuBsmTl7RwJn8HJcQqyFactNbxMuCnevm_tv2VD5-iNJnNSw1yUv224pbe3XmnOQ2a_CPmrT0enfRHxKA4OSgiG1M_IQJGlwH1SMTMs4vy_t6ABqWa12RMM31ccI_FDZt6xsiQZj1MHsGxZ8zoxibtJvmOik6KY9NurlCHA6PN8ZYFs3yOxqygL4TH5oxItiFUnJ5kaVC4M5NrsvcbPKrXQgc36W7e5DEZJuNuKNHagAQD4HhcX1rzaJK9kwcdPL3NuYJJl_8rWGieSk";

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container-max">
        {/* Logo - left */}
        <Link to="/" className="navbar__brand">
          <img src={LOGO} alt="SG Herbals Logo" className="navbar__logo" />
          <span className="navbar__brand-name font-headline-md">SG HERBALS</span>
        </Link>

        {/* Desktop centered nav links */}
        <div className="navbar__links">
          <Link to="/" className={`navbar__link font-label-md ${isActive('/') ? 'navbar__link--active' : ''}`}>HOME</Link>
          <Link to="/shop" className={`navbar__link font-label-md ${isActive('/shop') ? 'navbar__link--active' : ''}`}>SHOP</Link>
          <Link to="/about" className={`navbar__link font-label-md ${isActive('/about') ? 'navbar__link--active' : ''}`}>ABOUT</Link>
        </div>

        {/* Right side actions */}
        <div className="navbar__actions">
          {/* Mobile: info icon for About page */}
          <Link to="/about" className="navbar__about-mobile" title="About">
            <FontAwesomeIcon icon={faInfoCircle} />
          </Link>

          {/* Desktop: heart icon linking to order list page */}
          <Link to="/wishlist" className="navbar__heart-desktop" title="Order List">
            <span className="material-symbols-outlined">favorite</span>
            {totalItems > 0 && <span className="navbar__badge">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
