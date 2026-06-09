import React from 'react';
import { useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './Snackbar.css';

export default function Snackbar() {
  const { totalItems, subtotal, setIsDrawerOpen } = useWishlist();
  const location = useLocation();

  // Don't show on wishlist page or when cart is empty
  if (totalItems === 0 || location.pathname === '/wishlist') return null;

  return (
    <div className="snackbar">
      <div className="snackbar__info">
        <FontAwesomeIcon icon={faShoppingBag} className="snackbar__icon" style={{ fontSize: '18px' }} />
        <div className="snackbar__text">
          <span className="snackbar__count">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
          <span className="snackbar__total">₹{subtotal.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={() => setIsDrawerOpen(true)} className="snackbar__btn">
        View Order
        <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '14px' }} />
      </button>
    </div>
  );
}

