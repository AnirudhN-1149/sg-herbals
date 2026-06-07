import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'


function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-label-sm font-label-sm text-primary hover:text-primary-container transition-colors mt-1"
      title={`Copy ${label}`}
    >
      <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
      {copied ? 'Copied!' : `Copy ${label}`}
    </button>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [copyTableMsg, setCopyTableMsg] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const token = localStorage.getItem('adminToken') || ''
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const json = await res.json()
          setOrder(json.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
        const token = localStorage.getItem('adminToken') || ''
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) navigate('/orders')
    } catch (e) { console.error(e) }
  }

  function handleCopyTable() {
    if (!order) return;
    const text = order.items.map(
      (item) => `${item.name} | ${item.quantity} | ${item.size || '-'} | ₹${item.price} | ₹${item.price * item.quantity}`
    ).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopyTableMsg('Table copied!')
      setTimeout(() => setCopyTableMsg(''), 1500)
    })
  }

  function downloadPDF() {
    if (!order) return;
    const doc = new jsPDF();
    doc.text(`Invoice - Order ${order.orderNumber}`, 14, 15);
    doc.text(`Customer: ${order.customer?.name} (${order.customer?.phone})`, 14, 25);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 32);

    const tableData = order.items.map(item => [
      item.name,
      item.quantity,
      item.size || '-',
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Item Name', 'Count', 'Units', 'Unit Cost', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [43, 83, 65] }
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.text(`Subtotal: Rs. ${order.subtotal}`, 14, finalY + 10);
    doc.text(`Shipping: Rs. ${order.shippingFee}`, 14, finalY + 17);
    doc.text(`Total: Rs. ${order.total}`, 14, finalY + 24);

    doc.save(`Invoice_${order.orderNumber}.pdf`);
  }

  if (loading) return <div className="p-8 text-center bg-surface h-screen">Loading order details...</div>
  if (!order) return <div className="p-8 text-center text-error bg-surface h-screen">Order not found.</div>

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Order Details" />

        <main className="flex-1 p-6 space-y-6">
          {/* Back link */}
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant hover:text-primary group transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Orders
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">Order {order.orderNumber}</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container text-on-surface-variant rounded-lg text-label-md font-label-md hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Invoice
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-5 py-2.5 bg-error-container/30 text-error rounded-lg text-label-md font-label-md hover:bg-error-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete Order
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                <h3 className="text-label-md font-label-md text-on-surface">Customer Information</h3>
              </div>
              <p className="text-body-md font-body-md text-on-surface font-semibold">{order.customer?.name}</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">{order.customer?.phone}</p>
              <CopyButton text={order.customer?.phone || ''} label="Number" />
            </div>

            {/* Delivery Address */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                <h3 className="text-label-md font-label-md text-on-surface">Delivery Address</h3>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {order.customer?.address}
                {order.customer?.pincode && `\nPincode: ${order.customer.pincode}`}
              </p>
              <CopyButton
                text={`${order.customer?.address || ''} ${order.customer?.pincode || ''}`.trim()}
                label="Address"
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Order Items</h3>
              <button
                onClick={handleCopyTable}
                className="flex items-center gap-1.5 px-3 py-1.5 text-label-sm font-label-sm text-on-surface-variant bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                {copyTableMsg || 'Copy Table'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="text-left px-5 py-3 text-label-md font-label-md text-on-surface-variant">Item Name</th>
                    <th className="text-center px-4 py-3 text-label-md font-label-md text-on-surface-variant">Count</th>
                    <th className="text-center px-4 py-3 text-label-md font-label-md text-on-surface-variant">Units</th>
                    <th className="text-right px-4 py-3 text-label-md font-label-md text-on-surface-variant">Unit Cost (INR)</th>
                    <th className="text-right px-5 py-3 text-label-md font-label-md text-on-surface-variant">Subtotal (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-5 py-4 text-body-sm font-body-sm text-on-surface">{item.name}</td>
                      <td className="px-4 py-4 text-body-sm font-body-sm text-on-surface text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-body-sm font-body-sm text-on-surface-variant text-center">{item.size || '-'}</td>
                      <td className="px-4 py-4 text-body-sm font-body-sm text-on-surface text-right">₹{item.price}</td>
                      <td className="px-5 py-4 text-body-sm font-body-sm text-on-surface font-semibold text-right">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="px-5 py-4 border-t border-outline-variant/20 bg-surface-container-low/50">
              <div className="flex flex-col items-end gap-1.5 max-w-xs ml-auto">
                <div className="flex justify-between w-full">
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Subtotal</span>
                  <span className="text-body-sm font-body-sm text-on-surface">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between w-full">
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Shipping</span>
                  <span className="text-body-sm font-body-sm text-on-surface">₹{order.shippingFee}</span>
                </div>
                <div className="w-full h-px bg-outline-variant/30 my-1" />
                <div className="flex justify-between w-full">
                  <span className="text-label-md font-label-md text-on-surface">Total</span>
                  <span className="text-headline-sm font-headline-sm text-primary">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
