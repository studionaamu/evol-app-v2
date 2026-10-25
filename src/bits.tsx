import { useState } from 'react'

export function Avatar({ hue, initials, photo, size = 44, ring = false }: {
  hue: string
  initials: string
  photo?: string
  size?: number
  ring?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const showPhoto = photo && !failed
  return (
    <div
      className={'avatar' + (showPhoto ? ' has-photo' : '') + (ring ? ' ring' : '')}
      style={{
        width: size, height: size,
        ...(showPhoto ? {} : {
          background: `linear-gradient(140deg, hsl(${hue} 20% 90%), hsl(${hue} 12% 80%))`,
          fontSize: size * 0.34,
        }),
      }}
    >
      {showPhoto
        ? <img src={photo} alt={initials} onError={() => setFailed(true)} />
        : initials}
    </div>
  )
}

/* Visage d'EVA — disque de marque (grenat → améthyste → saphir) + visière douce */
export function EvaAvatar({ size = 46 }: { size?: number }) {
  return (
    <span className="eva-avatar" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <defs>
          <linearGradient id="evaFaceGrad" x1="6" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF5B4D" />
            <stop offset="0.52" stopColor="#9A6BE0" />
            <stop offset="1" stopColor="#4B5CFF" />
          </linearGradient>
          <radialGradient id="evaVisor" cx="50%" cy="38%" r="70%">
            <stop offset="0" stopColor="rgba(12,10,24,0.62)" />
            <stop offset="1" stopColor="rgba(12,10,24,0.86)" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="url(#evaFaceGrad)" />
        <circle cx="24" cy="24" r="22.4" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" />
        <ellipse cx="24" cy="24.5" rx="15" ry="12.5" fill="url(#evaVisor)" />
        <circle cx="18.6" cy="22.4" r="2.1" fill="#EAF0FF" />
        <circle cx="29.4" cy="22.4" r="2.1" fill="#EAF0FF" />
        <path d="M20 28.6c1.2 1.5 2.6 2.2 4 2.2s2.8-.7 4-2.2" fill="none" stroke="rgba(234,240,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M20 7c3.4 4.7 7.2 6.8 12.7 7.5C27.2 15.2 23.4 17.3 20 22c-3.4-4.7-7.2-6.8-12.7-7.5C12.8 13.8 16.6 11.7 20 7Z" fill="currentColor" />
      <circle cx="20" cy="29.5" r="2.1" fill="currentColor" />
    </svg>
  )
}
