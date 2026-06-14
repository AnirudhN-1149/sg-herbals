import React, { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'
import { useToast } from '../components/ToastContext'
import ConfirmationModal from '../components/ConfirmationModal'

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim() : 'http://localhost:5000').replace(/\/$/, '');

const ALL_TAGS = [
  { id: 'natural', label: 'Natural Ingredients', icon: 'eco' },
  { id: 'chemical-free', label: 'Chemical Free', icon: 'verified_user' },
  { id: 'herbal', label: 'Herbal Formula', icon: 'spa' },
  { id: 'handmade', label: 'Handmade', icon: 'pan_tool_alt' },
  { id: 'organic', label: 'Organic', icon: 'forest' },
  { id: 'skin-safe', label: 'Skin Safe', icon: 'health_and_safety' },
]

// Helper to parse product variant labels (e.g., "100g" -> { quantity: "100", unit: "g" })
function parseSizeLabel(label) {
  if (!label) return { quantity: '', unit: 'g' };
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.endsWith('ml')) {
    return { quantity: label.slice(0, -2).trim(), unit: 'mL' };
  }
  if (lowerLabel.endsWith('piece(s)')) {
    return { quantity: label.slice(0, -8).trim(), unit: 'piece(s)' };
  }
  if (lowerLabel.endsWith('pieces')) {
    return { quantity: label.slice(0, -6).trim(), unit: 'piece(s)' };
  }
  if (lowerLabel.endsWith('piece')) {
    return { quantity: label.slice(0, -5).trim(), unit: 'piece(s)' };
  }
  if (lowerLabel.endsWith('pc.')) {
    return { quantity: label.slice(0, -3).trim(), unit: 'piece(s)' };
  }
  if (lowerLabel.endsWith('pc')) {
    return { quantity: label.slice(0, -2).trim(), unit: 'piece(s)' };
  }
  if (lowerLabel.endsWith('g')) {
    return { quantity: label.slice(0, -1).trim(), unit: 'g' };
  }
  const match = label.match(/^(\d+)/);
  if (match) {
    const quantity = match[1];
    const unitPart = label.slice(quantity.length).trim().toLowerCase();
    let unit = 'g';
    if (unitPart === 'ml') unit = 'mL';
    else if (unitPart.includes('pc') || unitPart.includes('piece')) unit = 'piece(s)';
    return { quantity, unit };
  }
  return { quantity: label, unit: 'g' };
}

export default function ProductEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const fileInputRef = useRef(null)
  const { showToast } = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [isLive, setIsLive] = useState(true)
  const [selectedTags, setSelectedTags] = useState([])
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [sizes, setSizes] = useState([{ quantity: '', unit: 'g', price: '' }])
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [ingredients, setIngredients] = useState('')
  const [usage, setUsage] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!isNew)

  // Stock state
  const [stock, setStock] = useState(10)

  // Categories list state
  const [categories, setCategories] = useState([])

  // Images state (5 slots: either string URL, File object, or null)
  const [images, setImages] = useState([null, null, null, null, null])
  const [activeImageIndex, setActiveImageIndex] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!isNew) {
      setFetchLoading(true)
      fetch(`${API_URL}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const p = data.data
            setProductName(p.name || '')
            setCategory(p.category || '')
            setDescription(p.description || '')
            setIsLive(p.isActive !== false)
            setIsNewArrival(p.isNewArrival || false)
            setIsBestSeller(p.isBestSeller || false)
            setSelectedTags(p.tags || [])
            if (p.sizes && p.sizes.length > 0) {
              setSizes(p.sizes.map(s => {
                const parsed = parseSizeLabel(s.label);
                return { quantity: parsed.quantity, unit: parsed.unit, price: s.price };
              }));
            } else {
              setSizes([{ quantity: '', unit: 'g', price: '' }]);
            }
            setStock(p.stock !== undefined && p.stock !== null ? p.stock : 10);
            
            if (p.images && p.images.length > 0) {
              const arr = [null, null, null, null, null]
              p.images.slice(0, 5).forEach((url, i) => {
                arr[i] = url
              })
              setImages(arr)
            } else if (p.image) {
              setImages([p.image, null, null, null, null])
            }
            if (p.ingredients && p.ingredients.length > 0) {
              setIngredients(p.ingredients.map(i => `${i.name}: ${i.benefit}`).join('\n'))
            }
            if (p.howToUse && p.howToUse.length > 0) {
              setUsage(p.howToUse.map(u => `${u.step}: ${u.detail}`).join('\n'))
            }
          }
        })
        .catch(console.error)
        .finally(() => setFetchLoading(false))
    }
  }, [id, isNew])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (isNew && data.data.length > 0) {
          setCategory(data.data[0].name);
        }
      }
    } catch(err) {
      console.error('Error fetching categories:', err);
    }
  }

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (!file || activeImageIndex === null) return
    const newImages = [...images]
    newImages[activeImageIndex] = file
    setImages(newImages)
  }

  function handleSelectSlot(index) {
    setActiveImageIndex(index)
    fileInputRef.current.click()
  }

  function handleDeleteSlot(index, e) {
    e.stopPropagation()
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  function handleMoveImage(index, direction) {
    if (direction === 'up' && index > 0) {
      const newImages = [...images];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      setImages(newImages);
    } else if (direction === 'down' && index < 4) {
      const newImages = [...images];
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
      setImages(newImages);
    }
  }

  async function uploadImageToCloudinary(file) {
    setUploadingImage(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        return data.url
      }
      throw new Error(data.message || 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSave() {
    if (!productName.trim()) {
      showToast('Please enter a product name.', 'error')
      return
    }
    const validSizes = sizes.filter(s => s.quantity && s.price !== '');
    if (validSizes.length === 0) {
      showToast('Please add at least one valid pricing variant (with quantity and price).', 'error')
      return
    }
    setLoading(true)

    try {
      // Upload any new image files sequentially
      const uploadedUrls = []
      for (let i = 0; i < images.length; i++) {
        const item = images[i]
        if (!item) continue
        if (typeof item === 'string') {
          uploadedUrls.push(item)
        } else if (item instanceof File) {
          const url = await uploadImageToCloudinary(item)
          uploadedUrls.push(url)
        }
      }

      const primaryImage = uploadedUrls[0] || ''

      const parsedIngredients = ingredients.split('\n').filter(Boolean).map(line => {
        const parts = line.split(':')
        return { name: parts[0]?.trim() || line, benefit: parts[1]?.trim() || '' }
      })
      const parsedUsage = usage.split('\n').filter(Boolean).map(line => {
        const parts = line.split(':')
        return { step: parts[0]?.trim() || '', detail: parts[1]?.trim() || line }
      })

      const payload = {
        name: productName,
        category,
        description,
        isActive: isLive,
        isNewArrival,
        isBestSeller,
        tags: selectedTags,
        ingredients: parsedIngredients,
        howToUse: parsedUsage,
        sizes: sizes
          .filter(s => s.quantity && s.price !== '')
          .map(s => {
            const label = s.unit === 'piece(s)' ? `${s.quantity} piece(s)` : `${s.quantity}${s.unit}`;
            return { label, price: Number(s.price) || 0 };
          }),
        image: primaryImage,
        images: uploadedUrls,
        stock: Number(stock) || 0
      }

      const method = isNew ? 'POST' : 'PUT'
      const url = isNew
        ? `${API_URL}/api/products`
        : `${API_URL}/api/products/${id}`

      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (res.ok && result.success) {
        showToast('Saved successfully!')
        setTimeout(() => {
          navigate('/products')
        }, 800)
      } else {
        showToast('Save failed: ' + (result.message || 'Unknown error'), 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Failed to save product: ' + err.message, 'error')
    }
    setLoading(false)
  }

  function toggleTag(tagId) {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(prev => prev.filter(t => t !== tagId))
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags(prev => [...prev, tagId])
      }
    }
  }

  function addSize() { setSizes(prev => [...prev, { quantity: '', unit: 'g', price: '' }]) }
  function updateSize(index, field, value) {
    const newSizes = [...sizes]
    newSizes[index][field] = value
    setSizes(newSizes)
  }
  function removeSize(index) { setSizes(prev => prev.filter((_, i) => i !== index)) }

  if (fetchLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-on-surface-variant">Loading product...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto lg:ml-64 pb-16 lg:pb-0">
        <AdminTopBar pageTitle="Product Editor" />

        <main className="flex-1 p-6 space-y-6 mt-2 pb-32">
          {/* Back + Header */}
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant hover:text-primary group transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Products
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-headline-md font-headline-md text-on-surface">
                  {isNew ? 'Create New Product' : `Edit: ${productName || 'Product'}`}
                </h2>
                <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm ${isLive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {isLive ? 'Live' : 'Hidden'}
                </span>
              </div>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-error-container/30 text-error hover:bg-error-container rounded-lg text-label-md font-label-md transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete Product
                </button>
              )}
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 space-y-5">
              {/* Product Images (Gallery) */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-5 space-y-4">
                <div>
                  <h3 className="text-label-md font-label-md text-on-surface">Product Images (Max 5)</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Upload to slots. Slot 1 is the default primary cover image.</p>
                </div>

                <div className="space-y-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-6 h-6 rounded-full bg-surface-container-high text-[11px] font-bold text-primary">
                          {idx + 1}
                        </div>

                        <div
                          onClick={() => handleSelectSlot(idx)}
                          className="w-12 h-12 rounded-lg border border-outline-variant/30 overflow-hidden bg-surface-container-lowest flex items-center justify-center cursor-pointer hover:border-primary transition-all"
                        >
                          {img ? (
                            <img
                              src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                              alt={`Slot ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant opacity-60 text-[18px]">add_a_photo</span>
                          )}
                        </div>

                        <div>
                          <p className="text-label-sm font-bold text-on-surface">
                            {idx === 0 ? 'Cover (Default)' : `Slot ${idx + 1}`}
                          </p>
                          <p className="text-[10px] text-on-surface-variant leading-none">
                            {img ? 'Image added' : 'Empty slot'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {img && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveImage(idx, 'up'); }}
                              disabled={idx === 0}
                              className="w-7 h-7 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-primary rounded-md disabled:opacity-30 transition-colors"
                              title="Move Up"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveImage(idx, 'down'); }}
                              disabled={idx === 4 || !images[idx + 1]}
                              className="w-7 h-7 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-primary rounded-md disabled:opacity-30 transition-colors"
                              title="Move Down"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteSlot(idx, e)}
                              className="w-7 h-7 flex items-center justify-center bg-error-container/30 text-error hover:bg-error-container rounded-md transition-colors"
                              title="Delete Image"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </>
                        )}
                        {!img && (
                          <button
                            onClick={() => handleSelectSlot(idx)}
                            className="px-2 py-1 text-[10px] font-semibold text-primary bg-primary-container/20 hover:bg-primary-container/40 rounded-md transition-colors"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {uploadingImage && (
                  <p className="text-label-sm text-primary animate-pulse text-center">
                    Uploading selected images...
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
              </div>

              {/* Status Toggle */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">Visibility</p>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Show to customers?</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-label-sm font-label-sm ${isLive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                      {isLive ? 'Live' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => setIsLive(v => !v)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isLive ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isLive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-label-md font-label-md text-on-surface">New Arrival</p>
                  <button onClick={() => setIsNewArrival(v => !v)} className={`relative w-10 h-5 rounded-full transition-colors ${isNewArrival ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isNewArrival ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-label-md font-label-md text-on-surface">Best Seller</p>
                  <button onClick={() => setIsBestSeller(v => !v)} className={`relative w-10 h-5 rounded-full transition-colors ${isBestSeller ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isBestSeller ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-6 space-y-5">
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Product Name *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="e.g. Herbal Neem Soap"
                    className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Category select dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Pricing & Variants */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-label-md font-label-md text-on-surface">Pricing & Variants</label>
                    <button type="button" onClick={addSize} className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">add</span> Add Variant
                    </button>
                  </div>
                  {sizes.map((s, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-surface-container-low/40 sm:bg-transparent p-4 sm:p-0 rounded-xl border border-outline-variant/20 sm:border-0 relative">
                      {/* Label for Mobile */}
                      <span className="absolute top-2 right-2 sm:hidden text-[10px] font-bold text-white bg-primary-container px-2 py-0.5 rounded-full">
                        Variant #{idx + 1}
                      </span>
                      
                      {/* Quantity input */}
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-on-surface-variant sm:hidden">Quantity</label>
                        <input
                          type="number"
                          placeholder="Quantity (e.g. 100)"
                          value={s.quantity}
                          onChange={e => updateSize(idx, 'quantity', e.target.value)}
                          className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-body-md text-on-surface focus:border-primary outline-none"
                        />
                      </div>

                      {/* Unit select */}
                      <div className="w-full sm:w-24 flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-on-surface-variant sm:hidden">Unit</label>
                        <select
                          value={s.unit}
                          onChange={e => updateSize(idx, 'unit', e.target.value)}
                          className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-body-md text-on-surface focus:border-primary outline-none"
                        >
                          <option value="g">g</option>
                          <option value="mL">mL</option>
                          <option value="piece(s)">piece(s)</option>
                        </select>
                      </div>

                      {/* Price input */}
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-on-surface-variant sm:hidden">Price (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={s.price}
                            onChange={e => updateSize(idx, 'price', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg pl-7 pr-3 py-2.5 text-body-md text-on-surface focus:border-primary outline-none"
                          />
                        </div>
                      </div>

                      {/* Delete button */}
                      {sizes.length > 1 && (
                        <div className="flex justify-end pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeSize(idx)}
                            className="w-full sm:w-auto text-error hover:text-error-container p-2.5 sm:p-1 rounded-lg hover:bg-error-container/20 border border-error/20 sm:border-0 flex items-center justify-center gap-2 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            <span className="sm:hidden text-label-md font-bold">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stock Widget */}
                <div className="flex flex-col gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">Stock Quantity</p>
                    <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">Manage the available stock for this product.</p>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-body-sm font-semibold text-on-surface-variant">Quantity:</span>
                    <div className="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setStock(prev => Math.max(0, Number(prev) - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-surface-container-high rounded text-on-surface-variant font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <input
                        type="number"
                        value={stock}
                        onChange={e => {
                          const val = e.target.value;
                          setStock(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                        }}
                        className="w-16 text-center bg-transparent text-body-sm font-semibold text-on-surface outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setStock(prev => Number(prev) + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-surface-container hover:bg-surface-container-high rounded text-on-surface-variant font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                    {stock <= 0 && (
                      <span className="text-xs font-bold text-error">Out of Stock Warning (product will be hidden)</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe the product, its benefits and what makes it special..."
                    className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Ingredients & Usage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md font-label-md text-on-surface">Ingredients (Optional)</label>
                    <p className="text-[11px] text-on-surface-variant">Format: Name: Benefit (one per line)</p>
                    <textarea
                      value={ingredients}
                      onChange={e => setIngredients(e.target.value)}
                      rows={4}
                      placeholder={"Neem: Antibacterial\nTurmeric: Anti-inflammatory"}
                      className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md font-label-md text-on-surface">Usage Instructions (Optional)</label>
                    <p className="text-[11px] text-on-surface-variant">Format: Step: Detail (one per line)</p>
                    <textarea
                      value={usage}
                      onChange={e => setUsage(e.target.value)}
                      rows={4}
                      placeholder={"Wet face: Use warm water\nApply: Gently massage"}
                      className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Product Tags */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-label-md font-label-md text-on-surface">Product Tags</label>
                    <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-label-sm ${selectedTags.length >= 3 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                      {selectedTags.length}/3
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_TAGS.map(tag => {
                      const isSelected = selectedTags.includes(tag.id)
                      const isDisabled = !isSelected && selectedTags.length >= 3
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          disabled={isDisabled}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-label-sm font-label-sm transition-all ${
                            isSelected
                              ? 'bg-secondary-container border-primary text-on-secondary-container'
                              : isDisabled
                              ? 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed'
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary/50 cursor-pointer'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>
                          {tag.label}
                          {isSelected && <span className="material-symbols-outlined text-[14px] ml-auto">check</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 bg-surface-container-lowest border-t border-outline-variant/20 px-6 py-4 flex items-center justify-between z-40">
          <p className="text-label-sm font-label-sm text-on-surface-variant">
            {isNew ? 'New product draft' : `Editing: ${productName}`}
          </p>
          <div className="flex gap-3">
            <Link to="/products" className="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container transition-colors">
              Close
            </Link>
            <button
              disabled={loading || uploadingImage}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md bg-primary text-on-primary hover:opacity-90 transition-all disabled:opacity-60 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">{loading || uploadingImage ? 'hourglass_empty' : 'save'}</span>
              {uploadingImage ? 'Uploading Image...' : loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={async () => {
          setShowDeleteModal(false);
          setLoading(true);
          try {
            const token = localStorage.getItem('adminToken') || '';
            const res = await fetch(`${API_URL}/api/products/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
              showToast('Product deleted successfully!');
              setTimeout(() => {
                navigate('/products');
              }, 800);
            } else {
              showToast(data.message || 'Failed to delete product', 'error');
            }
          } catch(err) {
            console.error(err);
            showToast('Error deleting product', 'error');
          }
          setLoading(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
