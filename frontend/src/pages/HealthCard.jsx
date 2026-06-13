import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LeafRating from '../components/LeafRating'
import ConditionBadge from '../components/ConditionBadge'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Icons ─────────────────────────────────────────────────────────────────────
function CheckCircleIcon() {
  return (
    <svg className="h-6 w-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v5c0 5-3.5 9.3-7 10.5C8.5 20.3 5 16 5 11V6l7-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg className="h-7 w-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-5.7 7.4l-4.8 4.8a2.1 2.1 0 01-3-3l4.8-4.8a5 5 0 017.4-5.7l-3 3z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="h-7 w-7 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, className = '' }) {
  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 ${className}`}>
      {children}
    </section>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{children}</p>
  )
}

// ── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ events }) {
  return (
    <ol className="mt-4 space-y-0">
      {events.map((e, i) => {
        const isLast = i === events.length - 1
        return (
          <li key={i} className="flex gap-4">
            {/* dot + line */}
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-orange-400 ring-4 ring-orange-100 flex-shrink-0 mt-0.5" />
              {!isLast && <div className="w-0.5 flex-1 bg-orange-200 my-1" />}
            </div>
            {/* content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p className="text-sm font-semibold text-gray-800">{e.event}</p>
              <p className="text-xs text-gray-400 mt-0.5">{e.date}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HealthCard() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/api/health/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(true) } else { setData(json) }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-1.5 w-full bg-green-600 animate-pulse" />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Health card not found.</p>
      </div>
    )
  }

  const {
    product_name, order_id, return_reason,
    ai_condition_tier, ai_confidence, ai_damage_notes,
    leaf_rating, original_mrp, suggested_resale_price,
    price_deduction_percentage, warranty_status,
    refurbishment_notes, lifecycle,
  } = data

  const mrp = original_mrp || 2000
  const resalePrice = suggested_resale_price || 0

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Verified banner ──────────────────────────────────────────────── */}
      <div
        className="w-full py-3 px-4 flex items-center justify-center gap-2.5 text-white text-sm font-semibold tracking-wide"
        style={{ backgroundColor: '#16a34a' }}
      >
        <CheckCircleIcon />
        <span>AI Verified by Amazon Rehome</span>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">

        {/* ── S1: Product Identity ──────────────────────────────────────── */}
        <Section>
          <SectionLabel>Product Identity</SectionLabel>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
            {product_name}
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-mono">{order_id}</p>
          {return_reason && (
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 font-medium">
              Return reason: {return_reason}
            </span>
          )}
        </Section>

        {/* ── S2: Condition Summary ─────────────────────────────────────── */}
        <Section>
          <SectionLabel>Condition Summary</SectionLabel>
          <div className="flex flex-col items-center gap-4 text-center">
            <LeafRating rating={leaf_rating ?? 0} />
            <ConditionBadge tier={ai_condition_tier || 'Pending'} />
            {ai_damage_notes && (
              <p className="italic text-sm text-gray-400 max-w-md leading-relaxed">
                "{ai_damage_notes}"
              </p>
            )}
          </div>

          {/* Confidence bar */}
          {ai_confidence != null && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-gray-500">AI Confidence Score</span>
                <span className="text-xs font-bold text-gray-700">{ai_confidence}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
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
        </Section>

        {/* ── S3: Price Transparency ────────────────────────────────────── */}
        <Section>
          <SectionLabel>Price Transparency</SectionLabel>
          <div className="relative flex items-stretch gap-4">

            {/* Original MRP */}
            <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-5 flex flex-col justify-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Original MRP</p>
              <p className="text-3xl font-bold text-gray-300 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </p>
            </div>

            {/* % OFF badge */}
            {price_deduction_percentage > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
                              flex h-14 w-14 flex-col items-center justify-center rounded-full
                              bg-orange-400 text-white shadow-lg shadow-orange-200">
                <span className="text-sm font-black leading-none">{price_deduction_percentage}%</span>
                <span className="text-[9px] font-bold leading-none mt-0.5">OFF</span>
              </div>
            )}

            {/* Rehome Price */}
            <div className="flex-1 rounded-xl border-2 border-orange-400 bg-orange-50 p-5 flex flex-col justify-center">
              <p className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-2">Rehome Price</p>
              <p className="text-3xl font-black" style={{ color: '#FF9900' }}>
                ₹{resalePrice > 0 ? resalePrice.toLocaleString('en-IN') : '—'}
              </p>
            </div>

          </div>
        </Section>

        {/* ── S4: Trust Details ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Warranty */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <ShieldIcon />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Warranty Status</p>
              <p className="text-sm font-semibold text-gray-800">{warranty_status || 'Not available'}</p>
            </div>
          </div>

          {/* Refurbishment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <WrenchIcon />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Refurbishment</p>
              <p className={`text-sm font-semibold ${refurbishment_notes ? 'text-gray-800' : 'text-gray-400'}`}>
                {refurbishment_notes || 'Not Required'}
              </p>
            </div>
          </div>

          {/* Item History / Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <ClockIcon />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Item History</p>
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
                onClick={() => setTimelineOpen(o => !o)}
                aria-expanded={timelineOpen}
              >
                {timelineOpen ? 'Hide Timeline' : 'View Timeline'}
                <ChevronIcon open={timelineOpen} />
              </button>
              {timelineOpen && lifecycle?.length > 0 && (
                <Timeline events={lifecycle} />
              )}
            </div>
          </div>

        </div>

        {/* ── S5: Footer ────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-400 text-xs font-black text-white">
            A
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Verified by Amazon Rehome AI · Condition assessed on June 2026
          </p>
        </div>

      </main>
    </div>
  )
}
