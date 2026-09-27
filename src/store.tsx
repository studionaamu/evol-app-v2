import React, { createContext, useContext, useMemo, useState } from 'react'
import { THREADS, DEFAULT_CONSENT, type Consent, type Thread } from './data'

type Role = 'coache' | 'coach'
type Tab = 'hub' | 'explorer' | 'synergy' | 'profile'

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
  consent: Consent
  setConsent: React.Dispatch<React.SetStateAction<Consent>>
  quizDomains: string[]
  setQuizDomains: (d: string[]) => void
  coachClient: string
  setCoachClient: (id: string) => void
  tourDone: boolean
  setTourDone: (v: boolean) => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('coache')
  const [name, setName] = useState('Alex')
  const [guest, setGuest] = useState(false)
  const [tab, setTab] = useState<Tab>('hub')
  const [threads, setThreads] = useState<Thread[]>(THREADS)
  const [consent, setConsent] = useState<Consent>(DEFAULT_CONSENT)
  const [quizDomains, setQuizDomains] = useState<string[]>([])
  const [coachClient, setCoachClient] = useState('camille')
  const [tourDone, setTourDone] = useState(false)

  const value = useMemo<Store>(() => ({
    role, setRole, name, setName, guest, setGuest, tab, setTab,
    threads, setThreads, consent, setConsent, quizDomains, setQuizDomains,
    coachClient, setCoachClient, tourDone, setTourDone,
    reset: () => {
      setRole('coache'); setTab('hub'); setGuest(false); setName('Alex')
      setThreads(THREADS); setConsent(DEFAULT_CONSENT); setQuizDomains([])
    },
  }), [role, name, guest, tab, threads, consent, quizDomains, coachClient, tourDone])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}
