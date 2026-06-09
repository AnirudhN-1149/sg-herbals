import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faEye, faHandshake, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { aboutHeroImage, heritageImage, founderImage } from '../data/products';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about">
      {/* Hero */}
      <section className="about__hero">
        <div className="about__hero-bg">
          <img src={aboutHeroImage} alt="Our Story" />
          <div className="about__hero-overlay" />
        </div>
        <div className="about__hero-content container-max">
          <span className="about__pill font-label-md">ESTABLISHED IN NATURE</span>
          <h1 className="font-display-lg about__hero-title">Our Story</h1>
          <p className="font-body-lg about__hero-sub">
            Born from the quiet wisdom of age-old herbal traditions, SG Herbals bridges the gap between plant knowledge and simple, honest handcrafted care.
          </p>
          <button className="about__hero-btn font-label-md">Explore Our Products</button>
        </div>
      </section>

      {/* Heritage */}
      <section className="about__heritage">
        <div className="about__heritage-inner container-max">
          <div className="about__heritage-img">
            <img src={heritageImage} alt="From Tradition to Craft" />
          </div>
          <div className="about__heritage-text">
            <h2 className="font-headline-lg about__section-title">From Tradition to Craft</h2>
            <div className="about__heritage-paras">
              <p className="font-body-md about__para">
                My journey began with a simple belief — that the herbs growing around us hold everything our skin and hair need. I spent years studying herbal traditions to understand the true power of plants.
              </p>
              <p className="font-body-md about__para">
                Today, I craft every product by hand in small batches. No shortcuts. No synthetic additives. Just pure, honest ingredients working together the way nature intended.
              </p>
              <div className="about__stats">
                <div>
                  <span className="font-headline-sm about__stat-num">100%</span>
                  <span className="font-label-sm about__stat-label">NATURAL INGREDIENTS</span>
                </div>
                <div>
                  <span className="font-headline-sm about__stat-num">Handmade</span>
                  <span className="font-label-sm about__stat-label">CRAFTING WITH CARE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about__values">
        <div className="container-max">
          <div className="about__values-header">
            <h2 className="font-headline-lg about__section-title">Core Principles</h2>
            <p className="font-body-md about__values-sub">
              The principles that guide every ingredient I pick and every product I make.
            </p>
          </div>
          <div className="about__pillars">
            <div className="about__pillar">
              <div className="about__pillar-icon">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <h3 className="font-headline-sm about__pillar-title">100% Pure</h3>
              <p className="font-body-sm about__pillar-desc">
                I use only natural herbal ingredients. No synthetic fillers, no artificial fragrances, and absolutely no compromise on the purity of the products.
              </p>
            </div>
            <div className="about__pillar">
              <div className="about__pillar-icon">
                <FontAwesomeIcon icon={faEye} />
              </div>
              <h3 className="font-headline-sm about__pillar-title">Full Transparency</h3>
              <p className="font-body-sm about__pillar-desc">
                You have the right to know exactly what is in every product you use. No hidden chemicals, no complicated terms — just honest ingredients, clearly listed.
              </p>
            </div>
            <div className="about__pillar">
              <div className="about__pillar-icon">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="font-headline-sm about__pillar-title">Personal Care</h3>
              <p className="font-body-sm about__pillar-desc">
                From formulating and mixing to packaging and shipping, every step is personally handled by me to ensure the highest quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="about__founder" style={{ marginTop: '40px', paddingBottom: '60px' }}>
        <div className="container-max about__founder-inner">
          <FontAwesomeIcon icon={faQuoteLeft} className="about__quote-icon" />
          <p className="font-headline-lg about__founder-quote">
            "I believe that our skin deserves the same respect we give to the earth itself. Every bar of soap, every oil I craft is a small act of care."
          </p>
          <div className="about__founder-profile">
            <div className="about__founder-avatar">
              <img src={founderImage} alt="Founder" />
            </div>
            <span className="font-label-md about__founder-name">Subhasree Giridhari</span>
            <span className="font-body-sm about__founder-role">Founder & Creator</span>
          </div>
        </div>
      </section>
    </div>
  );
}
