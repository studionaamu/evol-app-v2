import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar, EvaAvatar } from './bits'
import { useStore } from './store'
import {
  COACHES, SESSIONS, QUOTES, IMAGES, EVENTS, HOME_ANNOUNCEMENTS,
  EVA_SESSION_REPORTS, STORIES, HORIZON_GOALS,
  COACH_TEAM, INITIAL_SHARED_DOCS,
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
            <stop offset="0%" stopColor="#E92B1F" stopOpacity="0.20" />
            <stop offset="46%" stopColor="#6D3EAD" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#1525FF" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E92B1F" />
            <stop offset="52%" stopColor="#6D3EAD" />
            <stop offset="100%" stopColor="#1525FF" />
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
          if (selectedAxis !== s.axis) return null
          const [x, y] = pt(i, (Math.min(100, s.v + 5) / 100) * R)
          return (
            <g key={'axis-' + s.axis} className="radar-axis-reveal" aria-hidden="true">
              <line x1={cx} y1={cy} x2={x} y2={y} pathLength={1} className="radar-axis-beam" />
              <circle cx={x} cy={y} r={7} className="radar-axis-ring" />
            </g>
          )
        })}
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
  const { name, avatar, quizDomains, program, setThreads, setTab } = useStore()
  const [event, setEvent] = useState<CommunityEvent | null>(null)
  const [joinedEvents, setJoinedEvents] = useState<string[]>([])
  const [joined, setJoined] = useState<string[]>(['a1'])
  const [homeTab, setHomeTab] = useState<'week' | 'events'>('week')
  const [invite, setInvite] = useState<'open' | 'joined' | 'declined'>('open')
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const quote = QUOTES[quoteIdx]

  /* fin de séance : les élèves peuvent se retrouver en extérieur, puis continuer dans un groupe de chat */
  const joinSessionGroup = () => {
    setThreads(ts => [{
      id: 'g-session-' + Date.now(),
      coachId: 'camille',
      unread: 1,
      messages: [
        { from: 'coach', text: 'Bienvenue dans le groupe de la séance ! Ici on se donne rendez-vous pour marcher ensemble après le cours. Aucune obligation : restez à votre rythme.', time: 'maintenant', author: 'Camille' },
        { from: 'coach', text: 'Je suis libre samedi à 10h pour une marche au parc Monceau, ça tente quelqu’un ?', time: 'maintenant', author: 'Leïla' },
      ],
      group: {
        name: 'Marche du parc · Cohérence cardiaque',
        memberIds: [],
        students: [{ name: 'Leïla B.', hue: '268' }, { name: 'David K.', hue: '208' }, { name: 'Sofia M.', hue: '8' }],
      },
    }, ...ts])
    setInvite('joined')
  }

  /* flux vidéo horizontal, filtré sur les objectifs du parcours */
  const [storyFilter, setStoryFilter] = useState<'objectifs' | 'tous'>('objectifs')
  const stories = useMemo(() => {
    const mine = quizDomains ?? []
    if (storyFilter === 'tous' || mine.length === 0) return STORIES
    const match = STORIES.filter(s => mine.includes(s.domain))
    const rest = STORIES.filter(s => !match.includes(s))
    return [...match, ...rest]
  }, [quizDomains, storyFilter])
  const eventWeekIds = new Set(EVENTS.map(ev => ev.id))
  const myWeek = [
    ...HOME_ANNOUNCEMENTS.filter(a => joined.includes(a.id)),
    ...EVENTS.filter(ev => joinedEvents.includes(ev.id)).map(ev => ({
      id: ev.id,
      title: ev.title,
      host: ev.host,
      when: `${ev.day} ${ev.month.toLowerCase()}`,
      time: ev.time,
      mode: ev.mode,
      tag: ev.tag,
      seats: `${ev.seats} places`,
      place: ev.place,
      note: ev.desc.split('. ')[0],
      img: ev.img,
    })),
  ]

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
          <Avatar hue="152" initials={name.slice(0, 1).toUpperCase()} photo={avatar ?? IMAGES.userPhoto} size={44} ring />
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

      {/* NOTIFICATIONS — la fin de séance arrive ici, avec le choix de rejoindre ou non le groupe */}
      {!program && (
      <section className="card" data-zone="alerts">
        <div className="feed-head">
          <h2>Notifications</h2>
          <span className="tag mini">{invite === 'open' ? 2 : 1} nouvelle{invite === 'open' ? 's' : ''}</span>
        </div>

        <div className="alert-feed">
          {invite === 'open' && (
            <article className="alert-item glass-lite">
              <div className="alert-item-head">
                <span className="alert-ico"><Icon name="users" size={15} /></span>
                <div>
                  <strong>Votre séance vient de se terminer.</strong>
                  <span>Cohérence cardiaque · 20 min · Camille Durand</span>
                </div>
              </div>
              <p>Souhaitez-vous être ajouté au groupe de chat de la séance ?</p>
              <div className="row">
                <button className="btn btn-ghost sm" onClick={joinSessionGroup}>
                  <Icon name="users" size={13} /><span>Rejoindre le groupe</span>
                </button>
                <button className="btn btn-ghost sm" onClick={() => setInvite('declined')}>
                  <span>Non merci</span>
                </button>
              </div>
            </article>
          )}

          {invite === 'joined' && (
            <article className="alert-item glass-lite on">
              <div className="alert-item-head">
                <span className="alert-ico ok"><Icon name="check" size={15} /></span>
                <div>
                  <strong>Vous avez rejoint le groupe de la séance.</strong>
                  <span>Les messages arrivent dans l’onglet Message.</span>
                </div>
              </div>
              <div className="row">
                <button className="btn btn-soft sm" onClick={() => setTab('synergy')}>
                  <Icon name="chat" size={13} /><span>Ouvrir la conversation</span>
                </button>
              </div>
            </article>
          )}

          {invite === 'declined' && (
            <article className="alert-item glass-lite muted">
              <div className="alert-item-head">
                <span className="alert-ico"><Icon name="shield" size={15} /></span>
                <div>
                  <strong>Vous restez hors du groupe de cette séance.</strong>
                  <span>Vous pourrez rejoindre une prochaine séance, sans engagement.</span>
                </div>
              </div>
            </article>
          )}

          <article className="alert-item glass-lite">
            <div className="alert-item-head">
              <span className="alert-ico"><Icon name="chat" size={15} /></span>
              <div>
                <strong>Camille vous a répondu.</strong>
                <span>Il y a 12 min · dans votre onglet Message</span>
              </div>
            </div>
            <div className="row">
              <button className="btn btn-ghost sm" onClick={() => onOpenChat('camille')}>
                <Icon name="send" size={12} /><span>Répondre</span>
              </button>
            </div>
          </article>
        </div>
      </section>
      )}

      {/* CE QUI SE PASSE CETTE SEMAINE — parcours EVOLIA */}
      {program && (
        <section className="card" data-zone="home-feed">
          <div className="feed-head">
            <h2>Ce qui se passe cette semaine</h2>
            <div className="subtabs feed-tabs">
              {([['week', 'Ma semaine'], ['events', 'Événements']] as const).map(([id, label]) => (
                <button key={id} className={'subtab' + (homeTab === id ? ' on' : '')} onClick={() => setHomeTab(id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="feed-list">
            {homeTab === 'week' && myWeek.map(a => {
              const isEvent = eventWeekIds.has(a.id)
              const on = isEvent ? joinedEvents.includes(a.id) : joined.includes(a.id)
              const toggleWeek = () => {
                if (isEvent) {
                  setJoinedEvents(js => on ? js.filter(x => x !== a.id) : [...js, a.id])
                } else {
                  setJoined(js => on ? js.filter(x => x !== a.id) : [...js, a.id])
                }
              }
              return (
                <article className={'feed-item glass-lite' + (on ? ' on' : '')} key={a.id}>
                  <img className="feed-img" src={a.img} alt="" loading="lazy" />
                  <div className="feed-body">
                    <div className="feed-meta">
                      <span className="tag mini">{a.tag}</span>
                      <span className="feed-time">
                        <Icon name={a.mode === 'Visio' ? 'video' : 'location'} size={11} /> {a.when} · {a.time}
                      </span>
                    </div>
                    <strong>{a.title}</strong>
                    <span className="feed-sub">{a.host} · {a.place} · {a.seats}</span>
                    <p className="feed-note">{a.note}</p>
                    <button
                      className={'feed-join' + (on ? ' on' : '')}
                      onClick={toggleWeek}
                      aria-pressed={on}
                    >
                      <Icon name={on ? 'check' : 'plus'} size={13} />
                      <span>{on ? 'Inscrit' : 'Rejoindre'}</span>
                    </button>
                  </div>
                </article>
              )
            })}
            {homeTab === 'week' && myWeek.length === 0 && (
              <div className="empty">
                <Icon name="calendar" size={26} />
                <p>Aucun événement inscrit cette semaine.</p>
                <button className="link-btn" onClick={() => setHomeTab('events')}>Voir les événements</button>
              </div>
            )}
            {homeTab === 'events' && EVENTS.map(ev => {
              const on = joinedEvents.includes(ev.id)
              return (
                <article className={'feed-item glass-lite' + (on ? ' on' : '')} key={ev.id} onClick={() => setEvent(ev)}>
                  <img className="feed-img" src={ev.img} alt="" loading="lazy" />
                  <div className="feed-body">
                    <div className="feed-meta">
                      <span className="tag mini">{ev.tag}</span>
                      <span className="feed-time">
                        <Icon name={ev.mode === 'Visio' ? 'video' : 'location'} size={11} /> {ev.day} {ev.month} · {ev.time}
                      </span>
                    </div>
                    <strong>{ev.title}</strong>
                    <span className="feed-sub">{ev.host} · {ev.place} · {ev.seats} places</span>
                    <p className="feed-note">{ev.desc}</p>
                    <button
                      className={'feed-join' + (on ? ' on' : '')}
                      onClick={e => { e.stopPropagation(); setJoinedEvents(js => on ? js.filter(x => x !== ev.id) : [...js, ev.id]) }}
                      aria-pressed={on}
                    >
                      <Icon name={on ? 'check' : 'plus'} size={13} />
                      <span>{on ? 'Inscrit' : 'S’inscrire'}</span>
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
        </section>
      )}

      {/* RENDEZ-VOUS — parcours classique */}
      {!program && (
      <section className="card card-sessions" data-zone="sessions">
        <h2>Vos prochains rendez-vous</h2>
        <div className="sessions" style={{ marginTop: 10 }}>
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
      )}

      {program && (
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
      )}
      {!program && <EvolutionJournal onOpenChat={onOpenChat} onOpenEva={onOpenEva} />}

    </div>
  )
}

/* =====================================================
   CARNET D'ÉVOLUTION — composant partagé (Hub & onglet dédié)
   ===================================================== */

const CARNET_MOODS = ['Léger', 'Fatigué', 'Tendu', 'Motivé']
const CARNET_PROMPTS = [
  'Qu’est-ce qui vous a redonné de l’énergie aujourd’hui ?',
  'Quel moment de la journée mérite d’être répété demain ?',
  'Qu’avez-vous appris sur vous cette semaine ?',
]

export function EvolutionJournal({ onOpenChat, onOpenEva, rich = false }: {
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
  rich?: boolean
}) {
  const [entries, setEntries] = useState<{ id: string; date: string; text: string; tag: string }[]>([
    { id: 'j1', date: 'Aujourd’hui · 08:15', text: 'Réveil plus clair après 4 cycles de 4-7-8 hier soir. Moins de raideur dans la nuque.', tag: 'Sommeil' },
    { id: 'j2', date: 'Hier · 21:40', text: 'Journée dense mais pas d’épuisement en fin d’après-midi grâce au protocole de Nora.', tag: 'Énergie' },
  ])
  const [draft, setDraft] = useState('')
  const [recording, setRecording] = useState(false)
  const [secs, setSecs] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [mood, setMood] = useState<string | null>(null)
  const [promptIdx, setPromptIdx] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const areaRef = useRef<HTMLTextAreaElement>(null)
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
    setEntries(es => [{ id: 'j' + Date.now(), date: 'À l’instant', text: draft.trim(), tag: mood ?? 'Journal' }, ...es])
    setDraft('')
    setMood(null)
  }

  return (
    <section className="card" data-zone="journal">
      <div className="row between" style={{ marginTop: 0, marginBottom: rich ? 10 : 0 }}>
        <h2 style={{ margin: 0 }}>{rich ? 'Écrire dans mon carnet' : 'Carnet d’évolution'}</h2>
        {rich && <span className="tag mini">{entries.length} notes</span>}
      </div>

      {rich && (
        <>
          <div className="journal-mood">
            <span className="journal-mood-q">Comment vous sentez-vous ?</span>
            <div className="mood-row">
              {CARNET_MOODS.map(m => (
                <button
                  key={m}
                  className={'mood-chip' + (mood === m ? ' on' : '')}
                  onClick={() => setMood(mood === m ? null : m)}
                  aria-pressed={mood === m}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="journal-prompt glass-lite">
            <div className="journal-prompt-head">
              <span><Icon name="sparkle" size={12} /> QUESTION DU SOIR</span>
              <button className="link-btn" onClick={() => setPromptIdx(i => (i + 1) % CARNET_PROMPTS.length)}>Autre</button>
            </div>
            <p>{CARNET_PROMPTS[promptIdx]}</p>
            <button className="link-btn" onClick={() => areaRef.current?.focus()}>Répondre dans mon carnet</button>
          </div>
        </>
      )}

      <textarea
        ref={areaRef}
        className="journal"
        rows={3}
        placeholder={rich ? 'Écrire librement, ou répondre à la question du soir…' : 'Noter une prise de conscience, un ressenti ou dicter…'}
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
        <button className="btn btn-ghost sm" onClick={() => setShareOpen(v => !v)} aria-expanded={shareOpen}>
          <Icon name="chat" size={13} /><span>Partager avec mon coach</span>
        </button>
      </div>

      {shareOpen && (
        <div className="journal-share glass-lite">
          <div className="row between" style={{ marginTop: 0, marginBottom: 6 }}>
            <span className="card-kicker" style={{ margin: 0 }}>PARTAGER AVEC</span>
            <button className="link-btn" onClick={() => setShareOpen(false)}>Annuler</button>
          </div>
          <div className="journal-share-row">
            {COACH_TEAM.map(t => {
              const c = COACHES.find(x => x.id === t.coachId)
              if (!c) return null
              return (
                <button
                  key={c.id}
                  className="journal-share-coach"
                  onClick={() => { setShareOpen(false); onOpenChat(c.id) }}
                >
                  <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={26} />
                  <span>{c.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

/* =====================================================
   CARNET — onglet dédié du parcours EVOLIA
   ===================================================== */

export function Carnet({ onOpenChat, onOpenEva }: {
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
}) {
  const { name, program } = useStore()
  const next = SESSIONS[0]
  const nextCoach = COACHES.find(c => c.id === next.coachId)!
  const week = [
    { label: 'L', on: false }, { label: 'M', on: false }, { label: 'M', on: false },
    { label: 'J', on: true }, { label: 'V', on: true }, { label: 'S', on: false }, { label: 'D', on: false },
  ]
  return (
    <div className="tab-page carnet-page" data-zone="carnet">
      <header className="page-head">
        <div>
          <div className="date-line">CARNET D’ÉVOLUTION · {program ? 'PROGRAMME EVOLIA' : name.toUpperCase()}</div>
          <h1>Votre carnet,<br />vos mots.</h1>
          <p>Deux minutes pour poser ce qui compte. EVA relie vos notes à votre cap, et vous choisissez ce qui est partagé.</p>
        </div>
      </header>

      <section className="card carnet-hero" data-zone="carnet-week">
        <div className="carnet-hero-top">
          <div>
            <div className="card-kicker"><Icon name="sparkle" size={12} /> CETTE SEMAINE</div>
            <h2>Deux jours de suite. Bravo!</h2>
            <p>La régularité compte plus que la longueur. Une ligne suffit.</p>
          </div>
          <div className="carnet-score"><strong>2</strong><span>jours</span></div>
        </div>

        <div className="carnet-week" aria-label="Jours notés cette semaine">
          {week.map((d, k) => (
            <span key={k} className={'carnet-day' + (d.on ? ' on' : '')}>
              <i />
              <em>{d.label}</em>
            </span>
          ))}
        </div>

        <div className="carnet-themes">
          <span className="carnet-theme"><i className="dot" /> Sommeil · 2 notes</span>
          <span className="carnet-theme"><i className="dot" /> Énergie · 1 note</span>
        </div>

        <div className="carnet-eva glass-lite">
          <EvaAvatar size={22} />
          <div>
            <strong>Ce que EVA retient</strong>
            <p>Vos notes relient le sommeil à votre énergie du matin. Le rituel du soir semble faire effet : on le garde cette semaine.</p>
          </div>
          <button className="btn btn-soft sm carnet-eva-btn" onClick={() => onOpenEva('Fais la synthèse de mon carnet de la semaine')}>Approfondir</button>
        </div>

        <div className="carnet-next">
          <Icon name="calendar" size={13} />
          <span>Prochain point : <strong>{nextCoach.name.split(' ')[0]} · {next.day} {next.month.toLowerCase()} · {next.time}</strong></span>
          <button className="btn btn-ghost sm carnet-next-btn" onClick={() => onOpenChat(next.coachId)}>Préparer</button>
        </div>
      </section>

      <EvolutionJournal onOpenChat={onOpenChat} onOpenEva={onOpenEva} rich />
    </div>
  )
}

/* =====================================================
   EXPLORER — recherche + filtres
   ===================================================== */

/* Vignettes vidéo des coachs — format vertical, défilement automatique de 2 s */
function CoachShorts({ onOpenCoach }: { onOpenCoach: (c: Coach) => void }) {
  const shorts = useMemo(() => COACHES.filter(c => c.video), [])
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || shorts.length === 0) return
    const t = setTimeout(() => setActive(v => (v + 1) % shorts.length), 2000)
    return () => clearTimeout(t)
  }, [active, paused, shorts.length])

  if (shorts.length === 0) return null

  return (
    <section className="shorts-block" data-zone="shorts">
      <div className="shorts-head">
        <h2>Découvrir</h2>
      </div>
      <div
        className="shorts-row"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        {shorts.map((c, i) => (
          <button
            key={c.id}
            className={'short-card' + (i === active ? ' on' : '')}
            onClick={() => { setActive(i); onOpenCoach(c) }}
            aria-label={`${c.name} — ${c.role}, vidéo ${c.video!.duration}`}
          >
            <img src={c.video!.thumb} alt="" loading="lazy" />
            <span className="short-shade" aria-hidden />
            {i === active && <span key={active} className="short-progress" aria-hidden><i /></span>}
            <span className="short-play"><Icon name="play" size={13} /></span>
            <span className="short-meta">
              <strong>{c.name.split(' ')[0]}</strong>
              <span>{c.domains[0]} · {c.video!.duration}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function Explorer({ onOpenCoach }: { onOpenCoach: (c: Coach) => void }) {
  const { quizDomains, followedCoachIds, guest, program } = useStore()
  const [q, setQ] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const cities = [...new Set(COACHES.map(c => c.city))]
  /* accès invité : textes seuls, sans photos */
  const textOnly = guest
  const filterCount = city ? 1 : 0

  const results = useMemo(() => COACHES.filter(c => {
    const ql = q.toLowerCase()
    const matchQ = !ql || c.name.toLowerCase().includes(ql) || c.role.toLowerCase().includes(ql) || c.tags.some(t => t.toLowerCase().includes(ql))
    const matchC = !city || c.city === city
    return matchQ && matchC
  }), [q, city])

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

      {!textOnly && <CoachShorts onOpenCoach={onOpenCoach} />}

      <div className="count-line">Tous</div>

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

/* Le radar suit les domaines réellement travaillés avec les coachs */
const DOMAIN_AXES: Record<string, { v: number; delta: string; insight: string; rec: string }> = {
  Stress: { v: 58, delta: '+7%', insight: 'Tension résiduelle en fin de journée, respiration courte avant les rendez-vous.', rec: 'Cohérence cardiaque 5 min à 18h30' },
  Sommeil: { v: 64, delta: '+9%', insight: 'Endormissement plus rapide, deux réveils nocturnes encore présents cette semaine.', rec: 'Rituel du soir 21h45 avec Camille' },
  Nutrition: { v: 61, delta: '+2%', insight: 'Repas réguliers, apports protéiques à renforcer au petit-déjeuner.', rec: 'Petit-déjeuner protéiné avec Nora' },
  Mouvement: { v: 55, delta: '+5%', insight: 'Mobilité scapulaire en progrès, amplitude encore limitée à droite.', rec: 'Séance mobilité 12 min avec Marc' },
  Mental: { v: 52, delta: '+3%', insight: 'Charge cognitive modérée, clarté stable le matin.', rec: 'Pause respiratoire avant chaque réunion' },
  Confiance: { v: 60, delta: '+8%', insight: 'Prise de parole plus posée, limites mieux exprimées.', rec: 'Préparer l’entretien avec Karim' },
}

/* Rapport de la dernière séance, accessible depuis la bulle du coach */
type LastSession = { date: string; title: string; duration: string; summary: string; points: string[] }
/* Le cap affiché vient du profil (priorités du quiz), pas d'un texte générique */
const DOMAIN_CAPS: Record<string, { cap: string; why: string }> = {
  Sommeil: { cap: 'Retrouver des nuits qui réparent.', why: 'Votre sommeil conditionne votre énergie, vos décisions et votre patience. C’est le premier levier de votre programme.' },
  Stress: { cap: 'Sortir du stress qui s’accumule.', why: 'Quand le système nerveux reste en alerte, tout coûte plus cher. On travaille la respiration et les limites avant d’ajouter des objectifs.' },
  Nutrition: { cap: 'Manger de façon stable, sans régime.', why: 'Des repas réguliers et protéinés soutiennent votre énergie et évitent les coups de fatigue de l’après-midi.' },
  Mouvement: { cap: 'Bouger sans douleur, durablement.', why: 'La mobilité revient par petites doses régulières, pas par des séances héroïques.' },
  Mental: { cap: 'Retrouver de la clarté mentale.', why: 'Un mental encombré rend chaque décision plus lourde. On allège avant d’accélérer.' },
  Confiance: { cap: 'Reprendre confiance dans vos décisions.', why: 'La confiance se reconstruit par des preuves concrètes, pas par la motivation.' },
}

const LAST_SESSIONS: Record<string, LastSession> = {
  camille: { date: '18 nov.', title: 'Respiration #4', duration: '45 min', summary: 'Apnée portée à 29 s, endormissement à 15 min sur les quatre dernières nuits.', points: ['4-7-8 tenu 3 soirs sur 4', 'Rituel du soir calé à 21h45'] },
  marc: { date: '16 nov.', title: 'Mobilité épaule droite', duration: '45 min', summary: 'Amplitude gagnée de 12°, douleur passée de 4 à 2/10 en fin de séance.', points: ['Amplitude +12°', '12 min à domicile 3×/semaine'] },
  karim: { date: '14 nov.', title: 'Bilan de reprise', duration: '30 min', summary: 'Reprise à mi-temps validée, deux matinées par semaine à partir du 1er décembre.', points: ['Entretien employeur préparé', 'Deux matinées tenues'] },
  helene: { date: '19 nov.', title: 'Séance confidentielle', duration: '45 min', summary: 'Notes privées : le contenu de cette séance n’est partagé avec personne.', points: ['Espace confidentiel respecté'] },
}
const LAST_SESSION_DEFAULT: LastSession = { date: '12 nov.', title: 'Séance de suivi', duration: '45 min', summary: 'Point de suivi réalisé, prochain rendez-vous posé avec votre coach.', points: ['Objectifs revus ensemble'] }

/* =====================================================
   MON ÉCOSYSTÈME — espace centralisé en widgets/grille
   ===================================================== */

export function Ecosystem({ onOpenCoach, onOpenChat, onOpenEva }: {
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
}) {
  const { selectedRadarAxis, setSelectedRadarAxis, program, followedCoachIds, quizDomains, threads } = useStore()
  const [ecoView, setEcoView] = useState<'radar' | 'sante'>('radar')
  const [goalCoach, setGoalCoach] = useState<string | null>(null)
  const [axisPopup, setAxisPopup] = useState<string | null>(null)
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

  /* le radar ne garde que les domaines travaillés avec les coachs (équipe + coachs suivis) */
  const teamCoaches = COACH_TEAM.map(t => COACHES.find(c => c.id === t.coachId)).filter((c): c is Coach => !!c)
  const myCoaches = [...teamCoaches, ...COACHES.filter(c => followedCoachIds.includes(c.id))]
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)
  const myDomains = [...new Set(myCoaches.flatMap(c => c.domains))]
  const teamRadar = myDomains.map(d => {
    const base = DOMAIN_AXES[d] ?? { v: 50, delta: '+0%', insight: `Domaine ${d} suivi avec votre équipe.`, rec: 'Faire le point avec votre coach' }
    const ref = myCoaches.find(c => c.domains.includes(d))
    return { axis: d as string, v: base.v, delta: base.delta, coachId: ref?.id ?? 'camille', insight: base.insight, rec: base.rec }
  })
  const radarScores = teamRadar.length > 0 ? teamRadar : RADAR
  const activeAxis = radarScores.find(r => r.axis === selectedRadarAxis) ?? radarScores[0]
  const axisCoach = COACHES.find(c => c.id === activeAxis.coachId) ?? COACHES[0]
  const popupAxis = axisPopup ? radarScores.find(r => r.axis === axisPopup) ?? null : null

  useEffect(() => {
    if (!axisPopup) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAxisPopup(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [axisPopup])

  const openAxisPopup = (axis: string) => {
    setSelectedRadarAxis(axis)
    setAxisPopup(axis)
  }

  /* priorité du profil : quiz d'entrée, sinon les deux axes du programme EVOLIA */
  const priorities = [...new Set(quizDomains.length > 0 ? quizDomains : ['Sommeil', 'Stress'])].slice(0, 3)
  const capInfo = DOMAIN_CAPS[priorities[0]] ?? DOMAIN_CAPS.Sommeil
  const weakest = [...radarScores].sort((a, b) => a.v - b.v)[0]
  const capAxis = radarScores.find(r => r.axis === priorities[0]) ?? weakest
  const prioritySet = new Set(priorities)
  const teamScore = (c: Coach) => c.domains.filter(d => prioritySet.has(d)).length + (c.id === weakest.coachId ? 1 : 0)
  const sortedTeam = COACH_TEAM
    .map(entry => ({
      entry,
      coach: COACHES.find(c => c.id === entry.coachId)!,
      goal: HORIZON_GOALS.find(g => g.coachId === entry.coachId),
    }))
    .sort((a, b) => teamScore(b.coach) - teamScore(a.coach))

  const activeCoachId = goalCoach ?? sortedTeam[0]?.coach.id ?? null
  const activeCoach = COACHES.find(c => c.id === activeCoachId)
  const activeEntry = COACH_TEAM.find(t => t.coachId === activeCoachId)
  const activeGoal = HORIZON_GOALS.find(g => g.coachId === activeCoachId)
  const activeNext = activeGoal?.steps.find(st => !st.done)
  const activeSession = SESSIONS.find(s => s.coachId === activeCoachId)
  const activeThread = threads.find(t => !t.group && t.coachId === activeCoachId)
  const activeMsg = activeThread?.messages[activeThread.messages.length - 1]
  const activePreview = activeMsg
    ? activeMsg.text.length > 84 ? activeMsg.text.slice(0, 84).trimEnd() + '…' : activeMsg.text
    : 'Aucun message pour l’instant'
  const activeRep = activeCoachId ? LAST_SESSIONS[activeCoachId] ?? LAST_SESSION_DEFAULT : LAST_SESSION_DEFAULT
  const activeMatched = activeCoach ? priorities.filter(p => (activeCoach.domains as string[]).includes(p)) : []

  return (
    <>
      <div className="tab-page" data-zone="ecosystem">
      <header className="page-head">
        <div>
          <div className="date-line">MON ÉCOSYSTÈME</div>
          <h1>Votre évolution<br />à 360°.</h1>
        </div>
        <button className="round-btn eco-cam" onClick={() => shotInput.current?.click()} aria-label="Scanner mon repas avec EVA">
          <Icon name="camera" size={19} />
        </button>
      </header>

      {program && (
      <>
      {/* BULLES DE COACH — accès direct en haut */}
      <section className="eco-bubbles-block" data-zone="team">
        <div className="row between" style={{ marginTop: 0, marginBottom: 2 }}>
          <h2 style={{ margin: 0 }}>Votre équipe</h2>
          <span className="tag mini">{COACH_TEAM.length} accompagnants</span>
        </div>
        <div className="goal-bubbles">
          {sortedTeam.map(({ coach: c }) => {
            const on = activeCoachId === c.id
            const unread = threads.find(t => !t.group && t.coachId === c.id)?.unread ?? 0
            return (
              <button
                key={c.id}
                className={'goal-bubble' + (on ? ' on' : '')}
                onClick={() => setGoalCoach(c.id)}
                aria-pressed={on}
              >
                <span className="goal-bubble-photo">
                  <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={64} ring={on} />
                  {unread > 0 && <span className="bubble-badge">{unread}</span>}
                </span>
                <strong>{c.name.split(' ')[0]}</strong>
                <span>{c.domains[0]}</span>
              </button>
            )
          })}
        </div>
      </section>

      {activeCoach && (
      <section className="card eco-cockpit" data-zone="coach">
        <div className="eco-cockpit-head">
          <Avatar hue={activeCoach.hue} initials={activeCoach.initials} photo={activeCoach.photo} size={46} ring />
          <div className="session-info">
            <strong>{activeCoach.name}</strong>
            <span>{activeCoach.role}</span>
          </div>
          {activeMatched.length > 0
            ? <span className="eco-priority-badge">{activeMatched[0]}</span>
            : <span className="tag mini">{activeCoach.domains[0]}</span>}
        </div>

        {activeGoal && (
          <div className="eco-coach-goal">
            <div className="eco-coach-goal-top">
              <span>{activeGoal.horizon} · {activeGoal.due}</span>
              <strong>{activeGoal.progress}%</strong>
            </div>
            <div className="eco-coach-goal-title">{activeGoal.title}</div>
            <div className="group-meter"><span style={{ width: `${activeGoal.progress}%` }} /></div>
            {activeNext && (
              <div className="eco-coach-next">
                <Icon name="arrow-right" size={11} />
                <span>À faire ensuite : <strong>{activeNext.label}</strong></span>
              </div>
            )}
          </div>
        )}

        <div className="eco-links">
          <div className="eco-link glass-lite as-info">
            <span className="eco-link-ico"><Icon name="calendar" size={16} /></span>
            <span className="eco-link-body">
              <span>PROCHAIN RENDEZ-VOUS</span>
              <strong>{activeSession ? `${activeSession.day} ${activeSession.month.toLowerCase()} · ${activeSession.time}` : 'Aucun créneau posé'}</strong>
              <em>{activeSession ? `${activeSession.title} · ${activeSession.duration} min · ${activeSession.mode}` : 'À planifier avec votre coach'}</em>
            </span>
          </div>

          <button className="eco-link glass-lite" onClick={() => onOpenChat(activeCoach.id)}>
            <span className="eco-link-ico"><Icon name="chat" size={16} /></span>
            <span className="eco-link-body">
              <span>DERNIER MESSAGE</span>
              <strong>{activePreview}</strong>
              <em>{activeMsg ? `${activeMsg.from === 'me' ? 'Vous' : activeCoach.name.split(' ')[0]} · ${activeMsg.time}` : 'Le fil est prêt pour votre premier message'}</em>
            </span>
            <Icon name="chevron-right" size={14} />
          </button>

          <div className="eco-link as-info">
            <span className="eco-link-ico"><Icon name="file" size={16} /></span>
            <span className="eco-link-body">
              <span>DERNIÈRE SYNTHÈSE · {activeRep.date}</span>
              <strong>{activeRep.title}</strong>
              <em>{activeRep.summary}</em>
            </span>
          </div>
        </div>

        <details className="eco-more">
          <summary>
            <span>Tout le suivi : étapes, documents, coordination</span>
            <Icon name="chevron-right" size={14} />
          </summary>
          <div className="eco-more-body">
            {activeGoal && (
              <div className="eco-steps">
                <div className="card-kicker" style={{ margin: '2px 0 2px' }}><Icon name="file" size={12} /> ÉTAPES DE L’OBJECTIF</div>
                {activeGoal.steps.map(st => (
                  <span className={'hg-step' + (st.done ? ' done' : '')} key={st.label}>
                    <Icon name={st.done ? 'check' : 'plus'} size={10} />{st.label}
                  </span>
                ))}
              </div>
            )}

            <div className="goal-share">
              <div className="card-kicker" style={{ margin: 0 }}><Icon name="file" size={12} /> DOCUMENTS PARTAGÉS</div>
              <div className="doc-share-bar" style={{ marginTop: 8, marginBottom: 8 }}>
                <input
                  className="eco-input glass-lite"
                  placeholder={`Partager un document avec ${activeCoach.name.split(' ')[0]}…`}
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                />
                <button className="btn btn-soft sm" onClick={() => shareDoc(activeCoach.id)}>
                  <Icon name="share" size={13} /><span>Partager</span>
                </button>
              </div>
              {docs.filter(d => d.coachId === activeCoach.id).map(d => (
                <div className="team-report" key={d.id}>
                  <Icon name="file" size={13} />
                  <div className="session-info">
                    <strong>{d.title}</strong>
                    <span>{d.byMe ? 'Partagé par vous' : 'Reçu de votre coach'} · {d.date} · {d.size}</span>
                  </div>
                </div>
              ))}
            </div>

            {activeEntry && (
              <div className="eco-coordination">
                <div className="card-kicker" style={{ margin: '2px 0 4px' }}><Icon name="users" size={12} /> COORDINATION DE L’ÉQUIPE</div>
                {EVA_SESSION_REPORTS.filter(r => r.coachId === activeCoach.id).map(r => (
                  <details className="team-eva" key={r.id}>
                    <summary>
                      <Icon name="sparkle" size={12} />
                      <span>{r.title}</span>
                      <em>{r.date}</em>
                    </summary>
                    <p>{r.summary}</p>
                    <ul className="eva-report-ul">
                      {r.nextActions.map((a, k) => <li key={k}><Icon name="arrow-right" size={12} /><span>{a}</span></li>)}
                    </ul>
                  </details>
                ))}
                {activeEntry.reports.map(r => (
                  <div className={'team-report' + (r.shared ? '' : ' locked')} key={r.title}>
                    <Icon name={r.shared ? 'file' : 'lock'} size={13} />
                    <div className="session-info">
                      <strong>{r.title}</strong>
                      <span>{r.date}{r.shared ? ' · visible par l’équipe' : ' · visible par vous uniquement'}</span>
                    </div>
                  </div>
                ))}
                <div className={'team-privacy ' + activeEntry.privacy}>
                  <Icon name="shield" size={12} />
                  <span>Avec votre accord, ces comptes rendus sont partagés avec les autres coachs. Les notes d’Hélène restent strictement privées.</span>
                </div>
              </div>
            )}
          </div>
        </details>

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btn-soft sm" onClick={() => onOpenCoach(activeCoach)}>
            <Icon name="user" size={13} /><span>Fiche du coach</span>
          </button>
          <button className="btn btn-ghost sm" onClick={() => onOpenChat(activeCoach.id)}>
            <Icon name="chat" size={13} /><span>Écrire à {activeCoach.name.split(' ')[0]}</span>
          </button>
        </div>
      </section>
      )}

      {/* CAP — replié pour laisser les coachs en premier */}
      <details className="eco-cap-strip glass-lite" data-zone="cap">
        <summary>
          <span className="eco-cap-ico"><Icon name="activity" size={14} /></span>
          <span className="eco-cap-body">
            <em>VOTRE CAP</em>
            <strong>{capInfo.cap}</strong>
          </span>
          <Icon name="chevron-right" size={14} />
        </summary>
        <div className="eco-cap-more">
          <p>{capInfo.why}</p>
          <div className="eco-cap-chips">
            {priorities.map(p => {
              const score = radarScores.find(r => r.axis === p)?.v
              return (
                <span className="eco-cap-chip" key={p}>
                  {p}
                  {score !== undefined && <em>{score}</em>}
                </span>
              )
            })}
          </div>
          <div className="eco-cap-next glass-lite">
            <Icon name="sparkle" size={12} />
            <span>Votre premier pas : <strong>{capAxis.rec}</strong>.</span>
          </div>
        </div>
      </details>
      </>
      )}

      {/* ÉCOSYSTÈME CLASSIQUE — bulles de coach, reliées au radar de vie */}
      {!program && (
        <section className="card" data-zone="objectifs">
          <div className="row between" style={{ marginTop: 0, marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>Vos coachs</h2>
            <span className="tag mini">{COACH_TEAM.length} accompagnants</span>
          </div>
          <div className="goal-bubbles">
            {COACH_TEAM.map(t => {
              const c = COACHES.find(x => x.id === t.coachId)!
              const on = goalCoach === c.id
              return (
                <button
                  key={c.id}
                  className={'goal-bubble' + (on ? ' on' : '')}
                  onClick={() => setGoalCoach(on ? null : c.id)}
                  aria-pressed={on}
                >
                  <span className="goal-bubble-photo">
                    <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={64} ring={on} />
                  </span>
                  <strong>{c.name.split(' ')[0]}</strong>
                  <span>{c.domains[0]}</span>
                </button>
              )
            })}
          </div>

          {(() => {
            const c = COACHES.find(x => x.id === goalCoach)
            if (!c) return <p className="goal-hint">Choisissez un coach pour voir ce qu’il travaille avec vous.</p>
            const goal = HORIZON_GOALS.find(g => g.coachId === c.id)
            const rep = LAST_SESSIONS[c.id] ?? LAST_SESSION_DEFAULT
            const next = goal?.steps.find(st => !st.done)
            const axis = radarScores.find(r => (c.domains as string[]).includes(r.axis)) ?? activeAxis
            return (
              <div className="goal-detail" key={c.id}>
                <div className="goal-detail-head">
                  <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={28} />
                  <div className="session-info">
                    <strong>{c.name}</strong>
                    <span>{c.role}</span>
                  </div>
                  {goal && <span className="tag mini">{goal.horizon}</span>}
                </div>

                <div className="eco-coach-radar glass-lite">
                  <div className="eco-coach-radar-head">
                    <span><Icon name="activity" size={12} /> Sur votre radar de vie</span>
                    <strong>{axis.axis} · {axis.v}/100</strong>
                  </div>
                  <div className="group-meter"><span style={{ width: `${axis.v}%` }} /></div>
                  <button className="btn btn-soft sm eco-axis-btn" onClick={() => openAxisPopup(axis.axis)}>
                    <Icon name="activity" size={12} />
                    <span>Voir cet axe dans le radar</span>
                  </button>
                </div>

                {goal && (
                  <div className="eco-coach-goal">
                    <div className="eco-coach-goal-top">
                      <span>{goal.horizon} · {goal.due}</span>
                      <strong>{goal.progress}%</strong>
                    </div>
                    <div className="eco-coach-goal-title">{goal.title}</div>
                    <div className="group-meter"><span style={{ width: `${goal.progress}%` }} /></div>
                    {next && (
                      <div className="eco-coach-next">
                        <Icon name="arrow-right" size={11} />
                        <span>Prochaine étape : <strong>{next.label}</strong></span>
                      </div>
                    )}
                    <div className="hg-steps">
                      {goal.steps.map(st => (
                        <span className={'hg-step' + (st.done ? ' done' : '')} key={st.label}>
                          <Icon name={st.done ? 'check' : 'plus'} size={10} />{st.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="coach-report glass-lite">
                  <div className="card-kicker" style={{ margin: 0 }}><Icon name="file" size={12} /> DERNIÈRE SÉANCE</div>
                  <div className="report-meta">{rep.date} · {rep.title} · {rep.duration}</div>
                  <p>{rep.summary}</p>
                </div>

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

                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn btn-soft sm" onClick={() => onOpenCoach(c)}>
                    <Icon name="user" size={13} /><span>Fiche du coach</span>
                  </button>
                  <button className="btn btn-ghost sm" onClick={() => onOpenChat(c.id)}>
                    <Icon name="chat" size={13} /><span>Écrire à {c.name.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            )
          })()}
        </section>
      )}

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

      {/* RADAR DE VIE & SANTÉ — deux modules empilés, accessibles par onglets */}
      <div className="msg-filters eco-tabs">
        <button className={'msg-filter' + (ecoView === 'radar' ? ' on' : '')} onClick={() => setEcoView('radar')}>Radar de vie</button>
        <button className={'msg-filter' + (ecoView === 'sante' ? ' on' : '')} onClick={() => setEcoView('sante')}>Santé & biométrie</button>
      </div>

      {ecoView === 'radar' && (
      <section className="card card-balance" data-zone="radar">
        <span className="balance-wash" aria-hidden />
        <div className="card-kicker"><Icon name="activity" size={13} /> RADAR DE VIE</div>
        <div className="radar-head">
          <h2>Analyse par domaine</h2>
          <span className="tag mini glass-lite">{activeAxis.axis} sélectionné</span>
        </div>

        <RadarChart
          scores={radarScores}
          selectedAxis={activeAxis.axis}
          onSelectAxis={axis => setSelectedRadarAxis(axis)}
          expanded
        />

        <div className="radar-scores">
          {radarScores.map(r => {
            const isSel = activeAxis.axis === r.axis
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

      </section>
      )}

      {ecoView === 'sante' && (
      <section className="card" data-zone="health">
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
      )}

    </div>

      {popupAxis && (
        <div className="axis-layer" onClick={() => setAxisPopup(null)}>
          <div
            className="axis-pop"
            role="dialog"
            aria-modal="true"
            aria-label={`${popupAxis.axis} sur votre radar de vie`}
            onClick={e => e.stopPropagation()}
          >
            <button className="axis-pop-close" onClick={() => setAxisPopup(null)} aria-label="Fermer">
              <Icon name="close" size={16} />
            </button>
            <div className="card-kicker" style={{ margin: 0 }}><Icon name="activity" size={12} /> VOTRE RADAR DE VIE</div>
            <div className="axis-pop-head">
              <div>
                <span>AXE SÉLECTIONNÉ</span>
                <h2>{popupAxis.axis}</h2>
              </div>
              <strong className="axis-pop-score">{popupAxis.v}<em>/100</em></strong>
            </div>
            <div className="group-meter"><span style={{ width: `${popupAxis.v}%` }} /></div>
            <RadarChart
              scores={radarScores}
              selectedAxis={popupAxis.axis}
              onSelectAxis={next => { setSelectedRadarAxis(next); setAxisPopup(next) }}
              expanded
            />
            <p className="axis-pop-insight">{popupAxis.insight}</p>
            <div className="axis-pop-rec">
              <Icon name="sparkle" size={12} />
              <span>{popupAxis.rec}</span>
            </div>
            <button className="btn btn-ghost sm axis-pop-done" onClick={() => setAxisPopup(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
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
