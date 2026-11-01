import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar, EvaAvatar } from './bits'
import { useStore } from './store'
import {
  COACHES, SESSIONS, QUOTES, IMAGES, EVENTS,
  EVA_SESSION_REPORTS, HOME_ANNOUNCEMENTS, STORIES, HORIZON_GOALS,
  COACH_TEAM, PSY_COACH_ID, CAREER_COACH_ID, INITIAL_SHARED_DOCS,
  type Coach, type CommunityEvent, type SharedDocument,
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

export function Hub({ onOpenCoach, onOpenChat, onOpenEva }: {
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
}) {
  const { name, quizDomains } = useStore()
  const [homeTab, setHomeTab] = useState<'week' | 'community'>('week')
  const [event, setEvent] = useState<CommunityEvent | null>(null)
  const [joinedEvents, setJoinedEvents] = useState<string[]>([])
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const quote = QUOTES[quoteIdx]

  /* flux Home : annonces de groupe de la semaine */
  const [joined, setJoined] = useState<string[]>(['a1'])
  const toggleJoin = (id: string) =>
    setJoined(js => (js.includes(id) ? js.filter(x => x !== id) : [...js, id]))

  /* flux vidéo horizontal, filtré sur les objectifs du parcours */
  const [storyFilter, setStoryFilter] = useState<'objectifs' | 'tous'>('objectifs')
  const stories = useMemo(() => {
    const mine = quizDomains ?? []
    if (storyFilter === 'tous' || mine.length === 0) return STORIES
    const match = STORIES.filter(s => mine.includes(s.domain))
    const rest = STORIES.filter(s => !match.includes(s))
    return [...match, ...rest]
  }, [quizDomains, storyFilter])

  /* journaling & transcription IA */
  const [entries, setEntries] = useState<{ id: string; date: string; text: string; tag: string }[]>([
    { id: 'j1', date: 'Aujourd’hui · 08:15', text: 'Réveil plus clair après 4 cycles de 4-7-8 hier soir. Moins de raideur dans la nuque.', tag: 'Sommeil' },
    { id: 'j2', date: 'Hier · 21:40', text: 'Journée dense mais pas d’épuisement en fin d’après-midi grâce au protocole de Nora.', tag: 'Énergie' },
  ])
  const [draft, setDraft] = useState('')
  const [recording, setRecording] = useState(false)
  const [secs, setSecs] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const toggleRec = () => {
    if (recording) {
      setRecording(false)
      if (timer.current) clearInterval(timer.current)
      if (secs > 0) {
        setTranscribing(true)
        setTimeout(() => {
          setTranscribing(false)
          setDraft(d => (d ? d + ' ' : '') + 'Note vocale transcrite par EVA : la respiration m’a aidé à stabiliser mon attention avant les réunions.')
        }, 1000)
      }
      setSecs(0)
    } else {
      setRecording(true)
      timer.current = setInterval(() => setSecs(s => s + 1), 1000)
    }
  }

  const saveEntry = () => {
    if (!draft.trim()) return
    setEntries(es => [{ id: 'j' + Date.now(), date: 'À l’instant', text: draft.trim(), tag: 'Journal' }, ...es])
    setDraft('')
  }

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
    <div className="tab-page" data-zone="hub">
      <header className="page-head">
        <div>
          <div className="date-line">{todayLabel()}</div>
          <h1>{greeting()}, <em className="hello-name">{name}</em></h1>
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

      <section className="card" data-zone="home-feed">
        <div className="feed-head">
          <h2>Ce qui se passe cette semaine</h2>
          <div className="subtabs feed-tabs">
            {([['week', 'Ma semaine'], ['community', 'Communauté']] as const).map(([id, label]) => (
              <button key={id} className={'subtab' + (homeTab === id ? ' on' : '')} onClick={() => setHomeTab(id)}>{label}</button>
            ))}
          </div>
        </div>

        {homeTab === 'community' ? (
          <>
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
          </>
        ) : (
          <>
        <div className="feed-list">
          {HOME_ANNOUNCEMENTS.map(a => {
            const on = joined.includes(a.id)
            return (
              <article className={'feed-item glass-lite' + (on ? ' on' : '')} key={a.id}>
                <img className="feed-img" src={a.img} alt="" loading="lazy" />
                <div className="feed-body">
                  <div className="feed-meta">
                    <span className="tag mini">{a.tag}</span>
                    <span className="feed-time"><Icon name={a.mode === 'Visio' ? 'video' : 'location'} size={11} /> {a.when} · {a.time}</span>
                  </div>
                  <strong>{a.title}</strong>
                  <span className="feed-sub">{a.host} · {a.place} · {a.seats}</span>
                  <p className="feed-note">{a.note}</p>
                  <button className={'feed-join' + (on ? ' on' : '')} onClick={() => toggleJoin(a.id)} aria-pressed={on}>
                    <Icon name={on ? 'check' : 'plus'} size={13} />
                    <span>{on ? 'Inscrit' : 'Rejoindre'}</span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <div className="feed-sessions">
          <div className="block-title" style={{ marginTop: 0 }}>Vos prochains rendez-vous</div>
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
        </div>
          </>
        )}
      </section>

      <section className="card" data-zone="stories">
        <h2>Des parcours qui ressemblent au vôtre</h2>
        <div className="msg-filters" style={{ marginTop: 8 }}>
          {([['objectifs', 'Pour vous'], ['tous', 'Tout le fil']] as const).map(([id, label]) => (
            <button key={id} className={'msg-filter' + (storyFilter === id ? ' on' : '')} onClick={() => setStoryFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="story-feed">
          {stories.map(s => (
            <article className="story-slide" key={s.id}>
              <img className="story-img" src={s.poster} alt="" loading="lazy" />
              <span className="story-wash" aria-hidden />
              <div className="story-body">
                <div className="story-top">
                  <span className="story-kind">
                    <Icon name={s.kind === 'Podcast' ? 'mic' : 'video'} size={11} /> {s.kind}
                  </span>
                  <span className="story-dur">{s.duration}</span>
                </div>
                <h3>{s.title}</h3>
                <p className="story-quote">{s.quote}</p>
                <span className="story-by">{s.author}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* JOURNALING & TRANSCRIPTION IA */}
      <section className="card" data-zone="journal">
        <h2>Carnet d’évolution</h2>
        <textarea
          className="journal"
          rows={3}
          placeholder="Noter une prise de conscience, un ressenti ou dicter…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />

        <div className="row" style={{ marginTop: 10, marginBottom: 14 }}>
          <button className={'mic-btn' + (recording ? ' rec' : '')} onClick={toggleRec} aria-label="Dicter une note">
            <Icon name={recording ? 'pause' : 'mic'} size={18} />
            {recording && <span className="mic-wave"><i /><i /><i /></span>}
            {recording && <em>{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</em>}
          </button>
          {transcribing
            ? <span className="ai-status"><i className="dot pulsing" /> Transcription IA…</span>
            : recording
              ? <span className="ai-status">J’écoute…</span>
              : null}
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary sm" onClick={saveEntry}>
            <Icon name="check" size={14} /><span>Enregistrer</span>
          </button>
        </div>

        <div className="eco-journal-list">
          {entries.map(j => (
            <div key={j.id} className="eco-journal-item glass-lite">
              <div className="row between" style={{ marginTop: 0, marginBottom: 4 }}>
                <span className="dim" style={{ fontSize: 11 }}>{j.date}</span>
                <span className="tag mini">{j.tag}</span>
              </div>
              <p style={{ fontSize: 13 }}>{j.text}</p>
            </div>
          ))}
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-soft sm" onClick={() => onOpenEva('Analyse mon journal de la semaine')}>
            <Icon name="sparkle" size={13} /><span>Faire synthétiser par EVA</span>
          </button>
          <button className="btn btn-ghost sm" onClick={() => onOpenChat('camille')}>
            <Icon name="chat" size={13} /><span>Partager avec mon coach</span>
          </button>
        </div>
      </section>
    </div>
  )
}

/* =====================================================
   EXPLORER — recherche + filtres
   ===================================================== */

export function Explorer({ onOpenCoach }: { onOpenCoach: (c: Coach) => void }) {
  const { quizDomains, followedCoachIds, toggleFollowCoach, guest, program } = useStore()
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const specialties = ['Stress', 'Nutrition', 'Mobilité', 'Anxiété']
  const cities = [...new Set(COACHES.map(c => c.city))]
  /* accès invité : textes seuls, sans photos */
  const textOnly = guest
  const filterCount = [specialty, maxPrice, mode, city].filter(v => v != null).length

  const results = useMemo(() => COACHES.filter(c => {
    const ql = q.toLowerCase()
    const matchQ = !ql || c.name.toLowerCase().includes(ql) || c.role.toLowerCase().includes(ql) || c.tags.some(t => t.toLowerCase().includes(ql))
    const matchS = !specialty || c.tags.includes(specialty)
    const matchP = maxPrice == null || c.price <= maxPrice
    const matchM = !mode || mode === 'Hybride' || c.mode === mode
    const matchC = !city || c.city === city
    return matchQ && matchS && matchP && matchM && matchC
  }), [q, specialty, maxPrice, mode, city])

  return (
    <div className="tab-page">
      <header className="page-head">
        <div>
          <div className="date-line">{program ? 'L’ÉQUIPE' : 'EXPLORER'}</div>
          <h1 className={textOnly ? 'explorer-slogan' : undefined}>
            {program ? <>Votre équipe<br />d’accompagnement.</> : <>Les bonnes personnes<br />au bon moment.</>}
          </h1>
        </div>
      </header>

      <div className="search-toolbar">
        <div className="search glass-lite">
          <Icon name="search" size={17} />
          <input placeholder="Domaine, prénom, spécialité…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button
          className={'filter-btn glass-lite' + (showFilters || filterCount > 0 ? ' on' : '')}
          onClick={() => setShowFilters(v => !v)}
          aria-label="Filtrer par lieu et format"
          aria-expanded={showFilters}
        >
          <Icon name="grid" size={17} />
          {filterCount > 0 && <em>{filterCount}</em>}
        </button>
      </div>

      <div className="chip-row">
        {(['Présentiel', 'À distance', 'Hybride'] as const).map(m => (
          <button key={m} className={'chip glass-lite' + (mode === m ? ' on' : '')} onClick={() => setMode(mode === m ? null : m)}>{m}</button>
        ))}
        {specialties.map(sp => (
          <button key={sp} className={'chip glass-lite' + (specialty === sp ? ' on' : '')} onClick={() => setSpecialty(specialty === sp ? null : sp)}>{sp}</button>
        ))}
        {!program && <button className={'chip glass-lite' + (maxPrice === 70 ? ' on' : '')} onClick={() => setMaxPrice(maxPrice === 70 ? null : 70)}>≤ 70 €</button>}
      </div>

      {showFilters && (
        <div className="filter-panel glass-lite">
          <div className="filter-sub">Lieu</div>
          <div className="chip-row" style={{ marginBottom: 0 }}>
            {cities.map(ci => (
              <button key={ci} className={'chip glass-lite' + (city === ci ? ' on' : '')} onClick={() => setCity(city === ci ? null : ci)}>{ci}</button>
            ))}
          </div>
        </div>
      )}

      {/* accès rapide façon rangée d'avatars — masqué en accès invité et dans le programme */}
      {!textOnly && !program && (
        <div className="quick-row">
          {COACHES.map(c => (
            <button key={c.id} className="quick-av" onClick={() => onOpenCoach(c)}>
              <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={58} ring={followedCoachIds.includes(c.id)} />
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="count-line">{results.length} accompagnant{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''}</div>

      <div className="coach-list">
        {results.map(c => {
          const isFollowed = followedCoachIds.includes(c.id)
          return (
            <article className={'coach-line' + (textOnly ? ' text-only' : '')} key={c.id} onClick={() => onOpenCoach(c)}>
              {!textOnly && <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={54} ring={isFollowed} />}
              <div className="coach-id">
                <strong>{c.name}{quizDomains.some(d => c.domains.includes(d as any)) && <em className="match-dot" />}</strong>
                <span>{c.role}</span>
                <div className="coach-meta">
                  <span className="rating"><Icon name="star" size={12} /> {c.rating}</span>
                  <span><Icon name="location" size={12} /> {c.city} · {c.mode}</span>
                </div>
              </div>
              {program && (
                <button
                  className={'btn sm ' + (isFollowed ? 'btn-soft' : 'btn-primary')}
                  style={{ padding: '7px 12px', fontSize: 11.5 }}
                  aria-label={isFollowed ? `Retirer ${c.name}` : `Choisir ${c.name}`}
                  onClick={e => { e.stopPropagation(); toggleFollowCoach(c.id) }}
                >
                  <Icon name={isFollowed ? 'check' : 'plus'} size={13} />
                  <span>{isFollowed ? 'Suivi' : 'Choisir'}</span>
                </button>
              )}
              {!program && <strong className="price-line-s">{c.price} €</strong>}
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

export function Ecosystem({ onOpenCoach, onOpenChat, onOpenEva }: {
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
}) {
  const { selectedRadarAxis, setSelectedRadarAxis, program } = useStore()
  const [goalCoach, setGoalCoach] = useState<string | null>(CAREER_COACH_ID)
  const [docs, setDocs] = useState<SharedDocument[]>(INITIAL_SHARED_DOCS)
  const [docTitle, setDocTitle] = useState('')
  const shareDoc = (coachId: string) => {
    const title = docTitle.trim() || `Note_Suivi_${new Date().toLocaleDateString('fr-FR')}.pdf`
    setDocs(ds => [
      { id: 'd' + Date.now(), title, kind: 'Bilan', size: '640 Ko', coachId, date: 'À l’instant', byMe: true },
      ...ds,
    ])
    setDocTitle('')
  }

  /* scan de repas — accès rapide depuis le haut de l'écosystème */
  const shotInput = useRef<HTMLInputElement>(null)
  const [mealShot, setMealShot] = useState<string | null>(null)
  const [mealAnalysis, setMealAnalysis] = useState<string | null>(null)
  const [analyzingMeal, setAnalyzingMeal] = useState(false)

  const runMealAnalysis = () => {
    setAnalyzingMeal(true)
    setTimeout(() => {
      setAnalyzingMeal(false)
      setMealAnalysis('Repas détecté : bowl de lentilles, avocat et œuf mollet — environ 520 kcal, 26 g de protéines, 48 g de glucides, 22 g de lipides. Équilibre fibres/protéines solide ; ajoutez un fruit pour la vitamine C.')
    }, 1100)
  }

  const onShot = (file?: File) => {
    if (!file) return
    setMealShot(URL.createObjectURL(file))
    setMealAnalysis(null)
    runMealAnalysis()
  }

  /* biométrie */
  const [steps, setSteps] = useState(8420)
  const [bpm, setBpm] = useState(58)
  const [measuring, setMeasuring] = useState(false)
  const [analyzingHealth, setAnalyzingHealth] = useState(false)
  const [evaHealthAnalysis, setEvaHealthAnalysis] = useState<string | null>(
    'Votre pouls au repos (58 bpm) et vos 8 420 pas montrent une excellente récupération cardiovasculaire. EVA suggère de maintenir la séance de mobilité douce avec Marc et d’avancer le coucher de 20 min.'
  )

  const triggerPulseMeasure = () => {
    if (measuring) return
    setMeasuring(true)
    setTimeout(() => {
      setBpm(56 + Math.floor(Math.random() * 7))
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

  const activeAxis = RADAR.find(r => r.axis === selectedRadarAxis) ?? RADAR[5]
  const axisCoach = COACHES.find(c => c.id === activeAxis.coachId) ?? COACHES[0]

  return (
    <div className="tab-page" data-zone="ecosystem">
      <header className="page-head">
        <div>
          <div className="date-line">MON ÉCOSYSTÈME</div>
          <h1>Votre évolution<br />à 360°.</h1>
          {program && <p>Vos coachs, leurs objectifs et tous vos outils au même endroit.</p>}
        </div>
        <button className="round-btn eco-cam" onClick={() => shotInput.current?.click()} aria-label="Scanner mon repas avec EVA">
          <Icon name="camera" size={19} />
        </button>
      </header>

      <input
        ref={shotInput}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Photographier mon plat"
        style={{ display: 'none' }}
        onChange={e => { onShot(e.target.files?.[0]); e.target.value = '' }}
      />
      {mealShot && (
        <div className="meal-preview glass-lite eco-meal">
          <img src={mealShot} alt="Photo du plat analysé par EVA" />
          <div className="meal-preview-body">
            <strong>Analyse nutritionnelle EVA</strong>
            {analyzingMeal
              ? <span className="ai-status"><i className="dot pulsing" /> EVA analyse votre assiette…</span>
              : <p className="meal-analysis">{mealAnalysis}</p>}
            <div className="row" style={{ marginTop: 4 }}>
              <button className="btn btn-ghost sm" onClick={() => { setMealShot(null); setMealAnalysis(null) }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* RADAR DE VIE */}
      <section className="card card-balance" data-zone="radar">
        <span className="balance-wash" aria-hidden />
        <div className="card-kicker"><Icon name="activity" size={13} /> RADAR DE VIE</div>
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
                <strong>{r.v}</strong>
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
              <span>Coach : {axisCoach.name.split(' ')[0]}</span>
            </button>
          </div>
          <p className="radar-axis-txt">{activeAxis.insight}</p>
          <div className="radar-rec-line">
            <Icon name="sparkle" size={12} />
            <span>Action prioritaire : <strong>{activeAxis.rec}</strong></span>
          </div>
        </div>

        <div className="radar-health glass-lite">
          <div className="row between" style={{ marginTop: 0, marginBottom: 10 }}>
            <div className="card-kicker" style={{ margin: 0 }}><Icon name="heart" size={13} /> SANTÉ & BIOMÉTRIE</div>
            <span className="tag mini"><i className="dot" /> Capteurs synchronisés</span>
          </div>

          <div className="health-bento">
            <div className="health-tile">
              <div className="ht-head">
                <span>PAS QUOTIDIENS</span>
                <span className="delta up">+14%</span>
              </div>
              <strong className="ht-val">{steps.toLocaleString('fr-FR')}</strong>
              <span className="ht-sub">Objectif 10 000 pas · {Math.min(100, Math.round((steps / 10000) * 100))}%</span>
              <div className="group-meter" style={{ marginTop: 8 }}>
                <span style={{ width: `${Math.min(100, Math.round((steps / 10000) * 100))}%` }} />
              </div>
            </div>

            <div className="health-tile">
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

          <div className="eva-health-box">
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
        </div>
      </section>

      {program && (
      <section className="card" data-zone="team">
        <h2>Mon référent</h2>
        <p>Votre coach référent — coach de vie et spécialiste carrière — coordonne l’équipe autour de vos objectifs.</p>

        {(() => {
          const entry = COACH_TEAM.find(t => t.coachId === CAREER_COACH_ID) ?? COACH_TEAM[0]
          const c = COACHES.find(x => x.id === entry.coachId)!
          const evaReports = EVA_SESSION_REPORTS.filter(r => r.coachId === entry.coachId)
          return (
            <div className="team-detail glass-lite" key={c.id}>
              <div className="team-head">
                <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={50} ring />
                <div className="session-info">
                  <strong>{c.name}</strong>
                  <span>{c.role}</span>
                </div>
                <span className={'tag mini team-badge ' + entry.privacy}>
                  <Icon name={entry.privacy === 'prive' ? 'lock' : 'users'} size={10} />
                  {entry.privacy === 'prive' ? 'Privé' : 'Équipe'}
                </span>
              </div>

              <div className="client-line"><Icon name="clock" size={14} /><span>{entry.cadence}</span></div>
              <div className="client-line"><Icon name="activity" size={14} /><span>{entry.objective}</span></div>

              <div className="team-sub">Objectifs assignés</div>
              <div className="team-goals">
                {entry.goals.map(g => (
                  <span className="team-goal" key={g}><Icon name="check" size={11} />{g}</span>
                ))}
              </div>

              <div className="team-sub">Comptes rendus IA EVA</div>
              {evaReports.length > 0 ? evaReports.map(r => (
                <details className="team-eva" key={r.id}>
                  <summary>
                    <Icon name="sparkle" size={12} />
                    <span>{r.title}</span>
                    <em>{r.date}</em>
                  </summary>
                  <p>{r.summary}</p>
                  <ul className="eva-report-ul">
                    {r.nextActions.map((a, i) => <li key={i}><Icon name="arrow-right" size={12} /><span>{a}</span></li>)}
                  </ul>
                </details>
              )) : (
                <div className="team-eva empty">
                  <Icon name="sparkle" size={12} />
                  <span>Aucun compte rendu pour le moment</span>
                </div>
              )}

              <div className="team-sub">
                {entry.privacy === 'prive' ? 'Notes confidentielles' : 'Comptes rendus partagés'}
              </div>
              {entry.reports.map(r => (
                <div className={'team-report' + (r.shared ? '' : ' locked')} key={r.title}>
                  <Icon name={r.shared ? 'file' : 'lock'} size={13} />
                  <div className="session-info">
                    <strong>{r.title}</strong>
                    <span>{r.date}{r.shared ? ' · visible par l’équipe' : ' · visible par vous et le psychologue uniquement'}</span>
                  </div>
                </div>
              ))}

              <div className={'team-privacy ' + entry.privacy}>
                <Icon name={entry.privacy === 'prive' ? 'shield' : 'users'} size={12} />
                <span>{entry.privacyNote}</span>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-soft sm" onClick={() => onOpenCoach(c)}>
                  <Icon name="user" size={13} /><span>Fiche du coach</span>
                </button>
                {entry.coachId === PSY_COACH_ID && (
                  <button className="btn btn-ghost sm" onClick={() => onOpenChat(c.id)}>
                    <Icon name="chat" size={13} /><span>Espace confidentiel</span>
                  </button>
                )}
              </div>
            </div>
          )
        })()}

        <div className="privacy" style={{ marginTop: 12 }}>
          <Icon name="shield" size={12} />
          <span>Le psychologue agréé lit les comptes rendus des autres coachs ; ses propres notes ne sont vues par personne.</span>
        </div>
      </section>
      )}

      {/* OBJECTIFS — vue horizontale par coach, détail au clic */}
      <section className="card" data-zone="objectifs">
        <h2>Vos objectifs</h2>

        <div className="goal-row">
          {COACH_TEAM.map(t => {
            const c = COACHES.find(x => x.id === t.coachId)!
            const goals = HORIZON_GOALS.filter(g => g.coachId === t.coachId)
            if (goals.length === 0) return null
            const avg = Math.round(goals.reduce((n, g) => n + g.progress, 0) / goals.length)
            const on = goalCoach === c.id
            return (
              <button
                key={c.id}
                className={'goal-card glass-lite' + (on ? ' on' : '')}
                onClick={() => setGoalCoach(on ? null : c.id)}
                aria-pressed={on}
              >
                <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={34} ring={on} />
                <span>{c.name.split(' ')[0]}</span>
                <strong>{avg}%</strong>
                <div className="group-meter"><span style={{ width: `${avg}%` }} /></div>
              </button>
            )
          })}
        </div>

        {(() => {
          const c = COACHES.find(x => x.id === goalCoach)
          if (!c) return <p className="goal-hint">Touchez un coach pour dérouler ses objectifs.</p>
          const goals = HORIZON_GOALS.filter(g => g.coachId === c.id)
          return (
            <div className="goal-detail" key={c.id}>
              <div className="goal-detail-head">
                <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={28} />
                <div className="session-info">
                  <strong>{c.name}</strong>
                  <span>{c.role}</span>
                </div>
                <span className="tag mini">{goals.length} objectif{goals.length > 1 ? 's' : ''}</span>
              </div>
              {goals.map(g => (
                <article className="horizon-goal glass-lite" key={g.id}>
                  <div className="hg-top">
                    <span className="hg-due">{g.horizon} · {g.due}</span>
                    <strong>{g.progress}%</strong>
                  </div>
                  <strong className="hg-title">{g.title}</strong>
                  <p>{g.detail}</p>
                  <div className="group-meter"><span style={{ width: `${g.progress}%` }} /></div>
                  <div className="hg-steps">
                    {g.steps.map(st => (
                      <span className={'hg-step' + (st.done ? ' done' : '')} key={st.label}>
                        <Icon name={st.done ? 'check' : 'plus'} size={10} />{st.label}
                      </span>
                    ))}
                  </div>
                </article>
              ))}

              <div className="goal-share">
                <div className="card-kicker" style={{ margin: 0 }}><Icon name="file" size={12} /> ESPACE DE PARTAGE</div>
                <div className="doc-share-bar" style={{ marginTop: 8, marginBottom: 8 }}>
                  <input
                    className="eco-input glass-lite"
                    placeholder={`Partager un document avec ${c.name.split(' ')[0]}…`}
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                  />
                  <button className="btn btn-soft sm" onClick={() => shareDoc(c.id)}>
                    <Icon name="share" size={13} /><span>Partager</span>
                  </button>
                </div>
                {docs.filter(d => d.coachId === c.id).map(d => (
                  <div className="team-report" key={d.id}>
                    <Icon name="file" size={13} />
                    <div className="session-info">
                      <strong>{d.title}</strong>
                      <span>{d.byMe ? 'Partagé par vous' : 'Reçu de votre coach'} · {d.date} · {d.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </section>

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
            {role !== 'coach' && <p>Photo de plat, sommeil, stress, séance : je suis là pour vous orienter.</p>}
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
