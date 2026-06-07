import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faLeaf, faShieldAlt, faAward,
  faArrowLeft, faArrowRight, faChevronDown, faCheck, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import ProductCounter from '../components/ProductCounter';

import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [openSection, setOpenSection] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
          // Fetch related
          fetch(`http://localhost:5000/api/products?active=true&limit=3&category=${data.data.category}`)
            .then(res => res.json())
            .then(rData => {
              if (rData.success) {
                setRelatedProducts(rData.data.filter(p => p._id !== data.data._id));
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
    cartId: `${product._id}-${sizes[selectedSize]?.label || 'std'}`
  };



  return (
    <div className="pdp">
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
              <span className="pdp__bestseller font-label-sm">
                <FontAwesomeIcon icon={faStar} /> BEST SELLER
              </span>
            )}
            {product.isNewArrival && (
              <span className="pdp__bestseller font-label-sm" style={{ backgroundColor: '#2f5d50' }}>
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
            <span className="font-label-sm pdp__price-label">ESTIMATED PRICE</span>
            <div className="pdp__price-value">
              <span className="pdp__price font-headline-md">₹{(sizes[selectedSize]?.price || 0).toLocaleString()}.00</span>
            </div>
            <span className="font-label-sm pdp__price-note">Adjust quantity below</span>
          </div>

          {product.badges && product.badges.length > 0 && (
            <ul className="pdp__value-props">
              {product.badges.map((b, i) => (
                <li key={i} className="pdp__value-prop">
                  <FontAwesomeIcon icon={faCheckCircle} className="pdp__prop-icon" />
                  <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: '24px' }}>
            <ProductCounter product={cartProduct} variant="large" />
          </div>

          <div className="pdp__trust">
            <div className="pdp__trust-item">
              <FontAwesomeIcon icon={faLeaf} className="pdp__trust-icon" />
              <span className="pdp__trust-title font-label-sm">100% Natural</span>
              <span className="pdp__trust-sub" style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>No synthetic additives</span>
            </div>
            <div className="pdp__trust-item">
              <FontAwesomeIcon icon={faShieldAlt} className="pdp__trust-icon" />
              <span className="pdp__trust-title font-label-sm">Handcrafted</span>
              <span className="pdp__trust-sub" style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>Made in small batches</span>
            </div>
            <div className="pdp__trust-item">
              <FontAwesomeIcon icon={faAward} className="pdp__trust-icon" />
              <span className="pdp__trust-title font-label-sm">Personal Care</span>
              <span className="pdp__trust-sub" style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>Direct from maker</span>
            </div>
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

      {relatedProducts.length > 0 && (
        <section className="pdp__related">
          <div className="pdp__related-header container-max">
            <div>
              <h2 className="font-display-lg pdp__related-title">Suggested Pairings</h2>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Products that go great together.</p>
            </div>
            <div className="pdp__related-nav">
              <button onClick={() => scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' })} className="pdp__nav-btn">
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <button onClick={() => scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' })} className="pdp__nav-btn">
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
          <div className="pdp__related-scroll hide-scrollbar" ref={scrollRef}>
            {relatedProducts.map(rp => {
              const defaultSize = rp.sizes && rp.sizes.length > 0 ? rp.sizes[0] : { label: '1 unit', price: 0 };
              const rc = {
                id: rp._id,
                name: rp.name,
                image: rp.image,
                price: defaultSize.price,
                size: defaultSize.label,
                cartId: `${rp._id}-${defaultSize.label}`
              };
              return (
                <div key={rp._id} className="pdp__related-card">
                  <div className="pdp__related-img-wrap">
                    <img src={rp.image} alt={rp.name} />
                  </div>
                  <Link to={`/product/${rp._id}`}>
                    <h4 className="font-headline-sm pdp__related-name">{rp.name}</h4>
                    <p className="font-label-sm pdp__related-price">₹{defaultSize.price.toLocaleString()}.00</p>
                  </Link>
                  <div style={{ marginTop: '12px' }}>
                    <ProductCounter product={rc} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
