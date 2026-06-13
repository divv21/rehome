import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',           label: 'Submit Return', end: true  },
  { to: '/rehome',     label: 'Rehome',        end: false, live: true },
  { to: '/admin',      label: 'Admin',         end: false },
  { to: '/prevention', label: 'Prevention',    end: false },
]

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function desktopLinkClass({ isActive }) {
  return [
    'flex items-center gap-1.5 text-sm font-medium text-white transition-colors',
    'hover:text-orange-400 pb-1 border-b-2',
    isActive ? 'border-orange-400 text-orange-400' : 'border-transparent',
  ].join(' ')
}

function mobileLinkClass({ isActive }) {
  return [
    'flex items-center gap-2 px-4 py-3 text-sm font-medium text-white',
    'transition-colors hover:bg-gray-700 hover:text-orange-400 border-l-4',
    isActive ? 'text-orange-400 border-orange-400 pl-3' : 'border-transparent',
  ].join(' ')
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: '#131921' }} className="w-full shadow-md">
      {/* Main bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Left — logo (links to /rehome) */}
          <Link
            to="/rehome"
            className="flex items-center gap-3 flex-shrink-0 group"
            aria-label="Amazon Rehome home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded bg-orange-400 text-xs font-bold text-white leading-none group-hover:bg-orange-500 transition-colors">
              A
            </div>
            <span className="text-white font-semibold text-base whitespace-nowrap group-hover:text-orange-400 transition-colors">
              Amazon Rehome
            </span>
          </Link>

          {/* Centre — desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label, end, live }) => (
              <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
                {label}
                {live && (
                  <span
                    className="relative flex h-2 w-2"
                    title="Live"
                    aria-label="Live marketplace"
                  >
                    {/* Ping animation */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right — icons + hamburger */}
          <div className="flex items-center gap-4 text-white">
            <button aria-label="Cart" className="hover:text-orange-400 transition-colors">
              <CartIcon />
            </button>
            <button aria-label="Account" className="hover:text-orange-400 transition-colors">
              <PersonIcon />
            </button>
            <button
              className="md:hidden hover:text-orange-400 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(prev => !prev)}
            >
              {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-700">
          {NAV_LINKS.map(({ to, label, end, live }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {live && (
                <span
                  className="flex items-center gap-1 text-xs text-green-400 font-normal"
                  title="Live"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Live
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
