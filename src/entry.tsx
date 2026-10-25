import { useMemo, useState } from 'react'
import { Icon, AppleIcon, GoogleIcon } from './Icon'
import { Avatar } from './bits'
import { COACHES, QUIZ, IMAGES, recommendedCoachIds, type Coach, type Domain } from './data'

/* =====================================================
   ENTRY FLOW: welcome → quiz → signup → tour → app
   ===================================================== */

/* ---------- welcome ---------- */

export function Welcome({ onAccount, onGuest, onCoach, onProgramme }: {
  onAccount: (email?: string) => void
  onGuest: () => void
  onCoach: () => void
  onProgramme: () => void
}) {
  const [mailOpen, setMailOpen] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <div className="screen auth">
      <div className="auth-art" aria-hidden>
        <div className="aurora" />
      </div>
      <div className="auth-body">
        <div className="auth-head">
          <div className="auth-brand" aria-label="Evol">
            <span>EVOL</span>
          </div>
          <h1 className="auth-slogan">votre évolution,<br />vos succès</h1>
        </div>
        <div className="auth-actions">
          <button className="btn btn-glass solid" onClick={() => onAccount()}>
            <AppleIcon size={19} /><span>Continuer avec Apple</span>
          </button>
          <button className="btn btn-glass" onClick={() => onAccount()}>
            <GoogleIcon size={18} /><span>Continuer avec Google</span>
          </button>
          <button className="btn btn-glass" onClick={() => setMailOpen(v => !v)}>
            <Icon name="send" size={17} /><span>Continuer avec l'adresse mail</span>
          </button>
          {mailOpen && (
            <div className="auth-mail">
              <input
                className="email-input auth-mail-input"
                type="email"
                autoFocus
                placeholder="prenom@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && email.includes('@')) onAccount(email.trim()) }}
              />
              <button className="btn btn-glass solid" disabled={!email.includes('@')} onClick={() => onAccount(email.trim())}>
                <span>Continuer par e-mail</span><Icon name="arrow-right" size={16} />
              </button>
            </div>
          )}
          <div className="or-divider glass-div"><span>ou</span></div>
          <button className="btn btn-glass ghost" onClick={onProgramme}>
            <Icon name="lock" size={16} /><span>J'ai un programme EVOLIA · accès par identifiant</span>
          </button>
          <button className="btn btn-glass ghost" onClick={onGuest}>Explorer en mode invité</button>
          <button className="coach-link on-photo" onClick={onCoach}>
            <Icon name="user" size={15} /> Espace coach
          </button>
          <p className="auth-legal glass-div">
            Espace confidentiel · chiffré et hébergé en UE.
          </p>
        </div>
      </div>

    </div>
  )
}

/* ---------- programme EVOLIA : présentation encadrée + connexion par identifiant ---------- */

const PILIERS = [
  {
    icon: 'shield',
    title: 'Strictement encadré',
    text: 'Protocoles validés, séances supervisées et suivi clinique par des professionnels partenaires.',
  },
  {
    icon: 'users',
    title: 'Coachs partenaires',
    text: 'Des intervenants sélectionnés, formés à nos programmes et coordonnés dans un même espace.',
  },
  {
    icon: 'file',
    title: 'Intermédiaires & financeurs',
    text: 'Assurance maladie, mutuelles, employeurs : votre accès est activé selon votre prise en charge.',
  },
] as const

const ETAPES = [
  { t: 'Votre accès est défini', d: 'Prescription, prise en charge ou paiement : nous paramétrons votre programme et son périmètre.' },
  { t: 'Votre identifiant est généré', d: 'Un identifiant de la forme EVOL-0000-00 est créé puis envoyé à l’adresse de rattachement.' },
  { t: 'Vous vous connectez', d: 'Identifiant + e-mail : votre programme s’ouvre, sans la partie Explorer.' },
] as const

export function GuestWelcome({ onEnter, onBack }: { onEnter: () => void; onBack: () => void }) {
  const team = COACHES.slice(0, 3)
  return (
    <div className="screen auth guest-welcome">
      <div className="auth-art" aria-hidden>
        <div className="aurora" />
      </div>
      <div className="gw-wrap">
        <header className="prog-top">
          <button className="icon-btn prog-back" onClick={onBack} aria-label="Retour">
            <Icon name="chevron-left" size={19} />
          </button>
          <span className="prog-badge"><Icon name="users" size={11} /> MODE INVITÉ</span>
          <span style={{ width: 40 }} />
        </header>

        <div className="gw-body">
          <div className="gw-team">
            {team.map((c, i) => (
              <span className={'gw-face' + (i === 1 ? ' main' : '')} key={c.id}>
                <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={i === 1 ? 84 : 66} ring />
              </span>
            ))}
          </div>
          <div className="prog-kicker">VOS COACHS SONT DÉJÀ LÀ</div>
          <h1>Une équipe pour vous,<br />à chaque étape.</h1>
          <p>
            Vos coachs partenaires sont en place et coordonnés autour de votre programme.
            Avancez à votre rythme, sans engagement.
          </p>
          <div className="gw-names">
            {team.map(c => <span key={c.id}>{c.name.split(' ')[0]}</span>)}
          </div>
        </div>

        <div className="prog-cta">
          <button className="btn btn-glass solid" onClick={onEnter}>
            <span>Découvrir mon espace</span><Icon name="arrow-right" size={16} />
          </button>
          <p className="prog-note">Sans compte : l’Explorer reste masqué, rien n’est conservé.</p>
        </div>
      </div>
    </div>
  )
}

export function Programme({ onBack, onLogin, onGuest }: {
  onBack: () => void
  onLogin: () => void
  onGuest: () => void
}) {
  return (
    <div className="screen auth program">
      <div className="auth-art" aria-hidden>
        <div className="aurora" />
      </div>
      <div className="prog-wrap">
        <header className="prog-top">
          <button className="icon-btn prog-back" onClick={onBack} aria-label="Retour">
            <Icon name="chevron-left" size={19} />
          </button>
          <span className="prog-badge"><Icon name="shield" size={11} /> PROGRAMME EVOLIA</span>
          <span style={{ width: 40 }} />
        </header>

        <div className="prog-head">
          <h1>Une équipe pour vous,<br />à chaque étape de votre programme.</h1>
        </div>

        <div className="prog-grid">
          {PILIERS.map(p => (
            <article className="prog-card" key={p.title}>
              <span className="prog-ico"><Icon name={p.icon} size={17} /></span>
              <div>
                <strong>{p.title}</strong>
                <p>{p.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="prog-block">
          <div className="prog-kicker">COMMENT ÇA MARCHE</div>
          <ol className="prog-steps">
            {ETAPES.map((e, i) => (
              <li key={e.t}>
                <span className="prog-step-n">{i + 1}</span>
                <div>
                  <strong>{e.t}</strong>
                  <p>{e.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="prog-cta">
          <button className="btn btn-glass solid" onClick={onLogin}>
            <Icon name="lock" size={16} /><span>Se connecter avec mon identifiant</span>
          </button>
          <button className="btn btn-glass ghost" onClick={onGuest}>
            <span>Découvrir en mode invité</span><Icon name="arrow-right" size={15} />
          </button>
          <p className="prog-note">
            Mode invité : explications illustrées, puis accès à l’app sans la partie Explorer.
          </p>
          <p className="prog-legal">
            <Icon name="shield" size={11} /> Données de santé hébergées en UE · accès nominatif et tracé.
          </p>
        </div>
      </div>
    </div>
  )
}

/* identifiants de démonstration — aucun back-end dans cette version */
const DEMO_CODES: Record<string, string> = { 'EVOL-4821-XR': 'Alex', 'EVOL-7710-BS': 'Sarah' }
const CODE_SHAPE = /^EVOL-[A-Z0-9]{4}-[A-Z0-9]{2}$/

export function ProgramAccess({ onBack, onAccess }: {
  onBack: () => void
  onAccess: (name: string, email: string) => void
}) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')
  const [help, setHelp] = useState(false)

  const norm = code.trim().toUpperCase()
  const shapeOk = CODE_SHAPE.test(norm)
  const mailOk = /.+@.+\..+/.test(email.trim())
  const valid = shapeOk && mailOk && status !== 'checking'

  const submit = () => {
    if (!valid) return
    setStatus('checking')
    setTimeout(() => {
      const who = DEMO_CODES[norm]
      if (who) onAccess(who, email.trim())
      else setStatus('error')
    }, 900)
  }

  return (
    <div className="screen auth program">
      <div className="auth-art" aria-hidden>
        <div className="aurora" />
      </div>
      <div className="prog-wrap">
        <header className="prog-top">
          <button className="icon-btn prog-back" onClick={onBack} aria-label="Retour">
            <Icon name="chevron-left" size={19} />
          </button>
          <span className="prog-badge"><Icon name="lock" size={11} /> ACCÈS PROGRAMME</span>
          <span style={{ width: 40 }} />
        </header>

        <div className="prog-head">
          <div className="prog-kicker">CONNEXION · EVOLIA</div>
          <h1>Votre identifiant<br />d’accès.</h1>
          <p>
            Il vous a été remis lors de la mise en place de votre programme et envoyé à votre
            adresse de rattachement.
          </p>
        </div>

        <div className="prog-form">
          <label className="prog-field">
            <span>E-mail de rattachement</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="prenom@exemple.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setStatus('idle') }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </label>

          <label className="prog-field">
            <span>Identifiant d’accès</span>
            <input
              className="prog-code"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="EVOL-0000-00"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setStatus('idle') }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <em className={'prog-hint' + (norm && !shapeOk ? ' bad' : '')}>
              {norm && !shapeOk ? 'Format attendu : EVOL-0000-00' : 'Format EVOL-0000-00 · fourni par votre référent'}
            </em>
          </label>

          {status === 'error' && (
            <div className="prog-error" role="alert">
              <Icon name="alert" size={15} />
              <span>
                Identifiant inconnu ou accès non encore activé. Vérifiez auprès de votre référent
                ou de votre caisse.
              </span>
            </div>
          )}

          <button className="btn btn-glass solid" disabled={!valid} onClick={submit}>
            <span>{status === 'checking' ? 'Vérification…' : 'Ouvrir mon programme'}</span>
            {status !== 'checking' && <Icon name="arrow-right" size={16} />}
          </button>

          <button className="prog-help-toggle" onClick={() => setHelp(v => !v)} aria-expanded={help}>
            <Icon name={help ? 'close' : 'plus'} size={13} />
            <span>Où trouver mon identifiant ?</span>
          </button>

          {help && (
            <div className="prog-help">
              <p>
                L’identifiant est généré au moment où votre accès est paramétré : prescription,
                prise en charge par l’Assurance maladie ou une mutuelle, ou paiement du programme.
              </p>
              <p>
                Il est envoyé par e-mail ou SMS à l’adresse de rattachement, avec la durée de
                validité de votre accès. Il est strictement personnel.
              </p>
              <p className="dim">
                Rien reçu ? Contactez l’interlocuteur qui a initié votre programme : nous pouvons
                régénérer un identifiant.
              </p>
            </div>
          )}

          <button
            className="prog-demo"
            onClick={() => { setEmail('alex@evolia.fr'); setCode('EVOL-4821-XR'); setStatus('idle') }}
          >
            <Icon name="sparkle" size={13} />
            <span>Utiliser un identifiant de démonstration</span>
          </button>
        </div>

        <div className="prog-cta">
          <p className="prog-legal">
            <Icon name="shield" size={11} /> Connexion chiffrée · chaque ouverture d’accès est
            journalisée.
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
