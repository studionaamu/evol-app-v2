export function Icon({ name, size = 22, strokeWidth = 1.6, filled = false }: {
  name: string
  size?: number
  strokeWidth?: number
  filled?: boolean
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'home':
      return filled ? (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M3.6 10.4 12 3.5l8.4 6.9V20a1 1 0 0 1-1 1h-5v-6h-4.8v6h-5a1 1 0 0 1-1-1v-9.6Z" />
        </svg>
      ) : (
        <svg {...common}>
          <path d="M3.6 10.4 12 3.5l8.4 6.9V20a1 1 0 0 1-1 1h-5v-6h-4.8v6h-5a1 1 0 0 1-1-1v-9.6Z" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} />
          <path d="m15.5 8.5-2.2 5-4.8 2 2.2-5 4.8-2Z" fill={filled ? '#fff' : 'none'} stroke={filled ? 'none' : 'currentColor'} />
        </svg>
      )
    case 'chat':
      return filled ? (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.4 0 2.3 1.2 4.3 3.1 5.7-.1.9-.5 2.2-1.5 3.4 0 0 2.4-.2 4.2-1.5 .9.2 1.8.3 2.7.3 4.7 0 8.5-3.3 8.5-7.4S16.7 3.5 12 3.5Z" />
        </svg>
      ) : (
        <svg {...common}>
          <path d="M21 11.5c0 4.1-4 7.4-9 7.4-1 0-2-.1-2.9-.4-1.6 1-3.6 1.2-3.6 1.2.7-1 1.1-2.1 1.2-3C4.9 15.4 3 13.6 3 11.5c0-4.1 4-7.4 9-7.4s9 3.3 9 7.4Z" />
        </svg>
      )
    case 'user':
      return filled ? (
        <svg {...common} fill="currentColor" stroke="none">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20.5c0-3.6 3.6-5.5 8-5.5s8 1.9 8 5.5v.5H4v-.5Z" />
        </svg>
      ) : (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20c.8-3.2 3.7-4.8 7-4.8s6.2 1.6 7 4.8" />
        </svg>
      )
    case 'heart':
      return filled ? (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 20.5s-7.5-4.6-9.3-9C1.4 8 3.4 5 6.5 5c2 0 3.6 1.1 4.5 2.7h2c.9-1.6 2.5-2.7 4.5-2.7 3.1 0 5.1 3 3.8 6.5-1.8 4.4-9.3 9-9.3 9Z" />
        </svg>
      ) : (
        <svg {...common}>
          <path d="M12 20.5s-7.5-4.6-9.3-9C1.4 8 3.4 5 6.5 5c2 0 3.6 1.1 4.5 2.7h2c.9-1.6 2.5-2.7 4.5-2.7 3.1 0 5.1 3 3.8 6.5-1.8 4.4-9.3 9-9.3 9Z" />
        </svg>
      )
    case 'share':
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none" width={size * 0.8} height={size * 0.8}>
          <path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.8 6.4 20l1.3-6.2L3 9.5l6.3-.7L12 3Z" />
        </svg>
      )
    case 'location':
      return (
        <svg {...common} width={size * 0.85} height={size * 0.85}>
          <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z" />
          <circle cx="12" cy="10.5" r="2.3" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg {...common} width={size * 0.8} height={size * 0.8}>
          <path d="m9 5.5 6.5 6.5L9 18.5" />
        </svg>
      )
    case 'chevron-left':
      return (
        <svg {...common} width={size * 0.8} height={size * 0.8}>
          <path d="M15 5.5 8.5 12 15 18.5" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M4 12h16" />
          <path d="m14 6 6 6-6 6" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="m4.5 12.5 5 5L19.5 7" />
        </svg>
      )
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z" />
          <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
          <path d="M8 3.5v4M16 3.5v4M4 10.5h16" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common} width={size * 0.85} height={size * 0.85}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none" width={size * 0.85} height={size * 0.85}>
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'send':
      return (
        <svg {...common}>
          <path d="M4.5 12 20 4.5l-4 15.5-4.5-5.5L4.5 12Z" />
          <path d="m11.5 14.5 4-4.5" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...common} fill="currentColor" stroke="none" width={size * 0.85} height={size * 0.85}>
          <path d="M12 2c.6 4.8 2.4 7.4 8 8-5.6.6-7.4 3.2-8 8-.6-4.8-2.4-7.4-8-8 5.6-.6 7.4-3.2 8-8Z" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 6.8 6.8 0 0 0 20 13.5Z" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common} width={size * 0.85} height={size * 0.85}>
          <path d="M12 3 5 5.5v6c0 4.5 3 7.5 7 9.5 4-2 7-5 7-9.5v-6L12 3Z" />
          <path d="m9 11.5 2 2 4-4" />
        </svg>
      )
    case 'activity':
      return (
        <svg {...common}>
          <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
        </svg>
      )
    case 'logo':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 8c3.2 4.4 6.8 6.4 12 7-5.2.6-8.8 2.6-12 7-3.2-4.4-6.8-6.4-12-7 5.2-.6 8.8-2.6 12-7Z" fill="currentColor" />
          <circle cx="20" cy="29.5" r="2" fill="currentColor" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
          <path d="M12 18v3" />
        </svg>
      )
    case 'pause':
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M8.5 5v14M15.5 5v14" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...common} width={size * 0.85} height={size * 0.85}>
          <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
          <path d="M20.5 3.5v5h-5" />
        </svg>
      )
    case 'video':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="13" height="12" rx="3" />
          <path d="m16 10.5 5-3v9l-5-3" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19c.7-2.9 3-4.3 5.5-4.3s4.8 1.4 5.5 4.3" />
          <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2" />
          <path d="M17.5 14.9c1.7.6 2.7 1.9 3 4.1" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common} width={size * 0.85} height={size * 0.85}>
          <rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5" />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        </svg>
      )
    default:
      return null
  }
}

export function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 12.54c-.03-2.89 2.36-4.28 2.47-4.35-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.49.96 1.39 2.1 2.94 3.6 2.88 1.45-.06 2-.93 3.74-.93s2.24.93 3.77.9c1.56-.03 2.55-1.41 3.5-2.8 1.1-1.61 1.55-3.17 1.58-3.25-.04-.02-3.03-1.16-3.07-4.58ZM14.16 4.06c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.86-1.39 2.23-1.22 3.55 1.29.1 2.6-.65 3.41-1.63Z" />
    </svg>
  )
}

export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1Z" />
      <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76Z" />
    </svg>
  )
}
