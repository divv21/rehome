import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ConditionBadge from '../components/ConditionBadge'
import LeafRating from '../components/LeafRating'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, borderColor }) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm px-5 py-4 flex flex-col gap-1 border-t-4"
      style={{ borderTopColor: borderColor }}
    >
      <span className="text-2xl font-bold text-gray-800">{value}</span>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
    </div>
  )
}

// ── Confidence bar ─────────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  if (value == null) return <span className="text-xs text-gray-400">Pending</span>
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 85 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  )
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({}) // { [id]: 'grade' | 'approve' }
  const navigate = useNavigate()

  const fetchReturns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/returns`)
      const data = await res.json()
      setReturns(data)
    } catch {
      // keep existing data on poll failure
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + 5s poll
  useEffect(() => {
    fetchReturns()
    const interval = setInterval(fetchReturns, 30000)
    return () => clearInterval(interval)
  }, [fetchReturns])

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleGrade(id) {
    setActionLoading(prev => ({ ...prev, [id]: 'grade' }))
    try {
      const res = await fetch(`${API}/api/grade/${id}`, { method: 'POST' })
      const result = await res.json()
      setReturns(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                ai_condition_tier: result.condition_tier,
                ai_confidence: result.confidence,
                ai_damage_notes: result.damage_notes,
                suggested_resale_price: result.suggested_resale_price,
                routing_decision: result.routing_decision,
                routing_reason: result.routing_reason,
                status: 'graded',
              }
            : r
        )
      )
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  async function handleApprove(id) {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }))
    try {
      await fetch(`${API}/api/approve/${id}`, { method: 'POST' })
      setReturns(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'listed' } : r))
      )
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  // ── Summary counts ─────────────────────────────────────────────────────────
  const total = returns.length
  const pending = returns.filter(r => r.status === 'pending_grading').length
  const listed = returns.filter(r => r.status === 'listed').length
  const donatedOrLiquidated = returns.filter(r =>
    r.routing_decision && (
      r.routing_decision.toLowerCase().includes('donat') ||
      r.routing_decision.toLowerCase().includes('liquidat')
    )
  ).length

  // ── Leaf rating derived from confidence ────────────────────────────────────
  function confidenceToLeaves(confidence) {
    if (confidence == null) return 0
    if (confidence >= 95) return 5
    if (confidence >= 85) return 4
    if (confidence >= 75) return 3
    if (confidence >= 65) return 2
    return 1
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Returns"          value={total}              borderColor="#FF9900" />
          <SummaryCard label="Pending Grading"        value={pending}            borderColor="#f59e0b" />
          <SummaryCard label="Listed on Rehome"       value={listed}             borderColor="#22c55e" />
          <SummaryCard label="Donated / Liquidated"   value={donatedOrLiquidated} borderColor="#ef4444" />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Order ID', 'Product Name', 'Return Reason', 'Customer Condition',
                    'AI Grade', 'Confidence', 'Routing Decision', 'Actions'].map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : returns.map(row => {
                      const busy = actionLoading[row.id]
                      const canGrade   = row.status === 'pending_grading'
                      const canApprove = row.status === 'graded' &&
                        row.routing_decision === 'Resell on Amazon Rehome'

                      return (
                        <tr key={row.id} className="hover:bg-orange-50 transition-colors">
                          {/* Order ID */}
                          <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                            {row.order_id}
                          </td>

                          {/* Product Name */}
                          <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px]">
                            <span className="line-clamp-2">{row.product_name}</span>
                          </td>

                          {/* Return Reason */}
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {row.return_reason}
                          </td>

                          {/* Customer Condition */}
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {row.customer_condition}
                          </td>

                          {/* AI Grade */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <ConditionBadge tier={row.ai_condition_tier || 'Pending'} />
                              {row.ai_confidence != null && (
                                <LeafRating rating={confidenceToLeaves(row.ai_confidence)} />
                              )}
                            </div>
                          </td>

                          {/* Confidence */}
                          <td className="px-4 py-3">
                            <ConfidenceBar value={row.ai_confidence} />
                          </td>

                          {/* Routing Decision */}
                          <td className="px-4 py-3 text-gray-700 max-w-[160px]">
                            {row.routing_decision
                              ? <span className="text-xs">{row.routing_decision}</span>
                              : <span className="text-xs text-gray-400">Pending</span>
                            }
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5 min-w-[130px]">
                              {canGrade && (
                                <button
                                  onClick={() => handleGrade(row.id)}
                                  disabled={!!busy}
                                  className="inline-flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition hover:opacity-90"
                                  style={{ backgroundColor: '#FF9900' }}
                                >
                                  {busy === 'grade' ? <><Spinner /> Grading…</> : 'Grade Now'}
                                </button>
                              )}

                              {canApprove && (
                                <button
                                  onClick={() => handleApprove(row.id)}
                                  disabled={!!busy}
                                  className="inline-flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                >
                                  {busy === 'approve' ? <><Spinner /> Approving…</> : 'Approve for Rehome'}
                                </button>
                              )}

                              <button
                                onClick={() => navigate(`/health/${row.id}`)}
                                className="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
                              >
                                View Health Card
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>

            {!loading && returns.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No returns found.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
