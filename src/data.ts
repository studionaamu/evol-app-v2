export type Domain = 'Stress' | 'Sommeil' | 'Nutrition' | 'Mouvement' | 'Mental' | 'Confiance'

export type Coach = {
  id: string
  name: string
  role: string
  rating: number
  reviews: number
  city: string
  mode: 'À distance' | 'Présentiel'
  tags: string[]
  domains: Domain[]
  price: number
  available: boolean
  initials: string
  hue: string
  photo: string
  bio: string
  experience: string[]
  students: number
  successRate: number
  video?: { duration: string; views: string; thumb: string }
  freeContent: { title: string; kind: string; duration: string }[]
  testimonial: { text: string; author: string }[]
  slots: string[]
}

export const COACHES: Coach[] = [
  {
    id: 'camille',
    name: 'Camille Durand',
    role: 'Coach holistique & respiration',
    rating: 4.9,
    reviews: 127,
    city: 'Paris',
    mode: 'À distance',
    tags: ['Stress', 'Sommeil', 'Respiration'],
    domains: ['Stress', 'Sommeil'],
    price: 65,
    available: true,
    initials: 'CD',
    hue: '152',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80&auto=format&fit=crop',
    bio: "10 ans d'accompagnement en gestion du stress et respiration consciente. Sessions douces, orientées vers le système nerveux.",
    experience: ['Certifiée Wim Hof Method', '8 ans en maison de santé', 'Formatrice en cohérence cardiaque'],
    students: 320,
    successRate: 92,
    video: { duration: '1:42', views: '12,4k', thumb: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=80&auto=format&fit=crop' },
    freeContent: [
      { title: 'Respiration du matin', kind: 'Audio', duration: '8 min' },
      { title: 'Pourquoi vous malvotre souffle', kind: 'Article', duration: '4 min' },
    ],
    testimonial: [
      { text: 'Une douceur et une écoute rares. Mon sommeil a changé en trois semaines.', author: 'Marie L.' },
      { text: 'Les exercices sont simples, les effets profonds.', author: 'Karim B.' },
    ],
    slots: ['Demain 09:30', 'Jeu 26 · 18:00', 'Ven 27 · 08:15', 'Lun 30 · 12:00'],
  },
  {
    id: 'nora',
    name: 'Nora Benali',
    role: 'Nutrition & équilibre alimentaire',
    rating: 5.0,
    reviews: 89,
    city: 'Lyon',
    mode: 'À distance',
    tags: ['Nutrition', 'Énergie', 'Habitudes'],
    domains: ['Nutrition'],
    price: 55,
    available: true,
    initials: 'NB',
    hue: '36',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80&auto=format&fit=crop',
    bio: 'Nutritionniste comportementale. Pas de régimes : des habitudes tenables qui respectent votre rythme de vie.',
    experience: ['Diététicienne-nutritionniste DE', 'Spécialiste eating behavior', 'Intervenante podcast "Manger juste"'],
    students: 210,
    successRate: 88,
    video: { duration: '1:28', views: '6,1k', thumb: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80&auto=format&fit=crop' },
    freeContent: [
      { title: 'Le petit-déjeuner idéal', kind: 'Guide', duration: '6 min' },
      { title: 'Sucres cachés : le quiz', kind: 'Quiz', duration: '3 min' },
    ],
    testimonial: [
      { text: 'Aucun interdit, juste de la clarté. J’ai enfin tenu mes objectifs.', author: 'Sophie R.' },
    ],
    slots: ['Mer 25 · 17:30', 'Ven 27 · 18:00', 'Sam 28 · 10:00'],
  },
  {
    id: 'marc',
    name: 'Marc Lefèvre',
    role: 'Mouvement & réathlétisation',
    rating: 4.8,
    reviews: 204,
    city: 'Bordeaux',
    mode: 'Présentiel',
    tags: ['Mobilité', 'Force', 'Dos'],
    domains: ['Mouvement'],
    price: 70,
    available: true,
    initials: 'ML',
    hue: '208',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80&auto=format&fit=crop',
    bio: 'Kinésiologue et préparateur physique. Retrouvez une mobilité sans douleur et une force fonctionnelle, à votre rythme.',
    experience: ['Kinésithérapeute DE', 'Réathlétisation sportive', '12 ans de cabinet'],
    students: 500,
    successRate: 94,
    video: { duration: '2:10', views: '8,7k', thumb: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop' },
    freeContent: [
      { title: 'Dos : les 3 étirements', kind: 'Vidéo', duration: '7 min' },
    ],
    testimonial: [
      { text: 'Après deux hernies, j’ai repris le sport sans peur. Pédagogie impeccable.', author: 'Thomas D.' },
    ],
    slots: ['Jeu 26 · 07:30', 'Jeu 26 · 12:15', 'Mar 01 · 19:00'],
  },
  {
    id: 'elodie',
    name: 'Élodie Martin',
    role: 'Psychologue & santé mentale',
    rating: 4.9,
    reviews: 156,
    city: 'Marseille',
    mode: 'À distance',
    tags: ['Anxiété', 'Confiance', 'Écoute'],
    domains: ['Mental', 'Confiance'],
    price: 80,
    available: true,
    initials: 'EM',
    hue: '268',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80&auto=format&fit=crop',
    bio: "Psychologue TCC. Un espace d'écoute sans jugement pour apprivoiser l'anxiété et retrouver confiance.",
    experience: ['Psychologue clinicienne', 'TCC & ACT', 'Pratique en ligne depuis 2019'],
    students: 410,
    successRate: 91,
    video: { duration: '1:56', views: '9,3k', thumb: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80&auto=format&fit=crop' },
    freeContent: [
      { title: 'Ancrage en 5 minutes', kind: 'Audio', duration: '5 min' },
      { title: 'Comprendre ses pensées intrusives', kind: 'Article', duration: '5 min' },
    ],
    testimonial: [
      { text: 'Élodie m’a aidée à traverser une période très sombre, avec justesse.', author: 'Claire M.' },
      { text: 'Des outils concrets qui apaisent dès la première semaine.', author: 'Hugo P.' },
    ],
    slots: ['Mer 25 · 12:00', 'Jeu 26 · 20:00', 'Ven 27 · 19:30'],
  },
  {
    id: 'lucas',
    name: 'Lucas Moreau',
    role: 'Chronobiologie & récupération profonde',
    rating: 4.9,
    reviews: 112,
    city: 'Nantes',
    mode: 'À distance',
    tags: ['Sommeil', 'Récupération', 'Circadien'],
    domains: ['Sommeil', 'Stress'],
    price: 75,
    available: true,
    initials: 'LM',
    hue: '192',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80&auto=format&fit=crop',
    bio: 'Spécialiste du rythme circadien et de la récupération nerveuse. Recalibrez vos nuits sans somnifères ni rigidité.',
    experience: ['Master Neurosciences du sommeil', 'Consultant athlètes & dirigeants', '7 ans de suivi clinique'],
    students: 290,
    successRate: 93,
    video: { duration: '1:35', views: '7,8k', thumb: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=900&q=80&auto=format&fit=crop' },
    freeContent: [
      { title: 'Protocole lumière du matin', kind: 'Guide', duration: '5 min' },
      { title: 'Décompression 21h30', kind: 'Audio', duration: '9 min' },
    ],
    testimonial: [
      { text: 'Mes réveils nocturnes ont disparu en dix jours. Approche ultra-précise.', author: 'Julien V.' },
      { text: 'Enfin un protocole adapté à mes horaires décalés.', author: 'Sarah K.' },
    ],
    slots: ['Jeu 26 · 08:30', 'Ven 27 · 17:00', 'Lun 30 · 18:30'],
  },
  {
    id: 'ines',
    name: 'Inès Khelifi',
    role: 'Leadership calme & clarté mentale',
    rating: 5.0,
    reviews: 94,
    city: 'Paris',
    mode: 'Présentiel',
    tags: ['Focus', 'Confiance', 'Posture', 'Charge mentale'],
    domains: ['Confiance', 'Mental'],
    price: 85,
    available: true,
    initials: 'IK',
    hue: '310',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80&auto=format&fit=crop',
    bio: 'Accompagnement exécutif et régulation émotionnelle. Décidez avec clarté sans y laisser votre énergie vitale.',
    experience: ['Ex-directrice produit', 'Certifiée ICF PCC', 'Spécialiste haute charge cognitive'],
    students: 185,
    successRate: 95,
    video: { duration: '1:50', views: '5,4k', thumb: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop' },
    freeContent: [
      { title: 'Audit de charge mentale', kind: 'Outil', duration: '6 min' },
    ],
    testimonial: [
      { text: 'Inès transforme la pression en clarté immédiate. Indispensable.', author: 'Antoine G.' },
    ],
    slots: ['Mer 25 · 14:00', 'Ven 27 · 11:00', 'Mar 01 · 09:00'],
  },
]

export type Session = {
  id: string
  day: number
  month: string
  time: string
  coachId: string
  title: string
  duration: number
  mode: string
}

export const SESSIONS: Session[] = [
  { id: 's1', day: 26, month: 'JUIN', time: '09:30', coachId: 'camille', title: 'Session respiration', duration: 45, mode: 'Visio' },
  { id: 's2', day: 28, month: 'JUIN', time: '18:00', coachId: 'nora', title: 'Point nutrition', duration: 30, mode: 'Visio' },
]

export type CommunityEvent = {
  id: string
  title: string
  day: number
  month: string
  time: string
  mode: 'Visio' | 'Présentiel'
  host: string
  place: string
  seats: number
  tag: string
  desc: string
}

/* événements ouverts à la communauté (visio ou présentiel) */
export const EVENTS: CommunityEvent[] = [
  { id: 'e1', title: 'Cohérence cardiaque collective', day: 26, month: 'JUIN', time: '07:30', mode: 'Visio', host: 'Camille Durand', place: 'Salle Synergy', seats: 12, tag: 'Respiration', desc: 'Vingt minutes de cohérence cardiaque guidée à distance, puis un temps d’échange libre. Idéal pour commencer la journée le souffle posé, seul ou en famille.' },
  { id: 'e2', title: 'Marche consciente au parc Monceau', day: 28, month: 'JUIN', time: '10:00', mode: 'Présentiel', host: 'Marc Lefèvre', place: 'Paris 8e', seats: 8, tag: 'Mouvement', desc: 'Une heure de marche lente en plein air, respiration et mobilité douce, pour retrouver de l’aisance dans le corps et rencontrer les autres élèves du programme.' },
  { id: 'e3', title: 'Atelier petit-déjeuner protéiné', day: 2, month: 'JUIL', time: '18:30', mode: 'Visio', host: 'Nora Benali', place: 'Cuisine partagée', seats: 20, tag: 'Nutrition', desc: 'Nora prépare en direct trois petits-déjeuners simples et rassasiants. Vous recevez la liste des courses et les fiches recettes avant l’atelier.' },
  { id: 'e4', title: 'Cercle d’écoute entre élèves', day: 5, month: 'JUIL', time: '19:00', mode: 'Visio', host: 'Élodie Martin', place: 'Salle confidentielle', seats: 6, tag: 'Mental', desc: 'Un espace de parole confidentiel, sans caméra obligatoire, animé par Élodie. Six places pour garantir un temps de parole à chacun.' },
]

export type Message = { from: 'me' | 'coach'; text: string; time: string; author?: string }

export type Thread = {
  id: string
  coachId: string
  unread: number
  messages: Message[]
  group?: { name: string; memberIds: string[] }
}

export const THREADS: Thread[] = [
  {
    id: 't1',
    coachId: 'camille',
    unread: 2,
    messages: [
      { from: 'coach', text: 'Bonjour Alex, comment s’est passée votre respiration hier ?', time: '09:12' },
      { from: 'me', text: 'J’ai senti une vraie différence au réveil. Le journal m’a aidé à poser les choses.', time: '09:17' },
      { from: 'coach', text: 'C’est super. On peut transmettre ce signal à Nora pour ajuster votre routine.', time: '09:18' },
      { from: 'me', text: 'Oui, je lui ouvre l’accès à cette conversation.', time: '09:20' },
    ],
  },
  {
    id: 't2',
    coachId: 'nora',
    unread: 0,
    messages: [
      { from: 'me', text: 'Bonjour Nora, la routine petit-déjeuner fonctionne bien.', time: 'hier' },
      { from: 'coach', text: 'Parfait. On garde ce cap cette semaine, sans rien changer d’autre.', time: 'hier' },
    ],
  },
  {
    id: 't3',
    coachId: 'marc',
    unread: 1,
    messages: [
      { from: 'coach', text: 'J’ai préparé votre programme mobilité épaules. 12 min, 3 fois par semaine.', time: '08:05' },
    ],
  },
]

export const CHAT_SEED: Record<string, Message[]> = {
  camille: [{ from: 'coach', text: 'Bonjour ! Je vous écoute. Comment puis-je vous aider ?', time: 'maintenant' }],
  nora: [{ from: 'coach', text: 'Bonjour ! Je vous écoute. Comment puis-je vous aider ?', time: 'maintenant' }],
  marc: [{ from: 'coach', text: 'Bonjour ! Je vous écoute. Comment puis-je vous aider ?', time: 'maintenant' }],
  elodie: [{ from: 'coach', text: 'Bonjour ! Je vous écoute. Comment puis-je vous aider ?', time: 'maintenant' }],
}

export type Exercise = {
  id: string
  title: string
  duration: number
  level: string
  desc: string
  steps: string[]
  hue: string
}

export const EXERCISES: Exercise[] = [
  {
    id: 'e1',
    title: 'Respiration 4-7-8',
    duration: 10,
    level: 'Doux',
    desc: 'Un classique pour apaiser le système nerveux et retrouver du calme en quelques minutes.',
    steps: [
      'Installez-vous confortablement, dos droit, épaules relâchées.',
      'Inspirez par le nez en comptant 4 temps.',
      'Retenez votre souffle doucement, 7 temps.',
      'Expirez longuement par la bouche, 8 temps.',
      'Répétez 4 cycles, puis respirez normalement.',
    ],
    hue: '152',
  },
  {
    id: 'e2',
    title: 'Scan corporel',
    duration: 12,
    level: 'Doux',
    desc: 'Un balayage attentif du corps pour relâcher les tensions accumulées.',
    steps: [
      'Allongez-vous ou asseyez-vous, fermez les yeux.',
      'Portez l’attention sur le sommet du crâne.',
      'Descendez lentement : visage, nuque, épaules.',
      'Notez chaque tension sans chercher à la chasser.',
      'Terminez par trois respirations profondes.',
    ],
    hue: '208',
  },
  {
    id: 'e3',
    title: 'Cohérence cardiaque',
    duration: 5,
    level: 'Rapide',
    desc: '365 respirations par jour, synchronisées au rythme du cœur.',
    steps: [
      'Inspirez 5 secondes, expirez 5 secondes.',
      'Gardez un rythme régulier, sans effort.',
      'Laissez les pensées passer comme des nuages.',
      'Continuez 5 minutes, deux fois par jour.',
    ],
    hue: '36',
  },
]

export const INTENTIONS = [
  { title: 'Créer de l’espace pour respirer.', sub: 'Une pratique douce de 10 minutes suffit pour revenir à vous.', ex: 'e1' },
  { title: 'Avancer sans forcer.', sub: 'Un pas suffit. Choisissez une micro-action et honorez-la.', ex: 'e3' },
  { title: 'Écouter avant de corriger.', sub: 'Ce que vous ressentez est une information, pas un défaut.', ex: 'e2' },
]

export const QUOTES = [
  { text: 'La régularité crée des transformations que la motivation seule ne peut pas tenir.', src: 'Votre espace Evol' },
  { text: 'On ne change pas de direction en forçant le volant, mais en regardant plus loin.', src: 'Proverbe' },
  { text: 'Le calme n’est pas l’absence de tempête, c’est ce que vous cultivez en elle.', src: 'Evol · Respiration' },
  { text: 'Chaque version de vous mérite un accompagnement d’exception.', src: 'Manifeste Evol' },
  { text: 'Une intention claire vaut dix résolutions bruyantes.', src: 'Votre espace Evol' },
]

/* --- Espace coach : clients, groupes, agenda, appels --- */

export type CoachClient = {
  id: string
  name: string
  initials: string
  hue: string
  photo?: string
  program: string
  startedAgo: string
  nextSession: string
  metrics: { label: string; value: string; delta?: string; up?: boolean }[]
  trend: number[]
  energy: number
  sleep: string
  adherence: number
  journal?: string
  flags: { type: 'alert' | 'watch' | 'ok'; text: string }[]
}

export const COACH_CLIENTS: CoachClient[] = [
  {
    id: 'alex', name: 'Alex Martin', initials: 'AM', hue: '152', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80&auto=format&fit=crop',
    program: 'Respiration & sommeil · 6 mois', startedAgo: 'mois 3', nextSession: 'Demain 09:30',
    metrics: [
      { label: 'Énergie', value: '78', delta: '+8%', up: true },
      { label: 'Sommeil', value: '7h42', delta: 'stable' },
      { label: 'Séances tenues', value: '86%', delta: '+4%', up: true },
    ],
    trend: [42, 48, 45, 56, 58, 66, 78], energy: 78, sleep: '7h42 · stable', adherence: 86,
    journal: '« Aujourd’hui je me sens plus calme. La respiration du matin m’a aidé à poser les choses. »',
    flags: [{ type: 'ok', text: 'Aucun signal d’alerte ce mois-ci' }],
  },
  {
    id: 'sofia', name: 'Sofia M.', initials: 'SM', hue: '8', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80&auto=format&fit=crop',
    program: 'Force & mobilité · 6 mois', startedAgo: 'mois 2', nextSession: 'Jeu 26 · 14:00',
    metrics: [
      { label: 'Énergie', value: '41', delta: '-12%', up: false },
      { label: 'Récupération', value: 'faible', delta: 'alerte' },
      { label: 'Séances tenues', value: '64%', delta: '-9%', up: false },
    ],
    trend: [68, 66, 60, 55, 48, 44, 41], energy: 41, sleep: '5h10 · fragmenté', adherence: 64,
    journal: '« J’enchaîne les grosses journées, je n’arrive pas à décrocher le soir. »',
    flags: [{ type: 'alert', text: 'Effort soutenu 3 jours, récupération insuffisante — EVA recommande de décharger.' }],
  },
  {
    id: 'david', name: 'David K.', initials: 'DK', hue: '208',
    program: 'Ancrage anti-stress · 3 mois', startedAgo: 'mois 1', nextSession: 'Ven 27 · 08:15',
    metrics: [
      { label: 'Énergie', value: '62', delta: '+3%', up: true },
      { label: 'Sommeil', value: '6h50', delta: '+20min', up: true },
      { label: 'Séances tenues', value: '71%', delta: 'stable' },
    ],
    trend: [50, 52, 55, 53, 58, 60, 62], energy: 62, sleep: '6h50 · en progrès', adherence: 71,
    flags: [{ type: 'watch', text: 'Check-in hebdo en retard de 24 h — relance douce conseillée.' }],
  },
  {
    id: 'leila', name: 'Leïla B.', initials: 'LB', hue: '268',
    program: 'Cohérence cardiaque · 6 mois', startedAgo: 'mois 4', nextSession: 'Lun 30 · 12:00',
    metrics: [
      { label: 'Énergie', value: '84', delta: '+6%', up: true },
      { label: 'Sommeil', value: '8h05', delta: '+15min', up: true },
      { label: 'Séances tenues', value: '93%', delta: '+2%', up: true },
    ],
    trend: [60, 64, 70, 72, 76, 80, 84], energy: 84, sleep: '8h05 · profond', adherence: 93,
    flags: [{ type: 'ok', text: 'Meilleur mois depuis le début du programme' }],
  },
]

export type CoachGroup = {
  id: string
  name: string
  memberIds: string[]
  objective: string
  mode: 'Distanciel' | 'Présentiel'
  schedule: string
  progress: number
}

export const COACH_GROUPS: CoachGroup[] = [
  {
    id: 'g1', name: 'Groupe Matin · Respiration', memberIds: ['alex', 'leila'],
    objective: '10 min de cohérence cardiaque, 5 jours/semaine',
    mode: 'Distanciel', schedule: 'Lun–Ven · 07:30', progress: 78,
  },
  {
    id: 'g2', name: 'Groupe Dos & Mobilité', memberIds: ['david', 'sofia'],
    objective: 'Protocole 12 min · 3×/semaine',
    mode: 'Présentiel', schedule: 'Mar & Jeu · 18:00', progress: 46,
  },
]

export type CoachCall = {
  id: string
  withId: string
  kind: 'audio' | 'video'
  scope: 'individuel' | 'groupe'
  title: string
  when: string
  duration?: string
  missed?: boolean
}

export const COACH_CALLS: CoachCall[] = [
  { id: 'c1', withId: 'alex', kind: 'video', scope: 'individuel', title: 'Séance respiration', when: 'Hier · 09:30', duration: '45 min' },
  { id: 'c2', withId: 'g1', kind: 'video', scope: 'groupe', title: 'Groupe Matin · Respiration', when: 'Lun · 07:30', duration: '20 min' },
  { id: 'c3', withId: 'david', kind: 'audio', scope: 'individuel', title: 'Point hebdo', when: 'Sam · 11:00', duration: '12 min', missed: true },
  { id: 'c4', withId: 'leila', kind: 'audio', scope: 'individuel', title: 'Suivi énergie', when: 'Ven · 18:40', duration: '8 min' },
]

export type CoachAgendaDay = { day: number; items: { time: string; label: string; who: string; kind: 'video' | 'group' | 'inperson' }[] | null }

/* --- Assessment quiz (friction zéro : pas de compte requis) --- */

export type QuizOption = { label: string; domains: Domain[] }
export type QuizStep = { q: string; sub: string; options: QuizOption[] }

export const QUIZ: QuizStep[] = [
  {
    q: 'Qu’est-ce qui pèse le plus en ce moment ?',
    sub: 'Une seule réponse, la plus honnête.',
    options: [
      { label: 'Le stress qui s’accumule', domains: ['Stress'] },
      { label: 'Des nuits trop courtes', domains: ['Sommeil'] },
      { label: 'Mon corps me parle (tensions, dos)', domains: ['Mouvement'] },
      { label: 'Un mental en ébullition', domains: ['Mental'] },
    ],
  },
  {
    q: 'Et à côté, qu’aimeriez-vous améliorer ?',
    sub: 'Optionnel — vous pourrez le faire plus tard.',
    options: [
      { label: 'Manger plus sainement', domains: ['Nutrition'] },
      { label: 'Bouger davantage', domains: ['Mouvement'] },
      { label: 'Gagner en confiance', domains: ['Confiance'] },
      { label: 'Mieux dormir', domains: ['Sommeil'] },
    ],
  },
  {
    q: 'Votre préférence pour débuter ?',
    sub: 'Vous pourrez toujours changer d’avis.',
    options: [
      { label: 'En visio, depuis chez moi', domains: [] },
      { label: 'En présentiel, près de chez moi', domains: [] },
      { label: 'Les deux m’arrangent', domains: [] },
    ],
  },
]

/* --- Illustrations (Unsplash haute qualité) --- */

const unsplash = (id: string, w = 1000, h?: number) =>
  `https://images.unsplash.com/${id}?w=${w}${h ? `&h=${h}&crop=entropy` : ''}&q=80&auto=format&fit=crop`

export const IMAGES = {
  welcome: unsplash('photo-1470071459604-3b5ec3a7fe05', 1100), // forêt brumeuse au réveil
  intent: unsplash('photo-1470252649378-9c29740c9fa8', 900, 1200), // lever de soleil doré
  ob: [
    unsplash('photo-1506905925346-21bda4d32df4', 900),         // sommet au lever du jour
    unsplash('photo-1518495973542-4542c06a5843', 900),         // lumière à travers les feuilles
    unsplash('photo-1521737604893-d14cc237f11d', 900),         // mains réunies
  ],
  userPhoto: unsplash('photo-1535713875002-d1d0cf377fde', 400, 400), // portrait clair, fond doux
}

export function recommendedCoachIds(domains: Domain[]): string[] {
  const scores = new Map<string, number>()
  for (const c of COACHES) {
    const n = c.domains.filter(d => domains.includes(d)).length
    if (n > 0) scores.set(c.id, n)
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

/* --- RGPD --- */

export type Consent = {
  account: boolean      // données de compte (email)
  health: boolean       // données de santé (obligatoire pour coaching)
  journal: boolean      // journal IA / transcription
  shareCoach: boolean   // partage journal & signaux avec coachs
}

export const DEFAULT_CONSENT: Consent = { account: false, health: false, journal: false, shareCoach: false }

/* --- Nouvelles données : Vitrine Coach, Rapports EVA, Écosystème Coaché, Statistiques Coach --- */

export type CoachProgram = {
  id: string
  title: string
  duration: string
  sessionsCount: number
  format: string
  desc: string
  price: number
  active: boolean
}

export type CoachPricingTier = {
  id: string
  name: string
  price: number
  unit: string
  features: string[]
  popular?: boolean
}

export const INITIAL_VITRINE_PROGRAMS: CoachProgram[] = [
  {
    id: 'p1',
    title: 'Reset Nerveux & Souffle',
    duration: '6 semaines',
    sessionsCount: 6,
    format: 'Individuel · Visio + suivi EVA',
    desc: 'Régulation vagale, cohérence cardiaque sur-mesure et restructuration du sommeil profond.',
    price: 360,
    active: true,
  },
  {
    id: 'p2',
    title: 'Ancrage & Clarté Mentale',
    duration: '12 semaines',
    sessionsCount: 10,
    format: 'Hybride · 1:1 & Groupe Matin',
    desc: 'Sortir de la surcharge cognitive durablement grâce aux rituels respiratoires et au biofeedback.',
    price: 620,
    active: true,
  },
]

export type CoachMedia = { id: string; title: string; kind: 'Photo' | 'Vidéo'; meta: string; src?: string }

export const INITIAL_GALLERY: CoachMedia[] = [
  { id: 'm1', title: 'Salle de respiration · lumière du matin', kind: 'Photo', meta: 'Studio Paris 8e' },
  { id: 'm2', title: 'Démonstration cohérence cardiaque', kind: 'Vidéo', meta: '1 min 12' },
  { id: 'm3', title: 'Atelier groupe Dos & Mobilité', kind: 'Photo', meta: 'Groupe · 6 élèves' },
]

export const INITIAL_FREEBIES: { id: string; title: string; kind: string; duration: string; downloads: number }[] = [
  { id: 'f1', title: 'Respiration du matin (4-7-8 guidé)', kind: 'Audio', duration: '8 min', downloads: 412 },
  { id: 'f2', title: 'Pourquoi votre souffle bloque sous pression', kind: 'Article', duration: '4 min', downloads: 289 },
  { id: 'f3', title: 'Protocole déconnexion 21h30', kind: 'Guide PDF', duration: '6 pages', downloads: 530 },
]

export const INITIAL_PRICING_TIERS: CoachPricingTier[] = [
  {
    id: 't1',
    name: 'Séance Découverte',
    price: 65,
    unit: 'la séance (45 min)',
    features: ['Bilan respiratoire & nerveux', 'Protocole personnalisé immédiat', 'Compte rendu IA EVA inclus'],
  },
  {
    id: 't2',
    name: 'Accompagnement Mensuel',
    price: 220,
    unit: '/ mois · sans engagement',
    features: ['4 séances 1:1 (45 min + 15 min débrief)', 'Accès illimité Synergy & messagerie', 'Analyse continue des signaux par EVA'],
    popular: true,
  },
  {
    id: 't3',
    name: 'Immersion Trimestrielle',
    price: 590,
    unit: '/ trimestre (12 séances)',
    features: ['Suivi prioritaire 7j/7', 'Sessions de groupe matinales incluses', 'Bilan biométrique complet'],
  },
]

export type EvaSessionReport = {
  id: string
  date: string
  coachId: string
  coachName: string
  clientName: string
  title: string
  duration: string
  summary: string
  keyTakeaways: string[]
  nextActions: string[]
  sentiment: string
  timeSaved: string
}

export const EVA_SESSION_REPORTS: EvaSessionReport[] = [
  {
    id: 'r1',
    date: 'Hier · 09:30',
    coachId: 'camille',
    coachName: 'Camille Durand',
    clientName: 'Alex Martin',
    title: 'Séance Respiration & Sommeil #4',
    duration: '45 min',
    summary: 'Séance enregistrée, transcrite et structurée par EVA. Nette diminution de la tension thoracique après 12 minutes de cohérence guidée. Alex identifie les réunions tardives comme déclencheur principal du réveil à 3h.',
    keyTakeaways: [
      'Capacité d’apnée basse passée de 18 s à 29 s (+61%)',
      'Endormissement réduit à 15 min sur les 4 derniers jours',
      'Besoin d’un sas de décompression de 10 min à 19h00',
    ],
    nextActions: [
      'Pratiquer le 4-7-8 au coucher 5 soirs/7',
      'Couper les écrans lumineux dès 21h45',
      'Partager le relevé de pouls au repos avec Nora',
    ],
    sentiment: 'Apaisé & engagé',
    timeSaved: '22 min d’admin économisées (80%)',
  },
  {
    id: 'r2',
    date: '20 juin · 18:00',
    coachId: 'nora',
    coachName: 'Nora Benali',
    clientName: 'Alex Martin',
    title: 'Bilan Énergie & Glycémie matinale',
    duration: '30 min',
    summary: 'Stabilisation nette du pic de fatigue de 15h grâce au petit-déjeuner protéiné. Hydratation encore en dessous de la cible les jours de télétravail.',
    keyTakeaways: [
      'Zéro fringale sucrée signalée cette semaine',
      'Énergie subjective remontée de 52 à 74/100',
    ],
    nextActions: [
      'Préparer une carafe d’eau visible sur le bureau',
      'Maintenir l’apport protéiné avant 9h30',
    ],
    sentiment: 'Confiant',
    timeSaved: '18 min d’admin économisées (80%)',
  },
]

export type SharedDocument = {
  id: string
  title: string
  kind: 'PDF' | 'Audio' | 'Bilan' | 'Note'
  size: string
  coachId: string
  date: string
  byMe?: boolean
}

export const INITIAL_SHARED_DOCS: SharedDocument[] = [
  { id: 'd1', title: 'Bilan_Sommeil_Juin_Alex.pdf', kind: 'PDF', size: '1.4 Mo', coachId: 'camille', date: 'Hier' },
  { id: 'd2', title: 'Routine_Matinale_Proteinee.pdf', kind: 'PDF', size: '840 Ko', coachId: 'nora', date: '21 juin' },
  { id: 'd3', title: 'Protocole_Epaules_12min.mp3', kind: 'Audio', size: '6.2 Mo', coachId: 'marc', date: '18 juin' },
  { id: 'd4', title: 'Relevé_Cardio_Semaine25.pdf', kind: 'Bilan', size: '520 Ko', coachId: 'camille', date: 'Auj.', byMe: true },
]

export type GoalTracker = {
  id: string
  title: string
  domain: Domain
  coachId: string
  progress: number
  target: string
  current: string
  streak: string
}

export const ECOSYSTEM_GOALS: GoalTracker[] = [
  { id: 'g-1', title: 'Sommeil réparateur ≥ 7h30', domain: 'Sommeil', coachId: 'camille', progress: 78, current: '7h25 / nuit', target: '7h30', streak: '5 j consécutifs' },
  { id: 'g-2', title: 'Stabilité énergétique après-midi', domain: 'Nutrition', coachId: 'nora', progress: 85, current: '6 / 7 jours', target: '7 / 7 jours', streak: '12 j' },
  { id: 'g-3', title: 'Mobilité scapulaire & dos sans douleur', domain: 'Mouvement', coachId: 'marc', progress: 64, current: '2 / 3 séances', target: '3 / sem', streak: '3 sem' },
]

