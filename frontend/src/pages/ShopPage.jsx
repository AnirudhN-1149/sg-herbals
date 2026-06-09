import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import ProductCounter from '../components/ProductCounter';
import './ShopPage.css';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('bestselling');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic categories
  const [categories, setCategories] = useState([{ key: 'all', label: 'All' }]);

  // Track selected sizes for each product (maps productId -> sizeLabel)
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    // Fetch categories
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = data.data.map(cat => ({ key: cat.name, label: cat.label }));
          setCategories([{ key: 'all', label: 'All' }, ...mapped]);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch products
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
    // Only filter by category on mobile; on desktop activeCategory is 'all' by default unless updated on mobile
    let list = activeCategory === 'all' ? [...products] : products.filter(p => p.category === activeCategory);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q));
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => {
        const pA = a.sizes && a.sizes.length > 0 ? a.sizes[0].price : 0;
        const pB = b.sizes && b.sizes.length > 0 ? b.sizes[0].price : 0;
        return pA - pB;
      });
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => {
        const pA = a.sizes && a.sizes.length > 0 ? a.sizes[0].price : 0;
        const pB = b.sizes && b.sizes.length > 0 ? b.sizes[0].price : 0;
        return pB - pA;
      });
    } else if (sortBy === 'newest') {
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
          {/* Desktop Filters (Category buttons + Sort select on right) */}
          <div className="shop__filters-desktop">
            {/* Category Buttons */}
            <div className="shop__filters">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`shop__filter-btn font-label-sm ${activeCategory === cat.key ? 'shop__filter-btn--active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="shop__sort-wrap">
              <select
                className="shop__sort font-label-sm w-full"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="bestselling">Best Sellers First</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="shop__sort-icon" />
            </div>
          </div>

          {/* Tablet & Mobile Selectors (Side by side on the same row, no category buttons shown) */}
          <div className="shop__filters-mobile">
            {/* Category Dropdown */}
            <div className="shop__sort-wrap flex-1">
              <select
                className="shop__sort font-label-sm w-full"
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="shop__sort-icon" />
            </div>

            {/* Sort Dropdown */}
            <div className="shop__sort-wrap flex-1">
              <select
                className="shop__sort font-label-sm w-full"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="bestselling">Best Sellers First</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="shop__sort-icon" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--on-surface-variant)' }}>Loading products...</div>
        ) : (
          <div className="shop__grid">
            {filtered.map(product => {
              const currentSizeLabel = selectedSizes[product._id] || (product.sizes && product.sizes.length > 0 ? product.sizes[0].label : '1 unit');
              const currentSizeObj = product.sizes && product.sizes.length > 0
                ? product.sizes.find(s => s.label === currentSizeLabel) || product.sizes[0]
                : { label: '1 unit', price: 0 };

              const cartProduct = {
                id: product._id,
                name: product.name,
                image: product.image,
                price: currentSizeObj.price,
                size: currentSizeObj.label,
                cartId: `${product._id}-${currentSizeObj.label}`,
                sizes: product.sizes,
                stock: product.stock
              };

              return (
                <Link to={`/product/${product._id}`} key={product._id} className="shop__card" style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}>
                  {/* Tags on Top Right border (popping out) */}
                  <div style={{ position: 'absolute', top: '-10px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', zIndex: 20 }}>
                    {product.isBestSeller && (
                      <span className="font-label-sm" style={{ backgroundColor: '#e67e22', color: 'white', padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', textTransform: 'uppercase', fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em' }}>Bestseller</span>
                    )}
                    {product.isNewArrival && (
                      <span className="font-label-sm" style={{ backgroundColor: '#27ae60', color: 'white', padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', textTransform: 'uppercase', fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em' }}>New Arrival</span>
                    )}
                  </div>
                  <div className="shop__card-img-wrap" style={{ position: 'relative' }}>
                    <img src={product.image} alt={product.name} className="shop__card-img" />
                    
                    {/* Product Counter overlay */}
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 10 }}>
                      <ProductCounter product={cartProduct} />
                    </div>
                  </div>
                  <div className="shop__card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 className="font-headline-sm shop__card-name" style={{ fontWeight: 'bold' }}>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <p className="font-headline-sm shop__card-price" style={{ fontWeight: 'bold', margin: 0 }}>
                        ₹{currentSizeObj.price.toLocaleString()}
                      </p>
                      {product.sizes && product.sizes.length > 1 ? (
                        <select
                          value={currentSizeLabel}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSizes(prev => ({ ...prev, [product._id]: e.target.value }));
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="variant-select"
                          style={{ zIndex: 15 }}
                        >
                          {product.sizes.map(s => (
                            <option key={s.label} value={s.label}>{s.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>{currentSizeObj.label}</span>
                      )}
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
