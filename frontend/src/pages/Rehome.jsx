import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConditionBadge from '../components/ConditionBadge'
import RehomeBadge from '../components/RehomeBadge'
import { useLocation as useDeliveryLocation } from '../context/LocationContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const FILTERS = ['All', 'Like New', 'Good', 'Acceptable']

function deriveCard(item) {
  const mrp = item.original_mrp || 2000
  const price = item.suggested_resale_price || 0
  const deduction = price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0
  const firstImage = item.image_paths?.split(',')[0]?.trim()
  return { ...item, mrp, price, deduction, firstImage }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function PinIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.006 3.913-5.076 3.913-9.077A8.202 8.202 0 0012 2a8.202 8.202 0 00-8.2 8.25c0 4 1.969 7.07 3.913 9.077a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 bg-gray-200 rounded flex-1" />
          <div className="h-8 bg-gray-200 rounded flex-1" />
        </div>
      </div>
    </div>
  )
}

// ── Product image ─────────────────────────────────────────────────────────────
function ProductImage({ firstImage, productName }) {
  const isPlaceholder = !firstImage || firstImage === 'placeholder.jpg'
  const initials = productName
    ? productName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  if (isPlaceholder) {
    return (
      <div className="h-44 w-full bg-gray-100 flex flex-col items-center justify-center gap-1">
        <span className="text-3xl font-black text-gray-300">{initials}</span>
        <span className="text-xs text-gray-300">No image</span>
      </div>
    )
  }

  return (
    <img
      src={`${API}/uploads/${firstImage}`}
      alt={productName}
      className="h-44 w-full object-cover"
      onError={e => {
        e.target.style.display = 'none'
        e.target.nextSibling.style.display = 'flex'
      }}
    />
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ visible }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
        bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl
        transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Added to cart!
    </div>
  )
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ item, onAddToCart }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                    flex flex-col hover:shadow-md transition-shadow duration-200">

      {/* Image */}
      <div className="relative overflow-hidden">
        <ProductImage firstImage={item.firstImage} productName={item.product_name} />
        {/* fallback div hidden by default */}
        <div
          className="h-44 w-full bg-gray-100 flex-col items-center justify-center gap-1 hidden"
          aria-hidden="true"
        >
          <span className="text-3xl font-black text-gray-300">
            {item.product_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
          </span>
          <span className="text-xs text-gray-300">No image</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <RehomeBadge />
        </div>

        {/* Product name */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1" title={item.product_name}>
          {item.product_name}
        </h3>

        {/* Condition badge */}
        <ConditionBadge tier={item.ai_condition_tier || 'Pending'} />

        {/* Price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs text-gray-400 line-through">₹{item.mrp.toLocaleString('en-IN')}</span>
          <span className="text-base font-black" style={{ color: '#FF9900' }}>
            ₹{item.price > 0 ? item.price.toLocaleString('en-IN') : '—'}
          </span>
          {item.deduction > 0 && (
            <span className="text-xs font-semibold text-green-600">{item.deduction}% OFF</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-1 flex gap-2">
          <button
            onClick={() => navigate(`/health/${item.id}`)}
            className="flex-1 rounded-lg border-2 border-orange-400 px-2 py-1.5 text-xs font-semibold
                       text-orange-500 hover:bg-orange-50 transition"
          >
            View Health Card
          </button>
          <button
            onClick={() => onAddToCart(item.id)}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5
                       text-xs font-semibold text-gray-900 hover:opacity-90 transition"
            style={{ backgroundColor: '#FF9900' }}
          >
            <CartIcon />
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-bold text-gray-700">No items listed on Rehome yet</p>
        <p className="text-sm text-gray-400 mt-1">Grade and approve items from the Admin Dashboard</p>
      </div>
      <Link
        to="/admin"
        className="mt-2 rounded-lg px-5 py-2 text-sm font-semibold text-gray-900 hover:opacity-90 transition"
        style={{ backgroundColor: '#FF9900' }}
      >
        Go to Admin
      </Link>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Rehome() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)
  const { selectedLocation } = useDeliveryLocation()

  const fetchMarketplace = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/marketplace`)
      const data = await res.json()
      setItems(data.map(deriveCard))
    } catch {
      // keep existing data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketplace()
  }, [fetchMarketplace])

  function handleAddToCart() {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500)
  }

  // Location-based filtering: Rehome products are from Warehouse New Delhi DEX3
  // Only serviceable to Delhi and Gurugram
  const locationFiltered = selectedLocation.serviceable ? items : []

  const filtered = activeFilter === 'All'
    ? locationFiltered
    : locationFiltered.filter(i => i.ai_condition_tier === activeFilter)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-2">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/" className="hover:text-orange-500 hover:underline transition">Amazon.in</Link>
            <span className="text-gray-300">›</span>
            <span>Featured</span>
            <span className="text-gray-300">›</span>
            <span className="text-gray-600 font-medium">Amazon Rehome</span>
          </nav>
        </div>
      </div>

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#131921' }} className="w-full px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-8">

          {/* Left */}
          <div className="flex flex-col gap-3 flex-1">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FF9900' }}>
              A featured section on Amazon
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight flex items-center gap-3 flex-wrap">
              Amazon Rehome
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed">
              Verified pre-owned products, available near you.
              Discounted and AI graded.
            </p>
          </div>



        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  activeFilter === f
                    ? 'text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={activeFilter === f ? { backgroundColor: '#FF9900' } : {}}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0 pl-4">
              {loading ? '…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          !selectedLocation.serviceable ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center">
                <PinIcon />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-700">Available soon at your location!</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Change your delivery address in the header to see available products.</p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <ProductCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      <Toast visible={toastVisible} />

    </div>
  )
}
