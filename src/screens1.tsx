import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar } from './bits'
import { useStore } from './store'
import {
  COACHES, SESSIONS, EXERCISES, INTENTIONS, QUOTES,
  type Coach,
} from './data'

function todayLabel() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bel après-midi'
  return 'Bonsoir'
}

/* =====================================================
   HUB — dashboard holistique + tour + journaling vocal
   ===================================================== */

const MOODS = [
  { emoji: '☀️', label: 'Lumineux' },
  { emoji: '🌤️', label: 'Correct' },
  { emoji: '🌫️', label: 'Brouillard' },
  { emoji: '🌧️', label: 'Lourd' },
  { emoji: '⛈️', label: 'Orage' },
]

const TOUR_STEPS = [
  { target: 'intent', title: 'Votre intention du jour', body: 'Une micro-pratique choisie pour vous, chaque matin.', before: { top: '25%', left: '18%', width: '64%' } },
  { target: 'balance', title: 'Votre équilibre', body: 'Énergie, sommeil, mouvement — sans surcharge.', before: { top: '42%', left: '12%', width: '76%' } },
  { target: 'journal', title: 'Journal privé', body: 'Écrivez ou dictez. L’IA transcrit, vous décidez qui voit quoi.', before: { top: '52%', left: '10%', width: '80%' } },
  { target: 'tabbar', title: 'Quatre espaces', body: 'Hub, Explorer, Synergy et Profil. C’est tout.', before: undefined },
]

export function Tour({ step, onNext, onEnd }: { step: number; onNext: () => void; onEnd: () => void }) {
  const s = TOUR_STEPS[step]
  const last = step === TOUR_STEPS.length - 1
  return (
    <div className="tour-layer" onClick={onEnd}>
      {s.before && <div className="tour-spot" style={s.before} />}
      <div className={'tour-tip ' + (s.target === 'tabbar' ? 'bottom' : '')} onClick={e => e.stopPropagation()}>
        <div className="tour-kicker">ÉTAPE {step + 1} / {TOUR_STEPS.length}</div>
        <strong>{s.title}</strong>
        <p>{s.body}</p>
        <div className="row between" style={{ marginTop: 10 }}>
          <button className="link-btn" onClick={onEnd}>Passer</button>
          <button className="btn btn-primary sm" onClick={onNext}>
            <span>{last ? 'Terminé' : 'Suivant'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function Hub({ onOpenExercise, onOpenCoach, onOpenChat, replayTourSignal }: {
  onOpenExercise: (id: string) => void
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  replayTourSignal?: boolean
}) {
  const { name, guest, tourDone, setTourDone, consent } = useStore()
  const [tourStep, setTourStep] = useState<number | null>(tourDone ? null : 0)
  useEffect(() => { if (replayTourSignal !== undefined) setTourStep(tourDone ? null : 0) }, [replayTourSignal])
  const [mood, setMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [intention] = useState(() => INTENTIONS[Math.floor(Math.random() * INTENTIONS.length)])
  const bars = [42, 55, 38, 62, 48, 70, 58]

  /* dictée vocale simulée avec transcription IA */
  const [recording, setRecording] = useState(false)
  const [secs, setSecs] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const toggleRec = () => {
    if (recording) {
      setRecording(false)
      if (timer.current) clearInterval(timer.current)
      if (secs > 0) {
        setTranscribing(true)
        setTimeout(() => {
          setTranscribing(false)
          setTranscript(t =>
            (t ? t + ' ' : '') +
            (secs < 3
              ? 'Aujourd’hui, je me sens plus calme qu’hier.'
              : 'Aujourd’hui je me sens plus calme. La respiration de ce matin m’a aidé à poser les choses avant une journée chargée. J’aimerais garder ce rythme.')
          )
        }, 1400)
      }
      setSecs(0)
    } else {
      setRecording(true)
      timer.current = setInterval(() => setSecs(s => s + 1), 1000)
    }
  }
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const quote = QUOTES[quoteIdx]

  return (
    <div className="tab-page" data-zone="hub">
      <header className="page-head">
        <div>
          <div className="date-line">{todayLabel()}</div>
          <h1>{greeting()}, {guest ? 'vous' : name} <span className="spark"><Icon name="sparkle" size={15} /></span></h1>
          <p>Votre espace pour avancer, un jour à la fois.</p>
        </div>
        <button className="icon-btn" aria-label="Notifications"><Icon name="bell" size={19} /></button>
      </header>

      <section className="card card-intent" data-zone="intent">
        <div className="card-kicker"><Icon name="sparkle" size={13} /> VOTRE INTENTION DU JOUR</div>
        <h2>{intention.title}</h2>
        <p>{intention.sub}</p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => onOpenExercise(intention.ex)}>
            <span>Commencer</span><Icon name="arrow-right" size={16} />
          </button>
          <div className="meta-chip"><Icon name="clock" size={13} /> {EXERCISES.find(e => e.id === intention.ex)?.duration} min</div>
        </div>
      </section>

      <section className="card" data-zone="balance">
        <div className="card-kicker"><Icon name="activity" size={13} /> VOTRE ÉQUILIBRE</div>
        <h2>Les petits signaux comptent.</h2>
        <div className="metrics">
          <div className="metric">
            <div className="metric-top"><span>Énergie</span><span className="delta up">+8%</span></div>
            <div className="metric-val">78<span className="of">/100</span></div>
            <div className="meter"><span style={{ width: '78%' }} /></div>
          </div>
          <div className="metric">
            <div className="metric-top"><span>Sommeil</span><span className="delta">stable</span></div>
            <div className="metric-val sm">7h 42</div>
            <div className="meter"><span style={{ width: '64%' }} /></div>
          </div>
          <div className="metric">
            <div className="metric-top"><span>Mouvement</span><span className="delta up">+12%</span></div>
            <div className="metric-val sm">4 280</div>
            <div className="meter"><span style={{ width: '71%' }} /></div>
          </div>
        </div>
        <div className="sparkline" aria-hidden>
          {bars.map((b, k) => <span key={k} style={{ height: `${b}%` }} />)}
        </div>
        <div className="axis"><span>Lun</span><span>Dim</span></div>
      </section>

      <section className="card">
        <div className="card-kicker"><Icon name="calendar" size={13} /> À VENIR</div>
        <h2>Vos prochains rendez-vous</h2>
        <div className="sessions">
          {SESSIONS.map(s => {
            const c = COACHES.find(x => x.id === s.coachId)!
            return (
              <button className="session" key={s.id} onClick={() => onOpenCoach(c)}>
                <div className="date-box"><strong>{s.day}</strong><span>{s.month}</span></div>
                <div className="session-info">
                  <div className="session-time"><Icon name="clock" size={12} /> {s.time} · {s.mode}</div>
                  <strong>{c.name}</strong>
                  <span>{s.title} · {s.duration} min</span>
                </div>
                <span className="chev"><Icon name="chevron-right" size={15} /></span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="card card-quote">
        <div className="quote-mark">“</div>
        <p key={quoteIdx}>{quote.text}</p>
        <div className="quote-src">— {quote.src}</div>
        <button className="quote-refresh" onClick={() => setQuoteIdx((quoteIdx + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length)} aria-label="Nouvelle citation">
          <Icon name="refresh" size={15} />
        </button>
      </section>

      <section className="card" data-zone="journal">
        <div className="card-kicker"><Icon name="sparkle" size={13} /> JOURNAL</div>
        <h2>Comment vous sentez-vous ?</h2>
        <div className="moods">
          {MOODS.map((m, k) => (
            <button key={k} className={'mood' + (mood === k ? ' on' : '')} onClick={() => setMood(k)}>
              <span className="mood-emoji">{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
        </div>

        {transcript && (
          <div className="transcript">
            <div className="transcript-head"><Icon name="sparkle" size={12} /> Transcription IA</div>
            <p>{transcript}</p>
            {consent.shareCoach ? (
              <button className="btn btn-soft sm" onClick={() => onOpenChat('camille')}>
                <Icon name="users" size={15} /><span>Partager avec Camille</span>
              </button>
            ) : (
              <div className="transcript-lock"><Icon name="lock" size={13} /> Partage coach désactivé — réglable dans Confidentialité.</div>
            )}
          </div>
        )}

        <textarea
          className="journal"
          rows={3}
          placeholder="Écrivez, ou dictez…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <div className="row">
          <button className={'mic-btn' + (recording ? ' rec' : '')} onClick={toggleRec} aria-label="Dicter">
            <Icon name={recording ? 'pause' : 'mic'} size={19} />
            {recording && <span className="mic-wave"><i /><i /><i /></span>}
            {recording && <em>{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</em>}
          </button>
          {transcribing
            ? <span className="ai-status"><i className="dot pulsing" /> Transcription IA…</span>
            : recording
              ? <span className="ai-status">J’écoute…</span>
              : null}
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => { setSaved(true); setNote(''); setTranscript(''); setTimeout(() => setSaved(false), 1600) }}>
            <Icon name={saved ? 'check' : 'send'} size={15} />
            <span>{saved ? 'Enregistré' : 'Enregistrer'}</span>
          </button>
        </div>
        <div className="privacy"><Icon name="shield" size={13} /> {consent.shareCoach ? 'Partage sélectif activé avec vos coachs.' : 'Privé — vous seul décidez qui voit vos notes.'}</div>
      </section>

      <section className="card card-grad">
        <div className="card-kicker light"><Icon name="activity" size={13} /> INSIGHT DE LA SEMAINE</div>
        <h2>Votre régularité monte.</h2>
        <p className="light-dim">+8% d’énergie moyenne et deux séances tenues cette semaine. Continuez exactement comme ça.</p>
        <button className="btn btn-inverse" onClick={() => onOpenChat('camille')}>
          <span>En parler à Camille</span><Icon name="chat" size={15} />
        </button>
      </section>

      <footer className="tab-footer">Evol · conçu pour respirer</footer>

      {tourStep !== null && (
        <Tour
          step={tourStep}
          onNext={() => (tourStep >= TOUR_STEPS.length - 1 ? (setTourDone(true), setTourStep(null)) : setTourStep(tourStep + 1))}
          onEnd={() => { setTourDone(true); setTourStep(null) }}
        />
      )}
    </div>
  )
}

/* =====================================================
   EXPLORER — recherche + filtres
   ===================================================== */

export function Explorer({ onOpenCoach }: { onOpenCoach: (c: Coach) => void }) {
  const { quizDomains } = useStore()
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [fav, setFav] = useState<string[]>([])
  const specialties = ['Stress', 'Nutrition', 'Mobilité', 'Anxiété']

  const results = useMemo(() => COACHES.filter(c => {
    const ql = q.toLowerCase()
    const matchQ = !ql || c.name.toLowerCase().includes(ql) || c.role.toLowerCase().includes(ql) || c.tags.some(t => t.toLowerCase().includes(ql))
    const matchS = !specialty || c.tags.includes(specialty)
    const matchP = maxPrice == null || c.price <= maxPrice
    const matchM = !mode || c.mode === mode || (mode === 'Hybride')
    return matchQ && matchS && matchP && matchM
  }), [q, specialty, maxPrice, mode])

  return (
    <div className="tab-page">
      <header className="page-head">
        <div>
          <div className="date-line">EXPLORER</div>
          <h1>Les bonnes personnes<br />au bon moment.</h1>
          <p>Des accompagnants vérifiés, dans toutes les dimensions de votre vie.</p>
        </div>
      </header>

      <div className="search">
        <Icon name="search" size={17} />
        <input placeholder="Domaine, prénom, spécialité…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="chip-row">
        {specialties.map(s => (
          <button key={s} className={'chip' + (specialty === s ? ' on' : '')} onClick={() => setSpecialty(specialty === s ? null : s)}>{s}</button>
        ))}
        <button className={'chip' + (maxPrice === 70 ? ' on' : '')} onClick={() => setMaxPrice(maxPrice === 70 ? null : 70)}>≤ 70 €</button>
        <button className={'chip' + (mode === 'Présentiel' ? ' on' : '')} onClick={() => setMode(mode === 'Présentiel' ? null : 'Présentiel')}>Présentiel</button>
        <button className={'chip' + (mode === 'À distance' ? ' on' : '')} onClick={() => setMode(mode === 'À distance' ? null : 'À distance')}>Distanciel</button>
      </div>

      <div className="count-line">{results.length} accompagnant{results.length > 1 ? 's' : ''}{specialty || maxPrice || mode ? ' · filtres actifs' : ''}</div>

      <div className="coach-list">
        {results.map(c => (
          <article className="card coach-card" key={c.id}>
            {quizDomains.some(d => c.domains.includes(d as any)) && <span className="match">Match</span>}
            <button className="fav" aria-label="Favori" onClick={() => setFav(f => f.includes(c.id) ? f.filter(x => x !== c.id) : [...f, c.id])}>
              <Icon name="heart" size={16} filled={fav.includes(c.id)} />
            </button>
            <div className="coach-top" onClick={() => onOpenCoach(c)}>
              <Avatar hue={c.hue} initials={c.initials} size={52} />
              <div className="coach-id">
                <strong>{c.name}</strong>
                <span>{c.role}</span>
                <div className="coach-meta">
                  <span className="rating"><Icon name="star" size={12} /> {c.rating}</span>
                  <span><Icon name="location" size={12} /> {c.city} · {c.mode}</span>
                </div>
              </div>
            </div>
            <div className="tag-row">{c.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
            <div className="coach-bottom">
              <strong>{c.price} € <em>/ séance</em></strong>
              <button className="btn btn-soft sm" onClick={() => onOpenCoach(c)}>
                <span>Voir le profil</span><Icon name="chevron-right" size={14} />
              </button>
            </div>
          </article>
        ))}
        {results.length === 0 && (
          <div className="empty">
            <Icon name="compass" size={30} />
            <p>Aucun accompagnant ne correspond.<br />Élargissez vos filtres.</p>
          </div>
        )}
      </div>

      <footer className="tab-footer">Coachs vérifiés et certifiés · paiement sécurisé</footer>
    </div>
  )
}
