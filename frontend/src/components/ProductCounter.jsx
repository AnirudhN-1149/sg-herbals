import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import './ProductCounter.css';

export default function ProductCounter({ product, variant = 'default' }) {
  const { wishlistItems, addToWishlist, updateQuantity } = useWishlist();
  
  const identifier = product.cartId || product.id;
  const cartItem = wishlistItems.find(item => (item.cartId || item.id) === identifier);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      <button onClick={handleRemove} className="pc-counter__btn pc-counter__btn--minus">
        <span className="material-symbols-outlined" style={{ fontSize: variant === 'large' ? '20px' : '16px' }}>remove</span>
      </button>
      <span className="pc-counter__qty">{quantity}</span>
      <button onClick={handleAdd} className="pc-counter__btn pc-counter__btn--plus">
        <span className="material-symbols-outlined" style={{ fontSize: variant === 'large' ? '20px' : '16px' }}>add</span>
      </button>
    </div>
  );
}
