import { useMemo, useState } from 'react'
import { Icon, AppleIcon, GoogleIcon } from './Icon'
import { Avatar } from './bits'
import { COACHES, QUIZ, IMAGES, recommendedCoachIds, type Coach, type Domain } from './data'

/* =====================================================
   ENTRY FLOW: splash → welcome → quiz → signup → tour → app
   ===================================================== */

export function Splash() {
  return (
    <div className="screen splash">
      <div className="splash-inner">
        <div className="splash-logo"><LogoMark size={64} /></div>
        <div className="splash-word">evol</div>
        <div className="splash-tag">Votre évolution, votre succès</div>
      </div>
    </div>
  )
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M20 7c3.4 4.7 7.2 6.8 12.7 7.5C27.2 15.2 23.4 17.3 20 22c-3.4-4.7-7.2-6.8-12.7-7.5C12.8 13.8 16.6 11.7 20 7Z" fill="currentColor" />
      <circle cx="20" cy="29.5" r="2.1" fill="currentColor" />
    </svg>
  )
}

/* ---------- welcome ---------- */

export function Welcome({ onAssessment, onAccount, onGuest, onCoach }: {
  onAssessment: () => void
  onAccount: () => void
  onGuest: () => void
  onCoach: () => void
}) {  return (
    <div className="screen auth">
      <div className="auth-art" aria-hidden>
        <div className="aurora" />
      </div>
      <div className="auth-body">
        <div className="auth-head">
          <h1>Votre évolution,<br />votre succès.</h1>
        </div>
        <div className="auth-actions">
          <button className="btn btn-glass solid" onClick={onAssessment}>
            <span>Trouver mes coachs · 2 min</span><Icon name="sparkle" size={17} />
          </button>
          <div className="or-divider glass-div"><span>ou</span></div>
          <button className="btn btn-glass" onClick={onAccount}>
            <AppleIcon size={19} /><span>Continuer avec Apple</span>
          </button>
          <button className="btn btn-glass" onClick={onAccount}>
            <GoogleIcon size={18} /><span>Continuer avec Google</span>
          </button>
          <button className="btn btn-glass ghost" onClick={onGuest}>Explorer en mode invité</button>
          <button className="coach-link on-photo" onClick={onCoach}>
            <Icon name="user" size={15} /> Vous êtes coach ?
          </button>
          <p className="auth-legal glass-div">
            Aucun compte requis pour découvrir vos coachs recommandés.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- assessment quiz ---------- */

export function Quiz({ onDone, onExit }: { onDone: (domains: Domain[]) => void; onExit: () => void }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const step = QUIZ[i]
  const last = i === QUIZ.length - 1

  const choose = (optIdx: number) => {
    setPicked(p => { const n = [...p]; n[i] = optIdx; return n })
    setTimeout(() => (last ? finish() : setI(i + 1)), 260)
  }
  const finish = () => {
    const domains = new Set<Domain>()
    picked.forEach((opt, k) => {
      QUIZ[k]?.options[opt]?.domains.forEach(d => domains.add(d))
    })
    onDone([...domains])
  }

  return (
    <div className="screen quiz">
      <div className="ob-top">
        <button className="icon-btn" onClick={onExit} aria-label="Retour"><Icon name="chevron-left" size={19} /></button>
        <div className="ob-dots">
          {QUIZ.map((_, d) => <span key={d} className={d <= i ? 'on' : ''} />)}
        </div>
        <span style={{ width: 40 }} />
      </div>
      <div className="quiz-body" key={i}>
        <div className="kicker">ASSESSMENT · {i + 1}/{QUIZ.length}</div>
        <h2>{step.q}</h2>
        <p>{step.sub}</p>
        <div className="quiz-options">
          {step.options.map((o, k) => (
            <button key={k} className={'quiz-opt' + (picked[i] === k ? ' on' : '')} onClick={() => choose(k)}>
              <span>{o.label}</span>
              <Icon name={picked[i] === k ? 'check' : 'plus'} size={17} />
            </button>
          ))}
        </div>
      </div>
      <div className="quiz-foot">
        <Icon name="shield" size={14} /> Vos réponses restent sur cet appareil. Aucun compte requis.
      </div>
    </div>
  )
}

/* ---------- quiz results ---------- */

export function QuizResults({ domains, onOpenCoach, onCreateAccount, onGuest }: {
  domains: Domain[]
  onOpenCoach: (c: Coach) => void
  onCreateAccount: () => void
  onGuest: () => void
}) {
  const recos = useMemo(() => {
    const ids = recommendedCoachIds(domains)
    const rest = COACHES.filter(c => !ids.includes(c.id)).map(c => c.id)
    return [...ids, ...rest].map(id => COACHES.find(c => c.id === id)!)
  }, [domains])

  return (
    <div className="screen results">
      <div className="results-head">
        <div className="kicker">VOTRE SÉLECTION</div>
        <h1>Une équipe pour vous.</h1>
        <p>
          {domains.length > 0
            ? `Basée sur vos priorités : ${domains.join(' · ').toLowerCase()}.`
            : 'Une sélection équilibrée pour débuter.'}
        </p>
      </div>
      <div className="results-list">
        {recos.map((c, idx) => (
          <article className="card coach-card" key={c.id} onClick={() => onOpenCoach(c)}>
            {idx < Math.min(2, recos.length) && <span className="match">Match</span>}
            <div className="coach-top">
              <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={54} ring />
              <div className="coach-id">
                <strong>{c.name}</strong>
                <span>{c.role}</span>
                <div className="coach-meta">
                  <span className="rating"><Icon name="star" size={12} /> {c.rating}</span>
                  <span><Icon name="location" size={12} /> {c.city} · {c.mode}</span>
                </div>
              </div>
              <strong className="price">{c.price} €</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="results-cta">
        <button className="btn btn-primary" onClick={onCreateAccount}>
          <span>Créer mon compte pour réserver</span><Icon name="arrow-right" size={17} />
        </button>
        <button className="btn btn-ghost" onClick={onGuest}>Continuer en invité</button>
      </div>
    </div>
  )
}

/* ---------- RGPD consent ---------- */

export function ConsentScreen({ onAccept, onBack }: { onAccept: () => void; onBack: () => void }) {
  const [c, setC] = useState({ account: false, health: false, journal: false, shareCoach: false })
  const valid = c.account && c.health
  const rows: { k: keyof typeof c; title: string; desc: string; req?: boolean }[] = [
    { k: 'account', title: 'Données de compte', desc: 'E-mail et profil pour accéder à votre espace. Requis pour créer un compte.', req: true },
    { k: 'health', title: 'Données de santé', desc: 'Objectifs et signaux bien-être, pour un accompagnement pertinent. Requis pour le coaching.', req: true },
    { k: 'journal', title: 'Journal & transcription IA', desc: 'Vos notes vocales sont transcrites puis chiffrées. Révocable à tout moment.' },
    { k: 'shareCoach', title: 'Partage avec vos coachs', desc: 'Vos signaux et extraits choisis, jamais tout votre journal. Révocable à tout moment.' },
  ]
  return (
    <div className="screen consent">
      <div className="ob-top">
        <button className="icon-btn" onClick={onBack} aria-label="Retour"><Icon name="chevron-left" size={19} /></button>
        <div className="kicker" style={{ margin: 0 }}>CONFIDENTIALITÉ</div>
        <span style={{ width: 40 }} />
      </div>
      <div className="consent-body">
        <h2>Vos données, vos règles.</h2>
        <p>Rien n'est activé par défaut. Chaque case est un choix explicite, révocable dans Profil → Confidentialité.</p>
        <div className="consent-list">
          {rows.map(r => (
            <button key={r.k} className={'consent-row' + (c[r.k] ? ' on' : '')} onClick={() => setC(v => ({ ...v, [r.k]: !v[r.k] }))}>
              <span className={'cbox' + (c[r.k] ? ' on' : '')}>{c[r.k] && <Icon name="check" size={13} strokeWidth={2.4} />}</span>
              <span className="consent-txt">
                <strong>{r.title} {r.req && <em>requis</em>}</strong>
                <span>{r.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="privacy"><Icon name="shield" size={14} /> Hébergement UE · RGPD · vous pouvez exporter ou supprimer vos données.</div>
      </div>
      <div className="ob-cta">
        <button className="btn btn-primary" disabled={!valid} onClick={onAccept}>
          <span>{valid ? 'Créer mon compte' : 'Choisissez les 2 cases requises'}</span>
          {valid && <Icon name="arrow-right" size={17} />}
        </button>
      </div>
    </div>
  )
}

/* ---------- onboarding (post-account) ---------- */

const OB = [
  { tag: 'Bienvenue', title: 'Votre évolution,\nvotre succès.', sub: 'Vos coachs, vos signaux et votre journal réunis dans un seul espace calme.', img: IMAGES.ob[0] },
  { tag: 'Vos signaux', title: 'Des petits signaux,\npas des tableaux de bord.', sub: 'Énergie, sommeil, mouvement : ce qui compte, sans surcharge.', img: IMAGES.ob[1] },
  { tag: 'Synergy', title: 'Votre équipe,\nune seule direction.', sub: 'Réunissez vos coachs dans un espace privé. Vous gardez le contrôle.', img: IMAGES.ob[2] },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const s = OB[i]
  const last = i === OB.length - 1
  return (
    <div className="screen onboarding">
      <div className="ob-top">
        <div className="ob-dots">{OB.map((_, d) => <span key={d} className={d <= i ? 'on' : ''} />)}</div>
        <button className="link-btn" onClick={onDone}>Passer</button>
      </div>
      <div className="ob-art" key={i}>
        <div className="ob-photo">
          <img src={s.img} alt="" />
        </div>
      </div>
      <div className="ob-body" key={'b' + i}>
        <div className="kicker">{s.tag}</div>
        <h2 style={{ whiteSpace: 'pre-line' }}>{s.title}</h2>
        <p>{s.sub}</p>
      </div>
      <div className="ob-cta">
        <button className="btn btn-primary" onClick={() => (last ? onDone() : setI(i + 1))}>
          <span>{last ? 'Découvrir mon Hub' : 'Continuer'}</span><Icon name="arrow-right" size={18} />
        </button>
      </div>
    </div>
  )
}
