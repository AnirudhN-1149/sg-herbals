import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuDQIhINItXX0r6qrws7vPHRf-Xa6Rv7pIXmz-ETDZD02S7CoUw_ZEH2mRyQfohtEiPLB0X6RQb8OUWHoOv5OCQK7mbrSo64l1sfLZvHkgdxS18CbFbRNeuYdwKbnYU9I8VrLqyTxtvLNLOlQ_mmXv2AV0QU0_3vt1FuPQgl26usQUv1zuj7sGeU1vpZW6CtIiVGYaBs9KrtcKQas8NbQmwUiEinGVFKDG-1cgmHYRu8dg2t6ZhM5JkCuIgzelQmsj7pYEdeec327weG";

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
          <div className="footer__social-icons">
            <a href="#!" className="footer__social-btn" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#!" className="footer__social-btn" aria-label="WhatsApp">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a href="#!" className="footer__social-btn" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
