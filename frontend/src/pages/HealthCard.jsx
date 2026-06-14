import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ConditionBadge from '../components/ConditionBadge'
import StarRating from '../components/StarRating'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Icons ─────────────────────────────────────────────────────────────────────
function VerifiedIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v5c0 5-3.5 9.3-7 10.5C8.5 20.3 5 16 5 11V6l7-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m0 10.5V6.75a2.25 2.25 0 012.25-2.25h2.068a2.25 2.25 0 011.793.894l2.828 3.535A2.25 2.25 0 0118 10.46v7.415" />
    </svg>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-16 space-y-6">
        <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 w-full bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-32 w-full bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HealthCard() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/api/health/customer/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error)
        else setData(json)
      })
      .catch(() => setError('Unable to load health card'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm text-center">{error}</p>
        <Link to="/rehome" className="text-sm text-orange-500 hover:underline">← Back to marketplace</Link>
      </div>
    )
  }

  const {
    product_name, order_id, return_reason, ai_condition_tier, ai_confidence,
    ai_damage_notes, star_rating, original_mrp, suggested_resale_price,
    price_deduction_percentage, warranty_status, routing_decision, lifecycle,
  } = data

  const mrp = original_mrp || 2000
  const resalePrice = suggested_resale_price || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">

      {/* ── Verified banner ──────────────────────────────────────────────── */}
      <div className="w-full py-3.5 px-4 flex items-center justify-center gap-2 text-white text-sm font-semibold"
        style={{ backgroundColor: '#16a34a' }}>
        <VerifiedIcon />
        <span>AI Verified Product Health Card</span>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-5">

        {/* Product header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product_name}</h1>
        </div>

        {/* Condition card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <StarRating rating={star_rating ?? 0} size="lg" />
            <ConditionBadge tier={ai_condition_tier || 'Pending'} />
            {ai_damage_notes && (
              <p className="text-sm text-gray-500 italic max-w-sm">"{ai_damage_notes}"</p>
            )}
          </div>

          {/* Confidence */}
          {ai_confidence != null && (
            <div className="mt-6 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">AI Confidence Score</span>
                <span className="text-xs font-bold text-gray-700">{ai_confidence}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${ai_confidence}%`,
                    backgroundColor: ai_confidence >= 85 ? '#16a34a' : ai_confidence >= 70 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price card */}
        {resalePrice > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pricing</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Original MRP</p>
                <p className="text-2xl font-bold text-gray-300 line-through">₹{mrp.toLocaleString('en-IN')}</p>
              </div>

              {price_deduction_percentage > 0 && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-white shadow-md">
                  <span className="text-xs font-black">{price_deduction_percentage}%</span>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-orange-500 mb-1">Rehome Price</p>
                <p className="text-2xl font-black" style={{ color: '#FF9900' }}>₹{resalePrice.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Trust cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-3">
            <ShieldIcon />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Warranty</p>
              <p className="text-sm font-semibold text-gray-800">{warranty_status || 'Not available'}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-3">
            <TruckIcon />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Delivery</p>
              <p className="text-sm font-semibold text-gray-800">FREE delivery on this item</p>
            </div>
          </div>
        </div>

        {/* Lifecycle timeline */}
        {lifecycle?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Item Lifecycle</p>
            <ol className="space-y-0">
              {lifecycle.map((e, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100 flex-shrink-0 mt-0.5" />
                    {i < lifecycle.length - 1 && <div className="w-0.5 flex-1 bg-green-200 my-1" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-semibold text-gray-800">{e.event}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.date}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <div className="flex justify-center mb-3">
            <div className="h-8 w-8 rounded bg-orange-400 flex items-center justify-center text-xs font-black text-white">A</div>
          </div>
          <p className="text-xs text-gray-400">Verified by Amazon Rehome AI · Condition assessed June 2026</p>
          <Link to="/rehome" className="mt-3 inline-block text-xs text-orange-500 hover:underline">
            ← Back to marketplace
          </Link>
        </div>

      </main>
    </div>
  )
}
