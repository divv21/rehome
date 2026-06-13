import { useState, useEffect } from 'react'

function Leaf({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? '#16a34a' : '#d1d5db'}
      width="20"
      height="20"
      aria-hidden="true"
      style={{ transition: 'fill 0.2s ease' }}
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-8 2C12.5 5 11.3 5.4 10 6c1-3 6-4 6-4S14 2 10 4C7 5.5 4.5 9 4.5 9S6 6 9 5c-3 2-4 6-4 6s2-1 4-1c-2 1-3 4-3 4s2 0 4-2c-1 2-1 4-1 4s3-2 4-5c0 3 1 5 1 5s1-3 1-6c1 2 2 5 2 5s0-4-1-6c2 1 3 4 3 4s-1-4-3-6z" />
    </svg>
  )
}

export default function LeafRating({ rating = 0 }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)))
  const [filledCount, setFilledCount] = useState(0)

  useEffect(() => {
    setFilledCount(0)
    if (clamped === 0) return

    const timers = []
    for (let i = 1; i <= clamped; i++) {
      timers.push(
        setTimeout(() => setFilledCount(i), i * 150)
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [clamped])

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${clamped} out of 5 leaves — AI Verified Condition`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Leaf key={i} filled={i < filledCount} />
        ))}
      </div>
      <p className="text-xs text-gray-400 tracking-wide">
        {clamped}/5 — AI Verified Condition
      </p>
    </div>
  )
}
