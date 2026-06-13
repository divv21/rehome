import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RETURN_REASONS = ['Wrong Item', 'Defective', 'No Longer Needed', 'Changed Mind', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor']

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition'

const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export default function SubmitReturn() {
  const [form, setForm] = useState({
    product_name: '',
    return_reason: '',
    customer_condition: '',
    notes: '',
  })
  const [images, setImages] = useState([])      // File objects
  const [previews, setPreviews] = useState([])  // object URLs
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)  // { order_id }
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  function handleField(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImages(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function resetForm() {
    setForm({ product_name: '', return_reason: '', customer_condition: '', notes: '' })
    setImages([])
    setPreviews([])
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
    data.append('notes', form.notes)
    images.forEach(img => data.append('images', img))

    try {
      const res = await fetch(`${API}/api/returns`, {
        method: 'POST',
        body: data,
      })
      if (!res.ok) throw new Error('Server error')
      const json = await res.json()
      setSuccess(json)
      resetForm()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-navy-900 mb-6" style={{ color: '#0f172a' }}>
          Submit a Return
        </h1>

        {/* Success banner */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 border border-green-300 px-4 py-4">
            <p className="text-green-800 font-medium text-sm">
              ✓ Return submitted successfully. Order ID:{' '}
              <span className="font-bold">{success.order_id}</span>.{' '}
              Our AI will grade your item shortly.
            </p>
            <Link
              to="/rehome"
              className="mt-3 inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              View Rehome Marketplace
            </Link>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-300 px-4 py-3">
            <p className="text-red-700 text-sm font-medium">
              ✕ Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Product Name */}
            <div>
              <label htmlFor="product_name" className={labelClass}>
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product_name"
                name="product_name"
                type="text"
                required
                placeholder="e.g. Sony WH-1000XM4 Headphones"
                value={form.product_name}
                onChange={handleField}
                className={inputClass}
              />
            </div>

            {/* Return Reason */}
            <div>
              <label htmlFor="return_reason" className={labelClass}>
                Return Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="return_reason"
                name="return_reason"
                required
                value={form.return_reason}
                onChange={handleField}
                className={inputClass + ' bg-white'}
              >
                <option value="" disabled>Select a reason…</option>
                {RETURN_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Product Condition */}
            <div>
              <label htmlFor="customer_condition" className={labelClass}>
                Product Condition <span className="text-red-500">*</span>
              </label>
              <select
                id="customer_condition"
                name="customer_condition"
                required
                value={form.customer_condition}
                onChange={handleField}
                className={inputClass + ' bg-white'}
              >
                <option value="" disabled>Select condition…</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className={labelClass}>
                Additional Notes{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Describe any damage, missing accessories, or other relevant details…"
                value={form.notes}
                onChange={handleField}
                className={inputClass + ' resize-none'}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="images" className={labelClass}>
                Upload Product Images{' '}
                <span className="text-gray-400 font-normal">(optional, jpg / png)</span>
              </label>
              <input
                id="images"
                name="images"
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                ref={fileInputRef}
                onChange={handleImages}
                className={
                  'w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer ' +
                  'file:rounded-md file:border-0 file:bg-orange-400 file:px-3 file:py-1.5 ' +
                  'file:text-sm file:font-medium file:text-white hover:file:bg-orange-500 ' +
                  'focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-md ' +
                  'border border-gray-300 px-3 py-2 transition'
                }
              />

              {/* Thumbnail previews */}
              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview ${i + 1}`}
                      className="h-20 w-20 rounded-md object-cover border border-gray-200 shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#fbbf24' : '#FF9900' }}
              className="w-full rounded-md px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:opacity-90 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            >
              {loading ? 'Submitting…' : 'Submit Return'}
            </button>

          </form>
        </div>
      </main>
    </div>
  )
}
