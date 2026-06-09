import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faStore, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from '../context/WishlistContext';
import './BottomBar.css';

export default function BottomBar() {
  const location = useLocation();
  const { totalItems } = useWishlist();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      <Link to="/" className={`bottom-nav__item ${isActive('/') ? 'bottom-nav__item--active' : ''}`}>
        <FontAwesomeIcon icon={faHome} />
        <span>Home</span>
      </Link>
      <Link to="/shop" className={`bottom-nav__item ${isActive('/shop') ? 'bottom-nav__item--active' : ''}`}>
        <FontAwesomeIcon icon={faStore} />
        <span>Shop</span>
      </Link>
      <Link to="/wishlist" className={`bottom-nav__item ${isActive('/wishlist') ? 'bottom-nav__item--active' : ''}`}>
        <div className="bottom-nav__icon-wrap">
          <FontAwesomeIcon icon={faShoppingBag} />
          {totalItems > 0 && <span className="bottom-nav__badge">{totalItems}</span>}
        </div>
        <span>Orders</span>
      </Link>
    </div>
  );
}
