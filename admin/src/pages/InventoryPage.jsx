import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ConfirmationModal from '../components/ConfirmationModal'

export default function InventoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('materials')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [salesData, setSalesData] = useState({ totalSales: 0, completedOrders: 0, recentOrders: [] })
  const [deleteMatId, setDeleteMatId] = useState(null)

  useEffect(() => {
    fetchInventory();
    fetchSalesData();
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory');
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data || []);
      }
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  }

  const fetchSalesData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setSalesData(data.data);
      }
    } catch(err) {
      console.error(err);
    }
  }

  const handleEditClick = (m) => {
    setEditingId(m._id || 'new');
    setEditForm({ ...m });
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    if (materials.some(m => !m._id)) {
      setMaterials(materials.filter(m => m._id));
    }
  }

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.unit) return;
    setSaving(true);
    try {
      const url = editForm._id ? `http://localhost:5000/api/inventory/${editForm._id}` : 'http://localhost:5000/api/inventory';
      const method = editForm._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        fetchInventory();
        setEditingId(null);
      }
    } catch(err) {
      console.error(err);
    }
    setSaving(false);
  }

  const removeMaterial = (id) => {
    if (!id) return;
    setDeleteMatId(id);
  }

  const addMaterial = () => {
    const newMat = { name: '', unit: '', quantity: 0, costPerUnit: 0 };
    setMaterials([newMat, ...materials]);
    setEditingId('new');
    setEditForm(newMat);
  }

  const exportInventoryPDF = () => {
    const doc = new jsPDF()

    // Brand header
    doc.setFillColor(21, 69, 57)
    doc.rect(0, 0, 210, 20, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text("SG HERBALS", 14, 13)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("RAW MATERIALS INVENTORY REPORT", 115, 13)

    // Meta info
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 28)
    doc.text(`Total Material Types: ${materials.length}`, 14, 33)
    doc.text(`Total Inventory Value: Rs. ${totalInventoryValue.toFixed(2)}`, 140, 33)

    const tableData = materials.map(m => [
      m.name,
      m.unit,
      m.quantity,
      `Rs. ${m.costPerUnit}`,
      `Rs. ${(m.quantity * m.costPerUnit).toFixed(2)}`
    ])

    autoTable(doc, {
      head: [['Material Name', 'Measurement Unit', 'Current Stock Qty', 'Cost per Unit', 'Subtotal Value']],
      body: tableData,
      startY: 38,
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
    doc.save(`sg_herbals_inventory_${timestamp}.pdf`)
  }

  const exportSalesPDF = () => {
    const doc = new jsPDF()

    // Brand header
    doc.setFillColor(21, 69, 57)
    doc.rect(0, 0, 210, 20, 'F')

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text("SG HERBALS", 14, 13)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("RECENT SALES REPORT", 130, 13)

    const orders = salesData.recentOrders ? salesData.recentOrders.filter(o => o.status === 'completed') : []
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0)

    // Meta info
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 28)
    doc.text(`Completed Orders Count: ${orders.length}`, 14, 33)
    doc.text(`Total Sales Value: Rs. ${totalSales.toFixed(2)}`, 140, 33)

    const tableData = orders.map(o => [
      o.orderNumber,
      o.customer?.name || '-',
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      `Rs. ${o.total}`,
      'COMPLETED'
    ])

    autoTable(doc, {
      head: [['Order ID', 'Customer Name', 'Sale Date', 'Total Paid', 'Order Status']],
      body: tableData,
      startY: 38,
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
    doc.save(`sg_herbals_sales_${timestamp}.pdf`)
  }

  const totalInventoryValue = materials.reduce((acc, m) => acc + (m.quantity * m.costPerUnit), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Inventory Management" />

        <main className="flex-1 px-10 py-8">
          <div className="flex items-center gap-0 border-b border-outline-variant/30 mb-8">
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-6 py-3 text-label-md font-label-md transition-all ${
                activeTab === 'materials'
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                Materials
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 text-label-md font-label-md transition-all ${
                activeTab === 'sales'
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                Sales
              </span>
            </button>
          </div>

          {activeTab === 'materials' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-headline-md font-headline-md text-primary">Current Inventory</h2>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/50">
                  <h3 className="text-headline-sm font-headline-sm text-primary">
                    Raw Materials List
                  </h3>
                  <div className="flex items-center gap-3">
                    <button onClick={exportInventoryPDF} className="flex items-center justify-center p-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Export PDF">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                    <button onClick={addMaterial} className="flex items-center justify-center p-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity airy-shadow-low" title="Add Material">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20 bg-surface-container-low/30">
                        {['Name', 'Unit', 'Qty', 'Cost / Unit', 'Subtotal', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-label-md font-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {loading ? (
                        <tr><td colSpan="6" className="text-center py-8">Loading inventory...</td></tr>
                      ) : materials.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8">No materials found.</td></tr>
                      ) : materials.map((m) => {
                        const isEditing = editingId === m._id || (editingId === 'new' && !m._id);
                        return (
                          <tr key={m._id || 'new'} className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-6 py-3">
                              {isEditing ? (
                                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/40 rounded px-2 py-1 w-full text-body-md" placeholder="Name" />
                              ) : (
                                <span className="text-body-md">{m.name}</span>
                              )}
                            </td>
                            <td className="px-6 py-3">
                              {isEditing ? (
                                <input type="text" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/40 rounded px-2 py-1 w-16 text-body-md text-center" placeholder="Unit" />
                              ) : (
                                <span className="text-body-md text-on-surface-variant">{m.unit}</span>
                              )}
                            </td>
                            <td className="px-6 py-3">
                              {isEditing ? (
                                <input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/40 rounded px-2 py-1 w-20 text-body-md" />
                              ) : (
                                <span className="text-body-md">{m.quantity}</span>
                              )}
                            </td>
                            <td className="px-6 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span>₹</span>
                                  <input type="number" value={editForm.costPerUnit} onChange={e => setEditForm({...editForm, costPerUnit: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/40 rounded px-2 py-1 w-20 text-body-md" />
                                </div>
                              ) : (
                                <span className="text-body-md">₹{m.costPerUnit}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-body-md font-body-md text-primary font-semibold">
                              ₹{isEditing 
                                  ? ((parseFloat(editForm.quantity) || 0) * (parseFloat(editForm.costPerUnit) || 0)).toFixed(2)
                                  : ((parseFloat(m.quantity) || 0) * (parseFloat(m.costPerUnit) || 0)).toFixed(2)
                               }
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button onClick={handleSaveEdit} disabled={saving} className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all">
                                      <span className="material-symbols-outlined text-[18px]">{saving ? 'hourglass_empty' : 'check'}</span>
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all">
                                      <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleEditClick(m)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all">
                                      <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button onClick={() => removeMaterial(m._id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all">
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30">
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Total Items: {materials.length}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-md font-label-md text-on-surface-variant">Total Inventory Value:</span>
                    <span className="text-headline-sm font-headline-sm text-primary">₹{totalInventoryValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-headline-md font-headline-md text-primary">Sales Records</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Total Sales</p>
                    <p className="text-headline-sm font-headline-sm text-primary">₹{(salesData.totalSales || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Completed Orders</p>
                    <p className="text-headline-sm font-headline-sm text-primary">{salesData.completedOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/50">
                  <h3 className="text-headline-sm font-headline-sm text-primary">Recent Completed Orders</h3>
                  <button onClick={exportSalesPDF} className="flex items-center justify-center p-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Export PDF">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        {['Order ID', 'Customer', 'Date', 'Total Amount', 'Status'].map(h => (
                          <th key={h} className="px-6 py-4 text-label-md font-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                    {salesData.recentOrders && salesData.recentOrders.filter(o => o.status === 'completed').map((o) => (
                      <tr 
                        key={o._id} 
                        onClick={() => navigate(`/orders/${o._id}`)}
                        className="hover:bg-surface-container-low/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-body-sm font-body-sm text-primary font-semibold">{o.orderNumber}</td>
                        <td className="px-6 py-4 text-body-md font-body-md text-on-surface">{o.customer?.name}</td>
                        <td className="px-6 py-4 text-body-sm font-body-sm text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-body-md font-body-md text-on-surface font-semibold">₹{o.total}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container text-label-sm font-label-sm rounded-full">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>

      <ConfirmationModal
        isOpen={deleteMatId !== null}
        title="Delete Material"
        message="Are you sure you want to delete this material? This action cannot be undone."
        onConfirm={async () => {
          const id = deleteMatId;
          setDeleteMatId(null);
          try {
            await fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' });
            fetchInventory();
          } catch(err) {
            console.error(err);
          }
        }}
        onCancel={() => setDeleteMatId(null)}
      />
    </div>
  )
}
