import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faLeaf, faShieldAlt,
  faArrowLeft, faArrowRight, faChevronDown, faCheck,
  faSpa, faSeedling, faHandHoldingHeart, faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import ProductCounter from '../components/ProductCounter';

import './ProductDetailPage.css';

const TAG_MAP = {
  'natural': { title: '100% Natural', desc: 'No synthetic additives', icon: faLeaf },
  'chemical-free': { title: 'Chemical Free', desc: 'No toxic preservatives', icon: faShieldAlt },
  'herbal': { title: 'Herbal Formula', desc: 'Traditional care', icon: faSpa },
  'handmade': { title: 'Handcrafted', desc: 'Made in small batches', icon: faHandHoldingHeart },
  'organic': { title: 'Organic Care', desc: 'Pure plant sources', icon: faSeedling },
  'skin-safe': { title: 'Skin Safe', desc: 'Gentle on skin', icon: faShoppingBag },
};

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
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
          // Fetch generic recommendations
          fetch(`http://localhost:5000/api/products?active=true&limit=10`)
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
              <span className="pdp__bestseller font-label-sm" style={{ backgroundColor: '#e67e22', color: 'white', padding: '5px 14px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)', border: 'none', fontWeight: '800' }}>
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

      {recommendations.length > 0 && (
        <section className="pdp__recommendations container-max" style={{ borderTop: '1px solid rgba(192,200,196,0.2)', paddingTop: '64px', paddingBottom: '64px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="font-display-lg pdp__related-title">Recommended for You</h2>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Other popular natural botanical products you might love.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
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
                <div key={rp._id} className="pdp__related-card" style={{ minWidth: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="pdp__related-img-wrap" style={{ margin: 0, aspectRatio: '4/5' }}>
                    <img src={rp.image} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <Link to={`/product/${rp._id}`}>
                    <h4 className="font-headline-sm pdp__related-name" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{rp.name}</h4>
                    <p className="font-label-sm pdp__related-price" style={{ margin: 0 }}>₹{defaultSize.price.toLocaleString()}.00</p>
                  </Link>
                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
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
