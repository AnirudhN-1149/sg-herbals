import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMinus, faPlus, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import './WishlistDrawer.css';

const LOGO = "/logo.png";

export default function WishlistDrawer() {
  const { wishlistItems, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromWishlist, changeItemSize, subtotal } = useWishlist();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleViewOrderList = () => {
    setIsDrawerOpen(false);
    navigate('/wishlist');
  };

  return (
    <>
      <div
        className={`drawer-overlay ${isDrawerOpen ? 'drawer-overlay--open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <div className={`drawer ${isDrawerOpen ? 'drawer--open' : ''}`}>
        {/* Header */}
        <div className="drawer__header">
          <div className="drawer__header-brand">
            <img src={LOGO} alt="SG Herbals" className="drawer__logo" />
            <h2 className="drawer__title font-headline-sm">YOUR ORDER LIST</h2>
          </div>
          <button className="drawer__close" onClick={() => setIsDrawerOpen(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Items */}
        <div className="drawer__items custom-scrollbar">
          {wishlistItems.length === 0 ? (
            <div className="drawer__empty">
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Your order list is empty.</p>
              <button
                className="drawer__shop-btn font-label-md"
                onClick={() => { setIsDrawerOpen(false); navigate('/shop'); }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            wishlistItems.map(item => {
              const stockLimit = item.stock !== undefined && item.stock !== null ? item.stock : 10;
              
              return (
                <div key={item.cartId || item.id} className="drawer__item">
                  <div className="drawer__item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="drawer__item-info">
                    <div className="drawer__item-top">
                      <div>
                        <h3 className="font-headline-sm drawer__item-name">{item.name}</h3>
                        
                        {/* Dynamic Size Dropdown inside Drawer */}
                        {item.sizes && item.sizes.length > 1 ? (
                          <div style={{ marginTop: '2px' }}>
                            <select
                              value={item.size}
                              onChange={(e) => {
                                const newSize = e.target.value;
                                const sizeObj = item.sizes.find(s => s.label === newSize);
                                if (sizeObj) {
                                  changeItemSize(item.cartId || item.id, newSize, sizeObj.price);
                                }
                              }}
                              className="variant-select"
                            >
                              {item.sizes.map(s => (
                                <option key={s.label} value={s.label}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p className="font-body-sm drawer__item-sub">{item.size}</p>
                        )}
                      </div>
                      <span className="font-label-md drawer__item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <div className="drawer__item-bottom">
                      <div className="drawer__qty">
                        <button onClick={() => updateQuantity(item.cartId || item.id, item.quantity - 1)}>
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="font-label-md">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            if (item.quantity >= stockLimit) {
                              showToast('No more of this product can be added. Stock limit reached.', 'info');
                              return;
                            }
                            updateQuantity(item.cartId || item.id, item.quantity + 1);
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      <button className="drawer__remove" onClick={() => removeFromWishlist(item.cartId || item.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="drawer__footer">
            <div className="drawer__notice">
              <FontAwesomeIcon icon={faInfoCircle} className="drawer__notice-icon" />
              <p className="font-body-sm">
                <strong>Notice:</strong> Payment is not processed on this platform. Your order will be personally handled through WhatsApp.
              </p>
            </div>
            <div className="drawer__subtotal">
              <div className="drawer__subtotal-row">
                <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Subtotal</span>
                <span className="font-headline-sm" style={{ color: 'var(--primary)' }}>₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
            <button className="drawer__cta font-label-md" onClick={handleViewOrderList}>
              View Order List
            </button>
          </div>
        )}
      </div>
    </>
  );
}
