import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ConfirmationModal from '../components/ConfirmationModal'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all mt-2 ${
        copied
          ? 'bg-secondary-container text-on-secondary-container'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
      }`}
      title="Copy"
    >
      <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function StatusSelect({ orderId, currentStatus, onUpdate }) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  async function handleChange(newStatus) {
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setStatus(newStatus)
        onUpdate && onUpdate(newStatus)
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-label-md font-label-md text-on-surface-variant">Status:</span>
      <select
        value={status}
        disabled={saving}
        onChange={(e) => setPendingStatus(e.target.value)}
        className={`status-select text-label-sm font-label-sm rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer ${
          status === 'completed'
            ? 'bg-secondary-container text-on-secondary-container'
            : 'bg-amber-100 text-amber-800'
        }`}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <ConfirmationModal
        isOpen={pendingStatus !== null}
        title="Update Order Status"
        message={`Are you sure you want to change the status of this order to "${pendingStatus}"?`}
        onConfirm={() => {
          handleChange(pendingStatus)
          setPendingStatus(null)
        }}
        onCancel={() => setPendingStatus(null)}
        confirmText="Update"
        isDestructive={false}
      />
    </div>
  )
}


export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingShipping, setEditingShipping] = useState(false)
  const [shippingInput, setShippingInput] = useState(0)
  const [savingShipping, setSavingShipping] = useState(false)
  const [copyOrderMsg, setCopyOrderMsg] = useState('')
  const [copyAddrMsg, setCopyAddrMsg] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        setOrder(json.data)
        setShippingInput(json.data.shippingFee || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete() {
    setShowDeleteModal(true)
  }

  async function saveShipping() {
    setSavingShipping(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const newFee = Number(shippingInput) || 0
      const newTotal = (order.subtotal || 0) + newFee
      await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ shippingFee: newFee, total: newTotal })
      })
      setOrder(prev => ({ ...prev, shippingFee: newFee, total: newTotal }))
      setEditingShipping(false)
    } catch (e) {
      console.error(e)
      const newFee = Number(shippingInput) || 0
      setOrder(prev => ({ ...prev, shippingFee: newFee, total: (prev.subtotal || 0) + newFee }))
      setEditingShipping(false)
    }
    setSavingShipping(false)
  }

  function buildOrderCopyText(o) {
    const lines = ['*ORDER ITEMS*', '']
    o.items.forEach((item, i) => {
      const sub = item.price * item.quantity
      lines.push(`${i + 1}. *${item.name}*`)
      lines.push(`Qty: ${item.quantity} | Size: ${item.size || '-'} | Unit Cost: ₹${item.price} | Subtotal: *₹${sub}*`)
      lines.push('')
    })
    lines.push(`*Shipping:* *₹${o.shippingFee || 0}*`)
    lines.push('────────────────────')
    lines.push(`*Grand Total:* *₹${o.total}*`)
    lines.push('────────────────────')
    return lines.join('\n')
  }

  function buildAddressCopyText(o) {
    return [
      `*Name:* ${o.customer?.name}`,
      `*Phone:* ${o.customer?.phone}`,
      o.customer?.address ? `*Address:* ${o.customer.address}` : '',
      o.customer?.pincode ? `*Pincode:* ${o.customer.pincode}` : ''
    ].filter(Boolean).join('\n')
  }

  function handleCopyOrder() {
    if (!order) return
    navigator.clipboard.writeText(buildOrderCopyText(order)).then(() => {
      setCopyOrderMsg('Copied!')
      setTimeout(() => setCopyOrderMsg(''), 2000)
    })
  }

  function handleCopyAddr() {
    if (!order) return
    navigator.clipboard.writeText(buildAddressCopyText(order)).then(() => {
      setCopyAddrMsg('Copied!')
      setTimeout(() => setCopyAddrMsg(''), 2000)
    })
  }

  function downloadPDF() {
    if (!order) return
    const doc = new jsPDF()

    // Header Banner
    doc.setFillColor(21, 69, 57)
    doc.rect(0, 0, 210, 25, 'F')

    // Header Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text("SG HERBALS", 14, 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(231, 216, 201)
    doc.text("Premium Botanical Products", 14, 21)

    // Invoice label on the right
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text("INVOICE / RECEIPT", 140, 16)

    // Reset text color for body
    doc.setTextColor(33, 33, 33)

    // Invoice Metadata (Two Columns)
    // Left: Customer details
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("BILLED TO:", 14, 38)
    doc.setFont("helvetica", "normal")
    doc.text(order.customer?.name || '-', 14, 44)
    doc.text(`Phone: ${order.customer?.phone || '-'}`, 14, 49)

    // Right: Invoice Details
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE DETAILS:", 130, 38)
    doc.setFont("helvetica", "normal")
    doc.text(`Invoice No: ${order.orderNumber}`, 130, 44)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 130, 49)
    doc.text(`Status: ${order.status.toUpperCase()}`, 130, 54)

    // Divider line
    doc.setDrawColor(21, 69, 57)
    doc.setLineWidth(0.5)
    doc.line(14, 60, 196, 60)

    const tableData = order.items.map((item, i) => [
      i + 1,
      item.name,
      item.size || '-',
      item.quantity,
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`
    ])

    autoTable(doc, {
      startY: 65,
      head: [['#', 'Item Description', 'Size', 'Qty', 'Unit Cost', 'Subtotal']],
      body: tableData,
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
        cellPadding: 4,
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    })

    const finalY = doc.lastAutoTable.finalY || 65

    // Calculation Summary Box
    doc.setFillColor(245, 248, 246)
    doc.roundedRect(125, finalY + 8, 71, 32, 2, 2, 'F')

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.text(`Subtotal:`, 130, finalY + 15)
    doc.text(`Rs. ${order.subtotal}`, 170, finalY + 15)

    doc.text(`Shipping:`, 130, finalY + 22)
    doc.text(`Rs. ${order.shippingFee || 0}`, 170, finalY + 22)

    // Total Line
    doc.setDrawColor(21, 69, 57)
    doc.setLineWidth(0.3)
    doc.line(130, finalY + 25, 190, finalY + 25)

    doc.setFont("helvetica", "bold")
    doc.text(`Total:`, 130, finalY + 32)
    doc.text(`Rs. ${order.total}`, 170, finalY + 32)

    // Delivery Address
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("DELIVERY ADDRESS:", 14, finalY + 15)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const splitAddress = doc.splitTextToSize(`${order.customer?.address || ''}, Pin: ${order.customer?.pincode || ''}`, 90)
    doc.text(splitAddress, 14, finalY + 21)

    // Footer message
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(120, 130, 125)
    doc.text("Thank you for shopping with SG Herbals! We appreciate your business.", 14, finalY + 50)

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    doc.save(`Invoice_${order.orderNumber}_${timestamp}.pdf`)
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-surface"><div className="text-on-surface-variant">Loading order details...</div></div>
  if (!order) return <div className="flex h-screen items-center justify-center bg-surface"><div className="text-error">Order not found.</div></div>

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Order Details" />
        <main className="flex-1 p-4 md:p-6 space-y-5">

          {/* Back */}
          <Link to="/orders" className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-primary group transition-colors">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Orders
          </Link>

          {/* Header Bar */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">Order {order.orderNumber}</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg text-label-md hover:bg-surface-container-high transition-colors border border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Invoice
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-error-container/30 text-error rounded-lg text-label-md hover:bg-error-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete
              </button>
            </div>
          </div>

          {/* Status + Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Card */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">local_shipping</span>
                <h3 className="text-label-md font-label-md text-on-surface">Order Status</h3>
              </div>
              <StatusSelect
                orderId={order._id}
                currentStatus={order.status}
                onUpdate={(s) => setOrder(prev => ({ ...prev, status: s }))}
              />
            </div>

            {/* Customer Card */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                <h3 className="text-label-md font-label-md text-on-surface">Customer</h3>
              </div>
              <p className="text-body-md font-semibold text-on-surface">{order.customer?.name}</p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">{order.customer?.phone}</p>
              <CopyButton text={order.customer?.phone || ''} />
            </div>

            {/* Address Card */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 airy-shadow-low">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                  <h3 className="text-label-md font-label-md text-on-surface">Delivery Address</h3>
                </div>
              </div>
              <p className="text-body-sm text-on-surface leading-relaxed">
                {order.customer?.address}
                {order.customer?.pincode && <><br /><span className="text-on-surface-variant">Pincode: {order.customer.pincode}</span></>}
              </p>
              <button
                onClick={handleCopyAddr}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm transition-all mt-2 ${
                  copyAddrMsg ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{copyAddrMsg ? 'check' : 'content_copy'}</span>
                {copyAddrMsg || 'Copy'}
              </button>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Order Items</h3>
              <button
                onClick={handleCopyOrder}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm transition-all ${
                  copyOrderMsg ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{copyOrderMsg ? 'check' : 'content_copy'}</span>
                {copyOrderMsg || 'Copy'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="text-left px-5 py-3 text-label-md font-label-md text-on-surface-variant">#</th>
                    <th className="text-left px-4 py-3 text-label-md font-label-md text-on-surface-variant">Item Name</th>
                    <th className="text-center px-4 py-3 text-label-md font-label-md text-on-surface-variant">Qty</th>
                    <th className="text-center px-4 py-3 text-label-md font-label-md text-on-surface-variant">Size</th>
                    <th className="text-right px-4 py-3 text-label-md font-label-md text-on-surface-variant">Unit Cost</th>
                    <th className="text-right px-5 py-3 text-label-md font-label-md text-on-surface-variant">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-5 py-4 text-label-sm text-on-surface-variant">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-body-sm font-semibold text-on-surface">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-body-sm text-on-surface text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-4 text-body-sm text-on-surface-variant text-center">{item.size || '-'}</td>
                      <td className="px-4 py-4 text-body-sm text-on-surface text-right">₹{item.price}</td>
                      <td className="px-5 py-4 text-body-sm text-on-surface font-bold text-right">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="px-5 py-5 border-t border-outline-variant/20 bg-surface-container-low/40">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-body-sm text-on-surface-variant">Subtotal</span>
                  <span className="text-body-sm text-on-surface">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-on-surface-variant">Shipping</span>
                  <div className="flex items-center gap-2">
                    {editingShipping ? (
                      <>
                        <input
                          type="number"
                          value={shippingInput}
                          onChange={e => setShippingInput(e.target.value)}
                          className="w-24 text-right border border-primary rounded-md px-2 py-1 text-body-sm text-on-surface outline-none bg-surface-container-lowest"
                          autoFocus
                        />
                        <button
                          onClick={saveShipping}
                          disabled={savingShipping}
                          className="px-2 py-1 bg-primary text-white rounded-md text-label-sm hover:opacity-90 transition"
                        >
                          {savingShipping ? '...' : 'Save'}
                        </button>
                        <button onClick={() => { setEditingShipping(false); setShippingInput(order.shippingFee) }} className="px-2 py-1 bg-surface-container text-on-surface-variant rounded-md text-label-sm">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-body-sm text-on-surface">₹{order.shippingFee || 0}</span>
                        <button onClick={() => setEditingShipping(true)} className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-px bg-outline-variant/30" />
                <div className="flex justify-between">
                  <span className="text-label-md font-bold text-on-surface">Grand Total</span>
                  <span className="text-headline-sm font-headline-sm text-primary">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>


        </main>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Order"
        message={`Are you sure you want to delete order ${order?.orderNumber}? This action cannot be undone.`}
        onConfirm={async () => {
          setShowDeleteModal(false);
          try {
            const token = localStorage.getItem('adminToken') || ''
            const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) navigate('/orders')
          } catch (e) { console.error(e) }
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
