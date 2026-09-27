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
  bio: string
  experience: string[]
  video?: { duration: string; views: string }
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
    bio: "10 ans d'accompagnement en gestion du stress et respiration consciente. Sessions douces, orientées vers le système nerveux.",
    experience: ['Certifiée Wim Hof Method', '8 ans en maison de santé', 'Formatrice en cohérence cardiaque'],
    video: { duration: '1:42', views: '12,4k' },
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
    bio: 'Nutritionniste comportementale. Pas de régimes : des habitudes tenables qui respectent votre rythme de vie.',
    experience: ['Diététicienne-nutritionniste DE', 'Spécialiste eating behavior', 'Intervenante podcast "Manger juste"'],
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
    bio: 'Kinésiologue et préparateur physique. Retrouvez une mobilité sans douleur et une force fonctionnelle, à votre rythme.',
    experience: ['Kinésithérapeute DE', 'Réathlétisation sportive', '12 ans de cabinet'],
    video: { duration: '2:10', views: '8,7k' },
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
    bio: "Psychologue TCC. Un espace d'écoute sans jugement pour apprivoiser l'anxiété et retrouver confiance.",
    experience: ['Psychologue clinicienne', 'TCC & ACT', 'Pratique en ligne depuis 2019'],
    freeContent: [
      { title: 'Ancrage en 5 minutes', kind: 'Audio', duration: '5 min' },
      { title: 'Comprendre ses pensées intrusives', kind: 'Article', duration: '5 min' },
    ],
    testimonial: [
      { text: 'Élodie m’a aidée à traverser une période très sombre, avec justesse.', author: 'Claire M.' },
    ],
    slots: ['Mer 25 · 12:00', 'Jeu 26 · 20:00', 'Ven 27 · 19:30'],
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

export type Message = { from: 'me' | 'coach'; text: string; time: string }

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
