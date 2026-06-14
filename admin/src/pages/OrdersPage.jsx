import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ConfirmationModal from '../components/ConfirmationModal'
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim() : 'http://localhost:5000').replace(/\/$/, '');

const TABS = ['all', 'pending', 'completed']

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, totalSales: 0 })
  const [viewMode, setViewMode] = useState('list')
  const [pendingStatusChange, setPendingStatusChange] = useState(null)
  const itemsPerPage = 8

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      handleStatusChange(pendingStatusChange.id, pendingStatusChange.status)
      setPendingStatusChange(null)
    }
  }

  const cancelStatusChange = () => {
    setPendingStatusChange(null)
  }
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`${API_URL}/api/orders?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }); // Fetch enough to filter client side for simplicity, or implement server-side pagination
      const data = await res.json()
      if (data.success) {
        setOrders(data.data || [])
      }
    } catch(err) {
      console.error(err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/stats`);
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch(err) {
      console.error(err)
    }
  }

  const handleRefresh = () => {
    setSearch('')
    setDateFilter('')
    setActiveTab('all')
    setCurrentPage(1)
    fetchOrders()
    fetchStats()
  }

  let filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab)
  
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(o => 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) || 
      (o.customer?.name && o.customer.name.toLowerCase().includes(s)) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(s))
    )
  }
  
  if (dateFilter) {
    filtered = filtered.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate === dateFilter;
    })
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  async function handleStatusChange(orderId, newStatus) {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch(err) {
      console.error(err);
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
    const doc = new jsPDF()
    const logoUrl = '/logo_sg.png';
    const logoBase64 = await preloadImage(logoUrl);

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
    doc.setFontSize(22);
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

    // Reset text color for body
    doc.setTextColor(33, 33, 33)

    // Centered Bolder Heading in the body top as the first line (increased font size + gap below)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(21, 69, 57);
    doc.text("ORDER SUMMARY REPORT", 105, 45, { align: "center" });

    // Premium Metrics Summary Card (Shifted to Y = 57 for gap)
    doc.setFillColor(245, 248, 246)
    doc.rect(14, 57, 182, 18, 'F')
    doc.setDrawColor(220, 225, 222)
    doc.setLineWidth(0.3)
    doc.rect(14, 57, 182, 18, 'S')

    // Left green border highlight for the card
    doc.setFillColor(21, 69, 57)
    doc.rect(14, 57, 2, 18, 'F')
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(74, 101, 79)
    doc.text("TOTAL ORDERS SHOWN", 22, 63)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(21, 69, 57)
    doc.text(`${filtered.length}`, 22, 71)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(74, 101, 79)
    doc.text("REPORT GENERATED ON", 110, 63)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(33, 33, 33)
    doc.text(`${new Date().toLocaleString('en-IN')}`, 110, 71)

    const tableData = filtered.map(o => [
      o.orderNumber,
      o.customer?.name || '-',
      o.customer?.phone || '-',
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      `Rs. ${o.total}`,
      o.status.toUpperCase()
    ])

    const startTableY = 82;
    autoTable(doc, {
      head: [['Order ID', 'Customer Name', 'Phone Number', 'Order Date', 'Total Amount', 'Status']],
      body: tableData,
      startY: startTableY,
      theme: 'striped',
      headStyles: {
        fillColor: [21, 69, 57],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [247, 249, 248]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      }
    })

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    doc.save(`sg_herbals_orders_report_${timestamp}.pdf`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto lg:ml-64 pb-16 lg:pb-0">
        <AdminTopBar pageTitle="Order Management" />

        <main className="flex-1 p-6 space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Sales */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-5 border border-outline-variant/20 airy-shadow-low flex items-center gap-2 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[24px] text-on-secondary-container">payments</span>
              </div>
              <div>
                <p className="text-headline-sm sm:text-headline-md font-headline-sm sm:font-headline-md text-on-surface">₹{(stats.totalSales || 0).toLocaleString()}</p>
                <p className="text-[10px] sm:text-label-sm font-medium text-on-surface-variant">Total Sales</p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-5 border border-outline-variant/20 airy-shadow-low flex items-center gap-2 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary-fixed/40 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[24px] text-primary">shopping_cart</span>
              </div>
              <div>
                <p className="text-headline-sm sm:text-headline-md font-headline-sm sm:font-headline-md text-on-surface">{stats.totalOrders || 0}</p>
                <p className="text-[10px] sm:text-label-sm font-medium text-on-surface-variant">Total Orders</p>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-5 border border-outline-variant/20 airy-shadow-low flex items-center gap-2 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[24px] text-on-secondary-container">check_circle</span>
              </div>
              <div>
                <p className="text-headline-sm sm:text-headline-md font-headline-sm sm:font-headline-md text-on-surface">{stats.completedOrders || 0}</p>
                <p className="text-[10px] sm:text-label-sm font-medium text-on-surface-variant">Completed Orders</p>
              </div>
            </div>

            {/* Pending/Orders to Complete */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-5 border border-outline-variant/20 airy-shadow-low flex items-center gap-2 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-error-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[24px] text-on-error-container">pending_actions</span>
              </div>
              <div>
                <p className="text-headline-sm sm:text-headline-md font-headline-sm sm:font-headline-md text-on-surface">{(stats.totalOrders || 0) - (stats.completedOrders || 0)}</p>
                <p className="text-[10px] sm:text-label-sm font-medium text-on-surface-variant">Orders to Complete</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 flex-1 min-w-[200px] focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search by Order ID, Customer name or Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-body-sm font-body-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
              />
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-body-sm font-body-sm text-on-surface outline-none"
              />
            </div>

            {/* Grid/List Toggle buttons */}
            <div className="flex items-center bg-surface-container rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end sm:ml-auto">
              <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Refresh
              </button>
              <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export PDF
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-label-md font-label-md transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid View rendering */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-on-surface-variant">
                  No orders found.
                </div>
              ) : (
                currentItems.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-body-md font-semibold text-primary">{order.orderNumber}</span>
                        <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                          {new Date(order.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-body-sm font-semibold text-on-surface">{order.customer?.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{order.customer?.phone}</p>
                        <p className="text-label-sm text-on-surface-variant/80">{order.customer?.address}</p>
                      </div>
                      <div className="mt-4 border-t border-outline-variant/10 pt-3">
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Items Summary</p>
                        <div className="mt-1 space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                          {order.items?.map((item, idx) => (
                            <p key={idx} className="text-xs text-on-surface-variant flex justify-between">
                              <span>{item.name} ({item.size})</span>
                              <span>x{item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-outline-variant/10 pt-3 mt-auto">
                      <div>
                        <p className="text-[10px] font-semibold text-on-surface-variant">Total Amount</p>
                        <p className="text-headline-sm font-headline-sm text-primary">₹{order.total}</p>
                      </div>
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setPendingStatusChange({ id: order._id, status: e.target.value })}
                        className={`status-select text-label-sm font-label-sm rounded-full px-3 py-1 border-0 outline-none cursor-pointer ${
                          order.status === 'completed'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List View rendering */}
          {viewMode === 'list' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Order ID</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Customer Name</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant hidden md:table-cell">Contact Number</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant hidden lg:table-cell">Order Date</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Total (₹)</th>
                      <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Order Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentItems.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-6 text-on-surface-variant">No orders found.</td></tr>
                    ) : currentItems.map((order) => (
                      <tr 
                        key={order._id} 
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="hover:bg-secondary-container/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-body-sm font-body-sm text-primary font-semibold">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface">{order.customer?.name}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant hidden md:table-cell">{order.customer?.phone}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface font-semibold">₹{order.total}</td>
                        <td className="px-4 py-3">
                          <div className="hidden sm:block">
                            <select
                              value={order.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setPendingStatusChange({ id: order._id, status: e.target.value })}
                              className={`status-select text-label-sm font-label-sm rounded-full px-3 py-1 border-0 outline-none cursor-pointer ${
                                order.status === 'completed'
                                  ? 'bg-secondary-container text-on-secondary-container'
                                  : order.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-surface-container text-on-surface-variant'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <div className="sm:hidden flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStatus = order.status === 'completed' ? 'pending' : 'completed';
                                setPendingStatusChange({ id: order._id, status: newStatus });
                              }}
                              className={`flex items-center justify-center w-8 h-8 rounded-full border-0 outline-none cursor-pointer transition-colors ${
                                order.status === 'completed'
                                  ? 'bg-secondary-container text-on-secondary-container'
                                  : order.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-surface-container text-on-surface-variant'
                              }`}
                              title={order.status === 'completed' ? 'Change to Pending' : 'Change to Completed'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {order.status === 'completed' ? 'check_circle' : 'hourglass_empty'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low flex-wrap gap-3">
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} orders
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-label-sm font-label-sm transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <ConfirmationModal
        isOpen={pendingStatusChange !== null}
        title="Update Order Status"
        message={`Are you sure you want to change the status of this order to "${pendingStatusChange?.status}"?`}
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        confirmText="Update"
        isDestructive={false}
      />
    </div>
  )
}
