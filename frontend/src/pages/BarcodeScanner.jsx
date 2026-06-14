import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/library'

const PRODUCT_DATABASE = {
  '8901058851378': {
    product_name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    original_mrp: 29990,
  },
  '8901058010247': {
    product_name: 'Sony WF-1000XM4 Earbuds',
    category: 'Electronics',
    original_mrp: 19990,
  },
  '8901212132476': {
    product_name: 'Samsung Galaxy Buds2 Pro',
    category: 'Electronics',
    original_mrp: 17999,
  },
  '8901664653430': {
    product_name: 'LG 1.5 Ton 5 Star Inverter AC',
    category: 'Electronics',
    original_mrp: 42999,
  },
  '8906084440019': {
    product_name: 'Philips Air Fryer HD9200',
    category: 'Electronics',
    original_mrp: 6995,
  },
  '0194253408598': {
    product_name: 'Apple iPhone 14 128GB',
    category: 'Electronics',
    original_mrp: 79900,
  },
  '0194253716174': {
    product_name: 'Apple iPad 10th Gen WiFi 64GB',
    category: 'Electronics',
    original_mrp: 44900,
  },
  '8901491500153': {
    product_name: 'Wildcraft Backpack 45L',
    category: 'Bags and Luggage',
    original_mrp: 1799,
  },
  '8903522001015': {
    product_name: 'Puma Men Running Shoes',
    category: 'Footwear',
    original_mrp: 3999,
  },
  '8901030847393': {
    product_name: 'Nike Air Max 270 Running Shoes',
    category: 'Footwear',
    original_mrp: 10795,
  },
  '8718699787059': {
    product_name: 'Philips 55 inch 4K UHD Smart TV',
    category: 'Electronics',
    original_mrp: 54990,
  },
  '8901396679007': {
    product_name: 'Prestige Iris 750W Mixer Grinder',
    category: 'Kitchen Appliances',
    original_mrp: 3495,
  },
  '8906043440076': {
    product_name: 'Boat Rockerz 450 Bluetooth Headphones',
    category: 'Electronics',
    original_mrp: 1999,
  },
  '8904259601234': {
    product_name: 'Noise ColorFit Pro 4 Smartwatch',
    category: 'Electronics',
    original_mrp: 3499,
  },
  '9780143441922': {
    product_name: 'Atomic Habits by James Clear',
    category: 'Books',
    original_mrp: 799,
  },
}

// ── Beep sound via Web Audio API ──────────────────────────────────────────────
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
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 150)
  } catch {
    // audio not available
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function WarehouseIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10l9-7 9 7M5 10v11M19 10v11M9 21v-6h6v6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BarcodeScanner() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [manualInput, setManualInput] = useState('')
  const [result, setResult] = useState(null) // { found: true, product, barcode } | { found: false, barcode }
  const [scanning, setScanning] = useState(true)
  const [flash, setFlash] = useState(false)

  // ── Start camera + scanning ─────────────────────────────────────────────────
  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader
      .decodeFromVideoDevice(null, videoRef.current, (res, err) => {
        if (res && scanning) {
          handleLookup(res.getText())
        }
      })
      .catch(() => {
        // camera not available — user can use manual entry
      })

    return () => {
      reader.reset()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Product lookup ──────────────────────────────────────────────────────────
  function handleLookup(barcode) {
    if (!barcode.trim()) return
    setScanning(false)

    // Stop the reader
    if (readerRef.current) readerRef.current.reset()

    // Flash + beep
    setFlash(true)
    playBeep()
    setTimeout(() => setFlash(false), 400)

    const product = PRODUCT_DATABASE[barcode.trim()]
    if (product) {
      setResult({ found: true, product, barcode: barcode.trim() })
    } else {
      setResult({ found: false, barcode: barcode.trim() })
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    handleLookup(manualInput)
  }

  function handleProceed() {
    if (!result?.found) return
    const p = result.product
    const params = new URLSearchParams({
      product_name: p.product_name,
      category: p.category,
      mrp: p.original_mrp.toString(),
    })
    navigate(`/warehouse?${params.toString()}`)
  }

  function handleReset() {
    setResult(null)
    setManualInput('')
    setScanning(true)
    // Restart reader
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    reader
      .decodeFromVideoDevice(null, videoRef.current, (res) => {
        if (res) handleLookup(res.getText())
      })
      .catch(() => {})
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="w-full py-4 px-6 flex items-center gap-3 border-b border-gray-800">
        <span className="text-white"><WarehouseIcon /></span>
        <h1 className="text-lg font-bold text-white tracking-wide">Warehouse Barcode Scanner</h1>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Left: Camera scanner ──────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div
              className={`relative rounded-xl overflow-hidden border-2 transition-colors duration-200 ${
                flash ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-gray-700'
              }`}
              style={{ aspectRatio: '4 / 3', backgroundColor: '#111' }}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Scanning line animation */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute left-4 right-4 h-0.5 rounded-full"
                    style={{
                      backgroundColor: '#FF9900',
                      boxShadow: '0 0 8px #FF9900',
                      animation: 'scanline 2s linear infinite',
                    }}
                  />
                </div>
              )}
              <style>{`
                @keyframes scanline {
                  0% { top: 10%; }
                  100% { top: 90%; }
                }
              `}</style>
            </div>
            <p className="text-center text-xs text-gray-500">
              Align barcode within frame
            </p>
          </div>

          {/* ── Right: Manual entry ───────────────────────────────────────── */}
          <div className="flex flex-col gap-4 justify-center">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="Enter barcode number manually"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
              <button
                type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#FF9900' }}
              >
                Lookup
              </button>
            </form>
            <p className="text-xs text-gray-600">
              Or type the barcode if camera is unavailable
            </p>
          </div>

        </div>

        {/* ── Result card ─────────────────────────────────────────────────── */}
        {result && (
          <div className="mt-8">
            {result.found ? (
              <div className="rounded-xl border border-green-700 bg-green-950/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckIcon />
                  <h2 className="text-xl font-bold text-green-400">Product Found</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Product Name</p>
                    <p className="text-sm text-white font-medium">{result.product.product_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                    <p className="text-sm text-white font-medium">{result.product.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Original MRP</p>
                    <p className="text-sm text-white font-medium">₹{result.product.original_mrp.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleProceed}
                    className="rounded-lg px-6 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition"
                    style={{ backgroundColor: '#FF9900' }}
                  >
                    Proceed to Submit Return
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-300 transition"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-700 bg-red-950/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XIcon />
                  <div>
                    <h2 className="text-xl font-bold text-red-400">Product not found in database</h2>
                    <p className="text-sm text-gray-400 mt-1">Barcode: <span className="font-mono">{result.barcode}</span></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/warehouse')}
                    className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-300 transition"
                  >
                    Enter Details Manually
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-300 transition"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
