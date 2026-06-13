import { useState, useEffect } from 'react'

const SIZES = ['UK6', 'UK7', 'UK8', 'UK9', 'UK10']

// ── Icons ─────────────────────────────────────────────────────────────────────
function WarningIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  )
}

// ── Nudge banner ──────────────────────────────────────────────────────────────
function NudgeBanner({ switched, onSwitch, onProceed }) {
  if (switched) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 p-4">
        <CheckIcon />
        <div>
          <p className="text-sm font-bold text-green-800">Smart choice</p>
          <p className="text-sm text-green-700 mt-0.5 leading-relaxed">
            UK9 has a <span className="font-semibold">94% keep rate</span> for buyers with your profile.
            Best return is no return.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-300 p-4" style={{ backgroundColor: '#fef9c3' }}>
      <div className="flex items-start gap-3">
        <WarningIcon />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">Heads up about your fit</p>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Buyers with your size history find Nike Air Max runs small —{' '}
            <span className="font-semibold">73% of similar buyers</span> who selected UK8 returned
            it and repurchased in UK9.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onSwitch}
              className="rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-amber-900
                         hover:bg-amber-500 transition"
            >
              Switch to UK9
            </button>
            <button
              onClick={onProceed}
              className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold
                         text-gray-600 hover:bg-gray-50 transition"
            >
              Proceed with UK8
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Prevention() {
  const [selectedSize, setSelectedSize] = useState('UK8')
  const [bannerVisible, setBannerVisible] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [switched, setSwitched] = useState(false)

  // Slide in after 1.5s
  useEffect(() => {
    const t = setTimeout(() => setBannerVisible(true), 1500)
    return () => clearTimeout(t)
  }, [])

  function handleSwitch() {
    setSelectedSize('UK9')
    setSwitched(true)
  }

  function handleProceed() {
    setBannerDismissed(true)
  }

  function handleSizeClick(size) {
    setSelectedSize(size)
    // If user manually picks UK8 again after switching, reset the switched state
    if (size !== 'UK9') {
      setSwitched(false)
    } else {
      setSwitched(true)
    }
  }

  const showBanner = bannerVisible && !bannerDismissed

  return (
    <div className="min-h-screen bg-white">

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <p className="text-xs text-gray-400 mb-6">
          Amazon &rsaquo; Sports &rsaquo; Footwear &rsaquo; Nike Air Max
        </p>

        {/* Product layout */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* ── Left: image placeholder ──────────────────────────────────── */}
          <div className="flex-shrink-0 w-full md:w-80">
            <div className="w-full aspect-square rounded-2xl bg-gray-100 border border-gray-200
                            flex flex-col items-center justify-center gap-3">
              {/* Shoe silhouette placeholder */}
              <svg className="h-24 w-24 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 16v-1l-8.5-5L11 7l-1.8.9L7 6 3 8v2l-1 1v1l1 1 1-1h1l1 1h12l1-1h1l1 1 1-1v-1l-1-1zm-10.5-5.5l1.5 1-4 2-1-1 3.5-2z"/>
              </svg>
              <span className="text-sm text-gray-400 font-medium">Nike Air Max</span>
              <span className="text-xs text-gray-300">Running Shoes</span>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-3 flex gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-16 w-16 rounded-lg bg-gray-100 border-2 cursor-pointer transition
                    ${i === 1 ? 'border-orange-400' : 'border-transparent hover:border-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* ── Right: product details ────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Title & rating */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Nike</p>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                Nike Air Max Running Shoes
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-orange-400 text-sm">{'★'.repeat(4)}{'☆'}</div>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">2,847 ratings</span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Price */}
            <div>
              <p className="text-xs text-gray-500">M.R.P.:</p>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-3xl font-black" style={{ color: '#FF9900' }}>₹4,999</span>
                <span className="text-sm text-gray-400 line-through">₹7,999</span>
                <span className="text-sm font-semibold text-green-600">38% off</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes. Free delivery.</p>
            </div>

            {/* Size selector */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Size: <span className="text-gray-900">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => {
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeClick(size)}
                      className={`rounded-lg border-2 px-4 py-1.5 text-sm font-semibold transition
                        ${isSelected
                          ? 'border-orange-400 text-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                        }`}
                      style={isSelected ? { backgroundColor: '#FF9900' } : {}}
                      aria-pressed={isSelected}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-blue-600 hover:underline cursor-pointer mt-2">
                Size guide
              </p>
            </div>

            {/* Nudge banner — slides in */}
            <div
              className={`transition-all duration-500 ease-out overflow-hidden
                ${showBanner || switched
                  ? 'max-h-64 opacity-100 translate-y-0'
                  : 'max-h-0 opacity-0 -translate-y-2'
                }`}
            >
              {(showBanner || switched) && (
                <NudgeBanner
                  switched={switched}
                  onSwitch={handleSwitch}
                  onProceed={handleProceed}
                />
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 max-w-xs">
              <button
                className="w-full rounded-xl py-3 text-sm font-bold text-gray-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#FF9900' }}
              >
                Add to Cart
              </button>
              <button
                className="w-full rounded-xl py-3 text-sm font-bold text-gray-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#ffa41c' }}
              >
                Buy Now
              </button>
            </div>

            {/* Delivery info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <span className="font-semibold text-gray-700">Delivery</span>{' '}
                FREE delivery <span className="text-gray-700 font-medium">Thursday, 19 June</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Returns</span>{' '}
                Eligible for Return, Refund or Replacement within 30 days
              </p>
            </div>

          </div>
        </div>

        {/* ── How does this work card ───────────────────────────────────── */}
        <div className="mt-12 rounded-2xl bg-blue-50 border border-blue-100 p-6 flex gap-4">
          <InfoIcon />
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">How does this work?</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Amazon Rehome analyses your purchase and return history to predict fit issues before
              they happen. Preventing returns saves you time and reduces waste.
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}
