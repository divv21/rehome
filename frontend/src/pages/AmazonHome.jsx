import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Carousel slides ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 'sale',
    bg: 'linear-gradient(135deg, #ff9900 0%, #ffbd4a 100%)',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-white text-xs font-bold uppercase tracking-widest mb-2">Amazon Great Indian Festival</p>
        <h2 className="text-white text-3xl sm:text-5xl font-black mb-3">Up to 80% Off</h2>
        <p className="text-white/90 text-sm">Electronics, Fashion, Home &amp; more</p>
      </div>
    ),
  },
  {
    id: 'rehome',
    bg: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-500/40 px-3 py-1 text-xs font-semibold text-green-400 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          New on Amazon
        </span>
        <h2 className="text-white text-2xl sm:text-4xl font-black mb-2">Amazon Rehome</h2>
        <p className="text-gray-300 text-sm sm:text-base mb-5 max-w-md">
          Give great products a second home. AI-verified, discounted, sustainable.
        </p>
        <Link
          to="/rehome"
          className="rounded-lg px-6 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition"
          style={{ backgroundColor: '#FF9900' }}
        >
          Shop Now
        </Link>
      </div>
    ),
  },
  {
    id: 'electronics',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Electronics Deals</p>
        <h2 className="text-white text-2xl sm:text-4xl font-black mb-3">Top Brands, Top Prices</h2>
        <p className="text-gray-400 text-sm">Smartphones, Laptops, TVs &amp; Accessories</p>
      </div>
    ),
  },
]

// ── Fake products ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  { name: 'OnePlus Nord CE 3 Lite 5G', price: '₹16,999', original: '₹19,999', stars: 4, reviews: '12,847', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400' },
  { name: 'Samsung Galaxy M34 5G', price: '₹14,999', original: '₹18,999', stars: 4, reviews: '8,234', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400' },
  { name: 'boAt Airdopes 141', price: '₹999', original: '₹2,990', stars: 4, reviews: '1,45,620', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400' },
  { name: 'Fire-Boltt Ninja Call Pro', price: '₹1,599', original: '₹5,999', stars: 3, reviews: '34,221', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
]

function StarRating({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`h-3.5 w-3.5 ${i < count ? 'text-orange-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ── Carousel ──────────────────────────────────────────────────────────────────
function Carousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '280px' }}>
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: slide.bg,
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          {slide.content}
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => setCurrent(p => (p - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        aria-label="Previous slide"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => setCurrent(p => (p + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        aria-label="Next slide"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AmazonHome() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Carousel hero */}
      <Carousel />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 -mt-8 relative z-10 space-y-6 pb-12">

        {/* ── Featured: Amazon Rehome card ─────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              New
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Featured on Amazon</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Icon */}
            <div className="flex-shrink-0 h-16 w-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Amazon Rehome</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                AI-verified pre-owned products available near you at <span className="font-semibold text-green-700">up to 60% off</span>.
                Every item includes a transparent Health Card with condition details.
              </p>
            </div>

            {/* CTA */}
            <Link
              to="/rehome"
              className="flex-shrink-0 rounded-lg px-6 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition shadow-sm"
              style={{ backgroundColor: '#FF9900' }}
            >
              Explore Rehome
            </Link>
          </div>
        </div>

        {/* ── Trending Products ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Trending Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="flex flex-col gap-2 cursor-pointer group">
                {/* Product image */}
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }}
                />
                {/* Info */}
                <p className="text-xs text-blue-700 hover:text-orange-600 hover:underline line-clamp-2 leading-snug cursor-pointer">
                  {p.name}
                </p>
                <StarRating count={p.stars} />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-gray-900">{p.price}</span>
                  <span className="text-xs text-gray-400 line-through">{p.original}</span>
                </div>
                <span className="text-xs text-gray-500">FREE delivery</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom banner ─────────────────────────────────────────────────── */}
        <Link
          to="/rehome"
          className="block rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          style={{ background: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)' }}
        >
          <div className="flex items-center justify-between p-6 gap-4">
            <div>
              <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1">Sustainability</p>
              <h3 className="text-lg font-bold text-white mb-1">Every return finds a new home</h3>
              <p className="text-sm text-gray-400">Shop pre-owned. Save money. Reduce waste.</p>
            </div>
            <div className="hidden sm:flex h-14 w-14 rounded-full items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF9900' }}>
              <span className="text-xl font-black text-white">R</span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
