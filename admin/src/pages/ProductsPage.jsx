import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const PRODUCTS = [
  {
    id: 1,
    name: 'Forest Pine Cleansing Oil',
    category: 'Cleansers',
    size: '100ml',
    price: '$45.00',
    status: 'Live',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2M-VCB0MlE_EHAoFNDFWFMEFJQvHpjN7k2R87yN8eiqwRYFQTJ3K3C-KCq0oFvL1UjqQd4MiF6pI4W0M6IwCPCEWR6pNe7QhTQ5ZGbEJQ-UjlHgZxqSmFJUCUqxKpJnJQkU1yEH5HGb4dHB3xPaAJQhqhlJKEKxlWE-BLiXg3K8Y7Gur7r2yyONkMVSQDnPp1kp64jZ_BfJLBQxwRvRFhLMZ_UrM6T89W4MoheNQ9M_K_jHH8v7M1mGAhqDjdFJ2gUJc5lFxc',
  },
  {
    id: 2,
    name: 'Wild Rose Serum',
    category: 'Serums',
    size: '30ml',
    price: '$72.00',
    status: 'Hidden',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYlSvCe_Oo0TiPjZxVR2jkgXnEKPrplGKmKZAqB4JnI6kpG9KPqNVmJf7kA_E1e4eCWBJE1i_XkFGFZi_MSSRh9x9Qnxp1N6KHpRa1X9bJeQanfA6T09gCOovK8SSSxQnXqInnbVD7mZOb9LXrjzJ5Y1iELFxvbDg6-1kN-ACacHPBQ22OPjjDDH7CpGtnKjqe-9Kqr_SzJ8ELZdOKqJxCyXRp2LO7Z7nPaWKsEqJzYQJJuIjMtA0RK-BVlGP7dsTnVA0Yf1KX',
  },
  {
    id: 3,
    name: 'Ancient Moss Repair Cream',
    category: 'Moisturizers',
    size: '50ml',
    price: '$58.00',
    status: 'Live',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJvOxqtc-4bLqBfFsWbzY_YVFHqHzXqnIMH0HlKMY1f5dA0F8fVnEUMU0dL7Xj8z9YVvRLq2XNPJx7P_DXXLyFqfKVJLYsAfFBLcP1HwGBHRbPn6KYuH1_71f8QdxpxRUK5rz0j8P33FJdxRh-5sO8B3LZL0APj-lCvSyNg2cH5e7pjEr4aRrV0tivdqv3RLt2k8Dnn0M0Qa8kJPAFjl4UUWn8w5M5pKr8Iqrk3gnDQB_PaaCsMUmTKxQvQ4JBuFJqRG3kLnOe',
  },
  {
    id: 4,
    name: 'Seaweed Hydrating Mist',
    category: 'Toner',
    size: '120ml',
    price: '$32.00',
    status: 'Live',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrNlw3CwHJvpqHxGN3vH-FaJ4gxb9YLp9V9eWfMPDO5NvyqhBBiGtIxNl57OqgNBJZxFizP3YqV0eiL-mHBnqLK6tRVqy6rT9Tl5p6J5YnFRm3lTQRUGZBLJy5o1IEPYu1Qk7t0YlbQvyvI7MsKfq5m2F5cWLJf2Iqq6SHpfgJcDyVzWzfH7XzQ2mZniEX-ZEj4f53hSIqoHSmJOSTVGk8rEu60AjUYhW6XtI9FCUH1ZdHJvJ0EK9gF7lY31FsXJNz7r4eYFkz',
  },
]

function ProductCard({ product, onDelete, onToggle }) {
  const [hovered, setHovered] = useState(false)
  
  const statusStr = product.isActive ? 'Live' : 'Hidden';
  const displayPrice = product.sizes && product.sizes.length > 0 ? `₹${product.sizes[0].price}` : 'N/A';
  const displaySize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : 'N/A';

  return (
    <div
      className="relative bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-container-low">
        <img
          src={product.image || 'https://via.placeholder.com/400x400/f3f3f3/717975?text=Product'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400/f3f3f3/717975?text=Product' }}
        />
        {/* Hover Actions */}
        {hovered && (
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Link
              to={`/products/edit/${product._id}`}
              className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest/90 backdrop-blur-sm rounded-lg text-on-surface-variant hover:text-primary shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </Link>
            <button
              onClick={() => onDelete(product._id)}
              className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest/90 backdrop-blur-sm rounded-lg text-error shadow-sm hover:bg-error-container/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-sm px-2 py-1.5 rounded-full shadow-sm">
          <span className={`text-label-sm font-label-sm ${product.isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
            {statusStr}
          </span>
          <button
            onClick={() => onToggle(product._id, product.isActive)}
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
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-label-sm font-label-sm text-on-surface-variant">{product.category} · {displaySize}</p>
        <h3 className="text-body-md font-body-md text-on-surface font-semibold mt-0.5 truncate">{product.name}</h3>
        <p className="text-headline-sm font-headline-sm text-primary mt-1">{displayPrice}</p>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState('grid')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    fetchProducts();
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch(err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('adminToken') || '';
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch(err) {
      console.error(err);
    }
  }

  async function handleToggleStatus(id, currentStatus) {
    try {
      const token = localStorage.getItem('adminToken') || '';
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchProducts();
    } catch(err) {
      console.error(err);
    }
  }

  function exportPDF() {
    const doc = new jsPDF()
    doc.text('SG Herbals - Product Catalogue', 14, 15)
    const tableData = products.map(p => {
      const displaySize = p.sizes && p.sizes.length > 0 ? p.sizes[0].label : 'N/A';
      const displayPrice = p.sizes && p.sizes.length > 0 ? `Rs. ${p.sizes[0].price}` : 'N/A';
      return [p.name, p.category, displaySize, displayPrice, p.isActive ? 'Live' : 'Hidden'];
    })
    doc.autoTable({
      head: [['Name', 'Category', 'Size', 'Price', 'Status']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [43, 83, 65] } // SG Herbals primary color approx
    })
    doc.save('sg_herbals_catalogue.pdf')
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Product Management" />

        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex gap-4 mt-1">
                <span className="text-body-sm font-body-sm text-on-surface-variant">
                  Total Products: <span className="font-semibold text-on-surface">{products.length}</span>
                </span>
                <span className="text-body-sm font-body-sm text-on-surface-variant">
                  Hidden Products: <span className="font-semibold text-error">{products.filter(p => !p.isActive).length}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Catalogue PDF
              </button>
              <Link
                to="/products/edit/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors"
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

            {/* Category Filter */}
            <select className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-sm font-body-sm text-on-surface outline-none">
              <option value="">All Categories</option>
              <option>Cleansers</option>
              <option>Serums</option>
              <option>Moisturizers</option>
              <option>Toner</option>
            </select>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentItems.map((product) => (
                <ProductCard key={product._id} product={product} onDelete={handleDelete} onToggle={handleToggleStatus} />
              ))}
              {/* Skeleton placeholders */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="hidden lg:block bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-surface-container" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                    <div className="h-4 bg-surface-container rounded w-3/4" />
                    <div className="h-5 bg-surface-container rounded w-1/3" />
                  </div>
                </div>
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
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Status</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentItems.map((product) => {
                      const displaySize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : 'N/A';
                      const displayPrice = product.sizes && product.sizes.length > 0 ? `₹${product.sizes[0].price}` : 'N/A';
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
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant">{product.category}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant">{displaySize}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface font-semibold">{displayPrice}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-label-sm font-label-sm ${product.isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                              {product.isActive ? 'Live' : 'Hidden'}
                            </span>
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
    </div>
  )
}
