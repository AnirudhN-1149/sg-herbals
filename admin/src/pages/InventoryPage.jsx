import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ConfirmationModal from '../components/ConfirmationModal'

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim() : 'http://localhost:5000').replace(/\/$/, '');

const parseUnit = (unitStr) => {
  if (!unitStr) return { val: '', metric: 'g' };
  const match = unitStr.match(/^(\d+(?:\.\d+)?)\s*(g|mL|piece\(s\)|pieces|piece|pc\.|pc)?$/i);
  if (match) {
    let metric = match[2] || 'g';
    if (metric.toLowerCase().startsWith('p') || metric.toLowerCase().startsWith('piece')) {
      metric = 'piece(s)';
    }
    return { val: match[1], metric };
  }
  const numMatch = unitStr.match(/^[\d.]+/);
  const val = numMatch ? numMatch[0] : '';
  let metric = unitStr.replace(val, '').trim() || 'g';
  if (metric.toLowerCase().startsWith('p') || metric.toLowerCase().startsWith('piece')) {
    metric = 'piece(s)';
  }
  return { val, metric };
}

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    fetchInventory();
    fetchSalesData();

    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventory`);
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
      const res = await fetch(`${API_URL}/api/dashboard/stats`);
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
    const { val, metric } = parseUnit(m.unit);
    setEditForm({ ...m, unitVal: val, unitMetric: metric });
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    if (materials.some(m => !m._id)) {
      setMaterials(materials.filter(m => m._id));
    }
  }

  const handleSaveEdit = async () => {
    const finalUnit = `${editForm.unitVal || ''}${editForm.unitMetric || 'g'}`;
    const payload = {
      ...editForm,
      unit: finalUnit
    };
    if (!payload.name || !editForm.unitVal) return;
    setSaving(true);
    try {
      const url = payload._id ? `${API_URL}/api/inventory/${payload._id}` : `${API_URL}/api/inventory`;
      const method = payload._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    const newMat = { name: '', unit: 'g', quantity: 0, costPerUnit: 0 };
    if (!isMobile) {
      setMaterials([newMat, ...materials]);
    }
    setEditingId('new');
    setEditForm({ ...newMat, unitVal: '', unitMetric: 'g' });
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

  const exportInventoryPDF = async () => {
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
    doc.text("INVENTORY REPORT", 105, 45, { align: "center" });

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
    doc.setFontSize(8.0)
    doc.setTextColor(74, 101, 79)
    doc.text("TOTAL MATERIAL TYPES", 22, 63)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(21, 69, 57)
    doc.text(`${materials.length}`, 22, 71)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.0)
    doc.setTextColor(74, 101, 79)
    doc.text("TOTAL INVENTORY VALUE", 85, 63)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(21, 69, 57)
    doc.text(`Rs. ${totalInventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 85, 71)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.0)
    doc.setTextColor(74, 101, 79)
    doc.text("GENERATED ON", 148, 63)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(33, 33, 33)
    doc.text(`${new Date().toLocaleString('en-IN')}`, 148, 71)

    const tableData = materials.map(m => [
      m.name,
      m.unit,
      m.quantity,
      `Rs. ${m.costPerUnit}`,
      `Rs. ${(m.quantity * m.costPerUnit).toFixed(2)}`
    ])

    const startTableY = 82;
    autoTable(doc, {
      head: [['Material Name', 'Measurement Unit', 'Current Stock Qty', 'Cost per Unit', 'Subtotal Value']],
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
    doc.save(`sg_herbals_inventory_${timestamp}.pdf`)
  }

  const exportSalesPDF = async () => {
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

    const orders = salesData.recentOrders ? salesData.recentOrders.filter(o => o.status === 'completed') : []
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0)

    // Centered Bolder Heading in the body top as the first line (increased font size + gap below)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(21, 69, 57);
    doc.text("SALES REPORT", 105, 45, { align: "center" });

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
    doc.setFontSize(8.0)
    doc.setTextColor(74, 101, 79)
    doc.text("COMPLETED ORDERS COUNT", 22, 63)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(21, 69, 57)
    doc.text(`${orders.length}`, 22, 71)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.0)
    doc.setTextColor(74, 101, 79)
    doc.text("TOTAL SALES VALUE", 85, 63)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(21, 69, 57)
    doc.text(`Rs. ${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 85, 71)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.0)
    doc.setTextColor(74, 101, 79)
    doc.text("GENERATED ON", 148, 63)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(33, 33, 33)
    doc.text(`${new Date().toLocaleString('en-IN')}`, 148, 71)

    const tableData = orders.map(o => [
      o.orderNumber,
      o.customer?.name || '-',
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      `Rs. ${o.total}`,
      'COMPLETED'
    ])

    const startTableY = 82;
    autoTable(doc, {
      head: [['Order ID', 'Customer Name', 'Sale Date', 'Total Paid', 'Order Status']],
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
    doc.save(`sg_herbals_sales_${timestamp}.pdf`)
  }

  const totalInventoryValue = materials.reduce((acc, m) => acc + (m.quantity * m.costPerUnit), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto lg:ml-64 pb-16 lg:pb-0">
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
                        const isEditing = !isMobile && (editingId === m._id || (editingId === 'new' && !m._id));
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
                                <div className="flex items-center gap-1 min-w-[120px]">
                                  <input 
                                    type="number" 
                                    value={editForm.unitVal || ''} 
                                    onChange={e => setEditForm({...editForm, unitVal: e.target.value})} 
                                    placeholder="Qty" 
                                    className="bg-surface-container-lowest border border-outline-variant/40 rounded px-1.5 py-1 w-14 text-body-md text-center outline-none focus:border-primary"
                                  />
                                  <select 
                                    value={editForm.unitMetric || 'g'} 
                                    onChange={e => setEditForm({...editForm, unitMetric: e.target.value})} 
                                    className="bg-surface-container-lowest border border-outline-variant/40 rounded px-1 py-1 text-body-md text-center cursor-pointer outline-none focus:border-primary"
                                  >
                                    <option value="g">g</option>
                                    <option value="mL">mL</option>
                                    <option value="piece(s)">piece(s)</option>
                                  </select>
                                </div>
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
                        <td className="px-6 py-4 text-body-sm font-body-sm text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
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

      {/* Mobile Form Modal */}
      {editingId !== null && isMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm border border-outline-variant/20 airy-shadow-high overflow-hidden flex flex-col max-h-[95vh] text-left">
            <div className="px-5 py-3 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
              <h3 className="text-title-medium font-bold text-primary">
                {editingId === 'new' ? 'Add Material' : 'Edit Material'}
              </h3>
              <button 
                onClick={handleCancelEdit} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Material Name</label>
                <input 
                  type="text" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  placeholder="e.g. Lavender Oil" 
                  className="bg-surface-container border border-outline-variant/40 rounded-xl px-3.5 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Unit selection */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Measurement Unit</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={editForm.unitVal || ''} 
                    onChange={e => setEditForm({...editForm, unitVal: e.target.value})} 
                    placeholder="e.g. 100" 
                    className="w-28 bg-surface-container border border-outline-variant/40 rounded-xl px-3.5 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                  />
                  <select 
                    value={editForm.unitMetric || 'g'} 
                    onChange={e => setEditForm({...editForm, unitMetric: e.target.value})} 
                    className="flex-1 bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="g">g (Grams)</option>
                    <option value="mL">mL (Milliliters)</option>
                    <option value="piece(s)">piece(s)</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Current Stock Qty</label>
                <input 
                  type="number" 
                  value={editForm.quantity || 0} 
                  onChange={e => setEditForm({...editForm, quantity: e.target.value})} 
                  className="bg-surface-container border border-outline-variant/40 rounded-xl px-3.5 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Cost per unit */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Cost Per Unit (₹)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-on-surface-variant text-body-md">₹</span>
                  <input 
                    type="number" 
                    value={editForm.costPerUnit || 0} 
                    onChange={e => setEditForm({...editForm, costPerUnit: e.target.value})} 
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl pl-8 pr-3.5 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Calculated Total */}
              <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center border border-outline-variant/10">
                <span className="text-label-md font-bold text-on-surface-variant">Estimated Subtotal:</span>
                <span className="text-title-large font-bold text-primary">
                  ₹{((parseFloat(editForm.quantity) || 0) * (parseFloat(editForm.costPerUnit) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-outline-variant/10 flex gap-3 bg-surface-container-low">
              <button 
                onClick={handleCancelEdit} 
                className="flex-1 px-4 py-2 rounded-xl border border-outline-variant/30 text-label-md font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={saving || !editForm.name} 
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving && <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteMatId !== null}
        title="Delete Material"
        message="Are you sure you want to delete this material? This action cannot be undone."
        onConfirm={async () => {
          const id = deleteMatId;
          setDeleteMatId(null);
          try {
            await fetch(`${API_URL}/api/inventory/${id}`, { method: 'DELETE' });
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
