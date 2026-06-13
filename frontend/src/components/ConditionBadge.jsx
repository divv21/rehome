const TIER_STYLES = {
  'Like New': {
    bg: '#22c55e',
    text: '#fff',
    darkText: false,
  },
  'Good': {
    bg: '#0d9488',
    text: '#fff',
    darkText: false,
  },
  'Acceptable': {
    bg: '#f59e0b',
    text: '#1c1917',
    darkText: true,
  },
  'Liquidate': {
    bg: '#ef4444',
    text: '#fff',
    darkText: false,
  },
  'Human Review Required': {
    bg: '#8b5cf6',
    text: '#fff',
    darkText: false,
  },
  'Pending': {
    bg: '#6b7280',
    text: '#fff',
    darkText: false,
  },
}

const VERIFIED_TIERS = new Set(['Like New', 'Good'])

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-3 w-3 flex-shrink-0"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function ConditionBadge({ tier }) {
  const normalised = tier ?? 'Pending'
  const style = TIER_STYLES[normalised] ?? TIER_STYLES['Pending']
  const showCheck = VERIFIED_TIERS.has(normalised)

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none"
      style={{ backgroundColor: style.bg, color: style.text }}
      aria-label={`Condition: ${normalised}`}
    >
      {showCheck && <CheckIcon />}
      {normalised}
    </span>
  )
}
