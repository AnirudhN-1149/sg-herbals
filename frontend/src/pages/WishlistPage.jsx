import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faInfoCircle, faLock, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from '../context/WishlistContext';
import ProductCounter from '../components/ProductCounter';
import './WishlistPage.css';

export default function WishlistPage() {
  const { wishlistItems, clearWishlist, subtotal } = useWishlist();
  const [form, setForm] = useState({ name: '', phone: '', pincode: '', address: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?active=true&limit=4')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const cartIds = wishlistItems.map(item => item.id);
          setRecommended(data.data.filter(p => !cartIds.includes(p._id)).slice(0, 4));
        }
      })
      .catch(console.error);
  }, [wishlistItems]);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill in Name, Phone, and Address.");
      return;
    }
    if (wishlistItems.length === 0) {
      alert("Your order list is empty. Please add some products first.");
      return;
    }
    setLoading(true);
    try {
      const orderSubtotal = wishlistItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const itemsPayload = wishlistItems.map(item => ({
        productId: item.id,
        name: item.name,
        image: item.image || '',
        price: item.price,
        quantity: item.quantity,
        size: item.size || ''
      }));

      const orderData = {
        customer: {
          name: form.name,
          phone: form.phone,
          pincode: form.pincode || '',
          address: form.address
        },
        items: itemsPayload,
        subtotal: orderSubtotal,
        shippingFee: 0
      };
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit order');
      }
      
      setSubmitted(true);
      clearWishlist();
    } catch (err) {
      console.error('Order submission error:', err);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="wishlist-success">
        <div className="wishlist-success__inner">
          <div className="wishlist-success__icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <h2 className="font-headline-lg wishlist-success__title">Order Placed!</h2>
          <p className="font-body-md wishlist-success__sub">
            Thank you! We will contact you on WhatsApp shortly to confirm your order and arrange delivery.
          </p>
          <Link to="/shop" className="wishlist-success__btn font-label-md">CONTINUE SHOPPING</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist">
      <main className="wishlist__main container-max">
        <div className="wishlist__back">
          <Link to="/shop" className="wishlist__back-link font-label-md">
            <FontAwesomeIcon icon={faArrowLeft} /> Continue Exploring
          </Link>
        </div>

        <h1 className="font-display-lg wishlist__title">Your Order List</h1>
        <p className="font-body-lg wishlist__sub">
          Review your selection. Once you place your order, you will be contacted on WhatsApp to confirm.
        </p>

        <div className="wishlist__notice">
          <FontAwesomeIcon icon={faInfoCircle} className="wishlist__notice-icon" />
          <p className="font-body-md">
            <strong>Notice:</strong> Payment is not processed on this platform. Your order will be personally handled through WhatsApp. The information you provide below will only be used for order delivery.
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="wishlist__empty">
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>Your order list is empty.</p>
            <Link to="/shop" className="wishlist__empty-btn font-label-md">Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist__layout">
            <div className="wishlist__items-wrap">
              <div className="wishlist__table-head">
                <span className="font-label-md wishlist__col-head">Product Details</span>
                <span className="font-label-md wishlist__col-head wishlist__col-right">Estimated Value</span>
              </div>
              {wishlistItems.map(item => (
                <div key={item.cartId} className="wishlist__item">
                  <div className="wishlist__item-left">
                    <div className="wishlist__item-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="wishlist__item-info">
                      <h3 className="font-headline-sm wishlist__item-name">{item.name}</h3>
                      <p className="font-body-sm wishlist__item-sub">Size: {item.size}</p>
                      <div style={{ marginTop: '12px' }}>
                        <ProductCounter product={item} />
                      </div>
                    </div>
                  </div>
                  <div className="wishlist__item-price">
                    <span className="wishlist__item-price-label font-label-sm">Estimated Price</span>
                    <span className="font-body-md">₹{(item.price * item.quantity).toLocaleString()}.00</span>
                  </div>
                </div>
              ))}

              {/* Subtotal summary */}
              <div className="wishlist__summary">
                <div className="wishlist__summary-row">
                  <span className="font-body-md">Subtotal ({wishlistItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-headline-sm" style={{ color: 'var(--primary)' }}>₹{subtotal.toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            <aside className="wishlist__form-wrap">
              <div className="wishlist__form-card">
                <h2 className="font-headline-md wishlist__form-title">Delivery Details</h2>
                <p className="font-body-sm wishlist__form-sub">
                  Please provide your details below. This information will only be used for order delivery.
                </p>

                <div className="wishlist__form">
                  <div className="wishlist__field">
                    <label className="font-label-md wishlist__label" htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="wishlist__input font-body-md"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="wishlist__row">
                    <div className="wishlist__field">
                      <label className="font-label-md wishlist__label" htmlFor="phone">Phone Number (WhatsApp)</label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 00000 00000"
                        className="wishlist__input font-body-md"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="wishlist__field">
                      <label className="font-label-md wishlist__label" htmlFor="pincode">Pincode</label>
                      <input
                        id="pincode"
                        type="text"
                        placeholder="Enter pincode"
                        className="wishlist__input font-body-md"
                        value={form.pincode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="wishlist__field">
                    <label className="font-label-md wishlist__label" htmlFor="address">Delivery Address</label>
                    <textarea
                      id="address"
                      placeholder="Enter your full delivery address..."
                      className="wishlist__textarea font-body-md"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>
                  <button
                    className={`wishlist__submit font-headline-sm ${loading ? 'wishlist__submit--loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place My Order'}
                  </button>
                </div>

                <div className="wishlist__privacy">
                  <FontAwesomeIcon icon={faLock} className="wishlist__privacy-icon" />
                  <span className="font-label-sm wishlist__privacy-text">Your information is handled with absolute privacy and only used for delivery.</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {recommended.length > 0 && (
          <section className="wishlist__reco">
            <div className="wishlist__reco-header">
              <div>
                <h2 className="font-headline-lg wishlist__reco-title">Recommended for You</h2>
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Enhance your care routine with these products.</p>
              </div>
              <Link to="/shop" className="font-label-md wishlist__reco-all">View All</Link>
            </div>
            <div className="wishlist__reco-grid">
              {recommended.map(p => {
                const defaultSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : { label: '1 unit', price: 0 };
                const cartProduct = {
                  id: p._id,
                  name: p.name,
                  image: p.image,
                  price: defaultSize.price,
                  size: defaultSize.label,
                  cartId: `${p._id}-${defaultSize.label}`
                };

                return (
                  <div key={p._id} className="wishlist__reco-card">
                    <div className="wishlist__reco-img-wrap">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <Link to={`/product/${p._id}`}>
                      <h3 className="font-headline-sm wishlist__reco-name">{p.name}</h3>
                    </Link>
                    <div className="wishlist__reco-footer">
                      <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>₹{defaultSize.price.toLocaleString()}.00</span>
                      <div className="wishlist__reco-tag font-label-sm">{defaultSize.label}</div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <ProductCounter product={cartProduct} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
