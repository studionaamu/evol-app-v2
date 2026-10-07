import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Avatar } from './bits'
import { useStore } from './store'
import { type Consent } from './data'

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
    <div className="tab-page">
      <header className="page-head">
        <div>
          <div className="date-line">PROFIL</div>
          <h1>{guest ? 'Mode invité' : name}</h1>
          <p>{guest ? 'Vos données restent sur cet appareil.' : 'Votre espace, vos règles.'}</p>
        </div>
        <Avatar hue="158" initials={guest ? '?' : name.slice(0, 1).toUpperCase()} size={52} />
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
   ESPACE COACH — dashboard minimaliste
   ===================================================== */

export function CoachSpace({ onExit, onOpenEva }: { onExit: () => void; onOpenEva?: (prefill?: string) => void }) {
  const [tab, setTab] = useState<'agenda' | 'clients' | 'synergy'>('agenda')

  return (
    <div className="tab-page">
      <header className="page-head">
        <div>
          <div className="date-line">ESPACE COACH · DÉMO</div>
          <h1>Cabinet de Camille</h1>
          <p>Votre activité, vos clients, vos Synergies.</p>
        </div>
        <Avatar hue="152" initials="CD" size={52} />
      </header>

      <section className="card card-grad eva-card">
        <span className="eva-orb" aria-hidden />
        <div className="card-kicker light"><Icon name="sparkle" size={13} /> EVA · VOTRE COPILOTE</div>
        <h2>2 alertes à traiter.</h2>
        <p className="light-dim">EVA surveille les signaux de vos clients et prépare vos synthèses de séance.</p>
        <div className="eva-quick">
          <button className="eva-chip" onClick={() => onOpenEva?.('Synthèse des alertes clients')}>Alertes & signaux</button>
          <button className="eva-chip" onClick={() => onOpenEva?.('Prépare le résumé de ma séance Marie L.')}>Résumé de séance</button>
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

      <div className="subtabs">
        {(['agenda', 'clients', 'synergy'] as const).map(t => (
          <button key={t} className={'subtab' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>
            {t === 'agenda' ? 'Agenda' : t === 'clients' ? 'Clients' : 'Synergy'}
          </button>
        ))}
      </div>

      {tab === 'agenda' && (
        <section className="card">
          <div className="card-kicker"><Icon name="calendar" size={13} /> AUJOURD'HUI</div>
          {[
            { time: '09:30', who: 'Alex', title: 'Respiration · 45 min' },
            { time: '14:00', who: 'Marie L.', title: 'Suivi stress · 30 min' },
            { time: '18:00', who: 'Karim B.', title: 'Première séance · 45 min' },
          ].map(s => (
            <button className="session" key={s.time}>
              <div className="date-box"><strong style={{ fontSize: 13 }}>{s.time}</strong></div>
              <div className="session-info">
                <strong>{s.who}</strong>
                <span>{s.title}</span>
              </div>
              <span className="chev"><Icon name="video" size={16} /></span>
            </button>
          ))}
        </section>
      )}

      {tab === 'clients' && (
        <section className="card">
          <div className="card-kicker"><Icon name="users" size={13} /> SUIVI CLIENT</div>
          <div className="client-row">
            <Avatar hue="158" initials="A" size={44} />
            <div className="session-info">
              <strong>Alex</strong>
              <span>Énergie 78 · sommeil stable · 2 séances tenues</span>
            </div>
          </div>
          <div className="transcript">
            <div className="transcript-head"><Icon name="sparkle" size={12} /> Journal partagé (extrait)</div>
            <p>« Aujourd'hui je me sens plus calme. La respiration de ce matin m'a aidé à poser les choses avant une journée chargée. »</p>
          </div>
          <div className="privacy"><Icon name="shield" size={13} /> Alex a autorisé le partage sélectif de son journal.</div>
        </section>
      )}

      {tab === 'synergy' && (
        <section className="card card-grad slim">
          <strong className="grad-title">Invité dans une Synergy</strong>
          <p className="light-dim">Alex vous a relié à Nora (nutrition) pour synchroniser sa routine matinale.</p>
          <button className="btn btn-inverse"><span>Ouvrir la Synergy</span><Icon name="users" size={15} /></button>
        </section>
      )}

      <button className="logout" onClick={onExit}><Icon name="chevron-left" size={15} /> Retour à l'espace coaché</button>
      <footer className="tab-footer">Interface coach · démo Evol</footer>
    </div>
  )
}
