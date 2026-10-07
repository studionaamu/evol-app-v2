import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar } from './bits'
import { useStore } from './store'
import {
  COACHES, SESSIONS, EXERCISES, INTENTIONS, QUOTES, IMAGES,
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
  { label: 'Lumineux', color: '#E9A13B' },
  { label: 'Correct', color: '#2E6BFF' },
  { label: 'Brouillard', color: '#8E9BB5' },
  { label: 'Lourd', color: '#6D3EAD' },
  { label: 'Orage', color: '#101013' },
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

const RADAR = [
  { axis: 'Corps', v: 72 },
  { axis: 'Mind', v: 55 },
  { axis: 'Social', v: 80 },
  { axis: 'Énergie', v: 38 },
  { axis: 'Pro', v: 60 },
  { axis: 'Sommeil', v: 34 },
]

function RadarChart({ scores }: { scores: { axis: string; v: number }[] }) {
  const cx = 150, cy = 128, R = 92
  const n = scores.length
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  }
  const ring = (r: number) => scores.map((_, i) => pt(i, r).join(',')).join(' ')
  const shape = scores.map((s, i) => pt(i, (s.v / 100) * R).join(',')).join(' ')
  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 300 300" className="radar-svg" aria-hidden>
        {[0.33, 0.66, 1].map(f => <polygon key={f} points={ring(R * f)} className="radar-ring" />)}
        {scores.map((_, i) => {
          const [x, y] = pt(i, R)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar-spoke" />
        })}
        <polygon points={shape} className="radar-area" />
        {scores.map((s, i) => {
          const [x, y] = pt(i, (s.v / 100) * R)
          return <circle key={i} cx={x} cy={y} r={4} className="radar-dot" />
        })}
        {scores.map((s, i) => {
          const [x, y] = pt(i, R + 26)
          return <text key={i} x={x} y={y} className="radar-label" textAnchor="middle" dominantBaseline="middle">{s.axis}</text>
        })}
      </svg>
    </div>
  )
}

export function Hub({ onOpenExercise, onOpenCoach, onOpenChat, onOpenEva, replayTourSignal }: {
  onOpenExercise: (id: string) => void
  onOpenCoach: (c: Coach) => void
  onOpenChat: (coachId: string) => void
  onOpenEva: (prefill?: string) => void
  replayTourSignal?: boolean
}) {
  const { name, tourDone, setTourDone, consent } = useStore()
  const [tourStep, setTourStep] = useState<number | null>(tourDone ? null : 0)
  useEffect(() => { if (replayTourSignal !== undefined) setTourStep(tourDone ? null : 0) }, [replayTourSignal])
  const [mood, setMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [intention] = useState(() => INTENTIONS[Math.floor(Math.random() * INTENTIONS.length)])
  const bars = [42, 55, 38, 62, 48, 70, 58]
  void bars

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

      <section className="card card-intent on-photo" data-zone="intent">
        <img className="intent-photo" src={IMAGES.intent} alt="" aria-hidden />
        <div className="intent-content">
          <div className="card-kicker on-photo"><Icon name="sparkle" size={13} /> VOTRE INTENTION DU JOUR</div>
          <h2>{intention.title}</h2>
          <p>{intention.sub}</p>
          <div className="row">
            <button className="btn btn-glass solid" onClick={() => onOpenExercise(intention.ex)}>
              <span>Commencer</span><Icon name="arrow-right" size={16} />
            </button>
            <div className="meta-chip on-photo"><Icon name="clock" size={13} /> {EXERCISES.find(e => e.id === intention.ex)?.duration} min</div>
          </div>
        </div>
      </section>

      <section className="card card-balance" data-zone="balance">
        <span className="balance-wash" aria-hidden />
        <div className="card-kicker"><Icon name="activity" size={13} /> VOTRE ÉQUILIBRE</div>
        <div className="radar-head">
          <h2>Radar de vie</h2>
          <span className="radar-when"><Icon name="clock" size={12} /> Aujourd'hui <em className="radar-caret" /></span>
        </div>
        <RadarChart scores={RADAR} />
        <div className="radar-scores">
          {RADAR.map(r => (
            <div className="radar-score" key={r.axis}>
              <span>{r.axis}</span>
              <strong style={r.v < 45 ? { color: '#B2231A' } : undefined}>{r.v}</strong>
            </div>
          ))}
        </div>
        <div className="client-flag watch" style={{ marginTop: 14 }}>
          <Icon name="alert" size={14} />
          <span>Fatigue détectée : vos nuits courtes pèsent sur l'énergie. Un rituel d'ancrage est recommandé ce soir.</span>
        </div>
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

      <section className="card" data-zone="journal">
        <div className="card-kicker"><Icon name="sparkle" size={13} /> JOURNAL</div>
        <h2>Comment vous sentez-vous ?</h2>
        <div className="moods">
          {MOODS.map((m, k) => (
            <button key={k} className={'mood' + (mood === k ? ' on' : '')} onClick={() => setMood(k)} style={{ '--m': m.color } as React.CSSProperties}>
              <span className="mood-orb" aria-hidden /><span>{m.label}</span>
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

      <section className="card card-grad eva-card" data-zone="eva">
        <span className="eva-orb" aria-hidden />
        <div className="card-kicker light"><Icon name="sparkle" size={13} /> EVA · VOTRE ASSISTANTE</div>
        <h2>Une question ? EVA est là.</h2>
        <p className="light-dim">Elle répond, vous oriente vers le bon coach et veille sur vos signaux de santé.</p>
        <div className="eva-quick">
          {['Je me sens stressé·e', 'J’ai mal au dos', 'Je veux mieux manger', 'Choisir un coach'].map(s => (
            <button key={s} className="eva-chip" onClick={() => onOpenEva(s)}>{s}</button>
          ))}
        </div>
        <button className="btn btn-inverse" onClick={() => onOpenEva()}>
          <span>Parler à EVA</span><Icon name="arrow-right" size={15} />
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
            <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={58} ring />
            <span>{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="count-line">{results.length} accompagnant{results.length > 1 ? 's' : ''}{specialty || maxPrice || mode ? ' · filtres actifs' : ''}</div>

      <div className="coach-list">
        {results.map(c => (
          <article className="coach-line" key={c.id} onClick={() => onOpenCoach(c)}>
            <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={54} ring />
            <div className="coach-id">
              <strong>{c.name}{quizDomains.some(d => c.domains.includes(d as any)) && <em className="match-dot" />}</strong>
              <span>{c.role}</span>
              <div className="coach-meta">
                <span className="rating"><Icon name="star" size={12} /> {c.rating}</span>
                <span><Icon name="location" size={12} /> {c.city} · {c.mode}</span>
              </div>
            </div>
            <button className="fav" aria-label="Favori" onClick={e => { e.stopPropagation(); setFav(f => f.includes(c.id) ? f.filter(x => x !== c.id) : [...f, c.id]) }}>
              <Icon name="heart" size={16} filled={fav.includes(c.id)} />
            </button>
            <strong className="price-line-s">{c.price} €</strong>
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

/* =====================================================
   EVA — assistante IA (coaché, prefill Hub) & coach (alertes)
   ===================================================== */

export type EvaTone = 'stress' | 'sommeil' | 'nutrition' | 'douleur' | 'mental' | 'info'
export type EvaMessage = { from: 'eva' | 'me'; text: string; actions?: EvaAction[] }
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
  const [msgs, setMsgs] = useState<EvaMessage[]>([
    role === 'coach'
      ? { from: 'eva', text: 'Bonjour Marcus. J’ai agrégé les signaux de vos clients : 2 alertes méritent votre attention, dont une critique (Sofia M. — récupération insuffisante). Je vous fais la synthèse quand vous voulez.', actions: [{ label: 'Synthèse des alertes', kind: 'info' }] }
      : { from: 'eva', text: `Bonjour ${name || 'vous'}. Posez-moi vos questions : stress, sommeil, énergie, douleur, nutrition — ou dites « choisir un coach ».` , actions: undefined }
  ])
  const [draft, setDraft] = useState(prefill ?? '')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

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
    <div className="screen chat-screen">
      <header className="chat-head">
        <button className="icon-btn" onClick={onClose} aria-label="Retour"><Icon name="chevron-left" size={19} /></button>
        <div className="eva-avatar-sm" aria-hidden>
          <Icon name="sparkle" size={17} />
        </div>
        <div className="chat-who">
          <strong>EVA</strong>
          <span><i className="dot" /> Assistante Evol · IA</span>
        </div>
        <button className="icon-btn" aria-label="Appel EVA"><Icon name="phone" size={17} /></button>
      </header>

      <div className="body eva-console">
        <div className="eva-stage">
          <span className="eva-halo" aria-hidden />
          <span className="eva-orb-lum" data-phase={typing ? 'alive' : 'idle'} aria-hidden />
          <div className="eva-hello">
            <div className="eva-hello-kicker">{role === 'coach' ? 'VOS SIGNAUX SONT À JOUR' : 'VOTRE ESPACE EST CALME'}</div>
            <h2>Hello {name || 'vous'}</h2>
            <p>Comment puis-je vous aider aujourd’hui ?</p>
          </div>
        </div>
        <div className="eva-feed">
          <div className="chat-note"><Icon name="shield" size={12} /> EVA vous oriente vers l’humain. En cas d’urgence, appelez le 15 ou le 112.</div>
          {msgs.map((m, k) => (
            m.from === 'me'
              ? <div key={k} className="bubble-row me">
                  <div className="bubble"><p>{m.text}</p><span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                </div>
              : <div key={k} className="eva-cardmsg">
                  <div className="eva-cardmsg-head"><span className="eva-orb-mini" aria-hidden /><strong>EVA</strong></div>
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
          {typing && <div className="eva-cardmsg eva-typing"><span className="eva-orb-mini" /><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
      </div>

      <div className="eva-composer glass">
        <input
          placeholder={role === 'coach' ? 'Demander à EVA…' : 'Demandez moi tout…'}
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
