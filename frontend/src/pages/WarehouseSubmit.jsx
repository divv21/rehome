import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/library'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RETURN_REASONS = ['Wrong Item', 'Defective', 'No Longer Needed', 'Changed Mind', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor']
const CATEGORIES = ['Electronics', 'Footwear', 'Bags and Luggage', 'Kitchen Appliances', 'Books', 'Other']

const PRODUCT_DATABASE = {
  '8901058851378': { product_name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', original_mrp: 29990 },
  '8901058010247': { product_name: 'Sony WF-1000XM4 Earbuds', category: 'Electronics', original_mrp: 19990 },
  '8901212132476': { product_name: 'Samsung Galaxy Buds2 Pro', category: 'Electronics', original_mrp: 17999 },
  '8901664653430': { product_name: 'LG 1.5 Ton 5 Star Inverter AC', category: 'Electronics', original_mrp: 42999 },
  '8906084440019': { product_name: 'Philips Air Fryer HD9200', category: 'Electronics', original_mrp: 6995 },
  '0194253408598': { product_name: 'Apple iPhone 14 128GB', category: 'Electronics', original_mrp: 79900 },
  '0194253716174': { product_name: 'Apple iPad 10th Gen WiFi 64GB', category: 'Electronics', original_mrp: 44900 },
  '8901491500153': { product_name: 'Wildcraft Backpack 45L', category: 'Bags and Luggage', original_mrp: 1799 },
  '8903522001015': { product_name: 'Puma Men Running Shoes', category: 'Footwear', original_mrp: 3999 },
  '8901030847393': { product_name: 'Nike Air Max 270 Running Shoes', category: 'Footwear', original_mrp: 10795 },
  '8718699787059': { product_name: 'Philips 55 inch 4K UHD Smart TV', category: 'Electronics', original_mrp: 54990 },
  '8901396679007': { product_name: 'Prestige Iris 750W Mixer Grinder', category: 'Kitchen Appliances', original_mrp: 3495 },
  '8906043440076': { product_name: 'Boat Rockerz 450 Bluetooth Headphones', category: 'Electronics', original_mrp: 1999 },
  '8904259601234': { product_name: 'Noise ColorFit Pro 4 Smartwatch', category: 'Electronics', original_mrp: 3499 },
  '9780143441922': { product_name: 'Atomic Habits by James Clear', category: 'Books', original_mrp: 799 },
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 1000
    gain.gain.value = 0.3
    osc.start()
    setTimeout(() => { osc.stop(); ctx.close() }, 150)
  } catch { /* audio unavailable */ }
}

const inputClass =
  'w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition placeholder-gray-500'

const labelClass = 'block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1'

export default function WarehouseSubmit() {
  // ── Scanner state ───────────────────────────────────────────────────────────
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [manualBarcode, setManualBarcode] = useState('')
  const [scanning, setScanning] = useState(true)
  const [flash, setFlash] = useState(false)
  const [scannedProduct, setScannedProduct] = useState(null)
  const [scannedBarcode, setScannedBarcode] = useState('')
  const [notFound, setNotFound] = useState(false)

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    product_name: '',
    return_reason: '',
    customer_condition: '',
    category: '',
    notes: '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // ── Camera setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    reader
      .decodeFromVideoDevice(null, videoRef.current, (res) => {
        if (res && scanning) handleBarcodeLookup(res.getText())
      })
      .catch(() => {})
    return () => { reader.reset() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleBarcodeLookup(barcode) {
    if (!barcode.trim()) return
    setScanning(false)
    if (readerRef.current) readerRef.current.reset()
    setFlash(true)
    playBeep()
    setTimeout(() => setFlash(false), 400)

    const trimmed = barcode.trim()
    setScannedBarcode(trimmed)
    const product = PRODUCT_DATABASE[trimmed]
    if (product) {
      setScannedProduct(product)
      setNotFound(false)
    } else {
      setScannedProduct(null)
      setNotFound(true)
    }
  }

  function handleManualBarcode(e) {
    e.preventDefault()
    handleBarcodeLookup(manualBarcode)
  }

  function loadIntoForm() {
    if (!scannedProduct) return
    setForm(prev => ({
      ...prev,
      product_name: scannedProduct.product_name,
      category: scannedProduct.category,
    }))
  }

  function resetScanner() {
    setScannedProduct(null)
    setScannedBarcode('')
    setNotFound(false)
    setManualBarcode('')
    setScanning(true)
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    reader
      .decodeFromVideoDevice(null, videoRef.current, (res) => {
        if (res) handleBarcodeLookup(res.getText())
      })
      .catch(() => {})
  }

  // ── Form handlers ───────────────────────────────────────────────────────────
  function handleField(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImages(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function resetForm() {
    setForm({ product_name: '', return_reason: '', customer_condition: '', category: '', notes: '' })
    setImages([])
    setPreviews([])
    setSuccess(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(null)

    const data = new FormData()
    data.append('product_name', form.product_name)
    data.append('return_reason', form.return_reason)
    data.append('customer_condition', form.customer_condition)
    data.append('category', form.category || 'Other')
    data.append('notes', form.notes)
    images.forEach(img => data.append('images', img))

    try {
      const res = await fetch(`${API}/api/returns`, { method: 'POST', body: data })
      if (!res.ok) throw new Error('Server error')
      const json = await res.json()
      setSuccess(json)
      resetForm()
      resetScanner()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Return Processing Station</h1>
          <div className="flex items-center gap-2 rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-300 font-medium">Warehouse New Delhi DEX3</span>
          </div>
        </div>

        {/* ── Two-panel layout ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden border border-gray-800">

          {/* ── Left panel: Scanner ──────────────────────────────────────── */}
          <div className="flex-1 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-gray-800">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-5">
              Scan or Enter Barcode
            </h2>

            {/* Camera */}
            <div
              className={`relative rounded-xl overflow-hidden border-2 transition-colors duration-200 mb-3 ${
                flash ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-gray-700'
              }`}
              style={{ aspectRatio: '4 / 3', backgroundColor: '#111', maxHeight: '220px' }}
            >
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {scanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute left-4 right-4 h-0.5 rounded-full"
                    style={{ backgroundColor: '#FF9900', boxShadow: '0 0 8px #FF9900', animation: 'scanline 2s linear infinite' }}
                  />
                </div>
              )}
              <style>{`@keyframes scanline { 0% { top: 10%; } 100% { top: 90%; } }`}</style>
            </div>
            <p className="text-center text-xs text-gray-600 mb-5">Align barcode within frame</p>

            {/* Manual entry */}
            <form onSubmit={handleManualBarcode} className="flex gap-2 mb-5">
              <input
                type="text"
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                placeholder="Enter barcode manually"
                className={inputClass}
              />
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-900 hover:opacity-90 transition flex-shrink-0"
                style={{ backgroundColor: '#FF9900' }}
              >
                Lookup
              </button>
            </form>

            {/* Product found card */}
            {scannedProduct && (
              <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                <p className="text-sm font-semibold text-gray-200 mb-2">{scannedProduct.product_name}</p>
                <div className="space-y-1 mb-4 text-xs text-gray-400">
                  <p>Category: {scannedProduct.category}</p>
                  <p>MRP: ₹{scannedProduct.original_mrp.toLocaleString('en-IN')}</p>
                  <p>Barcode: <span className="font-mono">{scannedBarcode}</span></p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadIntoForm}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-gray-900 hover:opacity-90 transition"
                    style={{ backgroundColor: '#FF9900' }}
                  >
                    Load into Form →
                  </button>
                  <button
                    onClick={resetScanner}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 border border-gray-600 hover:border-gray-500 transition"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            )}

            {/* Not found card */}
            {notFound && (
              <div className="rounded-xl border border-red-700 bg-red-950/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-red-400">Not found in database</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Barcode: <span className="font-mono">{scannedBarcode}</span></p>
                <div className="flex gap-2">
                  <button
                    onClick={resetScanner}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 border border-gray-600 hover:border-gray-500 transition"
                  >
                    Try Again
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">Enter product details manually in the form →</p>
              </div>
            )}
          </div>

          {/* ── Right panel: Form ────────────────────────────────────────── */}
          <div className="flex-1 p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-5">
              Return Details Form
            </h2>

            {/* Success banner */}
            {success && (
              <div className="mb-5 rounded-lg border border-green-700 bg-green-950/50 p-6 text-center">
                <svg className="h-12 w-12 text-green-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-400 font-bold text-base mb-1">Return successfully registered</p>
                <p className="text-gray-400 text-xs mb-4">
                  Order ID: <span className="font-mono font-semibold text-gray-300">{success.order_id}</span> · AI grading will begin shortly.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setSuccess(null)}
                    className="rounded px-4 py-1.5 text-xs font-semibold text-gray-900"
                    style={{ backgroundColor: '#FF9900' }}
                  >
                    Process Next Return
                  </button>
                  <Link to="/admin" className="rounded px-4 py-1.5 text-xs font-semibold text-gray-400 border border-gray-600 hover:border-gray-500 transition">
                    View Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-700 bg-red-950/50 p-3">
                <p className="text-red-400 text-sm">✕ Something went wrong. Please try again.</p>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label htmlFor="product_name" className={labelClass}>Product Name *</label>
                  <input id="product_name" name="product_name" type="text" required
                    value={form.product_name} onChange={handleField} className={inputClass}
                    placeholder="e.g. Sony WH-1000XM4 Headphones" />
                </div>

                <div>
                  <label htmlFor="category" className={labelClass}>Category</label>
                  <select id="category" name="category" value={form.category} onChange={handleField}
                    className={inputClass + ' bg-gray-900'}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="return_reason" className={labelClass}>Return Reason *</label>
                  <select id="return_reason" name="return_reason" required value={form.return_reason}
                    onChange={handleField} className={inputClass + ' bg-gray-900'}>
                    <option value="" disabled>Select a reason…</option>
                    {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="customer_condition" className={labelClass}>Product Condition *</label>
                  <select id="customer_condition" name="customer_condition" required value={form.customer_condition}
                    onChange={handleField} className={inputClass + ' bg-gray-900'}>
                    <option value="" disabled>Select condition…</option>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className={labelClass}>Notes (optional)</label>
                  <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleField}
                    className={inputClass + ' resize-none'} placeholder="Damage details, missing parts…" />
                </div>

                <div>
                  <label htmlFor="images" className={labelClass}>Product Images (optional)</label>
                  <input id="images" type="file" accept=".jpg,.jpeg,.png" multiple ref={fileInputRef}
                    onChange={handleImages}
                    className="w-full text-sm text-gray-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-orange-400 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-md border border-gray-700 px-3 py-2 transition" />
                  {previews.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {previews.map((src, i) => (
                        <img key={i} src={src} alt={`preview ${i + 1}`}
                          className="h-14 w-14 rounded-md object-cover border border-gray-700" />
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-lg px-6 py-3 text-sm font-bold text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition hover:opacity-90 mt-2"
                  style={{ backgroundColor: loading ? '#fbbf24' : '#FF9900' }}>
                  {loading ? 'Submitting…' : 'Submit Return'}
                </button>

              </form>
            )}
          </div>

        </div>

      </main>
    </div>
  )
}
