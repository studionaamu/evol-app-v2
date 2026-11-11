import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { THREADS, DEFAULT_CONSENT, COACHES, CHAT_SEED, type Consent, type QuizMode, type Thread } from './data'

type Role = 'coache' | 'coach'
type Tab = 'hub' | 'ecosystem' | 'explorer' | 'carnet' | 'synergy' | 'profile'
export type Theme = 'dark' | 'light'
export type CoachSync = { agenda: boolean; signaux: boolean }
export type EvaFeedbackStatus = 'saved' | 'done' | 'skipped'
export type EvaFeedback = { status: EvaFeedbackStatus; reason?: string; at: number }
export type Personalization = {
  time: 5 | 10 | 20
  avoid: string[]
  quizMode: QuizMode | null
  feedback: Record<string, EvaFeedback>
}

type Store = {
  role: Role
  setRole: (r: Role) => void
  name: string
  setName: (n: string) => void
  avatar: string | null
  setAvatar: (a: string | null) => void
  guest: boolean
  setGuest: (g: boolean) => void
  hideExplorer: boolean
  setHideExplorer: (h: boolean) => void
  program: boolean
  setProgram: (p: boolean) => void
  coachSync: CoachSync
  setCoachSync: React.Dispatch<React.SetStateAction<CoachSync>>
  personalization: Personalization
  setPersonalization: React.Dispatch<React.SetStateAction<Personalization>>
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  tab: Tab
  setTab: (t: Tab) => void
  threads: Thread[]
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>
  followedCoachIds: string[]
  setFollowedCoachIds: React.Dispatch<React.SetStateAction<string[]>>
  toggleFollowCoach: (id: string) => void
  selectedRadarAxis: string | null
  setSelectedRadarAxis: (axis: string | null) => void
  consent: Consent
  setConsent: React.Dispatch<React.SetStateAction<Consent>>
  quizDomains: string[]
  setQuizDomains: (d: string[]) => void
  coachClient: string
  setCoachClient: (id: string) => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

const DEFAULT_PERSONALIZATION: Personalization = { time: 10, avoid: [], quizMode: null, feedback: {} }

function initialPersonalization(): Personalization {
  if (typeof window === 'undefined') return DEFAULT_PERSONALIZATION
  try {
    const raw = window.localStorage.getItem('evol-personalization')
    if (!raw) return DEFAULT_PERSONALIZATION
    const saved = JSON.parse(raw) as Partial<Personalization>
    return {
      time: saved.time === 5 || saved.time === 10 || saved.time === 20 ? saved.time : 10,
      avoid: Array.isArray(saved.avoid) ? saved.avoid.filter((x): x is string => typeof x === 'string') : [],
      quizMode: saved.quizMode === 'visio' || saved.quizMode === 'presentiel' || saved.quizMode === 'both' ? saved.quizMode : null,
      feedback: saved.feedback && typeof saved.feedback === 'object' ? saved.feedback as Record<string, EvaFeedback> : {},
    }
  } catch {
    return DEFAULT_PERSONALIZATION
  }
}

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = window.localStorage.getItem('evol-theme')
    return saved === 'light' || saved === 'dark' ? saved : 'dark'
  } catch {
    return 'dark'
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('coache')
  const [name, setName] = useState('Alex')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [guest, setGuest] = useState(false)
  const [hideExplorer, setHideExplorer] = useState(false)
  const [program, setProgram] = useState(false)
  const [coachSync, setCoachSync] = useState<CoachSync>({ agenda: true, signaux: true })
  const [personalization, setPersonalization] = useState<Personalization>(initialPersonalization)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [tab, setTab] = useState<Tab>('hub')
  const [threads, setThreads] = useState<Thread[]>(THREADS)
  const [followedCoachIds, setFollowedCoachIds] = useState<string[]>(['camille', 'nora'])
  const [selectedRadarAxis, setSelectedRadarAxis] = useState<string | null>('Sommeil')
  const [consent, setConsent] = useState<Consent>(DEFAULT_CONSENT)
  const [quizDomains, setQuizDomains] = useState<string[]>([])
  const [coachClient, setCoachClient] = useState('camille')

  useEffect(() => {
    try { window.localStorage.setItem('evol-personalization', JSON.stringify(personalization)) } catch { /* stockage indisponible */ }
  }, [personalization])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.dataset.theme = theme
    root.style.colorScheme = theme
    const meta = document.querySelector('meta[name=theme-color]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#101013' : '#F7F6FA')
    try { window.localStorage.setItem('evol-theme', theme) } catch { /* stockage indisponible */ }
  }, [theme])

  const toggleFollowCoach = (id: string) => {
    setFollowedCoachIds(prev => {
      const exists = prev.includes(id)
      const next = exists ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) : [...prev, id]
      if (!exists) {
        setThreads(ts => {
          if (ts.some(t => !t.group && t.coachId === id)) return ts
          const c = COACHES.find(x => x.id === id)
          return [
            {
              id: 't-' + id,
              coachId: id,
              unread: 1,
              messages: CHAT_SEED[id] ?? [{ from: 'coach', text: `Bonjour Alex ! Ravi·e de rejoindre votre équipe (${c?.role ?? 'Expert'}).`, time: 'maintenant' }],
            },
            ...ts,
          ]
        })
      }
      return next
    })
  }

  const value = useMemo<Store>(() => ({
    role, setRole, name, setName, avatar, setAvatar, guest, setGuest, tab, setTab,
    hideExplorer, setHideExplorer, coachSync, setCoachSync, program, setProgram,
    personalization, setPersonalization,
    theme, setTheme, toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
    threads, setThreads, followedCoachIds, setFollowedCoachIds, toggleFollowCoach,
    selectedRadarAxis, setSelectedRadarAxis,
    consent, setConsent, quizDomains, setQuizDomains,
    coachClient, setCoachClient,
    reset: () => {
      setRole('coache'); setTab('hub'); setGuest(false); setName('Alex'); setAvatar(null)
      setHideExplorer(false); setProgram(false); setCoachSync({ agenda: true, signaux: true })
      setPersonalization(DEFAULT_PERSONALIZATION)
      setThreads(THREADS); setFollowedCoachIds(['camille', 'nora'])
      setConsent(DEFAULT_CONSENT); setQuizDomains([])
    },
  }), [role, name, avatar, guest, tab, hideExplorer, coachSync, personalization, theme, threads, followedCoachIds, selectedRadarAxis, consent, quizDomains, coachClient, program])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}
