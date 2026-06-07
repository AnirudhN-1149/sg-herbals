import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import ProductCounter from '../components/ProductCounter';
import './ShopPage.css';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'soaps', label: 'Soaps' },
  { key: 'shampoos', label: 'Shampoos' },
  { key: 'face-wash', label: 'Face Wash' },
  { key: 'face-packs', label: 'Face Packs' },
  { key: 'oils', label: 'Oils' },
  { key: 'balms', label: 'Balms' },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?active=true')
      .then(res => res.json())
      .then(data => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? [...products] : products.filter(p => p.category === activeCategory);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q));
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.sizes?.[0]?.price || 0) - (b.sizes?.[0]?.price || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.sizes?.[0]?.price || 0) - (a.sizes?.[0]?.price || 0));
    } else if (sortBy === 'newest') {
      // sort by creation date descending
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'bestselling') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }
    
    return list;
  }, [products, activeCategory, sortBy, searchQuery]);

  return (
    <div className="shop">
      {/* Header */}
      <header className="shop__header">
        <h1 className="font-display-lg shop__title">Herbal Products</h1>
        <p className="font-body-lg shop__sub">
          Purely natural, carefully crafted rituals for the modern skin. Made in small batches for the best quality.
        </p>
      </header>

      {/* Filters */}
      <section className="shop__section container-max">
        <div className="shop__search-bar">
          <FontAwesomeIcon icon={faSearch} className="shop__search-icon" />
          <input 
            type="text" 
            placeholder="Search herbal products..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="shop__search-input font-body-sm"
          />
        </div>
        <div className="shop__filters-row">
          <div className="shop__filters">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`shop__filter-btn font-label-sm ${activeCategory === cat.key ? 'shop__filter-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="shop__sort-wrap">
            <select
              className="shop__sort font-label-sm"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="bestselling">Sort by: Bestselling</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="shop__sort-icon" />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--on-surface-variant)' }}>Loading products...</div>
        ) : (
          <div className="shop__grid">
            {filtered.map(product => {
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
                <Link to={`/product/${product._id}`} key={product._id} className="shop__card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="shop__card-img-wrap" style={{ position: 'relative' }}>
                    <img src={product.image} alt={product.name} className="shop__card-img" />
                    
                    {/* Tags on Top Right */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      {product.isBestSeller && (
                        <span className="font-label-sm" style={{ backgroundColor: '#154539', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>Bestseller</span>
                      )}
                      {product.isNewArrival && (
                        <span className="font-label-sm" style={{ backgroundColor: '#2f5d50', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>New Arrival</span>
                      )}
                    </div>
                    {/* Product Counter overlay */}
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 10 }}>
                      <ProductCounter product={cartProduct} />
                    </div>
                  </div>
                  <div className="shop__card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 className="font-headline-sm shop__card-name" style={{ fontWeight: 'bold' }}>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <p className="font-headline-sm shop__card-price" style={{ fontWeight: 'bold', margin: 0 }}>₹{defaultSize.price.toLocaleString()}</p>
                      <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>{defaultSize.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="shop__pagination">
          <button className="shop__page-btn">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="shop__page-num shop__page-num--active font-label-md">1</span>
          <button className="shop__page-btn">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </section>
    </div>
  );
}
