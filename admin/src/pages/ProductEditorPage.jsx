import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopBar from '../components/AdminTopBar'

const PRODUCT_IMG_MAIN = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYlSvCe_Oo0TiPjZxVR2jkgXnEKPrplGKmKZAqB4JnI6kpG9KPqNVmJf7kA_E1e4eCWBJE1i_XkFGFZi_MSSRh9x9Qnxp1N6KHpRa1X9bJeQanfA6T09gCOovK8SSSxQnXqInnbVD7mZOb9LXrjzJ5Y1iELFxvbDg6-1kN-ACacHPBQ22OPjjDDH7CpGtnKjqe-9Kqr_SzJ8ELZdOKqJxCyXRp2LO7Z7nPaWKsEqJzYQJJuIjMtA0RK-BVlGP7dsTnVA0Yf1KX'
const PRODUCT_IMG_THUMB2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2M-VCB0MlE_EHAoFNDFWFMEFJQvHpjN7k2R87yN8eiqwRYFQTJ3K3C-KCq0oFvL1UjqQd4MiF6pI4W0M6IwCPCEWR6pNe7QhTQ5ZGbEJQ-UjlHgZxqSmFJUCUqxKpJnJQkU1yEH5HGb4dHB3xPaAJQhqhlJKEKxlWE-BLiXg3K8Y7Gur7r2yyONkMVSQDnPp1kp64jZ_BfJLBQxwRvRFhLMZ_UrM6T89W4MoheNQ9M_K_jHH8v7M1mGAhqDjdFJ2gUJc5lFxc'

const ALL_TAGS = [
  { id: 'natural', label: 'Natural Ingredients', icon: 'eco' },
  { id: 'chemical-free', label: 'Chemical Free', icon: 'verified_user' },
  { id: 'herbal', label: 'Herbal Formula', icon: 'spa' },
  { id: 'handmade', label: 'Handmade', icon: 'pan_tool_alt' },
  { id: 'organic', label: 'Organic', icon: 'forest' },
  { id: 'skin-safe', label: 'Skin Safe', icon: 'health_and_safety' },
]

export default function ProductEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLive, setIsLive] = useState(true)
  const [selectedTags, setSelectedTags] = useState([])
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('soaps')
  const [sizes, setSizes] = useState([{ label: '30mL', price: '3999' }])
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [ingredients, setIngredients] = useState('')
  const [usage, setUsage] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (id && id !== 'new') {
      fetch(`http://localhost:5000/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const p = data.data;
            setProductName(p.name);
            setCategory(p.category);
            setDescription(p.description);
            setIsLive(p.isActive);
            setIsNewArrival(p.isNewArrival || false);
            setIsBestSeller(p.isBestSeller || false);
            setSelectedTags(p.tags || []);
            setSizes(p.sizes || [{ label: '', price: '' }]);
            
            if (p.ingredients && p.ingredients.length > 0) {
               setIngredients(p.ingredients.map(i => `${i.name}: ${i.benefit}`).join('\n'));
            }
            if (p.howToUse && p.howToUse.length > 0) {
               setUsage(p.howToUse.map(u => `${u.step}: ${u.detail}`).join('\n'));
            }
          }
        })
    }
  }, [id])

  async function handleSave() {
    setLoading(true)
    // Parse ingredients & usage
    const parsedIngredients = ingredients.split('\n').filter(Boolean).map(line => {
      const parts = line.split(':');
      return { name: parts[0]?.trim() || line, benefit: parts[1]?.trim() || '' };
    });
    const parsedUsage = usage.split('\n').filter(Boolean).map(line => {
      const parts = line.split(':');
      return { step: parts[0]?.trim() || '', detail: parts[1]?.trim() || line };
    });

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
      sizes: sizes.map(s => ({ label: s.label || s.units + s.unit, price: Number(s.price) }))
    }
    const method = id && id !== 'new' ? 'PUT' : 'POST'
    const url = id && id !== 'new' ? `http://localhost:5000/api/products/${id}` : `http://localhost:5000/api/products`

    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        alert('Product saved!')
        navigate('/products')
      }
    } catch(err) {
      console.error(err)
      alert('Failed to save product')
    }
    setLoading(false)
  }

  function toggleTag(id) {
    if (selectedTags.includes(id)) {
      setSelectedTags((prev) => prev.filter((t) => t !== id))
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags((prev) => [...prev, id])
      }
    }
  }

  function addSize() {
    setSizes((prev) => [...prev, { label: '', price: '' }])
  }

  function updateSize(index, field, value) {
    const newSizes = [...sizes]
    newSizes[index][field] = value
    setSizes(newSizes)
  }

  function removeSize(index) {
    setSizes((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto md:ml-64 pb-16 md:pb-0">
        <AdminTopBar pageTitle="Product Details Editor" />

        <main className="flex-1 p-6 space-y-6 pb-24">
          {/* Back + Header */}
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant hover:text-primary group transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Products
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-headline-md font-headline-md text-on-surface">{id && id !== 'new' ? `Edit Product: ${productName}` : 'Create New Product'}</h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-label-sm font-label-sm">Active Draft</span>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 space-y-5">
              {/* Main Image */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low overflow-hidden">
                <div className="relative aspect-square group cursor-pointer">
                  <img
                    src={PRODUCT_IMG_MAIN}
                    alt="Product main"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white text-label-md font-label-md">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                      Change Image
                    </div>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="p-4 grid grid-cols-4 gap-2">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary cursor-pointer">
                    <img src={PRODUCT_IMG_MAIN} alt="thumb 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden border border-outline-variant/30 cursor-pointer">
                    <img src={PRODUCT_IMG_THUMB2} alt="thumb 2" className="w-full h-full object-cover" />
                  </div>
                  <button className="aspect-square rounded-lg border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                  </button>
                  <div className="aspect-square rounded-lg bg-surface-container-low border border-outline-variant/20" />
                </div>

                <p className="text-center text-label-sm font-label-sm text-on-surface-variant opacity-60 pb-4">
                  Recommended size: 2000×2000px. Max 5MB.
                </p>
              </div>

              {/* Status Toggle */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">Product Status</p>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                      Is this product visible to customers?
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-label-sm font-label-sm ${isLive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                      {isLive ? 'Live' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => setIsLive((v) => !v)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                        isLive ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          isLive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra Toggles */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-5 space-y-4 mt-5">
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
            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 airy-shadow-low p-6 space-y-5">
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="soaps">Soaps</option>
                    <option value="shampoos">Shampoos</option>
                    <option value="face-wash">Face Wash</option>
                    <option value="face-packs">Face Packs</option>
                    <option value="oils">Oils</option>
                    <option value="balms">Balms</option>
                  </select>
                </div>

                {/* Dynamic Sizes/Prices */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-label-md font-label-md text-on-surface">Pricing & Variants</label>
                    <button type="button" onClick={addSize} className="text-label-sm font-label-sm text-primary hover:underline">
                      + Add Variant
                    </button>
                  </div>
                  {sizes.map((s, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="flex-1 flex gap-2">
                        <input type="text" placeholder="Size (e.g. 30mL)" value={s.label} onChange={e => updateSize(idx, 'label', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary outline-none" />
                      </div>
                      <div className="flex-1">
                        <input type="number" placeholder="Price (₹)" value={s.price} onChange={e => updateSize(idx, 'price', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary outline-none" />
                      </div>
                      {sizes.length > 1 && (
                        <button type="button" onClick={() => removeSize(idx)} className="text-error hover:text-error-container">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Description</label>
                  {/* Mini Toolbar */}
                  <div className="flex items-center gap-1 bg-surface-container rounded-t-lg border border-outline-variant/30 border-b-0 px-2 py-1.5">
                    {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-b-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                  />
                </div>

                {/* Ingredients & Usage */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Ingredients (Optional)</label>
                  <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={3} className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-label-md text-on-surface">Usage Instructions (Optional)</label>
                  <textarea value={usage} onChange={e => setUsage(e.target.value)} rows={3} className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-4 py-3 text-body-md font-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
                </div>

                {/* Product Tags */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-label-md font-label-md text-on-surface">Product Tags</label>
                    <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-label-sm ${
                      selectedTags.length >= 3 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                    }`}>
                      {selectedTags.length}/3
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_TAGS.map((tag) => {
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
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:bg-surface-container cursor-pointer'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>
                          {tag.label}
                          {isSelected && (
                            <span className="material-symbols-outlined text-[14px] ml-auto">check</span>
                          )}
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
        <div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest border-t border-outline-variant/20 px-6 py-4 flex items-center justify-between z-40">
          <p className="text-label-sm font-label-sm text-on-surface-variant">
            Last saved: Today at 09:42 AM by Admin
          </p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container transition-colors">
              Discard Changes
            </button>
            <button disabled={loading} onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">save</span>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
