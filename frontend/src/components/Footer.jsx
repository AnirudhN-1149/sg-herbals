import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const LOGO = "/logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container-max">
        <div className="footer__brand">
          <div className="footer__brand-row">
            <img src={LOGO} alt="SG Herbals" className="footer__logo" />
            <span className="footer__brand-name font-headline-md">SG HERBALS</span>
          </div>
          <div className="footer__copy">
            <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>© 2026 SG Herbals.</p>
            <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic', fontSize: '13px' }}>Handcrafted herbal skin and hair care.</p>
          </div>
        </div>

        <div className="footer__nav">
          <h4 className="footer__heading font-label-md">NAVIGATION</h4>
          <ul className="footer__links">
            <li><Link to="/" className="footer__link font-body-sm">Home</Link></li>
            <li><Link to="/shop" className="footer__link font-body-sm">Shop</Link></li>
            <li><Link to="/about" className="footer__link font-body-sm">About</Link></li>
          </ul>
        </div>

        <div className="footer__social">
          <h4 className="footer__heading font-label-md">CONNECT</h4>
          <div className="footer__contact-info font-body-sm">
            <p className="footer__contact-name">Subhasree Giridhari</p>
            <p className="footer__contact-phone">+91 99039 91223</p>
          </div>
          <div className="footer__social-icons">
            <a href="https://www.facebook.com/share/1AF3CqFxmb/" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://www.instagram.com/subhasreegiridhari?igsh=OXQ0ZTY1MDAwb2Jp" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://wa.me/qr/3GQBCYAVCELRE1" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="WhatsApp">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
