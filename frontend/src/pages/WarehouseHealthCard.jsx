import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ConditionBadge from '../components/ConditionBadge'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Field({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</span>
      <span className={`text-sm text-gray-200 ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  )
}

function Divider() {
  return <hr className="border-gray-700 my-4" />
}

export default function WarehouseHealthCard() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/api/health/${id}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(true); else setData(json) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="animate-pulse text-gray-500 text-sm">Loading…</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p className="text-gray-500 text-sm">Record not found.</p>
      </div>
    )
  }

  const {
    product_name, order_id, return_reason, customer_condition,
    ai_condition_tier, ai_confidence, ai_damage_notes,
    original_mrp, suggested_resale_price, price_deduction_percentage,
    warranty_status, refurbishment_notes,
    routing_decision, routing_reason, status, created_at,
  } = data

  const mrp = original_mrp || 0
  const resalePrice = suggested_resale_price || 0
  const isLiquidated = routing_decision?.toLowerCase().includes('liquidat') ||
                       routing_decision?.toLowerCase().includes('donat') ||
                       ai_condition_tier === 'Liquidate'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-white">Item Health Record</h1>
          <Link to="/admin" className="text-xs text-gray-500 hover:text-gray-300 transition">← Back to Dashboard</Link>
        </div>

        {/* Record card */}
        <div className="rounded-xl border border-gray-800 p-6 sm:p-8" style={{ backgroundColor: '#222' }}>

          {/* Status bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                isLiquidated ? 'bg-red-500' : status === 'listed' ? 'bg-green-500' : status === 'graded' ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                {isLiquidated ? 'Liquidation / Donation' : status === 'listed' ? 'Listed' : status === 'graded' ? 'Graded' : 'Pending Grading'}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-mono">{created_at}</span>
          </div>

          {/* Section: Product */}
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3">Product Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Order ID" value={order_id} mono />
            <Field label="Product Name" value={product_name} />
            <Field label="Return Reason" value={return_reason} />
            <Field label="Customer Reported Condition" value={customer_condition} />
          </div>

          <Divider />

          {/* Section: AI Grading */}
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3">AI Grading Result</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Condition Tier</span>
              <div className="mt-0.5"><ConditionBadge tier={ai_condition_tier || 'Pending'} /></div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Confidence Score</span>
              {ai_confidence != null ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-700 overflow-hidden max-w-[120px]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${ai_confidence}%`,
                        backgroundColor: ai_confidence >= 85 ? '#22c55e' : ai_confidence >= 70 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-200">{ai_confidence}%</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
            <Field label="Damage Notes" value={ai_damage_notes} />
          </div>

          <Divider />

          {/* Section: Routing */}
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3">Routing Decision</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Decision" value={routing_decision} />
            <Field label="Reason" value={routing_reason} />
          </div>

          <Divider />

          {/* Section: Pricing — hidden for liquidated */}
          {!isLiquidated && (
            <>
              <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3">Pricing</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Original MRP" value={mrp ? `₹${mrp.toLocaleString('en-IN')}` : '—'} />
                <Field label="Suggested Resale Price" value={resalePrice ? `₹${resalePrice.toLocaleString('en-IN')}` : '—'} />
                <Field label="Discount" value={price_deduction_percentage ? `${price_deduction_percentage}%` : '—'} />
              </div>
              <Divider />
            </>
          )}

          {/* Section: Additional */}
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3">Additional Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Warranty Status" value={warranty_status} />
            <Field label="Refurbishment Notes" value={refurbishment_notes || 'Not required'} />
          </div>

        </div>
      </main>
    </div>
  )
}
