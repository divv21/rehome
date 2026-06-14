import { useState } from 'react'
import { useLocation as useRouterLocation, Link, NavLink } from 'react-router-dom'
import { useLocation as useDeliveryLocation } from '../context/LocationContext'

const WAREHOUSE_ROUTES = ['/admin', '/scan', '/warehouse']

// ── Icons ─────────────────────────────────────────────────────────────────────
function PinIcon() {
  return (
    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}

function WarehouseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10l9-7 9 7M5 10v11M19 10v11M9 21v-6h6v6" />
    </svg>
  )
}

// ── Customer Navbar ───────────────────────────────────────────────────────────
function CustomerNavbar() {
  const { selectedLocation, setSelectedLocation, LOCATIONS } = useDeliveryLocation()
  const [locOpen, setLocOpen] = useState(false)

  return (
    <nav>
      {/* Top bar */}
      <div style={{ backgroundColor: '#131921' }} className="w-full">
        <div className="mx-auto max-w-7xl px-3 py-2 flex items-center gap-3">

          {/* Logo */}
          <Link to="/rehome" className="flex items-center gap-0.5 flex-shrink-0 py-1 px-2 border border-transparent hover:border-gray-500 rounded transition">
            <span className="text-white text-xl font-bold tracking-tight">amazon</span>
            <span className="text-white text-xs">.in</span>
          </Link>

          {/* Location selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLocOpen(o => !o)}
              className="flex items-center gap-1 text-white py-1 px-2 border border-transparent hover:border-gray-500 rounded cursor-pointer transition"
            >
              <PinIcon />
              <div className="flex flex-col leading-tight text-left">
                <span className="text-xs text-gray-300">Deliver to</span>
                <span className="text-sm font-bold">{selectedLocation.label}</span>
              </div>
              <svg className="h-3 w-3 text-gray-400 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {locOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-lg bg-white shadow-xl border border-gray-200 py-1 z-50">
                <p className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Select delivery address</p>
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelectedLocation(loc); setLocOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition flex items-center gap-2 ${
                      selectedLocation.id === loc.id ? 'bg-orange-50 font-semibold text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    <PinIcon />
                    <span>{loc.label}</span>
                    {selectedLocation.id === loc.id && (
                      <svg className="h-3.5 w-3.5 ml-auto text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex-1 flex h-10 rounded-md overflow-hidden">
            <select className="bg-gray-100 border-none text-xs text-gray-700 px-2 pr-4 outline-none cursor-pointer">
              <option>All</option>
            </select>
            <input
              type="text"
              placeholder="Search Amazon Rehome"
              className="flex-1 px-3 text-sm border-none outline-none bg-white text-gray-800"
            />
            <button
              className="px-3 flex items-center justify-center text-gray-900"
              style={{ backgroundColor: '#FF9900' }}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>

          {/* Right icons */}
          <div className="hidden md:flex items-center gap-1">
            {/* Account */}
            <div className="flex items-center gap-1 text-white py-1 px-2 border border-transparent hover:border-gray-500 rounded cursor-pointer transition">
              <PersonIcon />
              <div className="flex flex-col leading-tight">
                <span className="text-xs text-gray-300">Hello, sign in</span>
                <span className="text-xs font-bold">Account &amp; Lists</span>
              </div>
            </div>

            {/* Returns */}
            <Link to="/orders" className="flex flex-col text-white py-1 px-2 border border-transparent hover:border-gray-500 rounded transition leading-tight">
              <span className="text-xs text-gray-300">Returns</span>
              <span className="text-xs font-bold">&amp; Orders</span>
            </Link>

            {/* Cart */}
            <Link to="/rehome" className="relative flex items-center text-white py-1 px-2 border border-transparent hover:border-gray-500 rounded transition">
              <CartIcon />
              <span className="absolute -top-0.5 right-1 text-xs font-bold" style={{ color: '#FF9900' }}>0</span>
              <span className="text-xs font-bold ml-1">Cart</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Secondary nav strip */}
      <div style={{ backgroundColor: '#232f3e' }} className="w-full">
        <div className="mx-auto max-w-7xl px-3 flex items-center gap-1 overflow-x-auto py-1.5">
          {['Today\'s Deals', 'Customer Service', 'Registry', 'Gift Cards'].map(label => (
            <span
              key={label}
              className="flex-shrink-0 text-xs text-gray-200 px-2 py-1 rounded border border-transparent hover:border-gray-500 cursor-pointer transition"
            >
              {label}
            </span>
          ))}
          <NavLink
            to="/rehome"
            className={({ isActive }) =>
              `flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white px-2 py-1 rounded border transition ${
                isActive ? 'border-gray-400' : 'border-transparent hover:border-gray-500'
              }`
            }
          >
            Amazon Rehome
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

// ── Warehouse Navbar ──────────────────────────────────────────────────────────
function WarehouseNavbar() {
  return (
    <nav style={{ backgroundColor: '#1a1a1a' }} className="w-full border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/warehouse" className="flex items-center gap-2 text-white hover:text-orange-400 transition">
            <WarehouseIcon />
            <span className="text-sm font-bold tracking-wide">Amazon Warehouse Portal</span>
            <span className="hidden sm:inline-flex items-center rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400 font-normal ml-1">DEX3 · New Delhi</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <NavLink
              to="/warehouse"
              end
              className={({ isActive }) =>
                `text-xs font-medium transition ${isActive ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`
              }
            >
              Process Return
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-xs font-medium transition ${isActive ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`
              }
            >
              Dashboard
            </NavLink>
          </div>
        </div>
        <span className="text-xs text-gray-500">Warehouse Staff View</span>
      </div>
    </nav>
  )
}

// ── Navbar router ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const location = useRouterLocation()
  const isWarehouse = WAREHOUSE_ROUTES.some(r => location.pathname.startsWith(r))

  if (isWarehouse) return <WarehouseNavbar />
  return <CustomerNavbar />
}
