import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import { useToast } from '../components/ToastContext'
import ConfirmationModal from '../components/ConfirmationModal'

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim() : 'http://localhost:5000').replace(/\/$/, '');

function ProductCard({ product, onToggle, categories = [] }) {
  const statusStr = product.isActive ? 'Live' : 'Hidden';
  const displayPrice = product.sizes && product.sizes.length > 0 ? `₹${product.sizes[0].price}` : 'N/A';
  const displaySize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : 'N/A';

  const categoryObj = categories.find(c => c.name === product.category);
  const categoryLabel = categoryObj ? categoryObj.label : product.category;

  const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;

  return (
    <Link
      to={`/products/edit/${product._id}`}
      className="relative bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden group block hover:no-underline"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-container-low">
        <img
          src={product.image || 'https://via.placeholder.com/400x400/f3f3f3/717975?text=Product'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400/f3f3f3/717975?text=Product' }}
        />
        {/* Out of Stock Ribbon / Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="px-3 py-1 rounded-full bg-error text-on-error text-[10px] font-bold uppercase tracking-wider shadow">Out of Stock</span>
          </div>
        )}
        <div 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute bottom-2 left-2 flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-sm px-2 py-1.5 rounded-full shadow-sm z-20"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(product._id, product.isActive);
            }}
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
              product.isActive ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                product.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`inline-block w-12 text-left text-label-sm font-label-sm ${product.isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
            {statusStr}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-label-sm font-label-sm text-on-surface-variant">{categoryLabel} · {displaySize}</p>
        <h3 className="text-body-md font-body-md text-on-surface font-semibold mt-0.5 truncate">{product.name}</h3>
        <div className="flex justify-between items-center mt-1.5">
          <p className="text-headline-sm font-headline-sm text-primary">{displayPrice}</p>
          {product.stock !== undefined && product.stock !== null ? (
            product.stock <= 0 ? (
              <span className="text-[10px] font-bold text-error">Out of Stock</span>
            ) : (
              <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">Qty: {product.stock}</span>
            )
          ) : (
            <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">Qty: 0</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState('grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Category management states
  const [categories, setCategories] = useState([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')

  const { showToast } = useToast()

  const [deleteCatId, setDeleteCatId] = useState(null)
  const [deleteProductId, setDeleteProductId] = useState(null)

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch(err) {
      console.error(err);
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch(err) {
      console.error('Error fetching categories:', err);
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim()) {
      showToast('Please enter category name.', 'error');
      return;
    }
    // Auto-generate name key from label
    const nameKey = newCategoryLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: nameKey, label: newCategoryLabel.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category created successfully!');
        setNewCategoryName('');
        setNewCategoryLabel('');
        fetchCategories();
      } else {
        showToast(data.message || 'Failed to create category', 'error');
      }
    } catch(err) {
      console.error(err);
      showToast('Error creating category', 'error');
    }
  }

  const handleDeleteCategory = (catId) => {
    setDeleteCatId(catId);
  }

  async function handleDelete(id) {
    setDeleteProductId(id);
  }

  async function handleToggleStatus(id, currentStatus) {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Product is now ${!currentStatus ? 'live' : 'hidden'}!`);
        fetchProducts();
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch(err) {
      console.error(err);
      showToast('Error updating status', 'error');
    }
  }

  const preloadImage = (url) => {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg'),
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        } catch (err) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
    });
  };

  async function exportPDF() {
    const liveProducts = products.filter(p => p.isActive);
    if (liveProducts.length === 0) {
      showToast("No live products to export.", "error");
      return;
    }

    showToast("Generating catalogue with images. Please wait...");

    const doc = new jsPDF();
    const logoUrl = '/logo_sg.png';

    // Preload logo and all images
    const logoBase64 = await preloadImage(logoUrl);
    const productImages = await Promise.all(
      liveProducts.map(p => preloadImage(p.image))
    );

    // Sort by category order: soaps first, then shampoos, oils, balms, face-packs, face-wash
    const categoryOrder = ['soaps', 'shampoos', 'oils', 'balms', 'face-packs', 'face-wash'];
    const getCategoryIndex = (cat) => {
      const idx = categoryOrder.indexOf(cat?.toLowerCase());
      return idx === -1 ? 999 : idx;
    };

    const sortedProducts = [...liveProducts].sort((a, b) => {
      const idxA = getCategoryIndex(a.category);
      const idxB = getCategoryIndex(b.category);
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });

    const productsPerPage = 4;
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) doc.addPage();

      // Draw Header with light color matching logo background
      doc.setFillColor(245, 247, 245);
      doc.rect(0, 0, 210, 30, 'F');

      let logoW = 20;
      // Draw Logo
      if (logoBase64 && logoBase64.dataUrl) {
        const logoRatio = logoBase64.width / logoBase64.height;
        let logoH = 20;
        if (logoRatio > 25/20) {
          logoW = 25;
          logoH = 25 / logoRatio;
        } else {
          logoW = 20 * logoRatio;
        }
        const logoY = 5 + (20 - logoH) / 2;
        doc.addImage(logoBase64.dataUrl, 'JPEG', 14, logoY, logoW, logoH);
      }

      // Brand Info
      const textX = 14 + logoW + 4;
      doc.setFont("Times-Roman", "bold");
      doc.setFontSize(22); // large size next to logo
      doc.setTextColor(21, 69, 57);
      doc.text("SG HERBALS", textX, 17);

      // Tagline: "Handcrafted Herbal Skin and Hair Care"
      doc.setFont("Times-Roman", "italic");
      doc.setFontSize(9);
      doc.setTextColor(74, 101, 79);
      doc.text("Handcrafted Herbal Skin and Hair Care", textX, 24);

      // Subhasree & Phone on the right
      doc.setFont("Times-Roman", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(21, 69, 57);
      doc.text("Subhasree Giridhari", 145, 13);
      doc.setFontSize(11);
      doc.text("Phone: 9940184032", 145, 19);

      // Draw footer (No site tagline, only page number)
      doc.setFont("Times-Roman", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${page + 1} of ${totalPages}`, 175, 288);

      // Draw 2x2 Grid of Products
      const startIndex = page * productsPerPage;
      const pageProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

      pageProducts.forEach((p, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);

        const x = 14 + col * 93;
        const y = 38 + row * 120;

        // Draw Card border
        doc.setDrawColor(220, 225, 222);
        doc.setFillColor(252, 253, 252);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, 88, 115, 4, 4, 'FD');

        // Draw Product Image preserving aspect ratio
        const origIndex = liveProducts.findIndex(lp => lp._id === p._id);
        const imgInfo = productImages[origIndex];
        if (imgInfo && imgInfo.dataUrl) {
          const maxW = 80;
          const maxH = 60;
          const imgRatio = imgInfo.width / imgInfo.height;
          const boxRatio = maxW / maxH;
          let drawW = maxW;
          let drawH = maxH;
          if (imgRatio > boxRatio) {
            drawH = maxW / imgRatio;
          } else {
            drawW = maxH * imgRatio;
          }
          const offsetW = (maxW - drawW) / 2;
          const offsetH = (maxH - drawH) / 2;
          
          doc.addImage(imgInfo.dataUrl, 'JPEG', x + 4 + offsetW, y + 4 + offsetH, drawW, drawH);
        } else {
          doc.setFillColor(240, 243, 241);
          doc.rect(x + 4, y + 4, 80, 60, 'F');
          doc.setFont("Times-Roman", "normal");
          doc.setFontSize(10);
          doc.setTextColor(150, 160, 155);
          doc.text("SG Herbals", x + 30, y + 34);
        }

        // Product Name (bold, increased size a bit)
        doc.setFont("Times-Roman", "bold");
        doc.setFontSize(13.5);
        doc.setTextColor(20, 30, 25);
        const nameText = p.name.length > 35 ? p.name.substring(0, 32) + '...' : p.name;
        doc.text(nameText, x + 4, y + 72);

        // Description
        doc.setFont("Times-Roman", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 90, 85);
        const descText = p.description || '';
        const splitDesc = doc.splitTextToSize(descText, 80);
        doc.text(splitDesc.slice(0, 3), x + 4, y + 78);

        // Sizes Available and Bold Prices shown in different lines
        doc.setFont("Times-Roman", "bold");
        doc.setFontSize(12); // increased size
        doc.setTextColor(21, 69, 57);
        let sizeY = y + 96;
        if (p.sizes && p.sizes.length > 0) {
          p.sizes.slice(0, 3).forEach((s, sIdx) => {
            doc.text(`${s.label}: Rs. ${s.price}`, x + 4, sizeY + (sIdx * 5.5));
          });
        } else {
          doc.text("Price: N/A", x + 4, sizeY);
        }
      });
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    doc.save(`sg_herbals_catalogue_${timestamp}.pdf`);
    showToast("Catalogue PDF downloaded successfully!");
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  })
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto lg:ml-64 pb-16 lg:pb-0">
        <AdminTopBar pageTitle="Product Management" />

        <main className="flex-1 p-6 space-y-6 mt-2">
          {/* Header Stats and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <div className="flex gap-4">
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                Total Products: <span className="font-semibold text-on-surface">{products.length}</span>
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                Hidden Products: <span className="font-semibold text-error">{products.filter(p => !p.isActive).length}</span>
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Catalogue PDF
              </button>
              <Link
                to="/products/edit/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Product
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 flex-1 min-w-[200px] focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-body-sm font-body-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>

            {/* Category Filter Select + Edit Pencil */}
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-sm font-body-sm text-on-surface outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shadow-sm flex items-center justify-center"
                title="Manage Categories"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onToggle={handleToggleStatus}
                  categories={categories}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20">
                      <th className="text-left px-5 py-3 text-label-md font-label-md text-on-surface-variant">Product</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Category</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Size</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Price</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Stock</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Status</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentItems.map((product) => {
                      const displaySize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : 'N/A';
                      const displayPrice = product.sizes && product.sizes.length > 0 ? `₹${product.sizes[0].price}` : 'N/A';
                      const catObj = categories.find(c => c.name === product.category);
                      const catLabel = catObj ? catObj.label : product.category;
                      return (
                      <tr key={product._id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || 'https://via.placeholder.com/80?text=P'}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-surface-container"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=P' }}
                            />
                            <span className="text-body-sm font-body-sm text-on-surface font-semibold">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant">{catLabel}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant">{displaySize}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface font-semibold">{displayPrice}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant">
                          {product.stock !== undefined && product.stock !== null ? (
                            product.stock <= 0 ? (
                              <span className="px-2 py-0.5 rounded bg-error-container text-error text-[10px] font-bold">Out of Stock</span>
                            ) : (
                              <span>{product.stock}</span>
                            )
                          ) : (
                            <span>0</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(product._id, product.isActive)}
                              className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                                product.isActive ? 'bg-primary' : 'bg-surface-container-highest'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                                  product.isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`inline-block w-12 text-left text-label-sm font-label-sm ${product.isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                              {product.isActive ? 'Live' : 'Hidden'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/products/edit/${product._id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-error-container/30 text-error hover:bg-error-container transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} products
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`w-8 h-8 flex items-center justify-center rounded-lg text-label-sm font-label-sm transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 max-w-sm w-full airy-shadow-high overflow-hidden animate-slide-in">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 bg-surface-container-low">
              <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                Manage Categories
              </h3>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  fetchCategories(); // Reload categories list on close
                }}
                className="px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Categories list */}
              <div className="space-y-2">
                <p className="text-label-sm font-bold text-on-surface">Existing Categories</p>
                <div className="space-y-1.5 max-h-48 overflow-auto custom-scrollbar pr-1">
                  {categories.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/60 italic">No categories found.</p>
                  ) : (
                    categories.map(cat => (
                      <div key={cat._id} className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded border border-outline-variant/10">
                        <span className="text-xs font-semibold text-on-surface">{cat.label}</span>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-error hover:bg-error-container/20 transition-colors"
                          title="Delete Category"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Category Row (Input + Checkmark save icon) */}
              <div className="border-t border-outline-variant/20 pt-4 space-y-2">
                <p className="text-label-sm font-bold text-primary">Add New Category</p>
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant/20">
                  <input
                    type="text"
                    placeholder="Enter category name..."
                    value={newCategoryLabel}
                    onChange={e => setNewCategoryLabel(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-on-surface outline-none placeholder:text-on-surface-variant/50 py-1"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="w-7 h-7 flex items-center justify-center rounded bg-primary text-on-primary hover:opacity-90 transition-opacity flex-shrink-0"
                    title="Save Category"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteCatId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={async () => {
          const catId = deleteCatId;
          setDeleteCatId(null);
          try {
            const token = localStorage.getItem('adminToken') || '';
            const res = await fetch(`${API_URL}/api/categories/${catId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
              showToast('Category deleted successfully!');
              fetchCategories();
            } else {
              showToast(data.message || 'Failed to delete category', 'error');
            }
          } catch(err) {
            console.error(err);
            showToast('Error deleting category', 'error');
          }
        }}
        onCancel={() => setDeleteCatId(null)}
      />

      <ConfirmationModal
        isOpen={deleteProductId !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={async () => {
          const id = deleteProductId;
          setDeleteProductId(null);
          try {
            const token = localStorage.getItem('adminToken') || '';
            const res = await fetch(`${API_URL}/api/products/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
              showToast('Product deleted successfully!');
              fetchProducts();
            } else {
              showToast(data.message || 'Failed to delete product', 'error');
            }
          } catch(err) {
            console.error(err);
            showToast('Error deleting product', 'error');
          }
        }}
        onCancel={() => setDeleteProductId(null)}
      />
    </div>
  )
}
