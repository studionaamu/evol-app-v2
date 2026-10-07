import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Avatar } from './bits'
import { useStore } from './store'
import {
  COACHES, IMAGES, COACH_CLIENTS, COACH_GROUPS, COACH_CALLS, SESSIONS,
  type Consent, type CoachClient, type CoachGroup, type CoachCall,
} from './data'

export type CoachTab = 'bord' | 'clients' | 'messagerie' | 'reglages'

/* =====================================================
   PROFIL — réglages, confidentialité RGPD, déconnexion
   ===================================================== */

export function Profile({ onReplayTour, onGoCoach }: { onReplayTour: () => void; onGoCoach: () => void }) {
  const { name, guest, consent, setConsent, reset, role } = useStore()
  const [dark, setDark] = useState(() => localStorage.getItem('evol-theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('evol-theme', dark ? 'dark' : 'light')
    const meta = document.querySelector('meta[name=theme-color]')
    if (meta) meta.setAttribute('content', dark ? '#101013' : '#FAFAF8')
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

      {!guest && (
        <section className="card">
          <div className="stat-row">
            <div><strong>12</strong><span>sessions</span></div>
            <div><strong>86%</strong><span>régularité</span></div>
            <div><strong>3</strong><span>coachs</span></div>
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-kicker">RÉGLAGES</div>
        <div className="setting row between" onClick={() => setDark(!dark)}>
          <div className="setting-label"><Icon name={dark ? 'moon' : 'sun'} size={17} />{dark ? 'Thème sombre' : 'Thème clair'}</div>
          <span className={'switch' + (dark ? ' on' : '')}><i /></span>
        </div>
        <button className="setting wide" onClick={onReplayTour}><Icon name="compass" size={17} />Revoir le tour du Hub<Icon name="chevron-right" size={14} /></button>
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
        <div className="card-kicker">OUTILS</div>
        <button className="setting wide"><Icon name="activity" size={17} />Mes exercices<Icon name="chevron-right" size={14} /></button>
        <button className="setting wide"><Icon name="calendar" size={17} />Mes rendez-vous<Icon name="chevron-right" size={14} /></button>
        <button className="setting wide"><Icon name="heart" size={17} />Contenus favoris<Icon name="chevron-right" size={14} /></button>
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

function ClientCard({ c }: { c: CoachClient }) {
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
          <div className="privacy"><Icon name="shield" size={13} /> Partage autorisé par {c.name.split(' ')[0]} · révocable à tout moment.</div>
        </div>
      )}
    </section>
  )
}

function GroupCard({ g }: { g: CoachGroup }) {
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
        </div>
      )}
    </section>
  )
}

function CallRow({ call }: { call: CoachCall }) {
  const isGroup = call.scope === 'groupe'
  const target = isGroup ? null : clientById(call.withId)
  const group = isGroup ? COACH_GROUPS.find(g => g.id === call.withId)! : null
  return (
    <button className={'call-row' + (call.missed ? ' missed' : '')}>
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

export function CoachSpace({ coachTab, onExit, onOpenEva }: {
  coachTab: CoachTab
  onExit: () => void
  onOpenEva?: (prefill?: string) => void
}) {
  const { name } = useStore()
  const [mTab, setMTab] = useState<'messages' | 'appels' | 'visio'>('messages')
  const [month, setMonth] = useState(0) // 0 = mois courant
  const base = new Date()
  const viewMonth = new Date(base.getFullYear(), base.getMonth() + month, 1)
  const monthLabel = viewMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const firstWd = (viewMonth.getDay() + 6) % 7 // lundi = 0
  const daysIn = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const agendaDays: Record<number, { time: string; label: string; who: string; kind: string }[]> = {
    [base.getDate()]: [
      { time: '09:30', label: 'Respiration · 45 min', who: 'Alex', kind: 'video' },
      { time: '14:00', label: 'Suivi stress · 30 min', who: 'Sofia', kind: 'video' },
      { time: '18:00', label: 'Groupe Dos · 60 min', who: 'Groupe', kind: 'group' },
    ],
    [base.getDate() + 1]: [
      { time: '08:15', label: 'Ancrage · 30 min', who: 'David', kind: 'video' },
    ],
    [base.getDate() + 4]: [
      { time: '07:30', label: 'Groupe Matin · 20 min', who: 'Groupe', kind: 'group' },
    ],
  }
  const todayCells = (d: number) => agendaDays[d]

  return (
    <div className="tab-page" data-zone={coachTab}>
      {coachTab === 'bord' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">ESPACE COACH · DÉMO</div>
              <h1>Cabinet de {COACHES.find(c => c.id === 'camille')!.name.split(' ')[0]}</h1>
              <p>Bonjour {name === 'Alex' ? 'Camille' : name}. Vos signaux sont agrégés par EVA.</p>
            </div>
            <Avatar hue="152" initials="CD" photo={COACHES.find(c => c.id === 'camille')?.photo} size={56} ring />
          </header>

          <section className="card card-grad eva-card">
            <span className="eva-orb" aria-hidden />
            <div className="card-kicker light"><Icon name="sparkle" size={13} /> EVA · VOTRE COPILOTE</div>
            <h2>2 alertes à traiter.</h2>
            <p className="light-dim">EVA surveille les signaux de vos clients et prépare vos synthèses de séance.</p>
            <div className="eva-quick">
              <button className="eva-chip" onClick={() => onOpenEva?.('Synthèse des alertes clients')}>Alertes & signaux</button>
              <button className="eva-chip" onClick={() => onOpenEva?.('Prépare le résumé de ma séance Sofia M.')}>Résumé de séance</button>
            </div>
          </section>

          <section className="card alert-crit">
            <div className="alert-head">
              <span className="alert-ico"><Icon name="alert" size={17} /></span>
              <div>
                <strong>Sofia M. — Épuisement physique</strong>
                <p>Effort soutenu 3 jours d’affilée avec une récupération insuffisante.</p>
              </div>
            </div>
            <div className="alert-actions">
              <button className="btn sm btn-soft" onClick={() => onOpenEva?.('Ajuste le plan de Sofia M. (récupération)')}>
                <span>Ajuster le plan · EVA</span>
              </button>
            </div>
          </section>

          <section className="card">
            <div className="card-kicker"><Icon name="calendar" size={13} /> AUJOURD'HUI</div>
            {(agendaDays[base.getDate()] ?? []).map(s => (
              <button className="session" key={s.time}>
                <div className="date-box"><strong style={{ fontSize: 13 }}>{s.time}</strong></div>
                <div className="session-info">
                  <strong>{s.who}</strong>
                  <span>{s.label}</span>
                </div>
                <span className="chev"><Icon name="video" size={16} /></span>
              </button>
            ))}
          </section>

          <section className="card">
            <div className="month-head">
              <button className="round-btn sm" onClick={() => setMonth(m => m - 1)} aria-label="Mois précédent"><Icon name="chevron-left" size={16} /></button>
              <strong>{monthLabel}</strong>
              <button className="round-btn sm" disabled={month >= 0} onClick={() => setMonth(m => m + 1)} aria-label="Mois suivant"><Icon name="chevron-right" size={16} /></button>
            </div>
            <div className="month-grid">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={'h' + i} className="month-dow">{d}</span>)}
              {Array.from({ length: firstWd }).map((_, i) => <span key={'p' + i} />)}
              {Array.from({ length: daysIn }).map((_, i) => {
                const d = i + 1
                const isToday = month === 0 && d === base.getDate()
                const has = month === 0 && !!todayCells(d)
                return (
                  <span key={d} className={'month-day' + (isToday ? ' today' : '') + (has ? ' has' : '')}>
                    {d}{has && <i />}
                  </span>
                )
              })}
            </div>
          </section>

          <button className="logout" onClick={onExit}><Icon name="chevron-left" size={15} /> Retour à l'espace coaché</button>
          <footer className="tab-footer">Interface coach · démo Evol</footer>
        </>
      )}

      {coachTab === 'clients' && (
        <>
          <header className="page-head">
            <div>
              <div className="date-line">MES CLIENTS</div>
              <h1>Suivi long terme.</h1>
              <p>Déroulez un profil pour voir les métriques du programme.</p>
            </div>
          </header>
          <div className="count-line">{COACH_CLIENTS.length} élèves · {COACH_GROUPS.length} groupes</div>
          {COACH_CLIENTS.map(c => <ClientCard key={c.id} c={c} />)}
          <div className="block-title">Groupes</div>
          {COACH_GROUPS.map(g => <GroupCard key={g.id} g={g} />)}
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
            <div className="thread-list">
              {[...COACH_CLIENTS.map(c => ({ id: c.id, name: c.name.split(' ')[0], hue: c.hue, photo: c.photo, last: 'Check-in de la semaine — tenez bon, le cap est bon.', when: 'hier', group: false })),
                ...COACH_GROUPS.map(g => ({ id: g.id, name: g.name, hue: '152', photo: undefined as string | undefined, last: `${g.schedule} — pensez à valider vos séances.`, when: 'lun', group: true }))]
                .map(t => (
                <button className="thread" key={t.id}>
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
          )}

          {mTab === 'appels' && (
            <div className="call-list">
              {COACH_CALLS.filter(c => c.kind === 'audio').map(c => <CallRow key={c.id} call={c} />)}
            </div>
          )}

          {mTab === 'visio' && (
            <div className="call-list">
              <section className="card card-grad slim">
                <strong className="grad-title">Prochaine visio de groupe</strong>
                <p className="light-dim">Groupe Dos & Mobilité · Jeu 26 · 18:00 — le coach garde la main sur la caméra principale.</p>
                <button className="btn btn-inverse"><span>Ouvrir la salle</span><Icon name="video" size={15} /></button>
              </section>
              {COACH_CALLS.filter(c => c.kind === 'video').map(c => <CallRow key={c.id} call={c} />)}
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
            <button className="setting wide"><Icon name="calendar" size={17} />Disponibilités & créneaux<Icon name="chevron-right" size={14} /></button>
            <button className="setting wide"><Icon name="activity" size={17} />Mes programmes<Icon name="chevron-right" size={14} /></button>
            <div className="setting row between">
              <div className="setting-label"><Icon name="users" size={17} />Groupe par niveaux</div>
              <span className="switch on"><i /></span>
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
    </div>
  )
}

/* sessions partagées (coaché) — gardé pour référence futur onglet agenda coaché */
export const COACH_AGENDA_SEED = SESSIONS
