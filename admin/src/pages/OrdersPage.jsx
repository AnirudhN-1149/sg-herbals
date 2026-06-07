import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
const TABS = ['all', 'pending', 'completed']

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0 })
  const itemsPerPage = 8
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('http://localhost:5000/api/orders?limit=100', {
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
      const res = await fetch('http://localhost:5000/api/dashboard/stats');
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch(err) {
      console.error(err)
    }
  }

  let filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab)
  
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(o => 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) || 
      (o.customer?.name && o.customer.name.toLowerCase().includes(s))
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
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
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

  function exportPDF() {
    const doc = new jsPDF()
    doc.text('SG Herbals - Orders Report', 14, 15)
    const tableData = filtered.map(o => [
      o.orderNumber,
      o.customer?.name || '-',
      o.customer?.phone || '-',
      new Date(o.createdAt).toLocaleDateString(),
      `Rs. ${o.total}`,
      o.status
    ])
    doc.autoTable({
      head: [['Order ID', 'Customer', 'Phone', 'Date', 'Total', 'Status']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [43, 83, 65] }
    })
    doc.save('sg_herbals_orders.pdf')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Order Management" />

        <main className="flex-1 p-6 space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 flex-1 min-w-[200px] focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search by ID or Customer..."
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
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-colors ml-auto">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export PDF
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-on-secondary-container">shopping_cart</span>
              </div>
              <div>
                <p className="text-headline-md font-headline-md text-on-surface">{stats.totalOrders}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Total Orders</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
              </div>
              <div>
                <p className="text-headline-md font-headline-md text-on-surface">{stats.completedOrders}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Completed Orders</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

          {/* Table */}
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
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-body-sm font-body-sm text-primary font-semibold">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface">{order.customer?.name}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant hidden md:table-cell">{order.customer?.phone}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface-variant hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-body-sm font-body-sm text-on-surface font-semibold">₹{order.total}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          </div>
        </main>
      </div>
    </div>
  )
}
