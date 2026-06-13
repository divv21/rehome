// Amazon smile icon placeholder
function SmileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
    >
      {/* Box shape */}
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#FF9900" />
      {/* Smile arc */}
      <path
        d="M8 13.5c1 1.5 7 1.5 8 0"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow tail of the smile */}
      <path
        d="M15.5 13.5c.5.2 1 .8 1 1.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function RehomeBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        backgroundColor: '#f0fdf4',
        borderColor: '#16a34a',
        color: '#0f172a',
      }}
      aria-label="Amazon Rehome Verified"
    >
      <SmileIcon />
      <span>Amazon Rehome Verified</span>
      {/* Green live dot */}
      <span
        className="h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: '#16a34a' }}
        aria-hidden="true"
      />
    </span>
  )
}
