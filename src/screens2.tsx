import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Avatar } from './bits'
import { useStore } from './store'
import {
  COACHES, type Coach, type Message,
} from './data'

/* =====================================================
   COACH PROFILE — vidéo, contenu gratuit, reviews, booking + Stripe
   ===================================================== */

export function CoachScreen({ coach, onBack, onBooked, onChat }: {
  coach: Coach
  onBack: () => void
  onBooked: () => void
  onChat: () => void
}) {
  const { guest } = useStore()
  const [needAccount, setNeedAccount] = useState(false)
  const [slot, setSlot] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [days, setDays] = useState<number | null>(null)

  const dayList = useMemo(() => {
    const out: { d: number; wd: string }[] = []
    const base = new Date()
    for (let i = 1; i <= 7; i++) {
      const d = new Date(base); d.setDate(base.getDate() + i)
      out.push({ d: d.getDate(), wd: d.toLocaleDateString('fr-FR', { weekday: 'narrow' }) })
    }
    return out
  }, [])

  const startPay = () => {
    if (guest) { setNeedAccount(true); return }
    setPaying(true)
  }

  if (paid) {
    return (
      <div className="booked">
        <div className="booked-card">
          <div className="booked-ring"><Icon name="check" size={30} strokeWidth={2.2} /></div>
          <h2>C'est réservé.</h2>
          <p>{coach.name} · {slot ?? ''}<br />Un e-mail de confirmation vient de partir.</p>
          <button className="btn btn-primary" onClick={onBooked}><span>Retour à l'app</span></button>
        </div>
      </div>
    )
  }

  return (
    <div className="coach-screen">
      <div className="coach-hero" >
        <img className="hero-photo" src={coach.photo} alt={coach.name} />
        <div className="hero-shade" />
        <button className="icon-btn on-art" onClick={onBack} aria-label="Retour"><Icon name="chevron-left" size={19} /></button>
        <div className="hero-foot">
          <h1>{coach.name}</h1>
          <p>{coach.role}</p>
          <div className="hero-meta">
            <span className="rating"><Icon name="star" size={12} /> {coach.rating} ({coach.reviews})</span>
            <span><Icon name="location" size={12} /> {coach.city}</span>
            <span><Icon name="check" size={12} /> Vérifié</span>
          </div>
        </div>
      </div>

      <div className="coach-body">
        <div className="coach-intro">
          <Avatar hue={coach.hue} initials={coach.initials} photo={coach.photo} size={64} ring />
          <strong>{coach.name}</strong>
          <span className="intro-role"><Icon name="sparkle" size={12} /> {coach.role}</span>
        </div>

        {/* vignette vidéo éditoriale */}
        {coach.video && (
          <button className="video-feature" aria-label={`Lire la vidéo de présentation de ${coach.name}`}>
            <img src={coach.video.thumb} alt="" />
            <span className="vf-shade" />
            <span className="vf-play"><Icon name="play" size={22} /></span>
            <span className="vf-label">Présentation · {coach.video.duration}</span>
          </button>
        )}

        <div className="stat-duo">
          <div className="stat-cell glass-lite">
            <Icon name="users" size={19} />
            <strong>{coach.students}+</strong>
            <span>élèves accompagnés</span>
          </div>
          <div className="stat-cell glass-lite">
            <Icon name="activity" size={19} />
            <strong>{coach.successRate}%</strong>
            <span>objectifs atteints</span>
          </div>
        </div>

        <div className="block-title">À propos</div>
        <p className="bio">{coach.bio}</p>
        <div className="exp-list">
          {coach.experience.map((e, k) => (
            <div key={k} className="exp"><Icon name="check" size={14} /> {e}</div>
          ))}
        </div>
        <div className="tag-row">{coach.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>

        <div className="block-title">Ce qu'ils en disent <em>{coach.reviews} avis</em></div>
        <div className="reviews">
          {coach.testimonial.map((t, k) => (
            <div className="review" key={k}>
              <div className="review-top">
                <span className="stars">{'★'.repeat(5)}</span>
                <strong>{t.author}</strong>
              </div>
              <p>{t.text}</p>
            </div>
          ))}
        </div>

        <div className="block-title">Offert par {coach.name.split(' ')[0]}</div>
        <div className="freelist">
          {coach.freeContent.map((f, k) => (
            <button className="free-item" key={k}>
              <span className="free-kind">{f.kind}</span>
              <span className="free-title">{f.title}</span>
              <span className="free-dur">{f.duration}</span>
              <Icon name="play" size={14} />
            </button>
          ))}
        </div>

        {/* calendrier interactif */}
        <div className="card booking-card">
          <div className="card-kicker"><Icon name="calendar" size={13} /> RÉSERVER</div>
          <div className="days-row">
            {dayList.map(d => (
              <button key={d.d} className={'day' + (days === d.d ? ' on' : '')} onClick={() => { setDays(d.d); setSlot(null) }}>
                <span>{d.wd}</span><strong>{d.d}</strong>
              </button>
            ))}
          </div>
          <div className="slots">
            {coach.slots.map(s => (
              <button key={s} className={'slot' + (slot === s ? ' on' : '')} onClick={() => setSlot(s)}>{s}</button>
            ))}
          </div>
          <div className="price-line">
            <strong>{coach.price} €</strong><span className="dim">· 45 min · annulation gratuite 24 h avant</span>
          </div>
        </div>

      </div>

      {/* barre d'action flottante en verre, au-dessus du défilement */}
      <div className="coach-ctabar glass-lite">
        <button className="btn btn-glass solid" disabled={!slot || paying} onClick={startPay}>
          {paying
            ? <><i className="dot pulsing" /><span>Paiement sécurisé…</span></>
            : <><span>{slot ? `Réserver · ${slot}` : 'Choisissez un créneau'}</span><Icon name="lock" size={15} /></>}
        </button>
        <button className="btn btn-glass round-cta" onClick={onChat} aria-label="Envoyer un message">
          <Icon name="chat" size={18} />
        </button>
      </div>
      <div className="stripe-note"><Icon name="lock" size={12} /> Paiement via Stripe Checkout · 3D Secure</div>

      {paying && (
        <div className="pay-layer" onClick={() => {}}>
          <div className="pay-sheet" onClick={e => e.stopPropagation()}>
            <div className="pay-head">
              <strong>Stripe Checkout</strong>
              <span className="dim">Démo</span>
            </div>
            <div className="pay-line"><span>Séance découverte · {coach.name}</span><strong>{coach.price} €</strong></div>
            <div className="pay-line dim"><span>Frais de service</span><span>0 €</span></div>
            <div className="pay-line total"><span>Total</span><strong>{coach.price} €</strong></div>
            <div className="pay-card">
              <span className="pay-num">•••• •••• •••• 4242</span>
              <span className="pay-brand">VISA</span>
            </div>
            <button className="btn btn-primary" onClick={() => { setPaying(false); setPaid(true) }}>
              <Icon name="lock" size={15} /><span>Payer {coach.price} €</span>
            </button>
            <button className="btn btn-ghost" onClick={() => setPaying(false)}>Annuler</button>
          </div>
        </div>
      )}

      {needAccount && (
        <div className="pay-layer" onClick={() => setNeedAccount(false)}>
          <div className="pay-sheet" onClick={e => e.stopPropagation()}>
            <div className="booked-ring slim"><Icon name="lock" size={22} /></div>
            <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Un compte pour réserver.</h2>
            <p style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 16 }}>
              La création de compte (et le consentement) n'est demandée qu'au moment de réserver — c'est maintenant.
            </p>
            <button className="btn btn-primary" onClick={() => { setNeedAccount(false); onBooked() }}><span>Créer mon compte</span></button>
            <button className="btn btn-ghost" onClick={() => setNeedAccount(false)}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* =====================================================
   SYNERGY — liste + création multi-coachs + gestion participants
   ===================================================== */

export function Synergy({ onOpenChat }: { onOpenChat: (coachId: string) => void }) {
  const { threads, setThreads } = useStore()
  const [creating, setCreating] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [q, setQ] = useState('')
  const totalUnread = threads.reduce((n, t) => n + t.unread, 0)

  const shown = useMemo(() => {
    const ql = q.trim().toLowerCase()
    if (!ql) return threads
    return threads.filter(t => {
      const c = COACHES.find(x => x.id === t.coachId)!
      const title = (t.group?.name ?? c.name).toLowerCase()
      const last = (t.messages[t.messages.length - 1]?.text ?? '').toLowerCase()
      return title.includes(ql) || last.includes(ql)
    })
  }, [threads, q])

  /* intervenants impliqués quelque part → rangée d'accès rapide */
  const quickCoaches = useMemo(() => {
    const seen: string[] = []
    for (const t of threads) {
      for (const id of t.group?.memberIds ?? [t.coachId]) {
        if (!seen.includes(id)) seen.push(id)
      }
    }
    return seen.map(id => COACHES.find(c => c.id === id)).filter((c): c is Coach => !!c)
  }, [threads])

  const createGroup = () => {
    if (picked.length < 2) return
    const names = picked.map(id => COACHES.find(c => c.id === id)!.name.split(' ')[0])
    const g = {
      name: `Synergy · ${names.join(' × ')}`,
      memberIds: picked,
    }
    setThreads(ts => [{
      id: 'g' + Date.now(), coachId: picked[0], unread: 0,
      messages: [{ from: 'coach', text: `Bonjour ! ${names[0]} et ${names[1]} sont réunis ici pour synchroniser votre suivi.`, time: 'maintenant' }],
      group: g,
    }, ...ts])
    setPicked([]); setCreating(false)
  }

  const markAll = () => setThreads(ts => ts.map(t => ({ ...t, unread: 0 })))

  return (
    <div className="tab-page">
      <header className="page-head">
        <div>
          <div className="date-line">SYNERGY ROOM</div>
          <h1>Votre réseau de soin.</h1>
          <p>Vous êtes le chef d'orchestre de votre équipe.</p>
        </div>
        <button className="round-btn" onClick={() => setCreating(true)} aria-label="Nouvelle Synergy"><Icon name="plus" size={20} /></button>
      </header>

      <div className="search glass-lite">
        <Icon name="search" size={17} />
        <input placeholder="Rechercher une conversation…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="quick-row">
        {quickCoaches.map(c => (
          <button key={c.id} className="quick-av" onClick={() => onOpenChat(c.id)}>
            <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={58} ring />
            <span>{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {totalUnread > 0 && (
        <div className="count-line row between" style={{ marginBottom: 10 }}>
          <span>{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</span>
          <button className="link-btn" onClick={markAll}>Tout lire</button>
        </div>
      )}

      <div className="thread-list">
        {shown.map(t => {
          const c = COACHES.find(x => x.id === t.coachId)!
          const last = t.messages[t.messages.length - 1]
          const title = t.group?.name ?? c.name
          return (
            <button className="thread" key={t.id} onClick={() => onOpenChat(t.coachId)}>
              <div className="thread-av">
                {t.group
                  ? <div className="group-av">{t.group.memberIds.slice(0, 2).map(id => {
                      const cc = COACHES.find(x => x.id === id)!
                      return <Avatar key={id} hue={cc.hue} initials={cc.initials} photo={cc.photo} size={30} />
                    })}</div>
                  : <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={46} />}
                {t.unread > 0 && <span className="badge">{t.unread}</span>}
              </div>
              <div className="thread-info">
                <div className="thread-top">
                  <strong>{title}</strong>
                  {t.group && <span className="tag mini"><Icon name="users" size={10} /> {t.group.memberIds.length}</span>}
                  <span>{last?.time}</span>
                </div>
                <p>{last?.from === 'me' ? 'Vous : ' : ''}{last?.text}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="privacy block"><Icon name="shield" size={13} /> Canal privé · vous contrôlez les participants et les données partagées.</div>
      <footer className="tab-footer">Vos échanges restent chiffrés de bout en bout</footer>

      {creating && (
        <div className="pay-layer" onClick={() => setCreating(false)}>
          <div className="pay-sheet" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 6 }}>Nouvelle Synergy</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>Choisissez au moins 2 intervenants à réunir.</p>
            <div className="pick-list">
              {COACHES.map(c => (
                <button key={c.id} className={'pick' + (picked.includes(c.id) ? ' on' : '')} onClick={() =>
                  setPicked(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])
                }>
                  <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={40} />
                  <span className="pick-name"><strong>{c.name}</strong><span>{c.role}</span></span>
                  <span className={'cbox' + (picked.includes(c.id) ? ' on' : '')}>
                    {picked.includes(c.id) && <Icon name="check" size={13} strokeWidth={2.4} />}
                  </span>
                </button>
              ))}
            </div>
            <button className="btn btn-primary" disabled={picked.length < 2} onClick={createGroup}>
              <span>{picked.length < 2 ? 'Choisissez 2 intervenants' : 'Créer la Synergy'}</span>
              {picked.length >= 2 && <Icon name="arrow-right" size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* =====================================================
   CHAT 1:1 & GROUPE — gestion des participants
   ===================================================== */

export function ChatScreen({ coachId, onBack }: { coachId: string; onBack: () => void }) {
  const { threads, setThreads } = useStore()
  const thread = threads.find(t => t.coachId === coachId)
  const [draft, setDraft] = useState('')
  const [managing, setManaging] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const c = COACHES.find(x => x.id === coachId)!
  const group = thread?.group

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [thread?.messages.length])

  const send = () => {
    if (!draft.trim() || !thread) return
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const msg: Message = { from: 'me', text: draft.trim(), time: now }
    setThreads(ts => ts.map(t => t.id === thread.id ? { ...t, messages: [...t.messages, msg] } : t))
    setDraft('')
    /* réponse simulée */
    setTimeout(() => {
      const reply: Message = { from: 'coach', text: 'Bien noté, merci pour ce partage. On en reparle à la prochaine séance.', time: now, author: group ? c.name.split(' ')[0] : undefined }
      setThreads(ts => ts.map(t => t.id === thread.id ? { ...t, messages: [...t.messages, reply] } : t))
    }, 1200)
  }

  const addMember = (id: string) => {
    if (!thread) return
    const nc = COACHES.find(x => x.id === id)!
    if (group) {
      setThreads(ts => ts.map(t => t.id === thread.id
        ? { ...t, group: { ...group, memberIds: [...group.memberIds, id] }, messages: [...t.messages, { from: 'me', text: `J'invite ${nc.name} dans cette Synergy pour synchroniser notre suivi.`, time: 'maintenant' }] }
        : t))
    } else {
      /* Conversation 1:1 → Synergy : le coaché crée le pont entre ses intervenants. */
      const first = c.name.split(' ')[0]
      const second = nc.name.split(' ')[0]
      setThreads(ts => ts.map(t => t.id === thread.id
        ? { ...t, group: { name: `Synergy · ${first} × ${second}`, memberIds: [coachId, id] }, messages: [...t.messages, { from: 'me', text: `J'invite ${second} dans cette conversation pour synchroniser notre suivi.`, time: 'maintenant' }] }
        : t))
    }
  }
  const removeMember = (id: string) => {
    if (!thread || !group) return
    if (group.memberIds.length <= 2) return
    const nc = COACHES.find(x => x.id === id)!
    setThreads(ts => ts.map(t => t.id === thread.id
      ? { ...t, group: { ...group, memberIds: group.memberIds.filter(m => m !== id) }, messages: [...t.messages, { from: 'me', text: `${nc.name} a été retiré de la Synergy.`, time: 'maintenant' }] }
      : t))
  }

  const candidates = group
    ? COACHES.filter(x => !group.memberIds.includes(x.id))
    : COACHES.filter(x => x.id !== coachId)

  return (
    <div className="chat-screen">
      <header className="chat-head">
        <button className="icon-btn" onClick={onBack} aria-label="Retour"><Icon name="chevron-left" size={19} /></button>
        {group
          ? <div className="group-av head">{group.memberIds.slice(0, 2).map(id => {
              const cc = COACHES.find(x => x.id === id)!
              return <Avatar key={id} hue={cc.hue} initials={cc.initials} photo={cc.photo} size={26} />
            })}</div>
          : <Avatar hue={c.hue} initials={c.initials} photo={c.photo} size={38} />}
        <div className="chat-who">
          <strong>{group?.name ?? c.name}</strong>
          <span><i className="dot" /> {group ? `${group.memberIds.length} intervenants` : 'En ligne'}</span>
        </div>
        <button className="icon-btn" onClick={onBack} aria-label="Appel audio"><Icon name="phone" size={17} /></button>
        <button className="icon-btn" onClick={onBack} aria-label="Appel visio"><Icon name="video" size={17} /></button>
        <button className="icon-btn" onClick={() => setManaging(true)} aria-label="Participants">
          <Icon name={group ? 'users' : 'plus'} size={18} />
        </button>
      </header>

      <div className="chat-body">
        <div className="chat-note"><Icon name="shield" size={12} /> Canal privé · vous contrôlez les participants et les données partagées.</div>
        {thread?.messages.map((m, k) => (
          <div key={k} className={'bubble-row ' + m.from}>
            <div className="bubble">
              {group && m.from === 'coach' && <em className="bubble-author">{m.author ?? COACHES.find(x => x.id === coachId)?.name.split(' ')[0]}</em>}
              <p>{m.text}</p>
              <span>{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <input
          placeholder="Écrire un message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className={'send-btn' + (draft.trim() ? ' ready' : '')} onClick={send} aria-label="Envoyer">
          <Icon name="send" size={17} />
        </button>
      </div>

      {managing && (
        <div className="pay-layer" onClick={() => setManaging(false)}>
          <div className="pay-sheet" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4 }}>{group ? 'Participants' : 'Inviter dans cette conversation'}</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>
              {group ? 'Ajoutez ou retirez des intervenants. Vous gardez le contrôle.' : 'Créez un pont entre vos intervenants en les réunissant ici.'}
            </p>
            {group && (
              <div className="pick-list">
                {group.memberIds.map(id => {
                  const cc = COACHES.find(x => x.id === id)!
                  return (
                    <div className="pick static" key={id}>
                      <Avatar hue={cc.hue} initials={cc.initials} photo={cc.photo} size={40} />
                      <span className="pick-name"><strong>{cc.name}</strong><span>{cc.role}</span></span>
                      <button className="remove-btn" onClick={() => removeMember(id)} aria-label={`Retirer ${cc.name}`}>
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {candidates.length > 0 && (
              <>
                <div className="card-kicker" style={{ marginTop: group ? 14 : 0 }}>DISPONIBLES</div>
                <div className="pick-list">
                  {candidates.map(cc => (
                    <button className="pick" key={cc.id} onClick={() => addMember(cc.id)}>
                      <Avatar hue={cc.hue} initials={cc.initials} photo={cc.photo} size={40} />
                      <span className="pick-name"><strong>{cc.name}</strong><span>{cc.role}</span></span>
                      <Icon name="plus" size={16} />
                    </button>
                  ))}
                </div>
              </>
            )}
            <button className="btn btn-soft" onClick={() => setManaging(false)}>Terminé</button>
          </div>
        </div>
      )}
    </div>
  )
}
