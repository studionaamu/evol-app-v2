import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar, EvaAvatar, ThemeToggle } from './bits'
import { useStore } from './store'
import {
  COACHES, IMAGES, COACH_CLIENTS, COACH_GROUPS, COACH_CALLS, SESSIONS,
  INITIAL_VITRINE_PROGRAMS, INITIAL_FREEBIES, INITIAL_GALLERY, EVA_SESSION_REPORTS,
  type Consent, type CoachClient, type CoachGroup, type CoachCall,
  type CoachProgram, type CoachMedia,
} from './data'
import { CallScreen } from './screens2'

export type CoachTab = 'bord' | 'vitrine' | 'clients' | 'messagerie' | 'reglages'
export type VitrineSub = 'business' | 'programmes' | 'creneaux' | 'galerie'

/* =====================================================
   PROFIL — réglages, confidentialité RGPD, déconnexion
   ===================================================== */

export function Profile({ onGoCoach }: { onGoCoach: () => void }) {
  const { name, avatar, setAvatar, guest, reset, role, program, theme, setTheme, personalization, setPersonalization, quizDomains } = useStore()
  const [openInfo, setOpenInfo] = useState<keyof Consent | null>(null)
  const avatarInput = useRef<HTMLInputElement>(null)
  const changeAvatar = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === 'string') setAvatar(reader.result) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="tab-page" data-zone="profile">
      <header className="page-head">
        <div>
          <div className="date-line">RÉGLAGES</div>
          <h1>{guest ? 'Mode invité' : name}</h1>
          {guest && <p>Vos données restent sur cet appareil.</p>}
        </div>
        <button className="profile-avatar-btn" type="button" onClick={() => avatarInput.current?.click()} aria-label="Changer la photo de profil">
          <Avatar hue="158" initials={guest ? '?' : name.slice(0, 1).toUpperCase()} photo={avatar ?? IMAGES.userPhoto} size={56} ring />
          <span className="profile-avatar-edit"><Icon name="camera" size={12} /></span>
        </button>
        <input
          ref={avatarInput}
          className="profile-avatar-input"
          type="file"
          accept="image/*"
          aria-label="Choisir une photo de profil"
          onChange={e => { changeAvatar(e.target.files?.[0]); e.target.value = '' }}
        />
      </header>

      <section className="card appearance-card">
        <div className="card-kicker"><Icon name="sun" size={13} /> APPARENCE</div>
        <div className="appearance-row">
          <div className="appearance-copy">
            <span className="appearance-aa" aria-hidden>Aa</span>
            <div className="setting-txt">
              <strong>Thème {theme === 'light' ? 'clair' : 'sombre'}</strong>
              <span>Une interface claire, aérée et fidèle à la charte Evol.</span>
            </div>
          </div>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </section>

      <section className="card eva-profile-card">
        <div className="row between" style={{ marginTop: 0, marginBottom: 6 }}>
          <div className="card-kicker" style={{ margin: 0 }}><Icon name="sparkle" size={13} /> MON PROFIL EVA</div>
          <span className="tag mini">{personalization.time} min</span>
        </div>
        <h2>Ce qu’EVA retient.</h2>
        <p>Ces préférences adaptent les propositions du radar, sans modifier votre programme.</p>

        <div className="eva-profile-block">
          <span className="eva-profile-label">TEMPS DISPONIBLE</span>
          <div className="eva-profile-chips">
            {([5, 10, 20] as const).map(time => (
              <button
                key={time}
                type="button"
                className={'eva-pref-chip' + (personalization.time === time ? ' on' : '')}
                aria-pressed={personalization.time === time}
                onClick={() => setPersonalization(current => ({ ...current, time }))}
              >
                {time} min
              </button>
            ))}
          </div>
        </div>

        <div className="eva-profile-block">
          <span className="eva-profile-label">À ÉVITER DANS LES RECETTES</span>
          <div className="eva-profile-chips">
            {['Œuf', 'Lactose', 'Fruits à coque', 'Gluten'].map(tag => {
              const on = personalization.avoid.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  className={'eva-pref-chip' + (on ? ' on' : '')}
                  aria-pressed={on}
                  onClick={() => setPersonalization(current => ({
                    ...current,
                    avoid: on ? current.avoid.filter(item => item !== tag) : [...current.avoid, tag],
                  }))}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="eva-profile-block">
          <span className="eva-profile-label">FORMAT PRÉFÉRÉ</span>
          <div className="eva-profile-chips">
            {([
              { id: 'visio', label: 'Visio' },
              { id: 'presentiel', label: 'Présentiel' },
              { id: 'both', label: 'Les deux' },
            ] as const).map(format => (
              <button
                key={format.id}
                type="button"
                className={'eva-pref-chip' + (personalization.quizMode === format.id ? ' on' : '')}
                aria-pressed={personalization.quizMode === format.id}
                onClick={() => setPersonalization(current => ({ ...current, quizMode: format.id }))}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>

        {quizDomains.length > 0 && (
          <div className="eva-profile-priorities">
            <span className="eva-profile-label">VOS PRIORITÉS</span>
            <div className="row" style={{ marginTop: 6 }}>
              {quizDomains.map(domain => <span className="tag mini" key={domain}>{domain}</span>)}
            </div>
          </div>
        )}

        <p className="eva-profile-hint"><Icon name="shield" size={12} /> Modifiable à tout moment. EVA ne partage pas ces préférences avec vos coachs.</p>
      </section>

      {program && (
        <section className="card prog-profile-card">
          <div className="row between" style={{ marginTop: 0, marginBottom: 8 }}>
            <div className="card-kicker" style={{ margin: 0 }}><Icon name="shield" size={13} /> PROGRAMME · ACCÈS ENCADRÉ</div>
            <span className="tag mini glass-lite">Programme encadré</span>
          </div>
          <h2>Votre cadre d’accompagnement</h2>
          <div className="client-lines" style={{ marginTop: 8 }}>
            <div className="client-line"><Icon name="check" size={14} /><span><strong>Statut</strong> · programme encadré, accès nominatif</span></div>
            <div className="client-line"><Icon name="user" size={14} /><span><strong>Prescripteur</strong> · Dr L. Perrin, médecin traitant</span></div>
            <div className="client-line"><Icon name="file" size={14} /><span><strong>Prise en charge</strong> · Assurance maladie, dossier 74-221 908</span></div>
            <div className="client-line"><Icon name="users" size={14} /><span><strong>Référent programme</strong> · Camille Durand</span></div>
            <div className="client-line"><Icon name="calendar" size={14} /><span><strong>Période</strong> · 12 nov. 2026 → 12 nov. 2027</span></div>
            <div className="client-line"><Icon name="clock" size={14} /><span><strong>Coach carrière</strong> · Karim Bensaïd, contact toutes les 2 semaines</span></div>
          </div>
          <div className="privacy" style={{ marginTop: 10 }}>
            <Icon name="shield" size={13} /> Toutes les options de confidentialité sont activées par défaut pour votre programme : transcription IA et partage avec l'équipe inclus.
          </div>
        </section>
      )}

      {/* ---- RGPD : information légale ---- */}
      <section className="card">
        <div className="card-kicker"><Icon name="shield" size={13} /> CONFIDENTIALITÉ · RGPD</div>
        <p>Cliquez sur une ligne pour lire le détail légal.</p>
        {([
          ['journal', 'Transcription IA du journal', 'Vos notes vocales transcrites puis chiffrées.',
            'Article 9 RGPD — vos notes vocales sont transcrites par EVA puis chiffrées. Aucun accès humain sans votre accord écrit, suppression immédiate sur demande.'],
          ['health', 'Données de santé', 'Objectifs et signaux bien-être.',
            'Données de santé traitées sur base de votre consentement explicite (art. 9.2.a RGPD), hébergées en UE, conservées le temps du programme puis supprimées.'],
        ] as [keyof Consent, string, string, string][]).map(([k, title, desc, legal]) => {
          const open = openInfo === k
          return (
            <div className="consent-info" key={k}>
              <button
                className={'setting wide consent-row info' + (open ? ' open' : '')}
                onClick={() => setOpenInfo(open ? null : k)}
                aria-expanded={open}
              >
                <Icon name="shield" size={16} />
                <span className="setting-txt"><strong>{title}</strong><span>{desc}</span></span>
                <Icon name="chevron-right" size={14} />
              </button>
              {open && <p className="consent-legal">{legal}</p>}
            </div>
          )
        })}
        <div className="service-list">
          <button className="service-btn"><Icon name="share" size={15} /><span>Exporter mes données</span><Icon name="chevron-right" size={13} /></button>
          <button className="service-btn danger"><Icon name="close" size={15} /><span>Supprimer mon compte</span><Icon name="chevron-right" size={13} /></button>
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

/* pastilles de couleurs intelligentes — agenda coach */
const CAL_KINDS = {
  indiv: { label: 'Cours individuel', color: '#2E6BFF' },
  groupe: { label: 'Cours collectif', color: '#6D3EAD' },
  service: { label: 'Prestation / programme', color: '#1E8E5A' },
  libre: { label: 'Créneau réservable', color: '#E9A13B' },
  off: { label: 'Indisponibilité', color: '#E92B1F' },
} as const
type CalKind = keyof typeof CAL_KINDS

const OFFER_CATEGORIES = ['Sommeil', 'Stress', 'Mental', 'Mouvement', 'Nutrition', 'Bien-être'] as const
const STUDIO_MEDIA_IMAGES: Record<string, string> = {
  m1: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=80&auto=format&fit=crop',
  m2: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80&auto=format&fit=crop',
  m3: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop',
}

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
    <section className={'card client-card' + (open ? ' open' : '') + (c.encadre ? ' prog-client' : '')}>
      <button className="client-row wide" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={44} ring />
        <div className="session-info">
          <strong>
            {c.name}
            {c.encadre && <span className="prog-tag">Programme</span>}
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
          <div className="privacy"><Icon name="shield" size={13} /> Partage autorisé par {c.name.split(' ')[0]}.</div>
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
          <strong>{g.name}<span className="prog-tag">Programme</span></strong>
          <span>{g.mode} · {g.schedule}</span>
        </div>
        <span className={'chev drop' + (open ? ' on' : '')}><Icon name="chevron-right" size={15} /></span>
      </button>
      {open && (
        <div className="client-detail">
          <div className="client-lines">
            <div className="client-line"><Icon name="shield" size={14} /><span><strong>Programme</strong> · {g.program}</span></div>
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
  const { coachSync, setCoachSync, theme, setTheme } = useStore()
  const [mTab, setMTab] = useState<'messages' | 'appels' | 'visio'>('messages')
  const [month, setMonth] = useState(0) // 0 = mois courant
  const base = new Date()
  const viewMonth = new Date(base.getFullYear(), base.getMonth() + month, 1)
  const monthLabel = viewMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const monthShort = monthLabel.split(' ')[0]
  const firstWd = (viewMonth.getDay() + 6) % 7 // lundi = 0
  const daysIn = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()

  /* Logique d'agenda : disponibilités avec bloc de +15 min retour sur séance auto */
  const [selectedDay, setSelectedDay] = useState<number>(base.getDate())
  const [newSlotTime, setNewSlotTime] = useState('11:00')
  const [newSlotDur, setNewSlotDur] = useState(45)
  const [slotOpen, setSlotOpen] = useState(false)
  const [customSlots, setCustomSlots] = useState<{ id: string; day: number; start: string; end: string; debriefEnd: string; dur: number }[]>([
    { id: 'cs1', day: base.getDate(), start: '16:00', end: '16:45', debriefEnd: '17:00', dur: 45 },
  ])
  /* agenda : vues Google Calendar, indisponibilités, synchro calendriers, plein écran */
  const [calView, setCalView] = useState<'jour' | 'semaine' | 'mois'>('mois')
  const [calFull, setCalFull] = useState(false)
  const [blockMode, setBlockMode] = useState(false)
  const [blockStart, setBlockStart] = useState<number | null>(null)
  const [rangeUndo, setRangeUndo] = useState<{ days: number[]; count: number } | null>(null)
  const [offConfirm, setOffConfirm] = useState<{ from: number; to: number } | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [offDays, setOffDays] = useState<number[]>([base.getDate() + 3])
  const [calSyncOpen, setCalSyncOpen] = useState(false)
  const [calSync, setCalSync] = useState<string[]>(['apple'])
  const [lastSync, setLastSync] = useState<string | null>(null)
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

  const [freebies, setFreebies] = useState<{ id: string; title: string; kind: string; duration: string; downloads: number; src?: string }[]>(INITIAL_FREEBIES)
  const [freeSrc, setFreeSrc] = useState<string | null>(null)
  const [freeTitle, setFreeTitle] = useState('')
  const [freeKind, setFreeKind] = useState('Audio')
  const [freeDur, setFreeDur] = useState('5 min')

  /* Galerie — photos & vidéos publiées par le coach */
  const [gallery, setGallery] = useState<CoachMedia[]>(INITIAL_GALLERY)
  const [mediaTitle, setMediaTitle] = useState('')
  const [mediaKind, setMediaKind] = useState<'Photo' | 'Vidéo'>('Photo')

  /* Vitrine publique — l'aperçu est la surface d'édition */
  const publicCoach = COACHES.find(c => c.id === 'camille') ?? COACHES[0]
  const coverInput = useRef<HTMLInputElement>(null)
  const [studioPreview, setStudioPreview] = useState(false)
  const [cover, setCover] = useState(publicCoach.video?.thumb ?? publicCoach.photo)
  const [headline, setHeadline] = useState(publicCoach.role)
  const [headlineDraft, setHeadlineDraft] = useState(publicCoach.role)
  const [headlineEditing, setHeadlineEditing] = useState(false)
  const [publicBio, setPublicBio] = useState(publicCoach.bio)
  const [bioDraft, setBioDraft] = useState(publicCoach.bio)
  const [bioEditing, setBioEditing] = useState(false)
  const [offerCats, setOfferCats] = useState<Record<string, string>>({ p1: 'Sommeil', p2: 'Mental' })
  const [freebiePublished, setFreebiePublished] = useState<Record<string, boolean>>(
    () => Object.fromEntries(freebies.map(f => [f.id, true])),
  )
  const [mediaPublished, setMediaPublished] = useState<Record<string, boolean>>(
    () => Object.fromEntries(gallery.map(m => [m.id, true])),
  )
  const [mediaCats, setMediaCats] = useState<Record<string, string>>({ m1: 'Studio', m2: 'Démo', m3: 'Atelier' })
  const [mediaDraft, setMediaDraft] = useState<{ src: string; fileName: string; size: string } | null>(null)
  const [composer, setComposer] = useState<'program' | 'freebie' | 'media' | null>(null)
  const [editingOffer, setEditingOffer] = useState<string | null>(null)


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
  const todayOff = offDays.includes(base.getDate())

  /* semaine affichée : 7 jours consécutifs du mois, navigables semaine par semaine */
  const weekStartDay = Math.min(1 + weekOffset * 7, daysIn)
  const weekDays: { day: number; num: number; label: string }[] = []
  for (let k = 0; k < 7; k++) {
    const day = weekStartDay + k
    if (day > daysIn) break
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
    weekDays.push({ day, num: day, label: d.toLocaleDateString('fr-FR', { weekday: 'short' }) })
  }

  /* tous les éléments d'une journée, avec leur pastille de couleur */
  const calItemsFor = (day: number) => {
    const out: { id: string; time: string; label: string; who: string; kind: CalKind }[] = []
    for (const it of agendaDays[day] ?? []) {
      out.push({ id: `ag-${day}-${it.time}`, time: it.time, label: it.label, who: it.who, kind: it.kind === 'group' ? 'groupe' : 'indiv' })
    }
    if (day === base.getDate() || day === base.getDate() + 2) {
      out.push({ id: `svc-${day}`, time: '12:30', label: 'Bilan découverte · 30 min', who: 'Nouvel élève', kind: 'service' })
    }
    for (const cs of customSlots.filter(s => s.day === day)) {
      out.push({ id: cs.id, time: cs.start, label: `Créneau ouvert · ${cs.dur} min`, who: 'Réservation libre', kind: 'libre' })
    }
    if (offDays.includes(day)) {
      out.push({ id: `off-${day}`, time: 'Journée', label: 'Indisponibilité', who: 'Non réservable', kind: 'off' })
    }
    return out.sort((a, b) => a.time.localeCompare(b.time))
  }

  const toggleOffDay = (day: number) => {
    if (month < 0) return
    setOffDays(ds => (ds.includes(day) ? ds.filter(x => x !== day) : [...ds, day]))
  }
  const isOffDay = (day: number) => month === 0 && offDays.includes(day)
  const cancelBlock = () => { setBlockMode(false); setBlockStart(null) }
  const changeMonth = (delta: number) => {
    if (delta > 0 && month >= 0) return
    if (delta < 0 && month <= -1) return
    setMonth(m => m + delta); setSelectedDay(1); setWeekOffset(0); cancelBlock()
  }

  /* séances déjà prévues sur une plage : on prévient avant de fermer les créneaux */
  const sessionsInRange = (from: number, to: number) => {
    const out: { id: string; time: string; label: string; who: string; kind: CalKind; day: number }[] = []
    for (let d = from; d <= to; d++) {
      for (const it of calItemsFor(d)) {
        if (it.kind !== 'off') out.push({ ...it, day: d })
      }
    }
    return out
  }
  const applyOff = (from: number, to: number) => {
    if (from !== to) setRangeUndo({ days: [...offDays], count: to - from + 1 })
    setOffDays(ds => [...new Set([...ds, ...Array.from({ length: to - from + 1 }, (_, k) => from + k)])].sort((a, b) => a - b))
    cancelBlock()
  }
  const requestOff = (from: number, to: number) => {
    if (sessionsInRange(from, to).length > 0) { setOffConfirm({ from, to }); return }
    applyOff(from, to)
  }

  /* toucher un jour le bascule directement ; en mode période, deux dates font une plage */
  const onMonthDay = (day: number) => {
    if (month < 0) return
    setSelectedDay(day)
    if (!blockMode) {
      if (isOffDay(day)) { toggleOffDay(day); setRangeUndo(null) }
      else requestOff(day, day)
      return
    }
    if (blockStart === null) { setBlockStart(day); return }
    const from = Math.min(blockStart, day)
    const to = Math.max(blockStart, day)
    requestOff(from, to)
  }
  const undoRange = () => { if (rangeUndo) setOffDays(rangeUndo.days); setRangeUndo(null) }
  const removeRun = (run: { from: number; to: number }) => {
    setOffDays(ds => ds.filter(d => d < run.from || d > run.to)); setRangeUndo(null)
  }

  /* jours bloqués regroupés en périodes consécutives, listés sous le calendrier */
  const offRuns: { from: number; to: number }[] = []
  ;[...offDays].sort((a, b) => a - b).forEach(d => {
    const last = offRuns[offRuns.length - 1]
    if (last && d === last.to + 1) last.to = d
    else offRuns.push({ from: d, to: d })
  })
  const offRunLabel = (run: { from: number; to: number }) =>
    run.from === run.to ? `${run.from} ${monthShort}` : `Du ${run.from} au ${run.to} ${monthShort}`
  const selectedWeekday = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), selectedDay).toLocaleDateString('fr-FR', { weekday: 'long' })

  /* navigation jour par jour, y compris au changement de mois */
  const moveDay = (delta: number) => {
    const next = selectedDay + delta
    if (next < 1) {
      if (month <= 0) return
      const prevDays = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0).getDate()
      setMonth(m => m - 1); setSelectedDay(prevDays); setWeekOffset(0)
      return
    }
    if (next > daysIn) {
      if (month >= 0) return
      setMonth(m => m + 1); setSelectedDay(1); setWeekOffset(0)
      return
    }
    setSelectedDay(next)
  }

  /* bandeau des 7 jours de la semaine du jour sélectionné */
  const selWeekday = (new Date(viewMonth.getFullYear(), viewMonth.getMonth(), selectedDay).getDay() + 6) % 7
  const stripStart = Math.max(1, selectedDay - selWeekday)
  const stripDays = Array.from({ length: 7 }, (_, k) => stripStart + k).filter(d => d <= daysIn)
  const daySlots = customSlots.filter(cs => cs.day === selectedDay)
  const toggleCalendar = (id: string) =>
    setCalSync(cs => (cs.includes(id) ? cs.filter(x => x !== id) : [...cs, id]))
  const runCalendarSync = () => {
    setLastSync(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    setCalSyncOpen(false)
  }

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
      const id = 'p' + Date.now()
      setPrograms(ps => [
        ...ps,
        {
          id,
          title: progTitle.trim(),
          duration: progDur,
          sessionsCount: 8,
          format: 'Individuel & suivi EVA',
          desc: progDesc.trim() || 'Accompagnement structuré sur-mesure avec bilans hebdomadaires.',
          price: Number(progPrice) || 390,
          active: true,
        },
      ])
      setOfferCats(cats => ({ ...cats, [id]: 'Bien-être' }))
    }
    setEditingProg(null); setShowProgForm(false); setEditingOffer(null); setComposer(null)
    setProgTitle(''); setProgDesc('')
  }

  const startProgramComposer = () => {
    setEditingProg(null); setEditingOffer(null)
    setProgTitle(''); setProgDur('8 semaines'); setProgPrice('420'); setProgDesc('')
    setComposer('program')
  }

  const beginOfferEdit = (p: CoachProgram) => {
    setEditingProg(p); setEditingOffer(p.id); setComposer(null)
    setProgTitle(p.title); setProgDur(p.duration); setProgPrice(String(p.price)); setProgDesc(p.desc)
  }

  const saveHeadline = () => {
    setHeadline(headlineDraft.trim() || headline)
    setHeadlineEditing(false)
  }

  const savePublicBio = () => {
    setPublicBio(bioDraft.trim() || publicBio)
    setBioEditing(false)
  }

  const addFreebie = () => {
    if (!freeTitle.trim()) return
    const id = 'f' + Date.now()
    setFreebies(fs => [
      { id, title: freeTitle.trim(), kind: freeKind, duration: freeDur, downloads: 1, src: freeSrc ?? undefined },
      ...fs,
    ])
    setFreebiePublished(pub => ({ ...pub, [id]: true }))
    setFreeTitle('')
    setFreeSrc(null)
    setComposer(null)
  }

  const removeFreebie = (id: string) => {
    setFreebies(fs => fs.filter(f => f.id !== id))
    setFreebiePublished(pub => {
      const next = { ...pub }
      delete next[id]
      return next
    })
  }

  const addMedia = () => {
    const title = mediaTitle.trim() || mediaDraft?.fileName
    if (!title) return
    const id = 'm' + Date.now()
    setGallery(gs => [
      {
        id,
        title,
        kind: mediaKind,
        meta: mediaDraft?.size ?? 'Ajouté à la galerie',
        src: mediaDraft?.src,
      },
      ...gs,
    ])
    setMediaPublished(pub => ({ ...pub, [id]: true }))
    setMediaCats(cats => ({ ...cats, [id]: 'Studio' }))
    setMediaTitle('')
    setMediaDraft(null)
    setComposer(null)
  }

  const toggleFreebiePublished = (id: string) => {
    setFreebiePublished(pub => ({ ...pub, [id]: pub[id] === false }))
  }

  const toggleMediaPublished = (id: string) => {
    setMediaPublished(pub => ({ ...pub, [id]: pub[id] === false }))
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
  const visiblePrograms = studioPreview ? programs.filter(p => p.active) : programs
  const visibleFreebies = studioPreview ? freebies.filter(f => freebiePublished[f.id] !== false) : freebies
  const visibleMedia = studioPreview ? gallery.filter(m => mediaPublished[m.id] !== false) : gallery
  const liveProgramCount = programs.filter(p => p.active).length
  const liveFreebieCount = freebies.filter(f => freebiePublished[f.id] !== false).length
  const liveMediaCount = gallery.filter(m => mediaPublished[m.id] !== false).length
  const hiddenContent = programs.filter(p => !p.active).length
    + freebies.filter(f => freebiePublished[f.id] === false).length
    + gallery.filter(m => mediaPublished[m.id] === false).length
  const todayAgenda = agendaDays[base.getDate()] ?? []
  const todayCustomSlots = customSlots.filter(cs => cs.day === base.getDate())
  const todayTotal = todayAgenda.length + todayCustomSlots.length

  return (
    <div className={'tab-page' + (coachTab === 'messagerie' && activeCoachThreadId && mTab === 'messages' ? ' chat-page' : '')} data-zone={coachTab}>
      {coachTab === 'bord' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">ESPACE COACH</div>
              <h1>Bonjour {COACH_FIRST_NAME}</h1>
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
            </div>
          </section>

          <section className="card today-card">
            <div className="today-head">
              <div className="today-head-copy">
                <div className="card-kicker" style={{ margin: 0 }}><Icon name="calendar" size={13} /> AUJOURD'HUI</div>
                <span className="today-count">{todayTotal} rendez-vous</span>
              </div>
              <button className="link-btn today-manage" onClick={() => { setVSub('creneaux'); onChangeCoachTab?.('vitrine') }}>
                Gérer mes créneaux <Icon name="chevron-right" size={12} />
              </button>
            </div>
            <div className="today-timeline">
              {todayAgenda.map(s => (
                <button className={'today-slot' + (s.kind === 'group' ? ' group' : '')} key={s.time} onClick={() => setLiveVisio({ who: s.who, isGroup: s.kind === 'group' })}>
                  <span className="today-time"><strong>{s.time}</strong><span>{s.dur} min</span></span>
                  <span className={'today-dot ' + s.kind} />
                  <span className="today-body">
                    <span className="today-kind">{s.kind === 'group' ? 'Collectif' : 'Individuel'}</span>
                    <strong>{s.who}</strong>
                    <span>{s.label}</span>
                  </span>
                  <span className="today-launch"><Icon name="video" size={15} /></span>
                </button>
              ))}
              {todayCustomSlots.map(cs => (
                <div className="today-slot is-open" key={cs.id}>
                  <span className="today-time"><strong>{cs.start}</strong><span>{cs.dur} min</span></span>
                  <span className="today-dot open" />
                  <span className="today-body">
                    <span className="today-kind">Réservable</span>
                    <strong>Créneau ouvert</strong>
                    <span>Disponible à la réservation</span>
                  </span>
                  <span className="today-open-tag">Ouvert</span>
                </div>
              ))}
              {todayTotal === 0 && <div className="today-empty">Aucun rendez-vous aujourd'hui.</div>}
            </div>
          </section>

          {/* SYNTHÈSES DE SÉANCES — comptes rendus EVA */}
          <section className="card" data-zone="syntheses">
            <div className="feed-head">
              <h2>Vos dernières synthèses de séance</h2>
              <span className="tag mini">{EVA_SESSION_REPORTS.length}</span>
            </div>
            <div className="synth-list">
              {EVA_SESSION_REPORTS.map(r => (
                <article className="synth-row glass-lite" key={r.id}>
                  <div className="synth-row-head">
                    <span className="synth-ico"><Icon name="sparkle" size={13} /></span>
                    <div className="session-info">
                      <strong>{r.clientName}</strong>
                      <span>{r.title} · {r.date}</span>
                    </div>
                    <span className="tag mini">{r.duration}</span>
                  </div>
                  <p>{r.summary}</p>
                  <span className="synth-saved"><Icon name="clock" size={11} /> {r.timeSaved}</span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ONGLET OFFRE & PLANNING (EX-VITRINE OPTIMISÉ) */}
      {coachTab === 'vitrine' && (
        <>
          <header className={'page-head' + (vSub === 'galerie' ? ' vitrine-public-head' : '')}>
            <div>
              <div className="date-line">{vSub === 'galerie' ? 'VITRINE · APERÇU ÉDITABLE' : 'OFFRE & PLANNING'}</div>
              <h1>{vSub === 'galerie' ? 'Votre vitrine' : <>Vos programmes,<br />créneaux & tarifs.</>}</h1>
              <p>{vSub === 'galerie'
                ? 'La page que vos élèves découvrent, éditable directement.'
                : 'Vos programmes portent leur tarif : créez, éditez et publiez vos offres, vos créneaux (+15 min auto) et vos contenus gratuits.'}</p>
            </div>
          </header>

          <div className="subtabs">
            {([
              ['business', 'Business'],
              ['programmes', 'Programmes'],
              ['creneaux', 'Créneaux'],
              ['galerie', 'Public'],
            ] as const).map(([id, label]) => (
              <button key={id} className={'subtab' + (vSub === id ? ' on' : '')} onClick={() => setVSub(id)}>
                {label}
              </button>
            ))}
          </div>

          {vSub === 'business' && (
            <>
              <section className="card">
                <div className="card-kicker"><Icon name="chart" size={13} /> REVENUS & FACTURATION · CE MOIS</div>
                <h2>Votre business, dans le détail</h2>
                <div className="metrics" style={{ marginTop: 8 }}>
                  <div className="metric">
                    <div className="metric-top"><span>CHIFFRE D'AFFAIRES</span><span className="delta up">+12%</span></div>
                    <span className="metric-val good">6 840 €</span>
                  </div>
                  <div className="metric">
                    <div className="metric-top"><span>CATALOGUE ACTIF</span></div>
                    <span className="metric-val">{programRevenue} €</span>
                  </div>
                  <div className="metric">
                    <div className="metric-top"><span>TAUX DE REMPLISSAGE</span><span className="delta up">+6%</span></div>
                    <span className="metric-val good">87%</span>
                  </div>
                  <div className="metric">
                    <div className="metric-top"><span>SÉANCES NON HONORÉES</span><span className="delta down">-2</span></div>
                    <span className="metric-val bad">3</span>
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
                        <strong className={row.share < 50 ? 'bad' : 'good'}>{row.share}%</strong>
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
                        <strong className={row.rate >= 85 ? 'good' : 'bad'}>{row.rate}%</strong>
                        <div className="group-meter"><span style={{ width: `${row.rate}%` }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="privacy">
                <Icon name="shield" size={13} /> Montants nets de commission · facturation aux organismes partenaires incluse.
              </div>
            </>
          )}

          {vSub === 'creneaux' && (
            <>
              <section className="card">
                <div className="row between" style={{ marginTop: 0, marginBottom: 8 }}>
                  <div className="card-kicker" style={{ margin: 0 }}><Icon name="calendar" size={13} /> DISPONIBILITÉS</div>
                  <span className={'status-pill' + (todayOff ? ' off' : '')}>
                    <i />{todayOff ? 'Indisponible aujourd’hui' : 'Disponible'}
                  </span>
                </div>
                <h2>Votre agenda, en un coup d’œil.</h2>

                <div className="sync-row">
                  <button className="btn btn-soft sm" onClick={() => setCalSyncOpen(true)}>
                    <Icon name="calendar" size={13} /><span>Synchroniser mes calendriers</span>
                  </button>
                  <span className="sync-state">
                    {lastSync
                      ? `Synchronisé à ${lastSync}`
                      : calSync.length > 0
                        ? `${calSync.length} calendrier${calSync.length > 1 ? 's' : ''} connecté${calSync.length > 1 ? 's' : ''}`
                        : 'Apple Calendrier · Google · Outlook'}
                  </span>
                </div>

                <div className="cal-views" role="tablist" aria-label="Vue de l’agenda">
                  {([['mois', 'Mois'], ['semaine', 'Semaine'], ['jour', 'Jour']] as const).map(([id, label]) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={calView === id}
                      className={'cal-view-tab' + (calView === id ? ' on' : '')}
                      onClick={() => { setCalView(id); cancelBlock(); setRangeUndo(null) }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="month-head">
                  <button className="round-btn sm" onClick={() => changeMonth(-1)} aria-label="Mois précédent"><Icon name="chevron-left" size={16} /></button>
                  <strong>{monthLabel}</strong>
                  <div className="row" style={{ marginTop: 0 }}>
                    <button className="round-btn sm" disabled={month >= 0} onClick={() => changeMonth(1)} aria-label="Mois suivant"><Icon name="chevron-right" size={16} /></button>
                    <button className="round-btn sm" onClick={() => setCalFull(true)} aria-label="Ouvrir l’agenda en plein écran"><Icon name="grid" size={15} /></button>
                  </div>
                </div>

                {calView === 'mois' && (
                  <div className="month-grid">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={'h' + i} className="month-dow">{d}</span>)}
                    {Array.from({ length: firstWd }).map((_, i) => <span key={'p' + i} />)}
                    {Array.from({ length: daysIn }).map((_, i) => {
                      const d = i + 1
                      const items = month === 0 ? calItemsFor(d) : []
                      const isToday = month === 0 && d === base.getDate()
                      const isOff = isOffDay(d)
                      const run = month === 0 ? offRuns.find(r => d >= r.from && d <= r.to) : undefined
                      const inRun = !!run && run.to > run.from
                      return (
                        <button
                          key={d}
                          className={'month-day cal' + (isToday ? ' now' : '') + (isOff ? ' off' : '') + (inRun ? ' in-run' : '') + (inRun && run!.from === d ? ' run-start' : '') + (inRun && run!.to === d ? ' run-end' : '')}
                          onClick={() => onMonthDay(d)}
                          aria-pressed={isOff}
                          aria-label={`${d} ${monthShort} — ${isOff ? 'indisponible' : 'disponible'}`}
                        >
                          <span>{d}</span>
                          <span className="cal-dots">
                            {items.slice(0, 3).map(it => (
                              <i key={it.id} style={{ background: CAL_KINDS[it.kind].color }} />
                            ))}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {calView === 'mois' && (month < 0 ? (
                  <p className="goal-hint">Les indisponibilités se gèrent sur le mois en cours.</p>
                ) : blockMode ? (
                  <div className="cal-blockbar">
                    <span>
                      {blockStart === null
                        ? 'Touchez le premier jour de la période'
                        : `${blockStart} ${monthShort} → touchez le dernier jour`}
                    </span>
                    <button onClick={cancelBlock}>Annuler</button>
                  </div>
                ) : (
                  <div className="cal-toolbar">
                    <button className="btn btn-soft sm" onClick={() => { setBlockMode(true); setBlockStart(null); setRangeUndo(null) }}>
                      <Icon name="calendar" size={12} /><span>Bloquer une période</span>
                    </button>
                    <span className="cal-help">Touchez un jour pour le rendre indisponible.</span>
                  </div>
                ))}

                {calView === 'mois' && month === 0 && rangeUndo && (
                  <div className="cal-undobar">
                    <Icon name="check" size={12} />
                    <span>{rangeUndo.count} jour{rangeUndo.count > 1 ? 's' : ''} bloqué{rangeUndo.count > 1 ? 's' : ''}</span>
                    <button onClick={undoRange}>Annuler</button>
                  </div>
                )}

                {calView === 'semaine' && (
                  <>
                    <div className="cal-nav">
                      <button
                        className="round-btn sm"
                        disabled={weekOffset === 0}
                        onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                        aria-label="Semaine précédente"
                      >
                        <Icon name="chevron-left" size={16} />
                      </button>
                      <strong>
                        {weekDays.length > 0 ? `Du ${weekDays[0].day} au ${weekDays[weekDays.length - 1].day} ${monthShort}` : monthShort}
                      </strong>
                      <button
                        className="round-btn sm"
                        disabled={1 + (weekOffset + 1) * 7 > daysIn}
                        onClick={() => setWeekOffset(w => w + 1)}
                        aria-label="Semaine suivante"
                      >
                        <Icon name="chevron-right" size={16} />
                      </button>
                    </div>
                    <div className="week-list">
                      {weekDays.map(wd => {
                        const off = isOffDay(wd.day)
                        const count = calItemsFor(wd.day).filter(it => it.kind !== 'off').length
                        return (
                          <button
                            key={wd.num}
                            type="button"
                            className={'week-row' + (off ? ' off' : '')}
                            onClick={() => (off ? toggleOffDay(wd.day) : requestOff(wd.day, wd.day))}
                            aria-pressed={off}
                          >
                            <span className="week-row-dow">{wd.label}</span>
                            <strong>{wd.num}</strong>
                            <span className="week-row-info">{count === 0 ? 'Aucune prestation' : `${count} prestation${count > 1 ? 's' : ''}`}</span>
                            <span className="week-row-state">{off ? 'Indispo' : 'Dispo'}</span>
                            <span className={'cal-switch' + (off ? ' on' : '')} aria-hidden="true"><i /></span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {calView === 'jour' && (
                  <>
                    <div className="day-strip">
                      {stripDays.map(d => (
                        <button
                          type="button"
                          key={d}
                          className={'day-strip-day' + (d === selectedDay ? ' on' : '') + (isOffDay(d) ? ' off' : '')}
                          onClick={() => setSelectedDay(d)}
                          aria-pressed={d === selectedDay}
                        >
                          <span>{new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d).toLocaleDateString('fr-FR', { weekday: 'narrow' })}</span>
                          <strong>{d}</strong>
                        </button>
                      ))}
                    </div>

                    <div className="cal-day-head cal-day-nav">
                      <button className="round-btn sm" onClick={() => moveDay(-1)} aria-label="Jour précédent">
                        <Icon name="chevron-left" size={15} />
                      </button>
                      <div>
                        <strong>{selectedWeekday} {selectedDay} {monthShort}</strong>
                        <span>{isOffDay(selectedDay) ? 'Indisponible' : 'Disponible'}</span>
                      </div>
                      <button className="round-btn sm" onClick={() => moveDay(1)} aria-label="Jour suivant">
                        <Icon name="chevron-right" size={15} />
                      </button>
                    </div>

                    <button
                      className={'day-toggle' + (isOffDay(selectedDay) ? ' off' : '')}
                      onClick={() => (isOffDay(selectedDay) ? toggleOffDay(selectedDay) : requestOff(selectedDay, selectedDay))}
                    >
                      <Icon name={isOffDay(selectedDay) ? 'check' : 'close'} size={13} />
                      <span>{isOffDay(selectedDay) ? 'Rendre ce jour disponible' : 'Marquer ce jour indisponible'}</span>
                    </button>

                    {calItemsFor(selectedDay).filter(it => it.kind !== 'off').length === 0 && (
                      <p className="goal-hint">Aucune prestation ce jour.</p>
                    )}
                    {calItemsFor(selectedDay).filter(it => it.kind !== 'off').map(it => (
                      <div className={'cal-line ' + it.kind} key={it.id}>
                        <span className="cal-line-dot" style={{ background: CAL_KINDS[it.kind].color }} />
                        <span className="cal-line-time">{it.time}</span>
                        <div className="session-info">
                          <strong>{it.label}</strong>
                          <span>{it.who}</span>
                        </div>
                        <span className="tag mini">{CAL_KINDS[it.kind].label}</span>
                      </div>
                    ))}
                  </>
                )}

                {month === 0 && (
                  <div className="off-summary">
                    <div className="off-summary-head">
                      <strong>Jours indisponibles</strong>
                      <span>{offDays.length === 0 ? 'Aucun' : `${offDays.length} jour${offDays.length > 1 ? 's' : ''}`}</span>
                    </div>
                    {offRuns.length === 0 ? (
                      <p className="goal-hint">Votre agenda est ouvert tous les jours.</p>
                    ) : offRuns.map(run => (
                      <div className="off-run" key={run.from}>
                        <span className="off-run-date">{offRunLabel(run)}</span>
                        {run.to > run.from && <span className="off-run-count">{run.to - run.from + 1} j</span>}
                        <button onClick={() => removeRun(run)}>Rendre dispo</button>
                      </div>
                    ))}
                    <div className="privacy" style={{ marginTop: 10 }}>
                      <Icon name="shield" size={12} /> Ces jours ne sont ni réservables ni proposés à vos élèves.
                    </div>
                  </div>
                )}

                <div className="cal-legend">
                  {(Object.keys(CAL_KINDS) as CalKind[]).map(k => (
                    <span className="cal-legend-item" key={k}>
                      <i style={{ background: CAL_KINDS[k].color }} />{CAL_KINDS[k].label}
                    </span>
                  ))}
                </div>
              </section>

              {/* créneaux réservables — une ligne, le formulaire ne s'ouvre qu'au besoin */}
              <section className="card eco-slot" data-zone="creneaux">
                <button className="eco-slot-head" onClick={() => setSlotOpen(o => !o)} aria-expanded={slotOpen}>
                  <span className="eco-slot-ico"><Icon name="clock" size={15} /></span>
                  <span className="eco-slot-title">
                    <strong>Créneaux réservables</strong>
                    <em>
                      {daySlots.length === 0
                        ? `Aucun créneau ouvert le ${selectedDay} ${monthShort}`
                        : `${daySlots.length} créneau${daySlots.length > 1 ? 'x' : ''} ouvert${daySlots.length > 1 ? 's' : ''} le ${selectedDay} ${monthShort}`}
                    </em>
                  </span>
                  <span className="chev"><Icon name="chevron-right" size={14} /></span>
                </button>

                {slotOpen && (
                  <div className="eco-slot-body">
                    <div className="row" style={{ marginTop: 0 }}>
                      <input
                        type="time"
                        className="eco-input glass-lite"
                        aria-label="Heure de début du créneau"
                        value={newSlotTime}
                        onChange={e => setNewSlotTime(e.target.value)}
                        style={{ maxWidth: 115 }}
                      />
                      <select
                        className="eco-select glass-lite"
                        aria-label="Durée de la séance"
                        value={newSlotDur}
                        onChange={e => setNewSlotDur(Number(e.target.value))}
                        style={{ maxWidth: 120 }}
                      >
                        {[30, 45, 60, 90].map(m => <option key={m} value={m}>{m} min</option>)}
                      </select>
                      <button className="btn btn-primary sm" onClick={addAvailabilitySlot}>
                        <Icon name="plus" size={14} /><span>Ouvrir</span>
                      </button>
                    </div>
                    <p className="goal-hint" style={{ marginTop: 0 }}>
                      {newSlotTime} → {addMinutesToTime(newSlotTime, newSlotDur)} · 15 min de retour sur séance incluses automatiquement.
                    </p>

                    {daySlots.map(cs => (
                      <div className="agenda-slot-block" key={cs.id}>
                        <div className="session">
                          <div className="date-box"><strong style={{ fontSize: 13 }}>{cs.start}</strong></div>
                          <div className="session-info">
                            <strong>Créneau ouvert ({cs.dur} min)</strong>
                            <span>Visible sur votre profil public · {cs.end} – {cs.debriefEnd} avec le retour</span>
                          </div>
                          <button
                            className="remove-btn"
                            onClick={() => setCustomSlots(list => list.filter(x => x.id !== cs.id))}
                            aria-label="Retirer ce créneau"
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

          {vSub === 'galerie' && (
            <>
              <div className={'studio-toolbar' + (studioPreview ? ' is-preview' : '')}>
                <div className="studio-toolbar-main">
                  <span className="studio-toolbar-icon">
                    <Icon name={studioPreview ? 'eye' : 'edit'} size={15} />
                  </span>
                  <div>
                    <strong>{studioPreview ? 'Aperçu élève' : 'Édition directe'}</strong>
                    <span>{studioPreview ? 'Votre page telle qu’elle est publiée aujourd’hui.' : 'Le profil public est la surface d’édition.'}</span>
                  </div>
                </div>
                <button
                  className={'studio-preview-btn' + (studioPreview ? ' active' : '')}
                  onClick={() => setStudioPreview(v => !v)}
                  aria-pressed={studioPreview}
                >
                  <Icon name={studioPreview ? 'edit' : 'eye'} size={14} />
                  <span>{studioPreview ? 'Modifier' : 'Aperçu élève'}</span>
                </button>
              </div>

              {!studioPreview && (
                <div className="studio-guidance">
                  <Icon name="sparkle" size={13} />
                  <span>Touchez un texte, une catégorie ou une visibilité. Tout se règle ici, sans quitter votre page.</span>
                </div>
              )}

              <div className="studio-overview" aria-label="Contenus de la vitrine">
                <button onClick={() => document.getElementById('studio-offres')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  <i className="blue" /><strong>{liveProgramCount}</strong><span>{liveProgramCount > 1 ? 'offres' : 'offre'}</span>
                </button>
                <button onClick={() => document.getElementById('studio-freebies')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  <i className="red" /><strong>{liveFreebieCount}</strong><span>{liveFreebieCount > 1 ? 'ressources' : 'ressource'}</span>
                </button>
                <button onClick={() => document.getElementById('studio-galerie')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  <i className="purple" /><strong>{liveMediaCount}</strong><span>{liveMediaCount > 1 ? 'médias' : 'média'}</span>
                </button>
                {!studioPreview && hiddenContent > 0 && <span className="studio-overview-hidden">{hiddenContent} masqué{hiddenContent > 1 ? 's' : ''}</span>}
              </div>

              <article className="public-profile" aria-label="Aperçu de votre vitrine publique">
                <header className="public-cover">
                  <img className="public-cover-img" src={cover} alt="" />
                  <div className="public-cover-shade" />
                  {!studioPreview && (
                    <div className="public-cover-tools">
                      <button className="public-cover-btn" onClick={() => coverInput.current?.click()}>
                        <Icon name="camera" size={13} /><span>Couverture</span>
                      </button>
                      <span className="public-state on"><i /> Publié</span>
                      <input
                        ref={coverInput}
                        type="file"
                        accept="image/*"
                        aria-label="Changer l’image de couverture"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f?.type.startsWith('image/')) setCover(URL.createObjectURL(f))
                          e.target.value = ''
                        }}
                      />
                    </div>
                  )}
                  <div className="public-identity">
                    <Avatar hue={publicCoach.hue} initials={publicCoach.initials} photo={publicCoach.photo} size={72} ring />
                    <div className="public-identity-copy">
                      <div className="public-name-line">
                        <strong>{publicCoach.name}</strong>
                        <span className="public-verified" title="Profil vérifié"><Icon name="check" size={10} strokeWidth={2.4} /></span>
                      </div>
                      {headlineEditing && !studioPreview ? (
                        <div className="public-inline-fields">
                          <input
                            className="public-inline-input"
                            value={headlineDraft}
                            autoFocus
                            aria-label="Accroche du profil"
                            onChange={e => setHeadlineDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveHeadline()
                              if (e.key === 'Escape') setHeadlineEditing(false)
                            }}
                          />
                          <div className="public-inline-actions">
                            <button className="inline-icon ok" onClick={saveHeadline} aria-label="Enregistrer l’accroche"><Icon name="check" size={12} /></button>
                            <button className="inline-icon" onClick={() => setHeadlineEditing(false)} aria-label="Annuler"><Icon name="close" size={12} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="public-role-line">
                          <span>{headline}</span>
                          {!studioPreview && (
                            <button
                              className="inline-edit"
                              onClick={() => { setHeadlineDraft(headline); setHeadlineEditing(true) }}
                              aria-label="Modifier l’accroche du profil"
                            >
                              <Icon name="edit" size={11} />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="public-meta">
                        <span><Icon name="star" size={12} /> {publicCoach.rating} · {publicCoach.reviews} avis</span>
                        <span><Icon name="location" size={12} /> {publicCoach.city} · {publicCoach.mode}</span>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="public-profile-body">
                  <div className="public-proof">
                    <div><strong>{publicCoach.students}+</strong><span>élèves accompagnés</span></div>
                    <div><strong>{publicCoach.successRate}%</strong><span>objectifs atteints</span></div>
                    <div><strong>24 h</strong><span>réponse moyenne</span></div>
                  </div>

                  <section className="public-section">
                    <div className="public-section-head">
                      <div>
                        <h2>À propos</h2>
                        <span className="public-section-kicker">Votre approche, en quelques mots</span>
                      </div>
                      {!studioPreview && !bioEditing && (
                        <button className="public-edit-link" onClick={() => { setBioDraft(publicBio); setBioEditing(true) }}>
                          <Icon name="edit" size={12} /><span>Modifier</span>
                        </button>
                      )}
                    </div>
                    {bioEditing && !studioPreview ? (
                      <div className="public-bio-edit">
                        <textarea
                          className="journal"
                          rows={4}
                          value={bioDraft}
                          autoFocus
                          aria-label="Biographie publique"
                          onChange={e => setBioDraft(e.target.value)}
                        />
                        <div className="public-bio-actions">
                          <button className="btn btn-ghost sm" onClick={() => setBioEditing(false)}>Annuler</button>
                          <button className="btn btn-primary sm" onClick={savePublicBio}><Icon name="check" size={13} /><span>Enregistrer</span></button>
                        </div>
                      </div>
                    ) : (
                      <p className="public-bio">{publicBio}</p>
                    )}
                    <div className="public-tags">
                      {publicCoach.tags.map(t => <span key={t}>{t}</span>)}
                      {publicCoach.domains.filter(d => !publicCoach.tags.includes(d)).map(d => <span key={d}>{d}</span>)}
                    </div>
                  </section>

                  <section className="public-section" id="studio-offres">
                    <div className="public-section-head">
                      <div>
                        <h2>Programmes & accompagnements</h2>
                        <span className="public-section-kicker">{programs.filter(p => p.active).length} offre{programs.filter(p => p.active).length > 1 ? 's' : ''} publiée{programs.filter(p => p.active).length > 1 ? 's' : ''} · {programs.filter(p => p.active).reduce((sum, p) => sum + p.price, 0)} € au catalogue</span>
                      </div>
                      {!studioPreview && (
                        <button className="public-add-btn" onClick={startProgramComposer}><Icon name="plus" size={13} /><span>Ajouter</span></button>
                      )}
                    </div>

                    <div className="public-offer-list">
                      {visiblePrograms.map(p => {
                        const category = offerCats[p.id] ?? 'Bien-être'
                        return (
                          <article className={'public-offer' + (p.active ? '' : ' is-hidden')} key={p.id}>
                            <div className="public-offer-top">
                              <span className="public-category">{category}</span>
                              {!studioPreview && (
                                <span className={'public-state' + (p.active ? ' on' : '')}><i />{p.active ? 'Publié' : 'Masqué'}</span>
                              )}
                            </div>
                            <div className="public-offer-main">
                              <div>
                                <h3>{p.title}</h3>
                                <span>{p.duration} · {p.sessionsCount} séances</span>
                              </div>
                              <strong>{p.price} €</strong>
                            </div>
                            <p>{p.desc}</p>
                            <span className="public-offer-format">{p.format}</span>

                            {!studioPreview && editingOffer === p.id && (
                              <div className="studio-inline-editor">
                                <input className="eco-input glass-lite" value={progTitle} onChange={e => setProgTitle(e.target.value)} aria-label="Titre du programme" />
                                <div className="studio-form-grid">
                                  <input className="eco-input glass-lite" value={progDur} onChange={e => setProgDur(e.target.value)} aria-label="Durée" />
                                  <input className="eco-input glass-lite" value={progPrice} onChange={e => setProgPrice(e.target.value)} aria-label="Tarif" inputMode="numeric" />
                                </div>
                                <textarea className="journal" rows={2} value={progDesc} onChange={e => setProgDesc(e.target.value)} aria-label="Description du programme" />
                                <div className="studio-editor-actions">
                                  <button className="btn btn-ghost sm" onClick={() => { setEditingOffer(null); setEditingProg(null) }}>Annuler</button>
                                  <button className="btn btn-primary sm" onClick={saveProgram}><Icon name="check" size={13} /><span>Enregistrer</span></button>
                                </div>
                              </div>
                            )}

                            {!studioPreview && editingOffer !== p.id && (
                              <div className="public-offer-actions">
                                <label className="public-cat-select">
                                  <span>Catégorie</span>
                                  <select
                                    value={category}
                                    aria-label={`Catégorie de ${p.title}`}
                                    onChange={e => setOfferCats(cats => ({ ...cats, [p.id]: e.target.value }))}
                                  >
                                    {OFFER_CATEGORIES.map(c => <option value={c} key={c}>{c}</option>)}
                                  </select>
                                </label>
                                <button className="public-mini-action" onClick={() => beginOfferEdit(p)}><Icon name="edit" size={12} /><span>Modifier</span></button>
                                <button
                                  className={'public-visibility' + (p.active ? ' on' : '')}
                                  aria-pressed={p.active}
                                  onClick={() => setPrograms(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x))}
                                >
                                  <Icon name={p.active ? 'eye' : 'close'} size={12} />
                                  <span>{p.active ? 'Visible' : 'Masqué'}</span>
                                </button>
                              </div>
                            )}
                          </article>
                        )
                      })}
                    </div>
                    {visiblePrograms.length === 0 && (
                      <div className="public-empty"><Icon name="store" size={17} /><span>Aucun programme visible. Activez une offre ci-dessus.</span></div>
                    )}

                    {!studioPreview && composer === 'program' && (
                      <div className="studio-composer">
                        <div className="studio-composer-head">
                          <div><span className="public-section-kicker">Nouvelle offre</span><strong>Créer un programme</strong></div>
                          <button className="icon-btn" onClick={() => setComposer(null)} aria-label="Fermer"><Icon name="close" size={14} /></button>
                        </div>
                        <input className="eco-input glass-lite" placeholder="Titre du programme (ex. Reset Sommeil)" value={progTitle} onChange={e => setProgTitle(e.target.value)} />
                        <div className="studio-form-grid">
                          <input className="eco-input glass-lite" placeholder="Durée (ex. 6 semaines)" value={progDur} onChange={e => setProgDur(e.target.value)} />
                          <input className="eco-input glass-lite" placeholder="Tarif €" value={progPrice} onChange={e => setProgPrice(e.target.value)} inputMode="numeric" />
                        </div>
                        <textarea className="journal" rows={2} placeholder="Description et bénéfices clés…" value={progDesc} onChange={e => setProgDesc(e.target.value)} />
                        <div className="studio-editor-actions">
                          <button className="btn btn-ghost sm" onClick={() => setComposer(null)}>Annuler</button>
                          <button className="btn btn-primary sm" onClick={saveProgram}><Icon name="check" size={13} /><span>Publier</span></button>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="public-section" id="studio-freebies">
                    <div className="public-section-head">
                      <div>
                        <h2>Ressources offertes</h2>
                        <span className="public-section-kicker">Ce que vos élèves reçoivent gratuitement</span>
                      </div>
                      {!studioPreview && (
                        <button className="public-add-btn" onClick={() => { setComposer(composer === 'freebie' ? null : 'freebie'); setEditingOffer(null) }}><Icon name="plus" size={13} /><span>Ajouter</span></button>
                      )}
                    </div>
                    <div className="public-freebies">
                      {visibleFreebies.map(f => {
                        const published = freebiePublished[f.id] !== false
                        return (
                          <article className={'public-freebie' + (published ? '' : ' is-hidden')} key={f.id}>
                            <span className="public-freebie-kind">{f.kind}</span>
                            <div className="public-freebie-copy">
                              <strong>{f.title}</strong>
                              <span>{f.duration} · {f.downloads} téléchargements</span>
                            </div>
                            {!studioPreview && (
                              <div className="public-freebie-actions">
                                <button
                                  className={'public-visibility compact' + (published ? ' on' : '')}
                                  aria-pressed={published}
                                  aria-label={published ? 'Masquer cette ressource' : 'Publier cette ressource'}
                                  onClick={() => toggleFreebiePublished(f.id)}
                                >
                                  <Icon name={published ? 'eye' : 'close'} size={12} />
                                </button>
                                <button
                                  className="public-visibility compact danger"
                                  aria-label="Supprimer cette ressource"
                                  onClick={() => removeFreebie(f.id)}
                                >
                                  <Icon name="trash" size={12} />
                                </button>
                              </div>
                            )}
                          </article>
                        )
                      })}
                    </div>
                    {visibleFreebies.length === 0 && (
                      <div className="public-empty"><Icon name="play" size={17} /><span>Aucune ressource visible. Publiez une ressource pour la montrer.</span></div>
                    )}

                    {!studioPreview && composer === 'freebie' && (
                      <div className="studio-composer">
                        <div className="studio-composer-head">
                          <div><span className="public-section-kicker">Nouvelle ressource</span><strong>Offrir un contenu</strong></div>
                          <button className="icon-btn" onClick={() => setComposer(null)} aria-label="Fermer"><Icon name="close" size={14} /></button>
                        </div>
                        <input className="eco-input glass-lite" placeholder="Titre du contenu gratuit…" value={freeTitle} onChange={e => setFreeTitle(e.target.value)} />
                        <div className="studio-form-grid">
                          <select className="eco-select glass-lite" value={freeKind} onChange={e => setFreeKind(e.target.value)}>
                            <option value="Audio">Audio guidé</option>
                            <option value="Guide PDF">Guide PDF</option>
                            <option value="Image">Image</option>
                            <option value="Vidéo">Vidéo</option>
                            <option value="Article">Article</option>
                          </select>
                          <input className="eco-input glass-lite" placeholder="Durée / taille" value={freeDur} onChange={e => setFreeDur(e.target.value)} />
                        </div>
                        <div className="studio-upload-row">
                          <label className="btn btn-soft sm gallery-pick">
                            <Icon name="camera" size={13} /><span>Ajouter un média</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  setFreeSrc(URL.createObjectURL(f))
                                  setFreeKind(f.type.startsWith('video') ? 'Vidéo' : 'Image')
                                  setFreeDur(`${Math.max(1, Math.round(f.size / 1024))} Ko`)
                                }
                                e.target.value = ''
                              }}
                            />
                          </label>
                          {freeSrc && <span className="public-state on"><i />Média prêt</span>}
                        </div>
                        <div className="studio-editor-actions">
                          <button className="btn btn-ghost sm" onClick={() => setComposer(null)}>Annuler</button>
                          <button className="btn btn-primary sm" onClick={addFreebie}><Icon name="check" size={13} /><span>Publier</span></button>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="public-section" id="studio-galerie">
                    <div className="public-section-head">
                      <div>
                        <h2>Galerie</h2>
                        <span className="public-section-kicker">Studio, démonstrations, ateliers</span>
                      </div>
                      {!studioPreview && (
                        <button className="public-add-btn" onClick={() => { setComposer(composer === 'media' ? null : 'media'); setEditingOffer(null) }}><Icon name="plus" size={13} /><span>Ajouter</span></button>
                      )}
                    </div>
                    <div className="public-gallery">
                      {visibleMedia.map(m => {
                        const published = mediaPublished[m.id] !== false
                        const mediaSrc = m.src ?? STUDIO_MEDIA_IMAGES[m.id]
                        const category = mediaCats[m.id] ?? 'Studio'
                        return (
                          <figure className={'public-media' + (published ? '' : ' is-hidden')} key={m.id}>
                            {mediaSrc
                              ? m.kind === 'Vidéo'
                                ? <video src={mediaSrc} muted playsInline />
                                : <img src={mediaSrc} alt={m.title} />
                              : <div className="public-media-ph"><Icon name={m.kind === 'Vidéo' ? 'play' : 'activity'} size={19} /></div>}
                            <div className="public-media-overlay">
                              <span className="public-media-cat">{category}</span>
                              {!studioPreview && (
                                <button
                                  className={'public-visibility compact' + (published ? ' on' : '')}
                                  aria-pressed={published}
                                  aria-label={published ? 'Masquer ce média' : 'Publier ce média'}
                                  onClick={() => toggleMediaPublished(m.id)}
                                >
                                  <Icon name={published ? 'eye' : 'close'} size={12} />
                                </button>
                              )}
                            </div>
                            <figcaption>
                              <strong>{m.title}</strong>
                              <span>{m.kind} · {m.meta}</span>
                              {!studioPreview && (
                                <select
                                  className="public-media-select"
                                  value={category}
                                  aria-label={`Catégorie de ${m.title}`}
                                  onChange={e => setMediaCats(cats => ({ ...cats, [m.id]: e.target.value }))}
                                >
                                  {['Studio', 'Démo', 'Atelier', 'Résultat', 'Coulisses'].map(c => <option value={c} key={c}>{c}</option>)}
                                </select>
                              )}
                            </figcaption>
                          </figure>
                        )
                      })}
                    </div>
                    {visibleMedia.length === 0 && (
                      <div className="public-empty"><Icon name="video" size={17} /><span>Aucun média visible. Ajoutez une photo ou une vidéo.</span></div>
                    )}

                    {!studioPreview && composer === 'media' && (
                      <div className="studio-composer">
                        <div className="studio-composer-head">
                          <div><span className="public-section-kicker">Nouveau média</span><strong>Enrichir la galerie</strong></div>
                          <button className="icon-btn" onClick={() => setComposer(null)} aria-label="Fermer"><Icon name="close" size={14} /></button>
                        </div>
                        <input className="eco-input glass-lite" placeholder="Légende du média…" value={mediaTitle} onChange={e => setMediaTitle(e.target.value)} />
                        <div className="studio-form-grid">
                          <select className="eco-select glass-lite" value={mediaKind} onChange={e => setMediaKind(e.target.value as 'Photo' | 'Vidéo')}>
                            <option value="Photo">Photo</option>
                            <option value="Vidéo">Vidéo</option>
                          </select>
                          <label className="btn btn-soft sm gallery-pick">
                            <Icon name="plus" size={13} /><span>Choisir un fichier</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  setMediaDraft({
                                    src: URL.createObjectURL(f),
                                    fileName: f.name,
                                    size: `${Math.max(1, Math.round(f.size / 1024))} Ko`,
                                  })
                                }
                                e.target.value = ''
                              }}
                            />
                          </label>
                          {mediaDraft && <span className="public-state on"><i />Média prêt</span>}
                        </div>
                        <div className="studio-editor-actions">
                          <button className="btn btn-ghost sm" onClick={() => { setComposer(null); setMediaDraft(null) }}>Annuler</button>
                          <button className="btn btn-primary sm" onClick={() => addMedia()} disabled={!mediaTitle.trim() && !mediaDraft}><Icon name="check" size={13} /><span>Publier</span></button>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="public-testimonials">
                    <div className="public-section-head">
                      <div><h2>Témoignages</h2><span className="public-section-kicker">{publicCoach.reviews} avis vérifiés</span></div>
                    </div>
                    {publicCoach.testimonial.map(t => (
                      <blockquote key={t.author}>
                        <span className="public-stars">★★★★★</span>
                        <p>“{t.text}”</p>
                        <cite>{t.author}</cite>
                      </blockquote>
                    ))}
                  </section>

                  <div className="public-cta">
                    <div><strong>Prêt à commencer ?</strong><span>Réservez un premier échange avec {publicCoach.name.split(' ')[0]}.</span></div>
                    <button className="btn btn-primary sm"><span>Choisir ce coach</span><Icon name="arrow-right" size={14} /></button>
                  </div>
                </div>
              </article>

              {!studioPreview && (
                <div className="studio-footnote">
                  <Icon name="shield" size={13} />
                  <span>{hiddenContent > 0 ? `${hiddenContent} contenu${hiddenContent > 1 ? 's' : ''} masqué${hiddenContent > 1 ? 's' : ''} · ` : ''}Vos modifications sont visibles immédiatement sur votre page publique.</span>
                </div>
              )}
            </>
          )}

        </>
      )}

      {/* ONGLET SUIVI — stats & clients réunis */}
      {coachTab === 'clients' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">SUIVI DE LA BASE</div>
              <h1>Votre activité,<br />vos élèves.</h1>
              <p>Assiduité, alertes EVA et progression de votre base. Vos revenus sont dans Offre → Business.</p>
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
            <div className="card-kicker"><Icon name="users" size={13} /> SUIVI DE LA BASE D'ÉLÈVES</div>
            <h2>Progression & assiduité</h2>
            <div className="metrics" style={{ marginTop: 8 }}>
              <div className="metric">
                <div className="metric-top"><span>ÉLÈVES ACTIFS</span><span className="delta up">+1</span></div>
                <span className="metric-val good">{COACH_CLIENTS.length}</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>ASSIDUITÉ MOYENNE</span></div>
                <span className={'metric-val ' + (avgAdherence >= 85 ? 'good' : 'bad')}>{avgAdherence}%</span>
              </div>
              <div className="metric">
                <div className="metric-top"><span>ALERTES EVA</span></div>
                <span className={'metric-val ' + (clientAlerts > 0 ? 'bad' : 'good')}>{clientAlerts}</span>
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
                    <strong>{c.name}{c.encadre && <span className="prog-tag">Programme</span>}</strong>
                    <span>{c.program} ({c.startedAgo})</span>
                  </div>
                  <div className="eco-ttarget">
                    <strong className={c.energy < 50 || c.adherence < 70 ? 'bad' : 'good'}>{c.energy}/100</strong>
                    <span>{c.sleep.split(' ')[0]}</span>
                  </div>
                  <div className="eco-tprog">
                    <strong className={c.adherence < 70 ? 'bad' : c.adherence >= 85 ? 'good' : ''}>{c.adherence}%</strong>
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
          {!(activeCoachThreadId && mTab === 'messages') && (
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
                  <button
                    key={t}
                    className={'subtab' + (mTab === t ? ' on' : '')}
                    onClick={() => {
                      setMTab(t)
                      if (t !== 'messages') setActiveCoachThreadId(null)
                    }}
                  >
                    {t === 'messages' ? 'Messages' : t === 'appels' ? 'Appels' : 'Visio'}
                  </button>
                ))}
              </div>
            </>
          )}

          {mTab === 'messages' && (
            activeCoachThreadId ? (() => {
              const isGroup = activeCoachThreadId.startsWith('g')
              const grp = isGroup ? COACH_GROUPS.find(g => g.id === activeCoachThreadId) : null
              const cli = !isGroup ? COACH_CLIENTS.find(c => c.id === activeCoachThreadId) : null
              const title = isGroup ? (grp?.name ?? 'Groupe') : (cli?.name ?? 'Élève')
              const subtitle = isGroup ? `${grp?.schedule} · ${grp?.memberIds.length} élèves` : `${cli?.program}`
              const msgs = coachThreads[activeCoachThreadId] ?? []
              const groupFaces = isGroup && grp
                ? grp.memberIds.slice(0, 2).map(id => clientById(id))
                : []
              return (
                <section className="coach-chat-full" aria-label={`Conversation avec ${title}`}>
                  <header className="coach-chat-full-head">
                    <button className="icon-btn coach-chat-back" onClick={() => setActiveCoachThreadId(null)} aria-label="Retour aux discussions">
                      <Icon name="chevron-left" size={18} />
                    </button>
                    {cli && <Avatar hue={cli.hue} initials={cli.initials} photo={cli.photo} size={38} ring />}
                    {isGroup && (
                      <div className="group-av coach-chat-group-av">
                        {groupFaces.map(face => (
                          <Avatar key={face.id} hue={face.hue} initials={face.initials} photo={face.photo} size={28} />
                        ))}
                      </div>
                    )}
                    <div className="coach-chat-full-who">
                      <strong>{title}</strong>
                      <span><i className="dot" /> {subtitle}</span>
                    </div>
                    <button className="icon-btn" onClick={() => setLiveVisio({ who: title, isGroup })} aria-label="Lancer la visio">
                      <Icon name="video" size={16} />
                    </button>
                  </header>

                  <div className="coach-chat-feed">
                    <span className="coach-chat-day">Aujourd'hui</span>
                    <div className="coach-chat-note"><Icon name="shield" size={12} /> Échange privé · données chiffrées</div>
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

                  <div className="coach-chat-compose">
                    <input
                      aria-label={`Répondre à ${title}`}
                      placeholder={`Répondre à ${title.split(' ')[0]}…`}
                      value={coachDraft}
                      onChange={e => setCoachDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendCoachMsg()}
                    />
                    <button className={'send-btn' + (coachDraft.trim() ? ' ready' : '')} onClick={sendCoachMsg} aria-label="Envoyer">
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
              <h1>Vos réglages.</h1>
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

          <section className="card appearance-card">
            <div className="card-kicker"><Icon name="sun" size={13} /> APPARENCE</div>
            <div className="appearance-row">
              <div className="appearance-copy">
                <span className="appearance-aa" aria-hidden>Aa</span>
                <div className="setting-txt">
                  <strong>Thème {theme === 'light' ? 'clair' : 'sombre'}</strong>
                  <span>La palette s’applique à toute l’application coach et élève.</span>
                </div>
              </div>
              <ThemeToggle theme={theme} onChange={setTheme} />
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

      {/* AGENDA DU MOIS EN PLEIN ÉCRAN — rendez-vous & prestations */}
      {calFull && (
        <div className="cal-full" role="dialog" aria-label="Agenda du mois en plein écran">
          <header className="cal-full-head">
            <button className="icon-btn" onClick={() => setCalFull(false)} aria-label="Fermer le plein écran"><Icon name="close" size={18} /></button>
            <div>
              <div className="date-line">AGENDA · PLEIN ÉCRAN</div>
              <strong>{monthLabel}</strong>
            </div>
            <span className={'status-pill sm' + (todayOff ? ' off' : '')}><i />{todayOff ? 'Indisponible' : 'Disponible'}</span>
          </header>

          <div className="cal-full-grid">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span className="month-dow" key={'fh' + i}>{d}</span>)}
            {Array.from({ length: firstWd }).map((_, i) => <span key={'fp' + i} />)}
            {Array.from({ length: daysIn }).map((_, i) => {
              const d = i + 1
              const items = month === 0 ? calItemsFor(d) : []
              return (
                <div className={'cal-full-cell' + (month === 0 && d === base.getDate() ? ' now' : '')} key={d}>
                  <strong>{d}</strong>
                  {items.slice(0, 3).map(it => (
                    <span
                      className="cal-full-event"
                      key={it.id}
                      style={{ background: `color-mix(in srgb, ${CAL_KINDS[it.kind].color} 14%, transparent)`, color: CAL_KINDS[it.kind].color }}
                    >
                      <em style={{ background: CAL_KINDS[it.kind].color }} />
                      {it.time} · {it.label.split(' · ')[0]}
                    </span>
                  ))}
                  {items.length > 3 && <span className="cal-more">+{items.length - 3}</span>}
                </div>
              )
            })}
          </div>

          <div className="cal-legend">
            {(Object.keys(CAL_KINDS) as CalKind[]).map(k => (
              <span className="cal-legend-item" key={k}><i style={{ background: CAL_KINDS[k].color }} />{CAL_KINDS[k].label}</span>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMATION AVANT DE BLOQUER UN JOUR DÉJÀ RÉSERVÉ — en haut, près du geste */}
      {offConfirm && (() => {
        const { from, to } = offConfirm
        const items = sessionsInRange(from, to)
        const label = from === to ? `${from} ${monthShort}` : `du ${from} au ${to} ${monthShort}`
        const bookings = items.filter(it => it.kind !== 'libre').length
        const slots = items.length - bookings
        const what = [
          bookings > 0 ? `${bookings} séance${bookings > 1 ? 's' : ''}` : '',
          slots > 0 ? `${slots} créneau${slots > 1 ? 'x' : ''} ouvert${slots > 1 ? 's' : ''}` : '',
        ].filter(Boolean).join(' et ')
        const title = from === to ? 'Bloquer ce jour ?' : `Bloquer ${to - from + 1} jours ?`
        return (
          <div className="cal-confirm-layer" onClick={() => setOffConfirm(null)}>
            <div className="cal-confirm-top" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
              <div className="cal-confirm-head">
                <span className="cal-confirm-ico"><Icon name="calendar" size={15} /></span>
                <div>
                  <strong>{title}</strong>
                  <span>{what} déjà au planning {from === to ? `le ${label}` : label}.</span>
                </div>
              </div>

              <div className="cal-confirm-list">
                {items.slice(0, 3).map(it => (
                  <div className={'cal-line ' + it.kind} key={it.id}>
                    <span className="cal-line-dot" style={{ background: CAL_KINDS[it.kind].color }} />
                    <span className="cal-line-time">{it.time}</span>
                    <div className="session-info">
                      <strong>{it.label}</strong>
                      <span>{it.who}{from !== to ? ` · ${it.day} ${monthShort}` : ''}</span>
                    </div>
                  </div>
                ))}
                {items.length > 3 && <p className="dim" style={{ fontSize: 11 }}>+ {items.length - 3} autre{items.length - 3 > 1 ? 's' : ''} élément{items.length - 3 > 1 ? 's' : ''}</p>}
              </div>

              <p className="goal-hint" style={{ margin: 0 }}>
                Les séances restent dans votre agenda ; seuls les créneaux réservables se ferment.
              </p>

              <div className="row" style={{ marginTop: 4 }}>
                <button className="btn btn-soft" onClick={() => setOffConfirm(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={() => { applyOff(from, to); setOffConfirm(null) }}>Bloquer quand même</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* SYNCHRONISATION DES CALENDRIERS DU TÉLÉPHONE */}
      {calSyncOpen && (
        <div className="pay-layer" onClick={() => setCalSyncOpen(false)}>
          <div className="pay-sheet" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4 }}>Synchroniser mes calendriers</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>
              Importez les calendriers de votre téléphone : vos événements personnels bloquent
              automatiquement vos créneaux réservables.
            </p>
            <div className="pick-list">
              {([
                ['apple', 'Apple Calendrier', 'iPhone · iCloud'],
                ['google', 'Google Agenda', 'Gmail · Android'],
                ['outlook', 'Outlook', 'Microsoft 365'],
              ] as const).map(([id, label, sub]) => (
                <button key={id} className={'pick' + (calSync.includes(id) ? ' on' : '')} onClick={() => toggleCalendar(id)}>
                  <span className="cal-sync-ico"><Icon name="calendar" size={17} /></span>
                  <span className="pick-name"><strong>{label}</strong><span>{sub}</span></span>
                  <span className={'cbox' + (calSync.includes(id) ? ' on' : '')}>
                    {calSync.includes(id) && <Icon name="check" size={13} strokeWidth={2.4} />}
                  </span>
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={runCalendarSync}>
              <Icon name="refresh" size={15} /><span>Synchroniser maintenant</span>
            </button>
            <p className="dim" style={{ fontSize: 11 }}>Aucune donnée de calendrier n’est partagée avec vos élèves.</p>
          </div>
        </div>
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
                  <EvaAvatar size={14} /> COMPTE RENDU IA EVA (TRANSCRIT & ANALYSÉ)
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

/* =====================================================
   DEMANDE DE MATÉRIEL — page dédiée (au cas par cas)
   ===================================================== */
