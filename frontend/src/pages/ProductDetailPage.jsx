import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faLeaf, faShieldAlt,
  faArrowLeft, faChevronDown, faCheck,
  faSpa,
  faHand, faTree, faHeart
} from '@fortawesome/free-solid-svg-icons';
import ProductCounter from '../components/ProductCounter';

import './ProductDetailPage.css';
import './ShopPage.css';

const TAG_MAP = {
  'natural': { title: '100% Natural', desc: 'No synthetic additives', icon: faLeaf },
  'chemical-free': { title: 'Chemical Free', desc: 'No toxic preservatives', icon: faShieldAlt },
  'herbal': { title: 'Herbal Formula', desc: 'Traditional care', icon: faSpa },
  'handmade': { title: 'Handcrafted', desc: 'Made in small batches', icon: faHand },
  'organic': { title: 'Organic Care', desc: 'Pure plant sources', icon: faTree },
  'skin-safe': { title: 'Skin Safe', desc: 'Gentle on skin', icon: faHeart },
};

const rawApiUrl = process.env.REACT_APP_API_URL;
const API_URL = (rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim() : 'http://localhost:5000').replace(/\/$/, '');

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
          // Fetch generic recommendations
           fetch(`${API_URL}/api/products?active=true&limit=10`)
            .then(res => res.json())
            .then(recData => {
              if (recData.success) {
                setRecommendations(recData.data.filter(p => p._id !== data.data._id).slice(0, 4));
              }
            });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ paddingTop: 120, textAlign: 'center', minHeight: '60vh' }}>Loading...</div>;
  }

  if (!product) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center', minHeight: '60vh' }}>
        <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>Product not found.</p>
        <Link to="/shop" style={{ color: 'var(--primary)', marginTop: 16, display: 'inline-block' }}>Back to Shop</Link>
      </div>
    );
  }

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : [{ label: 'Standard', price: 0 }];
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  
  const cartProduct = {
    id: product._id,
    name: product.name,
    image: product.image,
    price: sizes[selectedSize]?.price || 0,
    size: sizes[selectedSize]?.label || '',
    cartId: `${product._id}-${sizes[selectedSize]?.label || 'std'}`,
    sizes: product.sizes,
    stock: product.stock
  };



  return (
    <div className="pdp">
      <div className="container-max" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '14px', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: '14px' }} />
          Back to Shop
        </Link>
      </div>
      <section className="pdp__main container-max">
        <div className="pdp__gallery">
          <div className="pdp__thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`pdp__thumb ${selectedImg === i ? 'pdp__thumb--active' : ''}`}
                onClick={() => setSelectedImg(i)}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="pdp__main-img">
            <div className="pdp__img-count font-label-sm">{selectedImg + 1} / {images.length}</div>
            <img src={images[selectedImg] || product.image} alt={product.name} />
          </div>
        </div>

        <div className="pdp__info">
          <div className="pdp__badge-row">
            {product.isBestSeller && (
              <span className="pdp__bestseller font-label-sm" style={{ backgroundColor: '#2b6cb0', color: 'white', padding: '5px 14px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)', border: 'none', fontWeight: '800' }}>
                <FontAwesomeIcon icon={faStar} /> BEST SELLER
              </span>
            )}
            {product.isNewArrival && (
              <span className="pdp__bestseller font-label-sm" style={{ backgroundColor: '#27ae60', color: 'white', padding: '5px 14px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)', border: 'none', fontWeight: '800' }}>
                <FontAwesomeIcon icon={faStar} /> NEW ARRIVAL
              </span>
            )}
          </div>
          <h1 className="font-display-lg pdp__title">{product.name}</h1>
          <p className="font-body-md pdp__desc">{product.description}</p>

          <div className="pdp__sizes">
            <span className="font-label-md pdp__sizes-label">CHOOSE YOUR SIZE:</span>
            <div className="pdp__size-btns">
              {sizes.map((s, i) => (
                <button
                  key={i}
                  className={`pdp__size-btn font-label-md ${selectedSize === i ? 'pdp__size-btn--active' : ''}`}
                  onClick={() => setSelectedSize(i)}
                >
                  {s.label}
                  {selectedSize === i && <FontAwesomeIcon icon={faCheck} className="pdp__size-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pdp__price-box">
            <span className="font-label-sm pdp__price-label">PRODUCT PRICE</span>
            <div className="pdp__price-value">
              <span className="pdp__price font-headline-md">₹{(sizes[selectedSize]?.price || 0).toLocaleString()}.00</span>
            </div>
          </div>



          <div style={{ marginTop: '24px' }}>
            <ProductCounter product={cartProduct} variant="large" />
          </div>

          <div className="pdp__trust">
            {(product.tags && product.tags.length > 0 ? product.tags.slice(0, 3) : ['natural', 'handmade', 'herbal']).map((tagId) => {
              const meta = TAG_MAP[tagId] || { title: tagId.replace('-', ' '), desc: 'Quality guaranteed', icon: faLeaf };
              return (
                <div key={tagId} className="pdp__trust-item">
                  <FontAwesomeIcon icon={meta.icon} className="pdp__trust-icon" />
                  <span className="pdp__trust-title font-label-sm">{meta.title}</span>
                  <span className="pdp__trust-sub" style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>{meta.desc}</span>
                </div>
              );
            })}
          </div>

          <div className="pdp__accordions">
            {product.howToUse && product.howToUse.length > 0 && (
              <div className="pdp__accordion">
                <button
                  className="pdp__accordion-btn font-headline-sm"
                  onClick={() => setOpenSection(openSection === 'use' ? null : 'use')}
                >
                  How to Use
                  <FontAwesomeIcon icon={faChevronDown} className={`pdp__accordion-icon ${openSection === 'use' ? 'pdp__accordion-icon--open' : ''}`} />
                </button>
                {openSection === 'use' && (
                  <div className="pdp__accordion-body">
                    {product.howToUse.map((s, i) => (
                      <p key={i} className="font-body-sm pdp__step">
                        <strong>{s.step}:</strong> {s.detail}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="pdp__accordion">
                <button
                  className="pdp__accordion-btn font-headline-sm"
                  onClick={() => setOpenSection(openSection === 'ing' ? null : 'ing')}
                >
                  Ingredients
                  <FontAwesomeIcon icon={faChevronDown} className={`pdp__accordion-icon ${openSection === 'ing' ? 'pdp__accordion-icon--open' : ''}`} />
                </button>
                {openSection === 'ing' && (
                  <div className="pdp__accordion-body">
                    {product.ingredients.map((ing, i) => (
                      <p key={i} className="font-body-sm pdp__step">
                        <strong>{ing.name}:</strong> {ing.benefit}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>


      {recommendations.length > 0 && (
        <section className="pdp__recommendations container-max" style={{ borderTop: '1px solid rgba(192,200,196,0.2)', paddingTop: '64px', paddingBottom: '64px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="font-display-lg pdp__related-title">Recommended for You</h2>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Other popular natural botanical products you might love.</p>
          </div>
          <div className="shop__grid">
            {recommendations.map(rp => {
              const defaultSize = rp.sizes && rp.sizes.length > 0 ? rp.sizes[0] : { label: '1 unit', price: 0 };
              const rc = {
                id: rp._id,
                name: rp.name,
                image: rp.image,
                price: defaultSize.price,
                size: defaultSize.label,
                cartId: `${rp._id}-${defaultSize.label}`,
                sizes: rp.sizes,
                stock: rp.stock
              };
              return (
                <Link to={`/product/${rp._id}`} key={rp._id} className="shop__card" style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}>
                  {/* Tags on Top Right border (popping out) */}
                  <div style={{ position: 'absolute', top: '-10px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', zIndex: 20 }}>
                    {rp.isBestSeller && (
                      <span className="font-label-sm" style={{ backgroundColor: '#2b6cb0', color: 'white', padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', textTransform: 'uppercase', fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em' }}>Bestseller</span>
                    )}
                    {rp.isNewArrival && (
                      <span className="font-label-sm" style={{ backgroundColor: '#27ae60', color: 'white', padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', textTransform: 'uppercase', fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em' }}>New Arrival</span>
                    )}
                  </div>
                  <div className="shop__card-img-wrap" style={{ position: 'relative' }}>
                    <img src={rp.image} alt={rp.name} className="shop__card-img" />
                    
                    {/* Product Counter overlay */}
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 10 }}>
                      <ProductCounter product={rc} />
                    </div>
                  </div>
                  <div className="shop__card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 className="font-headline-sm shop__card-name" style={{ fontWeight: 'bold' }}>{rp.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <p className="font-headline-sm shop__card-price" style={{ fontWeight: 'bold', margin: 0 }}>
                        ₹{defaultSize.price.toLocaleString()}
                      </p>
                      <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>{defaultSize.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
