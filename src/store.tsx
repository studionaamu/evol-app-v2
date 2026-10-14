import React, { createContext, useContext, useMemo, useState } from 'react'
import { THREADS, DEFAULT_CONSENT, COACHES, CHAT_SEED, type Consent, type Thread } from './data'

type Role = 'coache' | 'coach'
type Tab = 'hub' | 'ecosystem' | 'explorer' | 'synergy' | 'profile'

type Store = {
  role: Role
  setRole: (r: Role) => void
  name: string
  setName: (n: string) => void
  guest: boolean
  setGuest: (g: boolean) => void
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('coache')
  const [name, setName] = useState('Alex')
  const [guest, setGuest] = useState(false)
  const [tab, setTab] = useState<Tab>('hub')
  const [threads, setThreads] = useState<Thread[]>(THREADS)
  const [followedCoachIds, setFollowedCoachIds] = useState<string[]>(['camille', 'nora'])
  const [selectedRadarAxis, setSelectedRadarAxis] = useState<string | null>('Sommeil')
  const [consent, setConsent] = useState<Consent>(DEFAULT_CONSENT)
  const [quizDomains, setQuizDomains] = useState<string[]>([])
  const [coachClient, setCoachClient] = useState('camille')

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
    role, setRole, name, setName, guest, setGuest, tab, setTab,
    threads, setThreads, followedCoachIds, setFollowedCoachIds, toggleFollowCoach,
    selectedRadarAxis, setSelectedRadarAxis,
    consent, setConsent, quizDomains, setQuizDomains,
    coachClient, setCoachClient,
    reset: () => {
      setRole('coache'); setTab('hub'); setGuest(false); setName('Alex')
      setThreads(THREADS); setFollowedCoachIds(['camille', 'nora'])
      setConsent(DEFAULT_CONSENT); setQuizDomains([])
    },
  }), [role, name, guest, tab, threads, followedCoachIds, selectedRadarAxis, consent, quizDomains, coachClient])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}
