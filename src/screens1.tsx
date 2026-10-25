import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar, EvaAvatar } from './bits'
import { useStore } from './store'
import {
  COACHES, SESSIONS, EXERCISES, QUOTES, IMAGES, EVENTS,
  EVA_SESSION_REPORTS, INITIAL_SHARED_DOCS, ECOSYSTEM_GOALS,
  type Coach, type SharedDocument, type CommunityEvent,
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
   HUB — dashboard holistique + radar cliquable + coachs adaptatifs
   ===================================================== */

export const RADAR = [
  { axis: 'Corps', v: 72, delta: '+6%', coachId: 'marc', insight: 'Mobilité scapulaire en progrès. 8 420 pas quotidiens maintenus.', rec: 'Séance mobilité 12 min avec Marc' },
  { axis: 'Mind', v: 55, delta: '+4%', coachId: 'elodie', insight: 'Charge cognitive modérée en fin de journée. Clarté matinale stable.', rec: 'Cohérence cardiaque 5 min à 18h30' },
  { axis: 'Social', v: 80, delta: '+9%', coachId: 'ines', insight: 'Interactions professionnelles fluides et limites mieux posées.', rec: 'Maintenir le créneau sans réunion du jeudi' },
  { axis: 'Énergie', v: 38, delta: '-8%', coachId: 'nora', insight: 'Creux énergétique vers 15h lié aux nuits écourtées cette semaine.', rec: 'Protocole hydratation & petit-déjeuner protéiné' },
  { axis: 'Pro', v: 60, delta: '+3%', coachId: 'ines', insight: 'Focus profond tenu sur 3 matinées, dispersion en fin d’après-midi.', rec: 'Bloc deep work 90 min avant 11h' },
  { axis: 'Sommeil', v: 34, delta: '-11%', coachId: 'camille', insight: 'Endormissement retardé et réveil léger vers 3h. Priorité n°1.', rec: 'Respiration 4-7-8 au coucher avec Camille' },
]

export function RadarChart({
  scores,
  selectedAxis,
  onSelectAxis,
  expanded = false,
}: {
  scores: typeof RADAR
  selectedAxis: string | null
  onSelectAxis: (axis: string) => void
  expanded?: boolean
}) {
  const cx = 150, cy = 136, R = expanded ? 96 : 88
  const n = scores.length
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  }
  const ring = (r: number) => scores.map((_, i) => pt(i, r).join(',')).join(' ')
  const shape = scores.map((s, i) => {
    const boost = selectedAxis === s.axis ? Math.min(100, s.v + 5) : s.v
    return pt(i, (boost / 100) * R).join(',')
  }).join(' ')

  return (
    <div className={'radar-wrap' + (expanded ? ' expanded' : '')}>
      <svg viewBox="0 0 300 280" className="radar-svg" role="group" aria-label="Radar de vie interactif">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1525FF" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#6D3EAD" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1525FF" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={ring(R * f)} className="radar-ring" />)}
        {scores.map((s, i) => {
          const [x, y] = pt(i, R)
          const isSel = selectedAxis === s.axis
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className={'radar-spoke' + (isSel ? ' active' : '')} />
        })}
        <polygon points={shape} className="radar-area" />
        <polygon points={shape} className="radar-data" />
        {scores.map((s, i) => {
          const boost = selectedAxis === s.axis ? Math.min(100, s.v + 5) : s.v
          const [x, y] = pt(i, (boost / 100) * R)
          const [lx, ly] = pt(i, R + 27)
          const isSel = selectedAxis === s.axis
          return (
            <g
              key={s.axis}
              className={'radar-node' + (isSel ? ' active' : '')}
              onClick={e => { e.stopPropagation(); onSelectAxis(s.axis) }}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={isSel ? 13 : 9} className="radar-dot-halo" />
              <circle cx={x} cy={y} r={isSel ? 5.5 : 4} className="radar-dot" />
              <circle cx={lx} cy={ly} r={22} fill="transparent" />
              <text x={lx} y={ly} className={'radar-label' + (isSel ? ' active' : '')} textAnchor="middle" dominantBaseline="middle">
                {s.axis}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function Hub({ onOpenExercise, onOpenCoach, onOpenChat, onOpenEva }: {
  onOpenExercise: (id: string) => void
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
}) {
  const { name, followedCoachIds, toggleFollowCoach } = useStore()
  void onOpenExercise; void onOpenEva
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [pickingCoaches, setPickingCoaches] = useState(false)

  const quote = QUOTES[quoteIdx]
  const followedCoaches = useMemo(
    () => followedCoachIds.map(id => COACHES.find(c => c.id === id)!).filter(Boolean),
    [followedCoachIds]
  )
  const layoutMode = followedCoaches.length === 1 ? 'mode-1' : followedCoaches.length === 2 ? 'mode-2' : followedCoaches.length === 3 ? 'mode-3' : 'mode-multi'

  return (
    <div className="tab-page" data-zone="hub">
      <header className="page-head">
        <div>
          <div className="date-line">{todayLabel()}</div>
          <h1>{greeting()}, <em className="hello-name">{name}</em></h1>
          <p>Votre espace pour avancer, un jour à la fois.</p>
        </div>
        <div className="head-user">
          <span className="user-presence" aria-hidden />
          <Avatar hue="152" initials={name.slice(0, 1).toUpperCase()} photo={IMAGES.userPhoto} size={44} ring />
        </div>
      </header>

      <section className="card card-quote">
        <div className="quote-mark">“</div>
        <p key={quoteIdx}>{quote.text}</p>
        <div className="quote-src">— {quote.src}</div>
        <button className="quote-refresh" onClick={() => setQuoteIdx((quoteIdx + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length)} aria-label="Nouvelle citation">
          <Icon name="refresh" size={15} />
        </button>
      </section>

      <section className="card" data-zone="adaptive-coaches">
        <div className="row between" style={{ marginTop: 0, marginBottom: 8 }}>
          <div className="card-kicker" style={{ margin: 0 }}><Icon name="users" size={13} /> MON ÉQUIPE D'EXPERTS</div>
          <button className="btn btn-soft sm" style={{ padding: '6px 12px', fontSize: 11.5 }} onClick={() => setPickingCoaches(v => !v)}>
            <Icon name={pickingCoaches ? 'check' : 'plus'} size={13} />
            <span>{pickingCoaches ? 'Terminé' : `Choisir mes coachs (${followedCoaches.length})`}</span>
          </button>
        </div>
        <div className="radar-head" style={{ marginBottom: 12 }}>
          <h2>Vos coachs suivis</h2>
          <span className="dim" style={{ fontSize: 11.5 }}>
            {followedCoaches.length === 1
              ? '1 expert · suivi focus'
              : followedCoaches.length === 2
                ? '2 experts · duo coordonné'
                : `${followedCoaches.length} experts · vue condensée`}
          </span>
        </div>

        {pickingCoaches && (
          <div className="coach-selector-drawer glass-lite">
            <span className="dim" style={{ fontSize: 11.5, display: 'block', marginBottom: 8 }}>
              Sélectionnez ou retirez des experts : le Hub et la messagerie s'adaptent instantanément.
            </span>
            <div className="coach-selector-pills">
              {COACHES.map(c => {
                const on = followedCoachIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    className={'coach-pick-chip' + (on ? ' on' : '')}
                    onClick={() => toggleFollowCoach(c.id)}
                  >
                    <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={22} />
                    <span>{c.name.split(' ')[0]}</span>
                    <Icon name={on ? 'check' : 'plus'} size={12} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className={`adaptive-coach-grid ${layoutMode}`} key={followedCoaches.length}>
          {followedCoaches.map(c => (
            <div key={c.id} className="adaptive-coach-tile glass-lite" onClick={() => onOpenCoach(c)}>
              <div className="act-top">
                <Avatar
                  hue={c.hue}
                  initials={c.initials}
                  photo={c.photo}
                  size={followedCoaches.length === 1 ? 56 : followedCoaches.length <= 3 ? 44 : 36}
                  ring
                />
                <div className="act-info">
                  <strong>{followedCoaches.length >= 4 ? c.name.split(' ')[0] : c.name}</strong>
                  <span>{c.role}</span>
                </div>
                {followedCoaches.length <= 2 && (
                  <button
                    className="round-btn sm"
                    onClick={e => { e.stopPropagation(); onOpenChat(c.id) }}
                    aria-label={`Message à ${c.name}`}
                  >
                    <Icon name="chat" size={16} />
                  </button>
                )}
              </div>
              {followedCoaches.length === 1 && (
                <div className="act-spotlight">
                  <div className="act-tags">
                    {c.tags.map(t => <span key={t} className="tag glass-lite">{t}</span>)}
                  </div>
                  <div className="act-next">
                    <span><Icon name="calendar" size={12} /> Prochain créneau : {c.slots[0]}</span>
                    <span className="act-cta">Voir le suivi <Icon name="chevron-right" size={13} /></span>
                  </div>
                </div>
              )}
              {(followedCoaches.length === 2 || followedCoaches.length === 3) && (
                <div className="act-meta">
                  <span className="tag mini">{c.domains[0]}</span>
                  <span className="act-slot"><Icon name="clock" size={11} /> {c.slots[0]}</span>
                </div>
              )}
              {followedCoaches.length >= 4 && (
                <div className="act-compact-foot">
                  <span className="tag mini">{c.tags[0]}</span>
                  <button
                    className="icon-btn"
                    style={{ width: 26, height: 26 }}
                    onClick={e => { e.stopPropagation(); onOpenChat(c.id) }}
                    aria-label={`Message à ${c.name}`}
                  >
                    <Icon name="chat" size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-kicker"><Icon name="calendar" size={13} /> À VENIR</div>
        <h2>Vos prochains rendez-vous</h2>
        <div className="sessions">
          {SESSIONS.filter(s => followedCoachIds.includes(s.coachId) || followedCoachIds.length > 0).map(s => {
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
    </div>
  )
}

/* =====================================================
   EXPLORER — recherche + filtres
   ===================================================== */

export function Explorer({ onOpenCoach }: { onOpenCoach: (c: Coach) => void }) {
  const { quizDomains, followedCoachIds, toggleFollowCoach } = useStore()
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [event, setEvent] = useState<CommunityEvent | null>(null)
  const [joinedEvents, setJoinedEvents] = useState<string[]>([])
  const specialties = ['Stress', 'Nutrition', 'Mobilité', 'Anxiété']

  const results = useMemo(() => COACHES.filter(c => {
    const ql = q.toLowerCase()
    const matchQ = !ql || c.name.toLowerCase().includes(ql) || c.role.toLowerCase().includes(ql) || c.tags.some(t => t.toLowerCase().includes(ql))
    const matchS = !specialty || c.tags.includes(specialty)
    const matchP = maxPrice == null || c.price <= maxPrice
    const matchM = !mode || c.mode === mode || (mode === 'Hybride')
    return matchQ && matchS && matchP && matchM
  }), [q, specialty, maxPrice, mode])

  if (event) {
    return (
      <EventScreen
        ev={event}
        joined={joinedEvents.includes(event.id)}
        onJoin={() => setJoinedEvents(js => js.includes(event.id) ? js.filter(x => x !== event.id) : [...js, event.id])}
        onBack={() => setEvent(null)}
      />
    )
  }

  return (
    <div className="tab-page">
      <header className="page-head">
        <div>
          <div className="date-line">EXPLORER</div>
          <h1>Les bonnes personnes<br />au bon moment.</h1>
          <p>Choisissez vos coachs : votre Hub et votre messagerie s'adaptent automatiquement ({followedCoachIds.length} suivi{followedCoachIds.length > 1 ? 's' : ''}).</p>
        </div>
      </header>

      <div className="search glass-lite">
        <Icon name="search" size={17} />
        <input placeholder="Domaine, prénom, spécialité…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="chip-row">
        {specialties.map(s => (
          <button key={s} className={'chip glass-lite' + (specialty === s ? ' on' : '')} onClick={() => setSpecialty(specialty === s ? null : s)}>{s}</button>
        ))}
        <button className={'chip glass-lite' + (maxPrice === 70 ? ' on' : '')} onClick={() => setMaxPrice(maxPrice === 70 ? null : 70)}>≤ 70 €</button>
        <button className={'chip glass-lite' + (mode === 'Présentiel' ? ' on' : '')} onClick={() => setMode(mode === 'Présentiel' ? null : 'Présentiel')}>Présentiel</button>
        <button className={'chip glass-lite' + (mode === 'À distance' ? ' on' : '')} onClick={() => setMode(mode === 'À distance' ? null : 'À distance')}>Distanciel</button>
      </div>

      {/* accès rapide façon rangée d'avatars */}
      <div className="quick-row">
        {COACHES.map(c => (
          <button key={c.id} className="quick-av" onClick={() => onOpenCoach(c)}>
            <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={58} ring={followedCoachIds.includes(c.id)} />
            <span>{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <section className="card">
        <div className="card-kicker"><Icon name="calendar" size={13} /> PROCHAINS ÉVÈNEMENTS</div>
        <div className="row between" style={{ marginTop: 0, marginBottom: 4 }}>
          <h2>Vivre Evol ensemble</h2>
          <span className="tag mini">Communauté</span>
        </div>
        <p style={{ fontSize: 12.5, marginBottom: 10 }}>Ateliers et rencontres en visio ou en présentiel, avec les autres élèves.</p>
        <div className="sessions">
          {EVENTS.map(ev => (
            <button className="session event-row" key={ev.id} onClick={() => setEvent(ev)} aria-label={`Voir l'évènement ${ev.title}`}>
              <div className="date-box"><strong>{ev.day}</strong><span>{ev.month}</span></div>
              <div className="session-info">
                <div className="session-time">
                  <Icon name={ev.mode === 'Visio' ? 'video' : 'location'} size={12} /> {ev.time} · {ev.mode}
                </div>
                <strong>{ev.title}</strong>
                <span>{ev.host} · {ev.place} · {ev.seats} places</span>
              </div>
              <span className={'event-join' + (joinedEvents.includes(ev.id) ? ' on' : '')}>
                {joinedEvents.includes(ev.id) ? 'Inscrit' : 'Rejoindre'}
                <Icon name="chevron-right" size={13} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="count-line">{results.length} accompagnant{results.length > 1 ? 's' : ''} · {followedCoachIds.length} dans votre équipe</div>

      <div className="coach-list">
        {results.map(c => {
          const isFollowed = followedCoachIds.includes(c.id)
          return (
            <article className="coach-line" key={c.id} onClick={() => onOpenCoach(c)}>
              <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={54} ring={isFollowed} />
              <div className="coach-id">
                <strong>{c.name}{quizDomains.some(d => c.domains.includes(d as any)) && <em className="match-dot" />}</strong>
                <span>{c.role}</span>
                <div className="coach-meta">
                  <span className="rating"><Icon name="star" size={12} /> {c.rating}</span>
                  <span><Icon name="location" size={12} /> {c.city} · {c.mode}</span>
                </div>
              </div>
              <button
                className={'btn sm ' + (isFollowed ? 'btn-soft' : 'btn-primary')}
                style={{ padding: '7px 12px', fontSize: 11.5 }}
                aria-label={isFollowed ? `Retirer ${c.name}` : `Choisir ${c.name}`}
                onClick={e => { e.stopPropagation(); toggleFollowCoach(c.id) }}
              >
                <Icon name={isFollowed ? 'check' : 'plus'} size={13} />
                <span>{isFollowed ? 'Suivi' : 'Choisir'}</span>
              </button>
              <strong className="price-line-s">{c.price} €</strong>
            </article>
          )
        })}
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

/* =====================================================
   ÉVÈNEMENT COMMUNAUTÉ — page dédiée
   ===================================================== */

function EventScreen({ ev, joined, onJoin, onBack }: {
  ev: CommunityEvent
  joined: boolean
  onJoin: () => void
  onBack: () => void
}) {
  return (
    <div className="event-screen">
      <header className="chat-head">
        <button className="icon-btn" onClick={onBack} aria-label="Retour aux évènements">
          <Icon name="chevron-left" size={19} />
        </button>
        <strong style={{ fontSize: 15 }}>Évènement</strong>
        <span className="tag mini">{ev.tag}</span>
      </header>

      <div className="event-hero">
        <span className="event-mode">
          <Icon name={ev.mode === 'Visio' ? 'video' : 'location'} size={13} /> {ev.mode}
        </span>
        <h1>{ev.title}</h1>
        <div className="event-when">
          <strong>{ev.day} {ev.month}</strong>
          <span>· {ev.time}</span>
        </div>
      </div>

      <div className="event-body">
        <section className="card">
          <div className="client-lines">
            <div className="client-line"><Icon name="user" size={14} /><span>Animé par {ev.host}</span></div>
            <div className="client-line"><Icon name={ev.mode === 'Visio' ? 'video' : 'location'} size={14} /><span>{ev.place}</span></div>
            <div className="client-line"><Icon name="users" size={14} /><span>{ev.seats} places · élèves Evol</span></div>
          </div>
          <p style={{ marginTop: 12 }}>{ev.desc}</p>
        </section>

        <section className="card">
          <div className="card-kicker"><Icon name="sparkle" size={13} /> POURQUOI Y ALLER</div>
          <p>Un temps collectif pour pratiquer avec vos coachs et rencontrer les autres élèves — en visio ou en présentiel. EVA ajoute l’évènement à votre agenda dès l’inscription.</p>
        </section>

        <div className="privacy">
          <Icon name="shield" size={13} /> Réservé aux élèves Evol · annulation libre jusqu’à 24 h avant.
        </div>
      </div>

      <div className="event-cta">
        <button className={'btn ' + (joined ? 'btn-soft' : 'btn-primary')} onClick={onJoin}>
          <Icon name={joined ? 'check' : 'plus'} size={16} />
          <span>{joined ? 'Inscrit · ajouté à mon agenda' : 'Je participe'}</span>
        </button>
      </div>
    </div>
  )
}

/* =====================================================
   MON ÉCOSYSTÈME — espace centralisé en widgets/grille
   ===================================================== */

export function Ecosystem({ onOpenExercise, onOpenCoach, onOpenChat, onOpenEva }: {
  onOpenExercise: (id: string) => void
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
}) {
  const { consent, selectedRadarAxis, setSelectedRadarAxis, followedCoachIds } = useStore()
  const [section, setSection] = useState<'radar' | 'sante' | 'objectifs' | 'seances' | 'partage' | 'outils'>('radar')
  const [steps, setSteps] = useState(8420)
  const [bpm, setBpm] = useState(58)
  const [measuring, setMeasuring] = useState(false)
  const [evaHealthAnalysis, setEvaHealthAnalysis] = useState<string | null>(
    'Votre pouls au repos (58 bpm) et vos 8 420 pas montrent une excellente récupération cardiovasculaire. EVA suggère de maintenir la séance de mobilité douce avec Marc et d’avancer le coucher de 20 min.'
  )
  const [analyzingHealth, setAnalyzingHealth] = useState(false)

  const [docs, setDocs] = useState<SharedDocument[]>(INITIAL_SHARED_DOCS)
  const [docTitle, setDocTitle] = useState('')
  const [docCoach, setDocCoach] = useState('camille')
  const [expandedReport, setExpandedReport] = useState<string | null>('r1')
  const [toolTab, setToolTab] = useState<'exercices' | 'rdv' | 'favoris'>('exercices')

  const triggerPulseMeasure = () => {
    if (measuring) return
    setMeasuring(true)
    setTimeout(() => {
      const nextBpm = 56 + Math.floor(Math.random() * 7)
      setBpm(nextBpm)
      setSteps(s => s + 180)
      setMeasuring(false)
    }, 1100)
  }

  const runEvaHealthAnalysis = () => {
    setAnalyzingHealth(true)
    setTimeout(() => {
      setAnalyzingHealth(false)
      setEvaHealthAnalysis(
        `Analyse croisée (${steps.toLocaleString('fr-FR')} pas · ${bpm} bpm au repos · variabilité VFC 68 ms) : récupération parasympathique optimale (+11% vs S-1). Votre fenêtre idéale pour le travail profond est 09h30–12h00 ; privilégiez une décompression respiratoire à 19h00.`
      )
    }, 900)
  }

  const addSharedDoc = () => {
    const title = docTitle.trim() || `Note_Suivi_${new Date().toLocaleDateString('fr-FR')}.pdf`
    setDocs(ds => [
      { id: 'd' + Date.now(), title, kind: 'Bilan', size: '640 Ko', coachId: docCoach, date: 'À l’instant', byMe: true },
      ...ds,
    ])
    setDocTitle('')
  }

  const activeAxis = RADAR.find(r => r.axis === selectedRadarAxis) ?? RADAR[5]
  const axisCoach = COACHES.find(c => c.id === activeAxis.coachId) ?? COACHES[0]

  return (
    <div className="tab-page" data-zone="ecosystem">
      <header className="page-head">
        <div>
          <div className="date-line">MON ÉCOSYSTÈME</div>
          <h1>Votre évolution<br />à 360°.</h1>
          <p>Radar de vie développé, santé, objectifs, outils et documents partagés.</p>
        </div>
      </header>

      <div className="chip-row">
        {([
          ['radar', 'Radar de vie'],
          ['sante', 'Santé & IA'],
          ['objectifs', 'Stats & Objectifs'],
          ['outils', 'Outils'],
          ['seances', 'Comptes rendus'],
          ['partage', 'Docs partagés'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            className={'chip glass-lite' + (section === id ? ' on' : '')}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* WIDGET 0 : RADAR DE VIE DÉVELOPPÉ & INTERACTIF */}
      {section === 'radar' && (
        <section className="card card-balance">
          <span className="balance-wash" aria-hidden />
          <div className="card-kicker"><Icon name="activity" size={13} /> RADAR DE VIE DÉVELOPPÉ</div>
          <div className="radar-head">
            <h2>Analyse par domaine</h2>
            <span className="tag mini glass-lite">{activeAxis.axis} sélectionné</span>
          </div>

          <RadarChart
            scores={RADAR}
            selectedAxis={selectedRadarAxis}
            onSelectAxis={axis => setSelectedRadarAxis(axis)}
            expanded
          />

          <div className="radar-scores">
            {RADAR.map(r => {
              const isSel = selectedRadarAxis === r.axis
              return (
                <button
                  type="button"
                  className={'radar-score' + (isSel ? ' active' : '')}
                  key={r.axis}
                  onClick={() => setSelectedRadarAxis(r.axis)}
                >
                  <span>{r.axis}</span>
                  <strong style={r.v < 45 ? { color: '#B2231A' } : undefined}>{r.v}</strong>
                </button>
              )
            })}
          </div>

          <div className="radar-axis-detail glass-lite" key={activeAxis.axis}>
            <div className="row between" style={{ marginTop: 0, marginBottom: 6 }}>
              <div className="radar-axis-title">
                <strong>{activeAxis.axis} · {activeAxis.v}/100</strong>
                <span className={'delta ' + (activeAxis.delta.startsWith('+') ? 'up' : '')}>{activeAxis.delta} sur 30 j</span>
              </div>
              <button className="btn btn-soft sm" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => onOpenCoach(axisCoach)}>
                <span>Expert : {axisCoach.name.split(' ')[0]}</span>
              </button>
            </div>
            <p className="radar-axis-txt">{activeAxis.insight}</p>
            <div className="radar-rec-line">
              <Icon name="sparkle" size={12} />
              <span>Action prioritaire : <strong>{activeAxis.rec}</strong></span>
            </div>
          </div>
        </section>
      )}

      {/* WIDGET 1 : MODULE SANTÉ (PAS, POULS & ANALYSE IA EVA) */}
      {section === 'sante' && (
        <section className="card eco-health-card">
          <span className="balance-wash" aria-hidden />
          <div className="row between" style={{ marginTop: 0, marginBottom: 10 }}>
            <div className="card-kicker" style={{ margin: 0 }}><Icon name="activity" size={13} /> MODULE SANTÉ & BIOMÉTRIE</div>
            <span className="tag mini glass-lite"><i className="dot" /> Capteurs synchronisés</span>
          </div>
          <h2>Pas, pouls & analyse EVA</h2>

          <div className="health-bento">
            <div className="health-tile glass-lite">
              <div className="ht-head">
                <span>PAS QUOTIDIENS</span>
                <span className="delta up">+14%</span>
              </div>
              <strong className="ht-val">{steps.toLocaleString('fr-FR')}</strong>
              <span className="ht-sub">Objectif 10 000 pas · {(Math.min(100, Math.round((steps / 10000) * 100)))}%</span>
              <div className="group-meter" style={{ marginTop: 8 }}>
                <span style={{ width: `${Math.min(100, Math.round((steps / 10000) * 100))}%` }} />
              </div>
            </div>

            <div className="health-tile glass-lite">
              <div className="ht-head">
                <span>PRISE DE POULS</span>
                <span className="pulse-dot" />
              </div>
              <strong className="ht-val">{measuring ? '…' : `${bpm} bpm`}</strong>
              <span className="ht-sub">Repos · VFC 68 ms (stable)</span>
              <button className="btn btn-soft sm" style={{ marginTop: 8, width: '100%', padding: '7px 10px' }} onClick={triggerPulseMeasure}>
                <Icon name="heart" size={13} filled />
                <span>{measuring ? 'Mesure optique…' : 'Prendre le pouls'}</span>
              </button>
            </div>
          </div>

          <div className="eva-health-box glass-lite">
            <div className="row between" style={{ marginTop: 0, marginBottom: 6 }}>
              <div className="transcript-head" style={{ margin: 0 }}>
                <EvaAvatar size={13} /> ANALYSE IA EVA · TEMPS RÉEL
              </div>
              <button className="link-btn" style={{ fontSize: 11.5 }} onClick={runEvaHealthAnalysis}>
                {analyzingHealth ? 'Calcul…' : 'Actualiser'}
              </button>
            </div>
            <p className="eva-health-txt">{evaHealthAnalysis}</p>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn btn-soft sm" onClick={() => onOpenEva(`Analyse mes ${steps} pas et mon pouls de ${bpm} bpm`)}>
                <Icon name="sparkle" size={13} /><span>Approfondir avec EVA</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* WIDGET 2 : STATISTIQUES AVANCÉES & TABLEAUX DE SUIVI DES OBJECTIFS */}
      {section === 'objectifs' && (
        <section className="card">
          <div className="card-kicker"><Icon name="chart" size={13} /> STATISTIQUES AVANCÉES & OBJECTIFS</div>
          <h2>Tableaux de suivi ({followedCoachIds.length} coachs suivis)</h2>
          <div className="metrics" style={{ marginTop: 10, marginBottom: 14 }}>
            <div className="metric">
              <div className="metric-top"><span>ASSIDUITÉ</span><span className="delta up">+9%</span></div>
              <span className="metric-val">91%</span>
            </div>
            <div className="metric">
              <div className="metric-top"><span>SCORE GLOBAL</span><span className="delta up">+12 pts</span></div>
              <span className="metric-val">78<span className="of">/100</span></span>
            </div>
            <div className="metric">
              <div className="metric-top"><span>SÉRIES ACTIVES</span></div>
              <span className="metric-val">12 j</span>
            </div>
          </div>

          <div className="eco-table">
            <div className="eco-thead">
              <span>Objectif & domaine</span>
              <span>Cible</span>
              <span>Progression</span>
            </div>
            {ECOSYSTEM_GOALS.map(g => {
              const c = COACHES.find(x => x.id === g.coachId)!
              return (
                <div className="eco-trow" key={g.id} onClick={() => onOpenCoach(c)}>
                  <div className="eco-tmain">
                    <strong>{g.title}</strong>
                    <span>{g.domain} · suivi par {c.name.split(' ')[0]} · {g.streak}</span>
                  </div>
                  <div className="eco-ttarget">
                    <strong>{g.current}</strong>
                    <span>cible {g.target}</span>
                  </div>
                  <div className="eco-tprog">
                    <strong>{g.progress}%</strong>
                    <div className="group-meter"><span style={{ width: `${g.progress}%` }} /></div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* WIDGET OUTILS (DÉPLACÉ DEPUIS PROFIL) : EXERCICES, RENDEZ-VOUS, CONTENUS FAVORIS */}
      {section === 'outils' && (
        <section className="card" data-zone="outils">
          <div className="card-kicker"><Icon name="activity" size={13} /> OUTILS & PRATIQUES</div>
          <h2>Exercices, rendez-vous & favoris</h2>
          <div className="subtabs" style={{ marginTop: 10, marginBottom: 12 }}>
            {([
              ['exercices', 'Mes exercices'],
              ['rdv', 'Mes rendez-vous'],
              ['favoris', 'Contenus favoris'],
            ] as const).map(([k, label]) => (
              <button key={k} className={'subtab' + (toolTab === k ? ' on' : '')} onClick={() => setToolTab(k)}>
                {label}
              </button>
            ))}
          </div>

          {toolTab === 'exercices' && (
            <div className="freelist">
              {EXERCISES.map(ex => (
                <button key={ex.id} className="free-item glass-lite" onClick={() => onOpenExercise(ex.id)}>
                  <span className="free-kind">{ex.level}</span>
                  <span className="free-title">{ex.title}</span>
                  <span className="free-dur">{ex.duration} min</span>
                  <Icon name="play" size={14} />
                </button>
              ))}
            </div>
          )}

          {toolTab === 'rdv' && (
            <div className="sessions" style={{ marginTop: 4 }}>
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
          )}

          {toolTab === 'favoris' && (
            <div className="freelist">
              {COACHES.slice(0, 3).flatMap(c => c.freeContent.slice(0, 1).map(f => ({ ...f, coachName: c.name.split(' ')[0], coach: c }))).map((item, i) => (
                <button key={i} className="free-item glass-lite" onClick={() => onOpenCoach(item.coach)}>
                  <span className="free-kind">{item.kind}</span>
                  <span className="free-title">{item.title} · {item.coachName}</span>
                  <span className="free-dur">{item.duration}</span>
                  <Icon name="heart" size={14} filled />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* WIDGET 3 : COMPTES RENDUS DE SÉANCES GÉNÉRÉS PAR L'IA EVA */}
      {section === 'seances' && (
        <section className="card">
          <div className="card-kicker"><Icon name="sparkle" size={13} /> COMPTES RENDUS IA EVA</div>
          <h2>Synthèses de vos séances</h2>
          <p>Enregistrées, transcrites et structurées automatiquement par EVA.</p>
          <div className="eva-reports-list" style={{ marginTop: 12 }}>
            {EVA_SESSION_REPORTS.map(r => {
              const isOpen = expandedReport === r.id
              const c = COACHES.find(x => x.id === r.coachId)!
              return (
                <div key={r.id} className={'eva-report-item glass-lite' + (isOpen ? ' open' : '')}>
                  <button className="eva-report-head" onClick={() => setExpandedReport(isOpen ? null : r.id)}>
                    <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={38} />
                    <div className="session-info">
                      <strong>{r.title}</strong>
                      <span>{r.coachName} · {r.date} · {r.duration}</span>
                    </div>
                    <span className="tag mini">IA EVA</span>
                  </button>
                  {isOpen && (
                    <div className="eva-report-body">
                      <p className="eva-report-sum">{r.summary}</p>
                      <div className="eva-report-sub">Points clés retenus</div>
                      <ul className="eva-report-ul">
                        {r.keyTakeaways.map((k, idx) => <li key={idx}><Icon name="check" size={13} /><span>{k}</span></li>)}
                      </ul>
                      <div className="eva-report-sub">Prochaines actions recommandées</div>
                      <ul className="eva-report-ul">
                        {r.nextActions.map((a, idx) => <li key={idx}><Icon name="arrow-right" size={13} /><span>{a}</span></li>)}
                      </ul>
                      <div className="row between" style={{ marginTop: 10 }}>
                        <span className="dim" style={{ fontSize: 11 }}>État détecté : {r.sentiment}</span>
                        <button className="btn btn-soft sm" onClick={() => onOpenChat(r.coachId)}>
                          <Icon name="chat" size={13} /><span>Discuter avec {c.name.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}


      {/* WIDGET 5 : ESPACE DE PARTAGE D'ÉLÉMENTS ET DE DOCUMENTS AVEC LES COACHS */}
      {section === 'partage' && (
        <section className="card">
          <div className="card-kicker"><Icon name="file" size={13} /> ESPACE DE PARTAGE MULTI-COACHS</div>
          <h2>Documents & éléments partagés</h2>
          <p>{consent.shareCoach ? 'Partage sélectif actif avec votre équipe.' : 'Coffre chiffré — partageable en un clic avec chaque expert.'}</p>

          <div className="doc-share-bar" style={{ marginTop: 12, marginBottom: 12 }}>
            <input
              className="eco-input glass-lite"
              placeholder="Nom du document ou bilan à partager…"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
            />
            <select
              className="eco-select glass-lite"
              value={docCoach}
              onChange={e => setDocCoach(e.target.value)}
              aria-label="Choisir le coach destinataire"
            >
              {COACHES.slice(0, 4).map(c => (
                <option key={c.id} value={c.id}>{c.name.split(' ')[0]}</option>
              ))}
            </select>
            <button className="btn btn-primary sm" onClick={addSharedDoc}>
              <Icon name="share" size={14} /><span>Partager</span>
            </button>
          </div>

          <div className="freelist">
            {docs.map(d => {
              const c = COACHES.find(x => x.id === d.coachId)!
              return (
                <div key={d.id} className="free-item glass-lite">
                  <span className="free-kind">{d.kind}</span>
                  <div className="session-info">
                    <strong style={{ fontSize: 13 }}>{d.title}</strong>
                    <span style={{ fontSize: 11 }}>
                      {d.byMe ? `Partagé par vous avec ${c.name.split(' ')[0]}` : `Reçu de ${c.name.split(' ')[0]}`} · {d.date} · {d.size}
                    </span>
                  </div>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onOpenChat(c.id)} aria-label="Ouvrir la discussion">
                    <Icon name="chat" size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <footer className="tab-footer">Mon Écosystème · synchronisé par EVA</footer>
    </div>
  )
}

/* =====================================================
   EVA — assistante IA (coaché, prefill Hub) & coach (alertes)
   ===================================================== */

export type EvaTone = 'stress' | 'sommeil' | 'nutrition' | 'douleur' | 'mental' | 'info'
export type EvaMessage = { from: 'eva' | 'me'; text: string; actions?: EvaAction[]; image?: string }
export type EvaAction = { label: string; kind: 'coach' | 'info' | 'emergency'; coachId?: string; coachName?: string; note?: string }

function evaRoutes(): { match: RegExp; tone: EvaTone; reply: string; actions: EvaAction[] }[] {
  return [
  {
    match: /stress|anxieu|panique|tension|pressé|surmen|surcharg/i,
    tone: 'stress',
    reply: 'Je note un pic de stress. Deux leviers marchent très bien : une respiration guidée maintenant, et un point avec une coach respiration cette semaine.',
    actions: [
      { label: 'Voir Camille (respiration)', kind: 'coach', coachId: 'camille', coachName: 'Camille Durand' },
      { label: 'Comprendre le stress', kind: 'info' },
    ],
  },
  {
    match: /sommeil|dors|dormir|insomni|nuit/i,
    tone: 'sommeil',
    reply: 'Vos nuits sont un signal important. Je peux vous orienter vers un accompagnement sommeil et vous donner une routine du soir.',
    actions: [
      { label: 'Voir Camille (sommeil & respiration)', kind: 'coach', coachId: 'camille', coachName: 'Camille Durand' },
      { label: 'Routine du soir', kind: 'info' },
    ],
  },
  {
    match: /mang|nutrition|aliment|sucre|régime|regime|petit.d.j/i,
    tone: 'nutrition',
    reply: 'Côté nutrition, Nora construit des habitudes tenables, sans interdits. Je peux aussi vous envoyer un guide gratuit pour commencer dès aujourd’hui.',
    actions: [
      { label: 'Voir Nora (nutrition)', kind: 'coach', coachId: 'nora', coachName: 'Nora Benali' },
      { label: 'Guide petit-déjeuner', kind: 'info' },
    ],
  },
  {
    match: /douleur|mal|tension physique|dos|cervical|lombaire|blessure|genou/i,
    tone: 'douleur',
    reply: 'Pour une douleur, j’oriente vers Marc (réathlétisation). Et si elle persistait ou s’aggravait, un professionnel de santé reste la bonne porte — je peux vous aider à préparer la consultation.',
    actions: [
      { label: 'Voir Marc (mobilité & dos)', kind: 'coach', coachId: 'marc', coachName: 'Marc Lefèvre' },
      { label: 'Quand consulter un médecin', kind: 'info' },
    ],
  },
  {
    match: /trist|déprim|deprim|moros|isol|appréhens|peur|confiance|motiv/i,
    tone: 'mental',
    reply: 'Ce que vous décrivez mérite d’être pris au sérieux. Élodie propose un espace d’écoute sans jugement — et si le poids devient trop lourd, un psychologue ou votre médecin traitant est la voie à privilégier.',
    actions: [
      { label: 'Voir Élodie (santé mentale)', kind: 'coach', coachId: 'elodie', coachName: 'Élodie Martin' },
      { label: 'Ressources d’aide', kind: 'info' },
    ],
  },
  {
    match: /coach|choisir|commence|début|debut|trouve/i,
    tone: 'info',
    reply: 'Je peux vous guider. Dites-moi ce qui pèse le plus en ce moment — stress, sommeil, corps, mental, assiette — et je vous propose les bons profils.',
    actions: [
      { label: 'Stress', kind: 'info' },
      { label: 'Sommeil', kind: 'info' },
      { label: 'Corps', kind: 'info' },
    ],
  },
  ]
}

function evaReply(text: string): EvaMessage {
  const found = evaRoutes().find(r => r.match.test(text))
  if (found) return { from: 'eva', text: found.reply, actions: found.actions }
  return {
    from: 'eva',
    text: 'Je vous écoute. Vous pouvez me parler de votre stress, de votre sommeil, de votre énergie, d’une douleur ou d’une envie de changement — et je vous oriente vers le bon accompagnement.',
    actions: [
      { label: 'Stress', kind: 'info' },
      { label: 'Sommeil', kind: 'info' },
      { label: 'Corps', kind: 'info' },
      { label: 'Nutrition', kind: 'info' },
    ],
  }
}

export function EvaPanel({ role, prefill, onClose }: {
  role: 'coache' | 'coach'
  prefill?: string
  onClose: () => void
}) {
  const { name } = useStore()
  const firstName = role === 'coach' ? 'Camille' : name
  const [msgs, setMsgs] = useState<EvaMessage[]>([])
  const [draft, setDraft] = useState(prefill ?? '')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  /* Photo d'un plat prise à l'appareil → analyse nutritionnelle d'EVA */
  const sendMeal = (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setMsgs(m => [...m, { from: 'me', text: 'Photo de mon plat', image: url }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs(m => [...m, {
        from: 'eva',
        text: 'Je vois un bowl de lentilles, avocat et œuf mollet : environ 520 kcal, 26 g de protéines, 48 g de glucides et 22 g de lipides. L’équilibre fibres/protéines est bon — ajoutez un fruit pour la vitamine C. Je peux l’ajouter à votre carnet si vous le souhaitez.',
      }])
    }, 1400)
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length, typing])

  const send = (text?: string) => {
    const t = (text ?? draft).trim()
    if (!t) return
    setMsgs(m => [...m, { from: 'me', text: t }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      const reply = evaReply(t)
      const coach = role === 'coach'
        ? 'Signal enregistré dans la fiche de votre client. Souhaitez-vous que je prépare une note d’ajustement pour votre prochaine séance ?'
        : null
      setMsgs(m => [...m, coach ? { ...reply, text: `${reply.text} ${coach}` } : reply])
      setTyping(false)
    }, 1100)
  }

  const act = (a: EvaAction) => {
    if (a.kind === 'emergency') return
    setMsgs(m => [...m, {
      from: 'eva',
      text: a.kind === 'coach'
        ? `Je vous emmène vers ${a.coachName}. En cas de symptôme persistant ou aggravant, consultez votre médecin — Evol accompagne, il ne remplace pas un avis médical.`
        : a.note ?? 'Guide et ressources : je vous en dis plus ici, puis un coach peut prendre le relais.',
    }])
  }

  return (
    <div className="screen chat-screen eva-screen">
      <header className="chat-head">
        <button className="icon-btn" onClick={onClose} aria-label="Retour"><Icon name="chevron-left" size={19} /></button>
        <EvaAvatar size={38} />
        <div className="chat-who">
          <strong>EVA</strong>
          <span><i className="dot" /> Assistante Evol · IA</span>
        </div>
      </header>

      <div className="body eva-console">
        <div className="eva-feed">
          <div className="eva-greet">
            <h2>Bonjour {firstName},<br />en quoi puis-je vous aider ?</h2>
            <p>Photo de plat, sommeil, stress, séance : je suis là pour vous orienter.</p>
          </div>
          {msgs.map((m, k) => (
            m.from === 'me'
              ? <div key={k} className="bubble-row me">
                  <div className="bubble">
                    {m.image && <img className="bubble-img" src={m.image} alt="Plat envoyé à EVA" />}
                    <p>{m.text}</p><span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              : <div key={k} className="eva-cardmsg">
                  <div className="eva-cardmsg-head"><EvaAvatar size={16} /><strong>EVA</strong></div>
                  <p>{m.text}</p>
                  {m.actions && (
                    <div className="eva-actions">
                      {m.actions.map((a, i) => (
                        <button key={i} className={'eva-action' + (a.kind === 'emergency' ? ' urgent' : '')} onClick={() => act(a)}>
                          {a.kind === 'coach' && <Icon name="user" size={13} />}
                          {a.kind === 'emergency' && <Icon name="alert" size={13} />}
                          <span>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
          ))}
          {typing && <div className="eva-cardmsg eva-typing"><EvaAvatar size={15} /><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
      </div>

      <div className="eva-composer glass">
        <label className="eva-shot" title="Photographier mon plat">
          <Icon name="camera" size={18} />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="Photographier un plat pour analyse IA"
            onChange={e => { sendMeal(e.target.files?.[0]); e.target.value = '' }}
          />
        </label>
        <input
          aria-label={role === 'coach' ? 'Demander à EVA' : 'Écrire à EVA'}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
        />
        <button className={'send-btn' + (draft.trim() ? ' ready' : '')} onClick={() => send()} aria-label="Envoyer">
          <Icon name="send" size={17} />
        </button>
      </div>
    </div>
  )
}
