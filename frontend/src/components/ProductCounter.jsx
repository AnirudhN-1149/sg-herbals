import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './ProductCounter.css';

export default function ProductCounter({ product, variant = 'default' }) {
  const { wishlistItems, addToWishlist, updateQuantity } = useWishlist();
  const { showToast } = useToast();
  
  const identifier = product.cartId || product.id;
  const cartItem = wishlistItems.find(item => (item.cartId || item.id) === identifier);
  const quantity = cartItem ? cartItem.quantity : 0;

  const stockLimit = product.stock !== undefined && product.stock !== null ? product.stock : 10;
  const isOutOfStock = stockLimit <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantity >= stockLimit) {
      showToast('No more of this product can be added. Stock limit reached.', 'info');
      return;
    }

    if (quantity === 0) {
      addToWishlist(product);
    } else {
      updateQuantity(identifier, quantity + 1);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(identifier, quantity - 1);
  };

  if (isOutOfStock && quantity === 0) {
    return (
      <button 
        disabled
        className={`pc-add-btn pc-add-btn--out ${variant === 'large' ? 'pc-add-btn--large' : ''}`}
        style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--outline-variant)', color: 'var(--on-surface-variant)' }}
      >
        Out of Stock
      </button>
    );
  }

  if (quantity === 0) {
    return (
      <button 
        onClick={handleAdd} 
        className={`pc-add-btn ${variant === 'large' ? 'pc-add-btn--large' : ''}`}
      >
        {variant === 'large' ? 'Add to Order' : 'Add'}
      </button>
    );
  }

  return (
    <div className={`pc-counter ${variant === 'large' ? 'pc-counter--large' : ''}`} onClick={e => e.stopPropagation()}>
      <button onClick={handleRemove} className="pc-counter__btn pc-counter__btn--minus" aria-label="Decrease quantity">
        <FontAwesomeIcon icon={faMinus} style={{ fontSize: variant === 'large' ? '14px' : '11px' }} />
      </button>
      <span className="pc-counter__qty">{quantity}</span>
      <button 
        onClick={handleAdd} 
        className="pc-counter__btn pc-counter__btn--plus"
        aria-label="Increase quantity"
      >
        <FontAwesomeIcon icon={faPlus} style={{ fontSize: variant === 'large' ? '14px' : '11px' }} />
      </button>
    </div>
  );
}
