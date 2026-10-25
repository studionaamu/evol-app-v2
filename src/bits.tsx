import { useId, useState } from 'react'

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

/* EVA — sphère irisée, deux yeux-barettes, halo doux */
export function EvaAvatar({ size = 46 }: { size?: number }) {
  const uid = useId().replace(/:/g, '')
  const clip = `eva-clip-${uid}`
  const base = `eva-base-${uid}`
  const blur = `eva-blur-${uid}`
  return (
    <span className="eva-avatar" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <defs>
          <clipPath id={clip}><circle cx="24" cy="24" r="23" /></clipPath>
          <radialGradient id={base} cx="38%" cy="30%" r="82%">
            <stop offset="0" stopColor="#7B6BFF" />
            <stop offset="0.55" stopColor="#4A2BD6" />
            <stop offset="1" stopColor="#1B1150" />
          </radialGradient>
          <filter id={blur} x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <circle cx="24" cy="24" r="23" fill={`url(#${base})`} />
          <ellipse cx="14" cy="13" rx="12" ry="10" fill="#FF7BD5" opacity="0.72" filter={`url(#${blur})`} />
          <ellipse cx="35" cy="19" rx="11" ry="12" fill="#9B4BFF" opacity="0.58" filter={`url(#${blur})`} />
          <ellipse cx="20" cy="35" rx="13" ry="9" fill="#22D3C5" opacity="0.5" filter={`url(#${blur})`} />
          <ellipse cx="37" cy="35" rx="10" ry="8" fill="#FFB56B" opacity="0.42" filter={`url(#${blur})`} />
          <ellipse cx="16" cy="12" rx="8" ry="5" fill="#FFFFFF" opacity="0.34" filter={`url(#${blur})`} />
        </g>
        <circle cx="24" cy="24" r="22.6" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.1" />
        <rect x="18.4" y="19" width="3.8" height="10" rx="1.9" fill="#FFFFFF" />
        <rect x="25.8" y="19" width="3.8" height="10" rx="1.9" fill="#FFFFFF" />
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
