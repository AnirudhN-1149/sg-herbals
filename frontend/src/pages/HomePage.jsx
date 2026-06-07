import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serumImage, moisturizerImage } from '../data/products';
import ProductCounter from '../components/ProductCounter';

import './HomePage.css';
import heroImage from "../pages/screen.png";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-active'); }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function HomePage() {
  useReveal();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?isActive=true&limit=4')
      .then(res => res.json())
      .then(data => {
        setRecommended(data.data || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="container-max home__hero-inner">
          <div className="home__hero-text reveal-left">
            <h1 className="font-display-lg-mobile md:font-display-lg home__hero-title">
              Handmade Herbal.<br />Simply Radiant.
            </h1>
            <p className="font-body-lg home__hero-sub">
              Crafted with love by Subhasree Giridhari. Simple, handmade herbal skin and hair care for your natural glow.
            </p>
            <Link to="/shop" className="home__hero-cta font-label-md">
              SHOP COLLECTION
            </Link>
          </div>
          <div className="home__hero-img-wrap reveal-right">
            <img src={heroImage} alt="SG Herbals Products" className="home__hero-img" />
          </div>
        </div>
      </section>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="home__recommended container-max">
          <div className="home__section-header">
            <span className="font-label-md home__section-label">Personalized Picks</span>
            <h2 className="font-headline-lg home__section-title">Recommended for You</h2>
          </div>
          <div className="home__rec-grid">
            {recommended.map((product, i) => {
              const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : { label: '1 unit', price: 0 };
              const cartProduct = {
                id: product._id,
                name: product.name,
                image: product.image,
                price: defaultSize.price,
                size: defaultSize.label,
                cartId: `${product._id}-${defaultSize.label}`
              };

              return (
                <Link to={`/product/${product._id}`} key={product._id} className="home__rec-card reveal-up" style={{ transitionDelay: `${i * 0.1}s`, textDecoration: 'none', color: 'inherit' }}>
                  <div className="home__rec-img-wrap" style={{ position: 'relative' }}>
                    <img src={product.image} alt={product.name} />
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      {product.isBestSeller && (
                        <span className="font-label-sm" style={{ backgroundColor: '#154539', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>Bestseller</span>
                      )}
                      {product.isNewArrival && (
                        <span className="font-label-sm" style={{ backgroundColor: '#2f5d50', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>New Arrival</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 0' }}>
                    <h4 className="font-headline-sm home__rec-name" style={{ fontWeight: 'bold' }}>{product.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span className="font-headline-sm home__rec-price" style={{ fontWeight: 'bold', margin: 0 }}>₹{defaultSize.price.toLocaleString()}</span>
                        <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>{defaultSize.label}</span>
                      </div>
                      <ProductCounter product={cartProduct} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bestsellers Zig-Zag */}
      <section className="home__bestsellers container-max">
        <div className="home__bestsellers-header">
          <div>
            <span className="font-label-md home__section-label">The Essentials</span>
            <h2 className="font-headline-lg home__section-title">Bestselling Herbal Blends</h2>
          </div>
          <Link to="/shop" className="home__viewshop font-label-md">VIEW SHOP</Link>
        </div>

        <div className="home__zigzag">
          {/* Row 1 */}
          <div className="home__zz-row">
            <div className="home__zz-img-wrap reveal-left">
              <img src={serumImage} alt="Herbal Oils" />
            </div>
            <div className="home__zz-text reveal-up">
              <span className="font-label-md home__section-label">Nourishing Blends</span>
              <h3 className="font-headline-lg home__zz-title">Herbal Oils</h3>
              <p className="font-body-md home__zz-desc">
                Pure herbal oils crafted to nourish, strengthen, and restore. From hair care to skin care, our cold-pressed oils bring the goodness of nature directly to you.
              </p>
              <Link to="/shop" className="home__zz-btn font-label-md">EXPLORE COLLECTION</Link>
            </div>
          </div>
          {/* Row 2 */}
          <div className="home__zz-row home__zz-row--reverse">
            <div className="home__zz-text reveal-up">
              <span className="font-label-md home__section-label">Daily Care</span>
              <h3 className="font-headline-lg home__zz-title">Herbal Soaps &amp; Balms</h3>
              <p className="font-body-md home__zz-desc">
                Gentle soaps and soothing balms made with natural herbs. Perfect for everyday use, they cleanse and care without harsh chemicals.
              </p>
              <Link to="/shop" className="home__zz-btn font-label-md">VIEW ALL</Link>
            </div>
            <div className="home__zz-img-wrap reveal-right">
              <img src={moisturizerImage} alt="Herbal Balms" />
            </div>
          </div>
        </div>
      </section>

      {/* About the System */}
      <section className="home__about-system container-max" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--surface-container-low)', borderRadius: '16px', marginBottom: '40px' }}>
        <h2 className="font-headline-lg" style={{ marginBottom: '16px', color: 'var(--primary)' }}>Purely Handmade</h2>
        <p className="font-body-md" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--on-surface-variant)' }}>
          SG Herbals is a personal endeavor by Subhasree Giridhari to bring you the purest, most natural skincare and haircare solutions. Every product is meticulously handcrafted in small batches using carefully selected herbal ingredients. From nourishing oils and soothing balms to refreshing soaps and face packs, we sell authentic, handmade care designed to highlight your natural radiance.
        </p>
      </section>
    </div>
  );
}
