import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { EvaAvatar } from './bits'
import { StoreProvider, useStore } from './store'
import { Welcome, Quiz, QuizResults, ConsentScreen, Onboarding, Programme, ProgramAccess, GuestWelcome } from './entry'
import { Hub, Explorer, Ecosystem, Carnet, EvaPanel } from './screens1'
import { CoachScreen, Synergy, ChatScreen } from './screens2'
import { Profile, CoachSpace, type CoachTab, type VitrineSub } from './screens3'
import { COACHES, EXERCISES, type Coach, type Domain } from './data'

type Phase = 'welcome' | 'programme' | 'programLogin' | 'guestWelcome' | 'quiz' | 'results' | 'consent' | 'onboarding' | 'app'

function Shell() {
  const {
    role, setRole, setName, setGuest, tab, setTab,
    hideExplorer, setHideExplorer, program,
    setThreads, setQuizDomains, reset,
    setProgram, setConsent,
  } = useStore()
  const [phase, setPhase] = useState<Phase>('welcome')
  const [coachTab, setCoachTab] = useState<CoachTab>('bord')
  const [coachThreadId, setCoachThreadId] = useState<string | null>(null)
  const [coachVSub, setCoachVSub] = useState<VitrineSub>('business')
  const [coachView, setCoachView] = useState<Coach | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [savedResults, setSavedResults] = useState<Domain[]>([])
  const [eva, setEva] = useState<{ open: boolean; prefill?: string }>({ open: false })
  const openEva = (prefill?: string) => setEva({ open: true, prefill })

  useEffect(() => {
    /* thème sombre appliqué automatiquement, sans réglage utilisateur */
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark)
      const meta = document.querySelector('meta[name=theme-color]')
      if (meta) meta.setAttribute('content', dark ? '#101013' : '#F1EFF7')
    }
    apply(true)
  }, [])

  const openChat = (coachId: string) => {
    setThreads(ts => {
      const cleared = ts.map(t => t.coachId === coachId ? { ...t, unread: 0 } : t)
      if (ts.some(t => !t.group && t.coachId === coachId)) return cleared
      const c = COACHES.find(x => x.id === coachId)
      return [{
        id: 't-' + coachId,
        coachId,
        unread: 0,
        messages: [{
          from: 'coach' as const,
          text: `Bonjour, je suis ${c?.name ?? 'votre coach'}. Comment puis-je vous aider ?`,
          time: 'maintenant',
        }],
      }, ...cleared]
    })
    setCoachView(null)
    setChatId(coachId)
  }

  /* overlays */
  if (eva.open) return <EvaPanel role={role} prefill={eva.prefill} onClose={() => setEva({ open: false })} />

  const floatingEva = phase === 'app' ? (
    <button
      className="eva-fab"
      onClick={() => openEva()}
      aria-label="EVA"
      title="Interroger l'IA EVA"
    >
      <EvaAvatar size={42} />
    </button>
  ) : null

  if (exerciseId) return <><PlayerScreen id={exerciseId} onExit={() => setExerciseId(null)} />{floatingEva}</>
  if (chatId) return <><ChatScreen coachId={chatId} onBack={() => setChatId(null)} />{floatingEva}</>
  if (coachView) return (
    <>
      <CoachScreen
        coach={coachView}
        onBack={() => setCoachView(null)}
        onBooked={() => { setCoachView(null); if (phase !== 'app') enterApp('Alex', false) }}
        onChat={() => openChat(coachView.id)}
      />
      {floatingEva}
    </>
  )

  /* création de compte : quiz results → consent → onboarding */
  function enterApp(n: string, asGuest: boolean) {
    setName(n.charAt(0).toUpperCase() + n.slice(1))
    setGuest(asGuest)
    setRole('coache')
    setPhase('onboarding')
  }

  if (phase === 'welcome') return (
    <Welcome
      onAccount={() => setPhase('consent')}
      onProgramme={() => setPhase('programme')}
      onCoach={() => { setRole('coach'); setPhase('app'); setTab('hub') }}
    />
  )

  if (phase === 'programme') return (
    <Programme
      onBack={() => setPhase('welcome')}
      onLogin={() => setPhase('programLogin')}
      onGuest={() => { setGuest(true); setProgram(false); setHideExplorer(true); setPhase('guestWelcome') }}
    />
  )

  if (phase === 'guestWelcome') return (
    <GuestWelcome
      onEnter={() => setPhase('app')}
      onBack={() => setPhase('programme')}
    />
  )

  if (phase === 'programLogin') return (
    <ProgramAccess
      onBack={() => setPhase('programme')}
      onAccess={(n) => {
        setGuest(false)
        setHideExplorer(false)
        setProgram(true)
        /* programme encadré : toutes les options sont activées par défaut */
        setConsent({ account: true, health: true, journal: true, shareCoach: true })
        setName(n)
        setRole('coache')
        setTab('hub')
        setPhase('app')
      }}
    />
  )

  if (phase === 'quiz') return (
    <Quiz
      onExit={() => setPhase('welcome')}
      onDone={(domains) => { setQuizDomains(domains); setSavedResults(domains); setPhase('results') }}
    />
  )

  if (phase === 'results') return (
    <QuizResults
      domains={savedResults}
      onOpenCoach={c => setCoachView(c)}
      onCreateAccount={() => setPhase('consent')}
    />
  )

  if (phase === 'consent') return (
    <ConsentScreen
      onBack={() => setPhase('welcome')}
      onAccept={() => { setHideExplorer(false); enterApp('Alex', false) }}
    />
  )

  if (phase === 'onboarding') return <Onboarding onDone={() => setPhase('app')} />

  /* ---- APP ---- */
  if (role === 'coach') return (
    <div className="phone">
      <main className="tab-content" key={coachTab}>
        <CoachSpace
          coachTab={coachTab}
          onChangeCoachTab={setCoachTab}
          onExit={() => { setRole('coache'); reset() }}
          onOpenEva={openEva}
          activeThreadId={coachThreadId}
          onChangeThread={setCoachThreadId}
          vitrineSub={coachVSub}
          onChangeVitrineSub={setCoachVSub}
        />
      </main>
      {floatingEva}
      <nav className="tabbar coach-tabbar" aria-label="Navigation coach">
        {([
          { id: 'bord', icon: 'home', label: 'Home' },
          { id: 'vitrine', icon: 'store', label: 'Bord' },
          { id: 'clients', icon: 'chart', label: 'Suivi' },
          { id: 'messagerie', icon: 'chat', label: 'Messages' },
          { id: 'reglages', icon: 'gear', label: 'Réglages' },
        ] as const).map(t => (
          <button key={t.id} className={'tab' + (coachTab === t.id ? ' on' : '')} onClick={() => setCoachTab(t.id)} aria-label={t.label}>
            <span className="tab-icon">
              <Icon name={t.icon} size={20} filled={coachTab === t.id} />
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )

  return (
    <div className="phone">
      <main className="tab-content" key={tab}>
        {tab === 'hub' && (
          <Hub
            onOpenCoach={c => setCoachView(c)}
            onOpenChat={openChat}
            onOpenEva={openEva}
          />
        )}
        {tab === 'ecosystem' && (
          <Ecosystem
            onOpenCoach={c => setCoachView(c)}
            onOpenChat={openChat}
            onOpenEva={openEva}
          />
        )}
        {tab === 'explorer' && !hideExplorer && <Explorer onOpenCoach={c => setCoachView(c)} />}
        {tab === 'carnet' && <Carnet onOpenChat={openChat} onOpenEva={openEva} />}
        {tab === 'synergy' && <Synergy onOpenChat={openChat} />}
        {tab === 'profile' && <Profile onGoCoach={() => setRole('coach')} />}
      </main>

      {floatingEva}

      <nav className="tabbar" aria-label="Navigation principale">
        {([
          { id: 'hub', icon: 'home', label: 'Home' },
          ...(program ? [{ id: 'carnet' as const, icon: 'file' as const, label: 'Carnet' }] : []),
          { id: 'ecosystem', icon: 'grid', label: 'Écosystème' },
          ...(!program && !hideExplorer ? [{ id: 'explorer' as const, icon: 'compass' as const, label: 'Explorer' }] : []),
          { id: 'synergy', icon: 'chat', label: 'Message' },
          { id: 'profile', icon: 'user', label: 'Réglages' },
        ] as const).map(t => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)} aria-label={t.label}>
            <span className="tab-icon">
              <Icon name={t.icon} size={21} filled={tab === t.id} />
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* lectrice de respiration (inchangée, déplacée ici pour clarté) */
function PlayerScreen({ id, onExit }: { id: string; onExit: () => void }) {
  const [running, setRunning] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const ex = EXERCISES.find(e => e.id === id) ?? EXERCISES[0]
  const total = ex.duration * 60
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setElapsed(s => Math.min(s + 1, total)), 1000)
    return () => clearInterval(t)
  }, [running, total])

  const cycle = 19
  const inCycle = elapsed % cycle
  const phase = inCycle < 4 ? 'Inspirez' : inCycle < 11 ? 'Retenez' : 'Expirez'
  const frac = inCycle < 4 ? inCycle / 4 : inCycle < 11 ? (inCycle - 4) / 7 : (inCycle - 11) / 8
  const scale = phase === 'Inspirez' ? 0.65 + frac * 0.35 : phase === 'Retenez' ? 1 : 1 - frac * 0.35
  const mm = String(Math.floor((total - elapsed) / 60)).padStart(2, '0')
  const ss = String((total - elapsed) % 60).padStart(2, '0')
  const done = elapsed >= total

  return (
    <div className="player-screen">
      <header className="chat-head">
        <button className="icon-btn" onClick={onExit} aria-label="Fermer"><Icon name="close" size={19} /></button>
        <strong style={{ fontSize: 15.5 }}>{ex.title}</strong>
        <span className="dim" style={{ width: 40, textAlign: 'right' }}>{ex.duration} min</span>
      </header>
      <div className="player-body">
        <div className="breath-stage">
          <div className={'breath-orb' + (running ? '' : ' paused')} style={{ transform: `scale(${scale})` }} />
          <div className="breath-label">{done ? 'Terminé' : running ? phase : 'En pause'}</div>
          <div className="breath-count">{done ? 'Bravo ✦' : `${mm}:${ss}`}</div>
        </div>
        <div className="steps">
          {ex.steps.map((s, k) => (
            <div key={k} className={'step' + (elapsed > (k * total) / ex.steps.length ? ' past' : '')}>
              <span className="step-n">{k + 1}</span><p>{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="player-controls">
        <button className="round-btn big" onClick={() => setRunning(r => !r)}>
          <Icon name={running ? 'pause' : 'play'} size={20} />
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
