import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { StoreProvider, useStore } from './store'
import { Splash, Welcome, Quiz, QuizResults, ConsentScreen, Onboarding } from './entry'
import { Hub, Explorer } from './screens1'
import { CoachScreen, Synergy, ChatScreen } from './screens2'
import { Profile, CoachSpace } from './screens3'
import { EXERCISES, type Coach, type Domain } from './data'

type Phase = 'splash' | 'welcome' | 'quiz' | 'results' | 'consent' | 'onboarding' | 'app'

function Shell() {
  const {
    role, setRole, setName, setGuest, tab, setTab,
    setThreads, setQuizDomains, setTourDone, reset,
  } = useStore()
  const [phase, setPhase] = useState<Phase>('splash')
  const [coachView, setCoachView] = useState<Coach | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [replayTour, setReplayTour] = useState(false)
  const [savedResults, setSavedResults] = useState<Domain[]>([])

  useEffect(() => {
    const t = setTimeout(() => setPhase('welcome'), 1400)
    return () => clearTimeout(t)
  }, [])

  const openChat = (coachId: string) => {
    setThreads(ts => ts.map(t => t.coachId === coachId ? { ...t, unread: 0 } : t))
    setCoachView(null)
    setChatId(coachId)
  }

  /* overlays */
  if (exerciseId) return <PlayerScreen id={exerciseId} onExit={() => setExerciseId(null)} />
  if (chatId) return <ChatScreen coachId={chatId} onBack={() => setChatId(null)} />
  if (coachView) return (
    <CoachScreen
      coach={coachView}
      onBack={() => setCoachView(null)}
      onBooked={() => { setCoachView(null); if (phase !== 'app') enterApp('Alex', false) }}
      onChat={() => openChat(coachView.id)}
    />
  )

  /* création de compte : quiz results → consent → onboarding */
  function enterApp(n: string, asGuest: boolean) {
    setName(n.charAt(0).toUpperCase() + n.slice(1))
    setGuest(asGuest)
    setRole('coache')
    setPhase('onboarding')
  }

  if (phase === 'splash') return <Splash />

  if (phase === 'welcome') return (
    <Welcome
      onAssessment={() => setPhase('quiz')}
      onAccount={() => setPhase('consent')}
      onGuest={() => { setGuest(true); setPhase('onboarding') }}
      onCoach={() => { setRole('coach'); setPhase('app'); setTab('hub') }}
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
      onGuest={() => { setGuest(true); setPhase('onboarding') }}
    />
  )

  if (phase === 'consent') return (
    <ConsentScreen
      onBack={() => setPhase('welcome')}
      onAccept={() => enterApp('Alex', false)}
    />
  )

  if (phase === 'onboarding') return <Onboarding onDone={() => { setPhase('app'); setTourDone(false) }} />

  /* ---- APP ---- */
  if (role === 'coach') return (
    <div className="phone">
      <main className="tab-content" key="coach"><CoachSpace onExit={() => { setRole('coache'); reset() }} /></main>
    </div>
  )

  return (
    <div className="phone">
      <main className="tab-content" key={tab + String(replayTour)}>
        {tab === 'hub' && (
          <Hub
            key={'hub' + replayTour}
            onOpenExercise={setExerciseId}
            onOpenCoach={c => setCoachView(c)}
            onOpenChat={openChat}
            replayTourSignal={replayTour}
          />
        )}
        {tab === 'explorer' && <Explorer onOpenCoach={c => setCoachView(c)} />}
        {tab === 'synergy' && <Synergy onOpenChat={openChat} />}
        {tab === 'profile' && <Profile onReplayTour={() => { setTab('hub'); setTourDone(false); setReplayTour(r => !r) }} onGoCoach={() => setRole('coach')} />}
      </main>

      <nav className="tabbar" aria-label="Navigation principale">
        {([
          { id: 'hub', icon: 'home', label: 'Hub' },
          { id: 'explorer', icon: 'compass', label: 'Explorer' },
          { id: 'synergy', icon: 'chat', label: 'Synergy' },
          { id: 'profile', icon: 'user', label: 'Profil' },
        ] as const).map(t => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)} aria-label={t.label}>
            <span className="tab-icon">
              <Icon name={t.icon} size={22} filled={tab === t.id} />
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
