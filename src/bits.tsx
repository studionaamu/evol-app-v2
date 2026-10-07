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

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M20 7c3.4 4.7 7.2 6.8 12.7 7.5C27.2 15.2 23.4 17.3 20 22c-3.4-4.7-7.2-6.8-12.7-7.5C12.8 13.8 16.6 11.7 20 7Z" fill="currentColor" />
      <circle cx="20" cy="29.5" r="2.1" fill="currentColor" />
    </svg>
  )
}
