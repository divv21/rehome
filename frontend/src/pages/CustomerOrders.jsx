import { useState } from 'react'

const RETURN_REASONS = ['Wrong Item', 'Defective', 'No Longer Needed', 'Changed Mind', 'Size/Fit Issue', 'Other']

const ORDERS = [
  { id: 'ORD-4821', product_name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 29990, date: 'May 28, 2026', image: 'S', eligible: true },
  { id: 'ORD-4822', product_name: 'Apple iPhone 14 128GB', category: 'Electronics', price: 79900, date: 'May 15, 2026', image: 'A', eligible: true },
  { id: 'ORD-4823', product_name: 'Nike Air Max 270 Running Shoes', category: 'Footwear', price: 10795, date: 'June 2, 2026', image: 'N', eligible: true },
  { id: 'ORD-4824', product_name: 'Philips Air Fryer HD9200', category: 'Kitchen Appliances', price: 6995, date: 'April 20, 2026', image: 'P', eligible: true },
  { id: 'ORD-4825', product_name: 'Atomic Habits by James Clear', category: 'Books', price: 799, date: 'March 10, 2026', image: 'B', eligible: false },
]

function CheckCircle() {
  return (
    <svg className="h-12 w-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ReturnModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    setError(false)

    // Simulate a short delay — no actual backend call
    await new Promise(resolve => setTimeout(resolve, 800))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle />
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Return Scheduled</h3>
          <p className="text-sm text-gray-600 mb-1">
            Your return for <span className="font-semibold">{order.product_name}</span> has been successfully scheduled.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            A pickup will be arranged within 2–3 business days. You'll receive an email confirmation shortly.
          </p>
          <button
            onClick={onSuccess}
            className="rounded-lg px-6 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition"
            style={{ backgroundColor: '#FF9900' }}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Return Product</h3>
            <p className="text-xs text-gray-400 mt-0.5">Order {order.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product details */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-lg font-black text-gray-400 flex-shrink-0">
            {order.image}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{order.product_name}</p>
            <p className="text-xs text-gray-500">₹{order.price.toLocaleString('en-IN')} · Delivered {order.date}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Reason for Return <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            >
              <option value="" disabled>Select a reason…</option>
              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Comments <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
              placeholder="Any additional details about the return…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 rounded-lg py-2.5 text-sm font-bold text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition"
              style={{ backgroundColor: '#FF9900' }}
            >
              {loading ? 'Processing…' : 'Initiate Return'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomerOrders() {
  const [returningOrder, setReturningOrder] = useState(null)
  const [returnedIds, setReturnedIds] = useState(new Set())

  function handleReturnComplete(orderId) {
    setReturnedIds(prev => new Set([...prev, orderId]))
    setReturningOrder(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* Page header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Orders</h1>
        <p className="text-sm text-gray-500 mb-6">View and manage your recent purchases</p>

        {/* Orders list */}
        <div className="space-y-3">
          {ORDERS.map(order => {
            const isReturned = returnedIds.has(order.id)
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-4"
              >
                {/* Image placeholder */}
                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-xl font-black text-gray-300 flex-shrink-0">
                  {order.image}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{order.product_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ₹{order.price.toLocaleString('en-IN')} · Delivered {order.date}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.id}</p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {isReturned ? (
                    <span className="inline-flex items-center rounded-lg bg-gray-100 border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-400">
                      Returned
                    </span>
                  ) : order.eligible ? (
                    <button
                      onClick={() => setReturningOrder(order)}
                      className="rounded-lg border-2 border-orange-400 px-4 py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition"
                    >
                      Return Product
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Return window closed</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </main>

      {/* Return modal */}
      {returningOrder && (
        <ReturnModal
          order={returningOrder}
          onClose={() => setReturningOrder(null)}
          onSuccess={() => handleReturnComplete(returningOrder.id)}
        />
      )}
    </div>
  )
}
