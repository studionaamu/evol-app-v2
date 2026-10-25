import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Avatar } from './bits'
import { useStore } from './store'
import {
  COACHES, IMAGES, COACH_CLIENTS, COACH_GROUPS, COACH_CALLS, SESSIONS,
  INITIAL_VITRINE_PROGRAMS, INITIAL_FREEBIES, INITIAL_GALLERY, EVA_SESSION_REPORTS,
  type Consent, type CoachClient, type CoachGroup, type CoachCall,
  type CoachProgram, type CoachMedia,
} from './data'
import { CallScreen } from './screens2'

export type CoachTab = 'bord' | 'vitrine' | 'clients' | 'messagerie' | 'reglages'
export type VitrineSub = 'programmes' | 'creneaux' | 'freebies' | 'galerie'

/* =====================================================
   PROFIL — réglages, confidentialité RGPD, déconnexion
   ===================================================== */

export function Profile({ onGoCoach }: { onGoCoach: () => void }) {
  const { name, guest, consent, setConsent, reset, role } = useStore()
  const [dark, setDark] = useState(() => localStorage.getItem('evol-theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('evol-theme', dark ? 'dark' : 'light')
    const meta = document.querySelector('meta[name=theme-color]')
    if (meta) meta.setAttribute('content', dark ? '#101013' : '#F1EFF7')
  }, [dark])

  return (
    <div className="tab-page" data-zone="profile">
      <header className="page-head">
        <div>
          <div className="date-line">PROFIL</div>
          <h1>{guest ? 'Mode invité' : name}</h1>
          <p>{guest ? 'Vos données restent sur cet appareil.' : 'Votre espace, vos règles.'}</p>
        </div>
        <Avatar hue="158" initials={guest ? '?' : name.slice(0, 1).toUpperCase()} photo={IMAGES.userPhoto} size={56} ring />
      </header>

      <section className="card">
        <div className="card-kicker">RÉGLAGES</div>
        <div className="setting row between" onClick={() => setDark(!dark)}>
          <div className="setting-label"><Icon name={dark ? 'moon' : 'sun'} size={17} />{dark ? 'Thème sombre' : 'Thème clair'}</div>
          <span className={'switch' + (dark ? ' on' : '')}><i /></span>
        </div>
      </section>

      {/* ---- RGPD : révocation ---- */}
      <section className="card">
        <div className="card-kicker"><Icon name="shield" size={13} /> CONFIDENTIALITÉ · RGPD</div>
        {([
          ['journal', 'Transcription IA du journal', 'Vos notes vocales transcrites puis chiffrées.'],
          ['shareCoach', 'Partage avec vos coachs', 'Signaux et extraits choisis uniquement.'],
          ['health', 'Données de santé', 'Objectifs et signaux bien-être.'],
        ] as [keyof Consent, string, string][]).map(([k, title, desc]) => (
          <div key={k} className="setting row between consent-line" onClick={() => setConsent(v => ({ ...v, [k]: !v[k] }))}>
            <div className="setting-label">
              <span className="setting-txt"><strong>{title}</strong><span>{desc}</span></span>
            </div>
            <span className={'switch' + (consent[k] ? ' on' : '')}><i /></span>
          </div>
        ))}
        <div className="service-list">
          <button className="service-btn"><Icon name="share" size={15} /><span>Exporter mes données</span><Icon name="chevron-right" size={13} /></button>
          <button className="service-btn danger"><Icon name="close" size={15} /><span>Supprimer mon compte</span><Icon name="chevron-right" size={13} /></button>
          <p className="service-note">Suppression définitive sous 30 jours, réversible par e-mail. Export en JSON + PDF.</p>
        </div>
      </section>

      <section className="card">
        <div className="card-kicker">AUTRE</div>
        {role === 'coache' && (
          <button className="setting wide" onClick={onGoCoach}><Icon name="user" size={17} />Espace coach (démo)<Icon name="chevron-right" size={14} /></button>
        )}
        <button className="setting wide"><Icon name="sparkle" size={17} />À propos d'Evol<Icon name="chevron-right" size={14} /></button>
      </section>

      <button className="logout" onClick={() => { reset() }}>
        <Icon name="close" size={15} /> {guest ? 'Quitter le mode invité' : 'Se déconnecter'}
      </button>
      <footer className="tab-footer">Evol v1.0 · © 2026 · hébergé en UE</footer>
    </div>
  )
}

/* =====================================================
   ESPACE COACH — Bord / Clients / Messagerie / Agenda
   ===================================================== */

const clientById = (id: string) => COACH_CLIENTS.find(c => c.id === id)!

function TrendBars({ data, invert = false }: { data: number[]; invert?: boolean }) {
  return (
    <div className="sparkline" aria-hidden>
      {data.map((b, k) => (
        <span key={k} style={{
          height: `${b}%`,
          background: k === data.length - 1
            ? 'color-mix(in srgb, var(--ink) 26%, transparent)'
            : invert && b < 50
              ? 'rgba(233,43,31,0.30)'
              : undefined,
        }} />
      ))}
    </div>
  )
}

function ClientCard({ c, onMessage }: { c: CoachClient; onMessage: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const hasAlert = c.flags.some(f => f.type === 'alert')
  const hasWatch = c.flags.some(f => f.type === 'watch')
  return (
    <section className={'card client-card' + (open ? ' open' : '')}>
      <button className="client-row wide" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={44} ring />
        <div className="session-info">
          <strong>
            {c.name}
            {hasAlert && <em className="flag-dot alert" title="Alerte" />}
            {hasWatch && !hasAlert && <em className="flag-dot watch" title="À surveiller" />}
          </strong>
          <span>{c.program}</span>
        </div>
        <span className={'chev drop' + (open ? ' on' : '')}><Icon name="chevron-right" size={15} /></span>
      </button>

      {open && (
        <div className="client-detail">
          <div className="metric-grid">
            {c.metrics.map(m => (
              <div className="metric" key={m.label}>
                <div className="metric-top"><span>{m.label}</span>{m.delta && <span className={'delta' + (m.up ? ' up' : m.delta.startsWith('-') ? ' down' : '')}>{m.delta}</span>}</div>
                <div className="metric-val sm">{m.value}</div>
              </div>
            ))}
          </div>
          <TrendBars data={c.trend} invert />
          <div className="axis"><span>S-6</span><span>Auj.</span></div>

          <div className="client-lines">
            <div className="client-line"><Icon name="activity" size={14} /><span>Énergie {c.energy}/100 · sommeil {c.sleep}</span></div>
            <div className="client-line"><Icon name="check" size={14} /><span>Assiduité {c.adherence}% · {c.startedAgo}</span></div>
            <div className="client-line"><Icon name="calendar" size={14} /><span>Prochaine séance : {c.nextSession}</span></div>
          </div>

          {c.flags.map((f, k) => (
            <div key={k} className={'client-flag ' + f.type}>
              <Icon name={f.type === 'alert' ? 'alert' : f.type === 'watch' ? 'clock' : 'check'} size={14} />
              <span>{f.text}</span>
            </div>
          ))}

          {c.journal && (
            <div className="transcript">
              <div className="transcript-head"><Icon name="sparkle" size={12} /> Journal partagé (extrait)</div>
              <p>{c.journal}</p>
            </div>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn-soft sm" onClick={() => onMessage(c.id)}>
              <Icon name="chat" size={14} /><span>Message</span>
            </button>
          </div>
          <div className="privacy"><Icon name="shield" size={13} /> Partage autorisé par {c.name.split(' ')[0]} · révocable à tout moment.</div>
        </div>
      )}
    </section>
  )
}

function GroupCard({ g, onMessage }: { g: CoachGroup; onMessage: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const members = g.memberIds.map(clientById)
  return (
    <section className={'card client-card' + (open ? ' open' : '')}>
      <button className="client-row wide" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="group-av">{members.slice(0, 2).map(m => (
          <Avatar key={m.id} hue={m.hue} initials={m.initials} photo={m.photo} size={30} />
        ))}</div>
        <div className="session-info">
          <strong>{g.name}</strong>
          <span>{g.mode} · {g.schedule}</span>
        </div>
        <span className={'chev drop' + (open ? ' on' : '')}><Icon name="chevron-right" size={15} /></span>
      </button>
      {open && (
        <div className="client-detail">
          <div className="client-lines">
            <div className="client-line"><Icon name="users" size={14} /><span>{members.map(m => m.name.split(' ')[0]).join(' · ')}</span></div>
            <div className="client-line"><Icon name="activity" size={14} /><span>{g.objective}</span></div>
          </div>
          <div className="metric-top" style={{ margin: '12px 2px 8px' }}><span>Progression du groupe</span><span>{g.progress}%</span></div>
          <div className="group-meter"><span style={{ width: `${g.progress}%` }} /></div>
          {members.map(m => (
            <div className="client-line" key={m.id} style={{ marginTop: 8 }}>
              <Avatar hue={m.hue} initials={m.initials} photo={m.photo} size={26} />
              <span>{m.name.split(' ')[0]} — {m.metrics[0].value} énergie · {m.metrics[2].value} assiduité</span>
            </div>
          ))}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn-soft sm" onClick={() => onMessage(g.id)}>
              <Icon name="chat" size={14} /><span>Message</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function CallRow({ call, onStartVisio }: { call: CoachCall; onStartVisio?: (who: string, isGroup: boolean) => void }) {
  const isGroup = call.scope === 'groupe'
  const target = isGroup ? null : clientById(call.withId)
  const group = isGroup ? COACH_GROUPS.find(g => g.id === call.withId)! : null
  const labelName = isGroup ? group!.name : target!.name
  return (
    <button className={'call-row' + (call.missed ? ' missed' : '')} onClick={() => onStartVisio?.(labelName, isGroup)}>
      {isGroup
        ? <div className="group-av">{group!.memberIds.slice(0, 2).map(id => {
            const m = clientById(id)
            return <Avatar key={id} hue={m.hue} initials={m.initials} photo={m.photo} size={26} />
          })}</div>
        : <Avatar hue={target!.hue} initials={target!.initials} photo={target!.photo} size={42} ring />}
      <div className="session-info">
        <strong>{isGroup ? group!.name : target!.name.split(' ')[0]}</strong>
        <span>{call.when}{call.duration ? ` · ${call.duration}` : ''}{call.missed ? ' · manqué' : ''}</span>
      </div>
      <span className={'call-kind ' + call.kind}>
        <Icon name={call.kind === 'video' ? 'video' : 'phone'} size={15} />
        {isGroup && <em>{group!.memberIds.length}</em>}
      </span>
    </button>
  )
}

function addMinutesToTime(hhmm: string, mins: number): string {
  const [hStr, mStr] = hhmm.split(':')
  const total = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0) + mins
  const nh = Math.floor((total % (24 * 60)) / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

export function CoachSpace({ coachTab, onChangeCoachTab, onExit, onOpenEva, activeThreadId, onChangeThread, vitrineSub, onChangeVitrineSub }: {
  coachTab: CoachTab
  onChangeCoachTab?: (t: CoachTab) => void
  onExit: () => void
  onOpenEva?: (prefill?: string) => void
  activeThreadId: string | null
  onChangeThread: (id: string | null) => void
  vitrineSub: VitrineSub
  onChangeVitrineSub: (s: VitrineSub) => void
}) {
  const { coachSync, setCoachSync } = useStore()
  const [mTab, setMTab] = useState<'messages' | 'appels' | 'visio'>('messages')
  const [month, setMonth] = useState(0) // 0 = mois courant
  const base = new Date()
  const viewMonth = new Date(base.getFullYear(), base.getMonth() + month, 1)
  const monthLabel = viewMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const firstWd = (viewMonth.getDay() + 6) % 7 // lundi = 0
  const daysIn = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()

  /* Logique d'agenda : disponibilités avec bloc de +15 min retour sur séance auto */
  const [selectedDay, setSelectedDay] = useState<number>(base.getDate())
  const [newSlotTime, setNewSlotTime] = useState('11:00')
  const [newSlotDur, setNewSlotDur] = useState(45)
  const [customSlots, setCustomSlots] = useState<{ id: string; day: number; start: string; end: string; debriefEnd: string; dur: number }[]>([
    { id: 'cs1', day: base.getDate(), start: '16:00', end: '16:45', debriefEnd: '17:00', dur: 45 },
  ])
  /* Visio live + Modale d'évaluation post-visio avec Compte Rendu IA EVA (-80% temps admin) */
  const [liveVisio, setLiveVisio] = useState<{ who: string; isGroup: boolean } | null>(null)
  const [evalModal, setEvalModal] = useState<{ who: string; isGroup: boolean } | null>(null)
  const [evalRating, setEvalRating] = useState(5)
  const [evalEnergy, setEvalEnergy] = useState<'Stable' | 'En hausse' | 'Fatigue'>('En hausse')
  const [evalNote, setEvalNote] = useState('')
  const [evalValidated, setEvalValidated] = useState(false)

  /* Onglet Offre & Planning (ex-Vitrine optimisé) : programmes, disponibilités & créneaux, freebies, grilles tarifaires */
  const vSub = vitrineSub
  const setVSub = onChangeVitrineSub
  const COACH_FIRST_NAME = COACHES.find(c => c.id === 'camille')!.name.split(' ')[0]
  const [programs, setPrograms] = useState<CoachProgram[]>(INITIAL_VITRINE_PROGRAMS)
  const activePrograms = programs.filter(p => p.active)
  const programRevenue = activePrograms.reduce((sum, p) => sum + p.price, 0)
  const avgAdherence = Math.round(COACH_CLIENTS.reduce((n, c) => n + c.adherence, 0) / COACH_CLIENTS.length)
  const clientAlerts = COACH_CLIENTS.filter(c => c.flags.some(f => f.type === 'alert')).length
  const [editingProg, setEditingProg] = useState<CoachProgram | null>(null)
  const [progTitle, setProgTitle] = useState('')
  const [progDur, setProgDur] = useState('8 semaines')
  const [progPrice, setProgPrice] = useState('420')
  const [progDesc, setProgDesc] = useState('')
  const [showProgForm, setShowProgForm] = useState(false)

  const [freebies, setFreebies] = useState(INITIAL_FREEBIES)
  const [freeTitle, setFreeTitle] = useState('')
  const [freeKind, setFreeKind] = useState('Audio')
  const [freeDur, setFreeDur] = useState('5 min')

  /* Galerie — photos & vidéos publiées par le coach */
  const [gallery, setGallery] = useState<CoachMedia[]>(INITIAL_GALLERY)
  const [mediaTitle, setMediaTitle] = useState('')
  const [mediaKind, setMediaKind] = useState<'Photo' | 'Vidéo'>('Photo')


  /* Messagerie Coach interactive : fil porté par App pour survivre au changement d'onglet */
  const activeCoachThreadId = activeThreadId
  const setActiveCoachThreadId = onChangeThread
  const [coachDraft, setCoachDraft] = useState('')
  const [coachThreads, setCoachThreads] = useState<Record<string, { from: 'coach' | 'client'; text: string; time: string; author?: string }[]>>({
    alex: [
      { from: 'client', text: 'Bonjour Camille, j’ai pratiqué le 4-7-8 hier soir, endormissement en 15 min !', time: '09:12' },
      { from: 'coach', text: 'Bravo Alex ! On maintient ce rythme jusqu’à notre séance de demain 09:30.', time: '09:18' },
      { from: 'client', text: 'Parfait, j’ai aussi partagé mon relevé cardio dans l’Écosystème.', time: '09:22' },
    ],
    sofia: [
      { from: 'client', text: 'Grosse fatigue cette semaine, j’ai du mal à récupérer après les séances.', time: 'hier' },
      { from: 'coach', text: 'EVA m’a transmis l’alerte récupération. On allège la séance de jeudi et on travaille le souffle.', time: 'hier' },
    ],
    david: [
      { from: 'coach', text: 'Bonjour David, comment se passe la première semaine d’ancrage ?', time: 'lun' },
      { from: 'client', text: 'Très bien, les pauses respiratoires de 3 min m’aident beaucoup au bureau.', time: 'lun' },
    ],
    leila: [
      { from: 'client', text: 'Sommeil à 8h05 cette nuit, record battu !', time: 'dim' },
      { from: 'coach', text: 'Magnifique progression Leïla, continuez ainsi.', time: 'dim' },
    ],
    g1: [
      { from: 'coach', text: 'Bonjour au Groupe Matin ! Rendez-vous demain à 07:30 pour les 10 min de cohérence.', time: 'hier' },
      { from: 'client', text: 'Présent !', time: 'hier', author: 'Alex' },
      { from: 'client', text: 'Moi aussi, à demain matin.', time: 'hier', author: 'Leïla' },
    ],
    g2: [
      { from: 'coach', text: 'Pensez à relâcher les épaules avant la séance mobilité de jeudi 18:00.', time: 'lun' },
      { from: 'client', text: 'Bien reçu, merci Camille.', time: 'lun', author: 'David' },
    ],
  })

  /* Ouvre la conversation : le fil de messages apparaît immédiatement */
  const openCoachThread = (id: string) => {
    setActiveCoachThreadId(id)
    setMTab('messages')
    onChangeCoachTab?.('messagerie')
  }

  const sendCoachMsg = () => {
    if (!activeCoachThreadId || !coachDraft.trim()) return
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const txt = coachDraft.trim()
    const targetId = activeCoachThreadId
    setCoachThreads(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] ?? []), { from: 'coach', text: txt, time: now }],
    }))
    setCoachDraft('')
    setTimeout(() => {
      setCoachThreads(prev => ({
        ...prev,
        [targetId]: [
          ...(prev[targetId] ?? []),
          { from: 'client', text: 'Merci Camille, c’est bien noté pour la suite !', time: now, author: targetId.startsWith('g') ? 'Alex' : undefined },
        ],
      }))
    }, 1000)
  }

  const agendaDays: Record<number, { time: string; label: string; who: string; kind: string; dur: number }[]> = {
    [base.getDate()]: [
      { time: '09:30', label: 'Respiration · 45 min', who: 'Alex Martin', kind: 'video', dur: 45 },
      { time: '14:00', label: 'Suivi stress · 30 min', who: 'Sofia M.', kind: 'video', dur: 30 },
      { time: '18:00', label: 'Groupe Dos · 60 min', who: 'Groupe Dos & Mobilité', kind: 'group', dur: 60 },
    ],
    [base.getDate() + 1]: [
      { time: '08:15', label: 'Ancrage · 30 min', who: 'David K.', kind: 'video', dur: 30 },
    ],
    [base.getDate() + 4]: [
      { time: '07:30', label: 'Groupe Matin · 20 min', who: 'Groupe Matin', kind: 'group', dur: 20 },
    ],
  }
  const todayCells = (d: number) => agendaDays[d] || customSlots.some(s => s.day === d)

  const addAvailabilitySlot = () => {
    const end = addMinutesToTime(newSlotTime, newSlotDur)
    const debriefEnd = addMinutesToTime(end, 15)
    setCustomSlots(cs => [
      ...cs,
      { id: 'cs' + Date.now(), day: selectedDay, start: newSlotTime, end, debriefEnd, dur: newSlotDur },
    ])
  }

  const saveProgram = () => {
    if (!progTitle.trim()) return
    if (editingProg) {
      setPrograms(ps => ps.map(p => p.id === editingProg.id
        ? { ...p, title: progTitle.trim(), duration: progDur, price: Number(progPrice) || p.price, desc: progDesc || p.desc }
        : p))
    } else {
      setPrograms(ps => [
        ...ps,
        {
          id: 'p' + Date.now(),
          title: progTitle.trim(),
          duration: progDur,
          sessionsCount: 8,
          format: 'Individuel & suivi EVA',
          desc: progDesc.trim() || 'Accompagnement structuré sur-mesure avec bilans hebdomadaires.',
          price: Number(progPrice) || 390,
          active: true,
        },
      ])
    }
    setEditingProg(null); setShowProgForm(false); setProgTitle(''); setProgDesc('')
  }

  const addFreebie = () => {
    if (!freeTitle.trim()) return
    setFreebies(fs => [
      { id: 'f' + Date.now(), title: freeTitle.trim(), kind: freeKind, duration: freeDur, downloads: 1 },
      ...fs,
    ])
    setFreeTitle('')
  }

  const addMedia = (file?: File) => {
    const title = mediaTitle.trim() || file?.name
    if (!title) return
    setGallery(gs => [
      {
        id: 'm' + Date.now(),
        title,
        kind: mediaKind,
        meta: file ? `${Math.max(1, Math.round(file.size / 1024))} Ko` : 'Ajouté à la galerie',
        src: file ? URL.createObjectURL(file) : undefined,
      },
      ...gs,
    ])
    setMediaTitle('')
  }

  if (liveVisio) {
    return (
      <CallScreen
        kind="video"
        name={liveVisio.who}
        photo={COACHES[0].photo}
        hue="152"
        initials={liveVisio.who.slice(0, 2).toUpperCase()}
        onEnd={() => {
          const ended = liveVisio
          setLiveVisio(null)
          setEvalValidated(false)
          setEvalModal(ended)
        }}
      />
    )
  }

  const sampleEvaReport = EVA_SESSION_REPORTS[0]
  /* Statut de synchronisation réel (piloté depuis Réglages → Synchronisation) */
  const syncLabel = coachSync.agenda && coachSync.signaux
    ? 'Signaux et agendas synchronisés.'
    : coachSync.agenda
      ? 'Agenda synchronisé · signaux non partagés.'
      : coachSync.signaux
        ? 'Signaux synchronisés · agenda non connecté.'
        : 'Aucune synchronisation active · configurez-la dans Réglages.'

  return (
    <div className="tab-page" data-zone={coachTab}>
      {coachTab === 'bord' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">ESPACE COACH</div>
              <h1>Bonjour {COACH_FIRST_NAME}</h1>
              <p>{syncLabel}</p>
            </div>
            <Avatar hue="152" initials="CD" photo={COACHES.find(c => c.id === 'camille')?.photo} size={56} ring />
          </header>

          <section className="card alert-crit">
            <div className="alert-head">
              <span className="alert-ico"><Icon name="alert" size={17} /></span>
              <div>
                <strong>Sofia M. — Épuisement physique détecté par EVA</strong>
                <p>Effort soutenu 3 jours d’affilée avec une récupération insuffisante (sommeil 5h10).</p>
              </div>
            </div>
            <div className="alert-actions">
              <button className="btn sm btn-soft" onClick={() => onOpenEva?.('Ajuste le plan de Sofia M. (récupération)')}>
                <Icon name="sparkle" size={14} /><span>Ajuster avec EVA</span>
              </button>
              <button className="btn sm btn-soft" onClick={() => setEvalModal({ who: 'Sofia M.', isGroup: false })}>
                <Icon name="file" size={14} /><span>Évaluer fin de visio</span>
              </button>
            </div>
          </section>

          <section className="card">
            <div className="row between" style={{ marginTop: 0, marginBottom: 8 }}>
              <div className="card-kicker" style={{ margin: 0 }}><Icon name="calendar" size={13} /> AUJOURD'HUI</div>
              <button className="link-btn" style={{ fontSize: 11.5 }} onClick={() => onChangeCoachTab?.('vitrine')}>
                Gérer mes créneaux
              </button>
            </div>
            {(agendaDays[base.getDate()] ?? []).map(s => (
              <button className="session" key={s.time} onClick={() => setLiveVisio({ who: s.who, isGroup: s.kind === 'group' })}>
                <div className="date-box"><strong style={{ fontSize: 13 }}>{s.time}</strong></div>
                <div className="session-info">
                  <strong>{s.who}</strong>
                  <span>{s.label} · cliquez pour lancer ou clôturer</span>
                </div>
                <span className="chev"><Icon name="video" size={16} /></span>
              </button>
            ))}
            {customSlots.filter(cs => cs.day === selectedDay).map(cs => (
              <div className="session" key={cs.id}>
                <div className="date-box"><strong style={{ fontSize: 13 }}>{cs.start}</strong></div>
                <div className="session-info">
                  <strong>Créneau ouvert ({cs.dur} min)</strong>
                  <span>Disponible à la réservation · Jour {cs.day}</span>
                </div>
                <span className="tag mini">Ouvert</span>
              </div>
            ))}
          </section>
        </>
      )}

      {/* ONGLET OFFRE & PLANNING (EX-VITRINE OPTIMISÉ) */}
      {coachTab === 'vitrine' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">OFFRE & PLANNING</div>
              <h1>Vos programmes,<br />créneaux & tarifs.</h1>
              <p>Vos programmes portent leur tarif : créez, éditez et publiez vos offres, vos créneaux (+15 min auto) et vos contenus gratuits.</p>
            </div>
          </header>

          <div className="subtabs">
            {([
              ['programmes', 'Mes programmes'],
              ['creneaux', 'Disponibilités'],
              ['freebies', 'Freebies'],
              ['galerie', 'Galerie'],
            ] as const).map(([id, label]) => (
              <button key={id} className={'subtab' + (vSub === id ? ' on' : '')} onClick={() => setVSub(id)}>
                {label}
              </button>
            ))}
          </div>

          {vSub === 'creneaux' && (
            <>
              <section className="card">
                <div className="card-kicker"><Icon name="calendar" size={13} /> DISPONIBILITÉS & CRÉNEAUX (+15 MIN AUTO)</div>
                <h2>Ouvrir des créneaux de réservation</h2>
                <p>Chaque disponibilité saisie intègre automatiquement 15 minutes consécutives dédiées au retour sur séance.</p>

                <div className="month-head" style={{ marginTop: 14 }}>
                  <button className="round-btn sm" onClick={() => setMonth(m => m - 1)} aria-label="Mois précédent"><Icon name="chevron-left" size={16} /></button>
                  <strong>{monthLabel}</strong>
                  <button className="round-btn sm" disabled={month >= 0} onClick={() => setMonth(m => m + 1)} aria-label="Mois suivant"><Icon name="chevron-right" size={16} /></button>
                </div>
                <div className="month-grid">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={'h' + i} className="month-dow">{d}</span>)}
                  {Array.from({ length: firstWd }).map((_, i) => <span key={'p' + i} />)}
                  {Array.from({ length: daysIn }).map((_, i) => {
                    const d = i + 1
                    const isToday = month === 0 && d === selectedDay
                    const has = month === 0 && !!todayCells(d)
                    return (
                      <button
                        key={d}
                        className={'month-day' + (isToday ? ' today' : '') + (has ? ' has' : '')}
                        onClick={() => setSelectedDay(d)}
                      >
                        {d}{has && <i />}
                      </button>
                    )
                  })}
                </div>

                <div className="avail-builder glass-lite">
                  <div className="avail-builder-head">
                    <strong>Ajouter une disponibilité (Jour {selectedDay})</strong>
                    <span className="tag mini">+15 min auto</span>
                  </div>
                  <div className="row" style={{ marginTop: 10 }}>
                    <input
                      type="time"
                      className="eco-input glass-lite"
                      value={newSlotTime}
                      onChange={e => setNewSlotTime(e.target.value)}
                      style={{ maxWidth: 115 }}
                    />
                    <input
                      type="number"
                      min={10}
                      max={240}
                      step={5}
                      className="eco-input glass-lite"
                      aria-label="Durée libre de la séance en minutes"
                      value={newSlotDur}
                      onChange={e => setNewSlotDur(Math.max(10, Math.min(240, Number(e.target.value) || 45)))}
                      style={{ maxWidth: 110 }}
                    />
                    <button className="btn btn-primary sm" onClick={addAvailabilitySlot}>
                      <Icon name="plus" size={14} /><span>Ouvrir</span>
                    </button>
                  </div>
                  <div className="avail-preview">
                    <Icon name="sparkle" size={12} />
                    <span>
                      Plage bloquée : <strong>{newSlotTime} → {addMinutesToTime(newSlotTime, newSlotDur)}</strong> (séance) + <strong>{addMinutesToTime(newSlotTime, newSlotDur)} → {addMinutesToTime(newSlotTime, newSlotDur + 15)}</strong> (15 min retour sur séance).
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="card-kicker">CRÉNEAUX OUVERTS · JOUR {selectedDay}</div>
                  {customSlots.filter(cs => cs.day === selectedDay).map(cs => (
                    <div className="agenda-slot-block" key={cs.id}>
                      <div className="session">
                        <div className="date-box"><strong style={{ fontSize: 13 }}>{cs.start}</strong></div>
                        <div className="session-info">
                          <strong>Créneau ouvert ({cs.dur} min)</strong>
                          <span>Disponible sur votre profil public · Jour {cs.day}</span>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => setCustomSlots(list => list.filter(x => x.id !== cs.id))}
                          aria-label="Retirer ce créneau"
                        >
                          <Icon name="close" size={13} />
                        </button>
                      </div>
                      <div className="debrief-buffer glass-lite">
                        <Icon name="clock" size={12} />
                        <span><strong>{cs.end} – {cs.debriefEnd}</strong> · +15 min réservés automatiquement (retour sur séance)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {vSub === 'programmes' && (
            <>
              <div className="row between" style={{ marginTop: 0, marginBottom: 12 }}>
                <span className="count-line" style={{ margin: 0 }}>{programs.length} programmes publiés</span>
                <button className="btn btn-primary sm" onClick={() => { setEditingProg(null); setProgTitle(''); setProgDesc(''); setShowProgForm(true) }}>
                  <Icon name="plus" size={14} /><span>Nouveau programme</span>
                </button>
              </div>

              {showProgForm && (
                <section className="card">
                  <div className="card-kicker">{editingProg ? 'ÉDITER LE PROGRAMME' : 'AJOUTER UN PROGRAMME'}</div>
                  <div className="vitrine-form">
                    <input className="eco-input glass-lite" placeholder="Titre du programme (ex. Reset Sommeil)" value={progTitle} onChange={e => setProgTitle(e.target.value)} />
                    <div className="row" style={{ marginTop: 0 }}>
                      <input className="eco-input glass-lite" placeholder="Durée (ex. 6 semaines)" value={progDur} onChange={e => setProgDur(e.target.value)} />
                      <input className="eco-input glass-lite" placeholder="Tarif €" value={progPrice} onChange={e => setProgPrice(e.target.value)} style={{ maxWidth: 110 }} />
                    </div>
                    <textarea className="journal" rows={2} placeholder="Description et bénéfices clés…" value={progDesc} onChange={e => setProgDesc(e.target.value)} />
                    <div className="row">
                      <button className="btn btn-soft sm" onClick={() => setShowProgForm(false)}>Annuler</button>
                      <button className="btn btn-primary sm" onClick={saveProgram}><Icon name="check" size={14} /><span>Publier sur la vitrine</span></button>
                    </div>
                  </div>
                </section>
              )}

              {programs.map(p => (
                <section className="card vitrine-prog-card" key={p.id}>
                  <div className="row between" style={{ marginTop: 0, marginBottom: 6 }}>
                    <span className="tag mini glass-lite">{p.duration} · {p.sessionsCount} séances</span>
                    <strong style={{ fontFamily: 'var(--disp)', fontSize: 18 }}>{p.price} €</strong>
                  </div>
                  <h2>{p.title}</h2>
                  <p>{p.desc}</p>
                  <div className="row between" style={{ marginTop: 12 }}>
                    <span className="dim" style={{ fontSize: 11.5 }}>{p.format}</span>
                    <div className="row" style={{ marginTop: 0 }}>
                      <button
                        className="btn btn-soft sm"
                        onClick={() => {
                          setEditingProg(p); setProgTitle(p.title); setProgDur(p.duration); setProgPrice(String(p.price)); setProgDesc(p.desc); setShowProgForm(true)
                        }}
                      >
                        <Icon name="edit" size={13} /><span>Éditer</span>
                      </button>
                      <button
                        className={'switch' + (p.active ? ' on' : '')}
                        onClick={() => setPrograms(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x))}
                        aria-label="Activer programme"
                      >
                        <i />
                      </button>
                    </div>
                  </div>
                </section>
              ))}
            </>
          )}

          {vSub === 'freebies' && (
            <>
              <section className="card">
                <div className="card-kicker"><Icon name="plus" size={13} /> AJOUTER UN CONTENU GRATUIT (FREEBIE)</div>
                <h2>Aimant à prospects & ressources</h2>
                <div className="vitrine-form" style={{ marginTop: 10 }}>
                  <input className="eco-input glass-lite" placeholder="Titre du contenu gratuit…" value={freeTitle} onChange={e => setFreeTitle(e.target.value)} />
                  <div className="row" style={{ marginTop: 0 }}>
                    <select className="eco-select glass-lite" value={freeKind} onChange={e => setFreeKind(e.target.value)}>
                      <option value="Audio">Audio guidé</option>
                      <option value="Guide PDF">Guide PDF</option>
                      <option value="Vidéo">Vidéo courte</option>
                      <option value="Article">Article</option>
                    </select>
                    <input className="eco-input glass-lite" placeholder="Durée / taille" value={freeDur} onChange={e => setFreeDur(e.target.value)} style={{ maxWidth: 110 }} />
                    <button className="btn btn-primary sm" onClick={addFreebie}><Icon name="plus" size={14} /><span>Publier</span></button>
                  </div>
                </div>
              </section>

              <div className="freelist">
                {freebies.map(f => (
                  <div key={f.id} className="free-item glass-lite">
                    <span className="free-kind">{f.kind}</span>
                    <div className="session-info">
                      <strong style={{ fontSize: 13.5 }}>{f.title}</strong>
                      <span style={{ fontSize: 11.5 }}>{f.duration} · {f.downloads} consultations</span>
                    </div>
                    <button className="remove-btn" onClick={() => setFreebies(fs => fs.filter(x => x.id !== f.id))} aria-label="Supprimer">
                      <Icon name="close" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {vSub === 'galerie' && (
            <>
              <section className="card">
                <div className="card-kicker"><Icon name="video" size={13} /> GALERIE · PHOTOS & VIDÉOS</div>
                <h2>Montrez votre univers</h2>
                <p>Studio, démonstrations, ateliers : les médias publiés sur votre vitrine publique.</p>
                <div className="vitrine-form" style={{ marginTop: 10 }}>
                  <input
                    className="eco-input glass-lite"
                    placeholder="Légende du média…"
                    value={mediaTitle}
                    onChange={e => setMediaTitle(e.target.value)}
                  />
                  <div className="row" style={{ marginTop: 0 }}>
                    <select className="eco-select glass-lite" value={mediaKind} onChange={e => setMediaKind(e.target.value as 'Photo' | 'Vidéo')}>
                      <option value="Photo">Photo</option>
                      <option value="Vidéo">Vidéo</option>
                    </select>
                    <label className="btn btn-soft sm gallery-pick">
                      <Icon name="plus" size={13} /><span>Choisir un fichier</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={e => { const f = e.target.files?.[0]; if (f) addMedia(f); e.target.value = '' }}
                      />
                    </label>
                    <button className="btn btn-primary sm" onClick={() => addMedia()}>
                      <Icon name="check" size={13} /><span>Publier</span>
                    </button>
                  </div>
                </div>
              </section>

              <div className="gallery-grid">
                {gallery.map(m => (
                  <figure className="gallery-item glass-lite" key={m.id}>
                    {m.src
                      ? m.kind === 'Vidéo'
                        ? <video src={m.src} muted playsInline />
                        : <img src={m.src} alt={m.title} />
                      : <div className="gallery-ph"><Icon name={m.kind === 'Vidéo' ? 'play' : 'activity'} size={18} /></div>}
                    <figcaption>
                      <strong>{m.title}</strong>
                      <span>{m.kind} · {m.meta}</span>
                    </figcaption>
                    <button className="remove-btn" onClick={() => setGallery(gs => gs.filter(x => x.id !== m.id))} aria-label="Retirer ce média">
                      <Icon name="close" size={12} />
                    </button>
                  </figure>
                ))}
              </div>
              <div className="privacy"><Icon name="shield" size={13} /> Visibilité maîtrisée · retirez un média à tout moment de votre vitrine.</div>
            </>
          )}

        </>
      )}

      {/* ONGLET SUIVI — stats & clients réunis */}
      {coachTab === 'clients' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">STATS & CLIENTS</div>
              <h1>Votre activité,<br />vos élèves.</h1>
              <p>Revenus, formats et suivi de votre base, au même endroit.</p>
            </div>
          </header>

          <section className="card">
            <div className="card-kicker"><Icon name="chart" size={13} /> INDICATEURS CLÉS · CE MOIS</div>
            <div className="metrics" style={{ marginTop: 8 }}>
              <div className="metric">
                <div className="metric-top"><span>COURS DISPENSÉS</span><span className="delta up">+18%</span></div>
                <span className="metric-val">42</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>RÉTENTION ÉLÈVES</span><span className="delta up">94%</span></div>
                <span className="metric-val">10<span className="of">/12</span></span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>TEMPS GAGNÉ EVA</span></div>
                <span className="metric-val">14h</span>
              </div>
            </div>
            <TrendBars data={[52, 60, 58, 70, 76, 84, 92]} />
            <div className="axis"><span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span></div>
          </section>

          <section className="card">
            <div className="card-kicker"><Icon name="chart" size={13} /> REVENUS & FACTURATION · CE MOIS</div>
            <h2>Votre business, dans le détail</h2>
            <div className="metrics" style={{ marginTop: 8 }}>
              <div className="metric">
                <div className="metric-top"><span>CHIFFRE D'AFFAIRES</span><span className="delta up">+12%</span></div>
                <span className="metric-val">6 840 €</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>CATALOGUE ACTIF</span></div>
                <span className="metric-val">{programRevenue} €</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>TAUX DE REMPLISSAGE</span><span className="delta up">+6%</span></div>
                <span className="metric-val">87%</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>SÉANCES NON HONORÉES</span><span className="delta down">-2</span></div>
                <span className="metric-val">3</span>
              </div>
            </div>
            <div className="eco-table" style={{ marginTop: 12 }}>
              <div className="eco-thead">
                <span>Source de revenus</span>
                <span>Encaissé</span>
                <span>Part de l'objectif</span>
              </div>
              {[
                { name: 'Programmes & accompagnements', detail: `${activePrograms.length} offres publiées`, amount: '3 420 €', share: 74 },
                { name: 'Séances 1:1', detail: '22 séances · 16h30', amount: '1 870 €', share: 62 },
                { name: 'Groupes & ateliers', detail: '12 sessions', amount: '980 €', share: 41 },
                { name: 'Freebies convertis', detail: '5 nouveaux élèves', amount: '570 €', share: 28 },
              ].map(row => (
                <div className="eco-trow" key={row.name}>
                  <div className="eco-tmain">
                    <strong>{row.name}</strong>
                    <span>{row.detail}</span>
                  </div>
                  <div className="eco-ttarget">
                    <strong>{row.amount}</strong>
                    <span>ce mois</span>
                  </div>
                  <div className="eco-tprog">
                    <strong>{row.share}%</strong>
                    <div className="group-meter"><span style={{ width: `${row.share}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-kicker"><Icon name="calendar" size={13} /> GESTION DES COURS DISPENSÉS</div>
            <h2>Répartition par format</h2>
            <div className="eco-table" style={{ marginTop: 10 }}>
              <div className="eco-thead">
                <span>Format de cours</span>
                <span>Volume</span>
                <span>Présence</span>
              </div>
              {[
                { name: 'Respiration & Nerf Vague (1:1)', count: '22 séances', hours: '16h30', rate: 96 },
                { name: 'Groupe Matin · Cohérence', count: '12 sessions', hours: '6h00', rate: 89 },
                { name: 'Bilan Découverte & Audit EVA', count: '8 séances', hours: '6h00', rate: 100 },
              ].map((row, idx) => (
                <div className="eco-trow" key={idx}>
                  <div className="eco-tmain">
                    <strong>{row.name}</strong>
                    <span>{row.hours} dispensées ce mois</span>
                  </div>
                  <div className="eco-ttarget">
                    <strong>{row.count}</strong>
                    <span>+15m débrief inclus</span>
                  </div>
                  <div className="eco-tprog">
                    <strong>{row.rate}%</strong>
                    <div className="group-meter"><span style={{ width: `${row.rate}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-kicker"><Icon name="users" size={13} /> SUIVI DE LA BASE D'ÉLÈVES</div>
            <h2>Progression & assiduité</h2>
            <div className="metrics" style={{ marginTop: 8 }}>
              <div className="metric">
                <div className="metric-top"><span>ÉLÈVES ACTIFS</span><span className="delta up">+1</span></div>
                <span className="metric-val">{COACH_CLIENTS.length}</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>ASSIDUITÉ MOYENNE</span></div>
                <span className="metric-val">{avgAdherence}%</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>ALERTES EVA</span></div>
                <span className="metric-val">{clientAlerts}</span>
              </div>
            </div>
            <div className="eco-table" style={{ marginTop: 10 }}>
              <div className="eco-thead">
                <span>Élève & Programme</span>
                <span>Énergie / Sommeil</span>
                <span>Assiduité</span>
              </div>
              {COACH_CLIENTS.map(c => (
                <div className="eco-trow" key={c.id}>
                  <div className="eco-tmain">
                    <strong>{c.name}</strong>
                    <span>{c.program} ({c.startedAgo})</span>
                  </div>
                  <div className="eco-ttarget">
                    <strong>{c.energy}/100</strong>
                    <span>{c.sleep.split(' ')[0]}</span>
                  </div>
                  <div className="eco-tprog">
                    <strong>{c.adherence}%</strong>
                    <div className="group-meter"><span style={{ width: `${c.adherence}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="count-line">{COACH_CLIENTS.length} élèves · {COACH_GROUPS.length} groupes</div>
          {COACH_CLIENTS.map(c => <ClientCard key={c.id} c={c} onMessage={openCoachThread} />)}
          <div className="block-title">Groupes</div>
          {COACH_GROUPS.map(g => <GroupCard key={g.id} g={g} onMessage={openCoachThread} />)}
        </>
      )}

      {coachTab === 'messagerie' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">MESSAGERIE</div>
              <h1>Messages, appels, visio.</h1>
              <p>Individuel ou groupe, tout au même endroit.</p>
            </div>
          </header>
          <div className="subtabs">
            {(['messages', 'appels', 'visio'] as const).map(t => (
              <button key={t} className={'subtab' + (mTab === t ? ' on' : '')} onClick={() => setMTab(t)}>
                {t === 'messages' ? 'Messages' : t === 'appels' ? 'Appels' : 'Visio'}
              </button>
            ))}
          </div>

          {mTab === 'messages' && (
            activeCoachThreadId ? (() => {
              const isGroup = activeCoachThreadId.startsWith('g')
              const grp = isGroup ? COACH_GROUPS.find(g => g.id === activeCoachThreadId) : null
              const cli = !isGroup ? COACH_CLIENTS.find(c => c.id === activeCoachThreadId) : null
              const title = isGroup ? (grp?.name ?? 'Groupe') : (cli?.name ?? 'Élève')
              const subtitle = isGroup ? `${grp?.schedule} · ${grp?.memberIds.length} élèves` : `${cli?.program}`
              const msgs = coachThreads[activeCoachThreadId] ?? []
              return (
                <section className="card coach-inline-chat">
                  <div className="coach-chat-bar">
                    <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setActiveCoachThreadId(null)} aria-label="Retour aux discussions">
                      <Icon name="chevron-left" size={17} />
                    </button>
                    {cli && <Avatar hue={cli.hue} initials={cli.initials} photo={cli.photo} size={36} ring />}
                    <div className="session-info">
                      <strong>{title}</strong>
                      <span>{subtitle}</span>
                    </div>
                    <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setLiveVisio({ who: title, isGroup })} aria-label="Lancer la visio">
                      <Icon name="video" size={15} />
                    </button>
                  </div>

                  <div className="coach-chat-messages">
                    {msgs.map((m, i) => (
                      <div key={i} className={'bubble-row ' + (m.from === 'coach' ? 'me' : 'coach')}>
                        <div className="bubble">
                          {m.author && <em className="bubble-author">{m.author}</em>}
                          <p>{m.text}</p>
                          <span>{m.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <input
                      className="eco-input glass-lite"
                      placeholder={`Répondre à ${title.split(' ')[0]}…`}
                      value={coachDraft}
                      onChange={e => setCoachDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendCoachMsg()}
                    />
                    <button className={'send-btn' + (coachDraft.trim() ? ' ready' : '')} style={{ width: 40, height: 40 }} onClick={sendCoachMsg} aria-label="Envoyer">
                      <Icon name="send" size={16} />
                    </button>
                  </div>
                </section>
              )
            })() : (
              <div className="thread-list">
                {[...COACH_CLIENTS.map(c => {
                  const list = coachThreads[c.id] ?? []
                  const last = list[list.length - 1]
                  return { id: c.id, name: c.name, hue: c.hue, photo: c.photo, last: last ? (last.from === 'coach' ? `Vous : ${last.text}` : last.text) : c.program, when: last?.time ?? 'hier', group: false }
                }),
                  ...COACH_GROUPS.map(g => {
                    const list = coachThreads[g.id] ?? []
                    const last = list[list.length - 1]
                    return { id: g.id, name: g.name, hue: '152', photo: undefined as string | undefined, last: last ? (last.from === 'coach' ? `Vous : ${last.text}` : `${last.author ?? 'Élève'} : ${last.text}`) : g.schedule, when: last?.time ?? 'lun', group: true }
                  })]
                  .map(t => (
                  <button className="thread" key={t.id} onClick={() => setActiveCoachThreadId(t.id)}>
                    {t.group
                      ? <div className="group-av">{clientById(COACH_GROUPS.find(g => g.id === t.id)!.memberIds[0]).photo
                          ? <Avatar hue={clientById(COACH_GROUPS.find(g => g.id === t.id)!.memberIds[0]).hue} initials="" photo={clientById(COACH_GROUPS.find(g => g.id === t.id)!.memberIds[0]).photo} size={26} />
                          : <Avatar hue="152" initials="G" size={26} />}</div>
                      : <Avatar hue={t.hue} initials={t.name.slice(0, 2).toUpperCase()} photo={t.photo} size={46} />}
                    <div className="thread-info">
                      <div className="thread-top"><strong>{t.name}</strong><span>{t.when}</span></div>
                      <p>{t.last}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {mTab === 'appels' && (
            <div className="call-list">
              {COACH_CALLS.filter(c => c.kind === 'audio').map(c => (
                <CallRow key={c.id} call={c} onStartVisio={(who, isGroup) => setEvalModal({ who, isGroup })} />
              ))}
            </div>
          )}

          {mTab === 'visio' && (
            <div className="call-list">
              <section className="card card-grad slim">
                <strong className="grad-title">Prochaine visio de groupe</strong>
                <p className="light-dim">Groupe Dos & Mobilité · Jeu 26 · 18:00 — EVA enregistre, transcrit et génère le bilan à la clôture.</p>
                <div className="row">
                  <button className="btn btn-inverse sm" onClick={() => setLiveVisio({ who: 'Groupe Dos & Mobilité', isGroup: true })}>
                    <span>Ouvrir la salle</span><Icon name="video" size={15} />
                  </button>
                  <button className="btn btn-soft sm" onClick={() => setEvalModal({ who: 'Groupe Dos & Mobilité', isGroup: true })}>
                    <span>Simuler fin de session</span>
                  </button>
                </div>
              </section>
              {COACH_CALLS.filter(c => c.kind === 'video').map(c => (
                <CallRow key={c.id} call={c} onStartVisio={(who, isGroup) => setLiveVisio({ who, isGroup })} />
              ))}
            </div>
          )}
        </>
      )}

      {coachTab === 'reglages' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">RÉGLAGES</div>
              <h1>Votre cabinet, vos règles.</h1>
              <p>Profil, préférences et confidentialité du coach.</p>
            </div>
            <Avatar hue="152" initials="CD" photo={COACHES.find(c => c.id === 'camille')?.photo} size={56} ring />
          </header>

          <section className="card">
            <div className="card-kicker">PROFIL</div>
            <div className="client-row wide" style={{ paddingBottom: 12 }}>
              <Avatar hue="152" initials="CD" photo={COACHES.find(c => c.id === 'camille')?.photo} size={46} ring />
              <div className="session-info">
                <strong>Camille Durand</strong>
                <span>Coach holistique & respiration · Paris</span>
              </div>
            </div>
            <button className="setting wide"><Icon name="user" size={17} />Modifier mon profil public<Icon name="chevron-right" size={14} /></button>
            <button className="setting wide"><Icon name="video" size={17} />Ma vidéo de présentation<Icon name="chevron-right" size={14} /></button>
            <button className="setting wide"><Icon name="star" size={17} />Mes avis clients<Icon name="chevron-right" size={14} /></button>
          </section>

          <section className="card">
            <div className="card-kicker">CABINET</div>
            <button
              className="setting wide"
              onClick={() => { onChangeVitrineSub('creneaux'); onChangeCoachTab?.('vitrine') }}
            >
              <Icon name="calendar" size={17} />Disponibilités & créneaux (dans Offre)<Icon name="chevron-right" size={14} />
            </button>
            <div className="setting row between">
              <div className="setting-label"><Icon name="users" size={17} />Groupe par niveaux</div>
              <span className="switch on"><i /></span>
            </div>
          </section>

          <section className="card">
            <div className="card-kicker"><Icon name="refresh" size={13} /> SYNCHRONISATION</div>
            <p className="dim" style={{ marginBottom: 6 }}>Le statut affiché sur votre Bord suit ces réglages.</p>
            <div className="setting row between" onClick={() => setCoachSync(s => ({ ...s, agenda: !s.agenda }))}>
              <div className="setting-label">
                <span className="setting-txt"><strong>Agendas & créneaux</strong><span>Séances, disponibilités et réservations.</span></span>
              </div>
              <span className={'switch' + (coachSync.agenda ? ' on' : '')}><i /></span>
            </div>
            <div className="setting row between" onClick={() => setCoachSync(s => ({ ...s, signaux: !s.signaux }))}>
              <div className="setting-label">
                <span className="setting-txt"><strong>Signaux & biométrie</strong><span>Énergie, sommeil et alertes EVA de vos élèves.</span></span>
              </div>
              <span className={'switch' + (coachSync.signaux ? ' on' : '')}><i /></span>
            </div>
          </section>

          <section className="card">
            <div className="card-kicker"><Icon name="shield" size={13} /> CONFIDENTIALITÉ</div>
            <div className="setting row between">
              <div className="setting-label">
                <span className="setting-txt"><strong>Journal des clients</strong><span>Accès aux extraits autorisés uniquement.</span></span>
              </div>
              <span className="switch on"><i /></span>
            </div>
            <div className="setting row between">
              <div className="setting-label">
                <span className="setting-txt"><strong>Alertes EVA</strong><span>Signaux de santé poussés vers vous.</span></span>
              </div>
              <span className="switch on"><i /></span>
            </div>
            <div className="service-list">
              <button className="service-btn"><Icon name="share" size={15} /><span>Exporter mes données cabinet</span><Icon name="chevron-right" size={13} /></button>
            </div>
          </section>

          <button className="logout" onClick={onExit}><Icon name="chevron-left" size={15} /> Retour à l'espace coaché</button>
        </>
      )}

      {/* MODALE D'ÉVALUATION POST-VISIO AVEC COMPTE RENDU IA EVA (-80% TEMPS ADMIN) */}
      {evalModal && (
        <div className="pay-layer" onClick={() => setEvalModal(null)}>
          <div className="pay-sheet post-visio-modal" onClick={e => e.stopPropagation()}>
            <div className="row between" style={{ marginTop: 0 }}>
              <span className="card-kicker" style={{ margin: 0 }}>
                <Icon name="sparkle" size={12} /> FIN DE SESSION · {evalModal.isGroup ? 'GROUPE' : 'INDIVIDUELLE'}
              </span>
              <span className="eva-gain-badge">−80% temps admin</span>
            </div>
            <h2 style={{ fontSize: 20 }}>Évaluation & Bilan EVA — {evalModal.who}</h2>

            {/* Compte rendu pré-généré par EVA en amont */}
            <div className="eva-pre-report glass-lite">
              <div className="row between" style={{ marginTop: 0, marginBottom: 6 }}>
                <div className="transcript-head" style={{ margin: 0 }}>
                  <span className="eva-orb-mini" style={{ width: 12, height: 12 }} /> COMPTE RENDU IA EVA (TRANSCRIT & ANALYSÉ)
                </div>
                <span className="dim" style={{ fontSize: 10.5 }}>Prêt en 4 s</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink)', marginBottom: 8 }}>
                {sampleEvaReport.summary}
              </p>
              <div className="eva-pre-bullets">
                {sampleEvaReport.keyTakeaways.map((k, i) => (
                  <div key={i} className="eva-pre-bullet"><Icon name="check" size={12} /><span>{k}</span></div>
                ))}
              </div>
            </div>

            {/* Évaluation rapide par le coach */}
            <div className="coach-eval-controls">
              <div className="row between" style={{ marginTop: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>Qualité & engagement séance</span>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} className={'star-btn' + (n <= evalRating ? ' on' : '')} onClick={() => setEvalRating(n)}>
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="row between" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>État perçu de l'élève</span>
                <div className="coach-count-pills">
                  {(['En hausse', 'Stable', 'Fatigue'] as const).map(st => (
                    <button key={st} className={'count-pill' + (evalEnergy === st ? ' on' : '')} onClick={() => setEvalEnergy(st)}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="journal"
                rows={2}
                style={{ marginTop: 10 }}
                placeholder="Note complémentaire du coach (optionnel, EVA a déjà structuré l'essentiel)…"
                value={evalNote}
                onChange={e => setEvalNote(e.target.value)}
              />
            </div>

            <div className="row" style={{ marginTop: 6 }}>
              <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => setEvalModal(null)}>Plus tard</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={() => {
                  setEvalValidated(true)
                  setTimeout(() => { setEvalModal(null); setEvalNote('') }, 700)
                }}
              >
                <Icon name="check" size={15} />
                <span>{evalValidated ? 'Envoyé dans l’Écosystème !' : 'Valider & partager le CR EVA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* sessions partagées (coaché) — gardé pour référence futur onglet agenda coaché */
export const COACH_AGENDA_SEED = SESSIONS
