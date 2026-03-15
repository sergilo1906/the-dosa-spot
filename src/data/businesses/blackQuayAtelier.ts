import posterHero from '../../assets/demo/barbers/black-quay-poster.svg?url';
import interiorWide from '../../assets/demo/barbers/black-quay-interior.svg?url';
import detailPanel from '../../assets/demo/barbers/black-quay-detail.svg?url';
import loungePanel from '../../assets/demo/barbers/black-quay-lounge.svg?url';
import grainTexture from '../../assets/textures/grain.svg?url';
import type { BusinessBriefInput } from '../../types/business';

export const blackQuayAtelierInput: BusinessBriefInput = {
  slug: 'black-quay-atelier',
  isMockSample: true,
  sampleLabel: 'Mock concept study',
  businessName: 'Black Quay Atelier',
  niche: 'barbershop',
  tagline: 'A Cork barber presence that feels worth booking on first view.',
  shortDescription:
    'A premium barber studio for clients who want quiet appointments, sharp craft, and a more considered atmosphere from the street to the final mirror check.',
  city: 'Cork',
  country: 'Ireland',
  address: null,
  phone: null,
  email: 'hello@blackquayatelier.example',
  website: 'https://blackquayatelier.example',
  openingHours: [],
  coordinates: null,
  socialLinks: [],
  services: [
    {
      title: 'Signature Cut',
      summary: 'Shape, texture, and tailored finishing with a controlled, editorial feel.',
      duration: '50 min',
      accent: 'Most requested',
    },
    {
      title: 'Beard Architecture',
      summary: 'Precision line work, hot-towel prep, and structure designed to frame the face cleanly.',
      duration: '35 min',
      accent: 'Sharp detail',
    },
    {
      title: 'Studio Ritual',
      summary: 'Cut, beard refinement, scalp finish, and a slower consultation-led service sequence.',
      duration: '80 min',
      accent: 'Premium ritual',
    },
    {
      title: 'Event Reset',
      summary: 'A tighter pre-event finish for weddings, shoots, dinners, and high-visibility evenings.',
      duration: '40 min',
      accent: 'Occasion ready',
    },
  ],
  faqItems: [
    {
      question: 'Which service suits a first visit?',
      answer:
        'Most first visits start with the Signature Cut if the goal is shape and finish, or the Studio Ritual if you want more time for consultation, beard work, and a slower service pace.',
    },
    {
      question: 'Can cut and beard work be combined in one appointment?',
      answer:
        'Yes. The Studio Ritual is designed for clients who want a fuller session with cut, beard refinement, and finishing detail in a single visit.',
    },
    {
      question: 'What kind of atmosphere should I expect in the studio?',
      answer:
        'Calm pacing, lower light, warmer material tones, and a quieter sense of attention from consultation through to the final mirror check.',
    },
    {
      question: 'Is the studio a good fit for special events or evenings out?',
      answer:
        'Yes. Event Reset is built for sharper pre-event finishing when you want everything sitting cleanly for a wedding, dinner, or higher-visibility evening.',
    },
  ],
  realReviews: [],
  imageAssets: [
    {
      id: 'black-quay-poster',
      src: posterHero,
      alt: 'Editorial portrait artwork for Black Quay Atelier.',
      kind: 'hero',
      ratio: 'portrait',
      treatment: 'bronze frame',
    },
    {
      id: 'black-quay-interior',
      src: interiorWide,
      alt: 'Wide studio artwork suggesting mirrors, seating, and warm lighting.',
      kind: 'gallery',
      ratio: 'landscape',
      treatment: 'cinematic wide',
    },
    {
      id: 'black-quay-detail',
      src: detailPanel,
      alt: 'Detail artwork with editorial lines and premium barber motifs.',
      kind: 'detail',
      ratio: 'portrait',
      treatment: 'detail crop',
    },
    {
      id: 'black-quay-lounge',
      src: loungePanel,
      alt: 'Lounge artwork for the waiting area and mood of the studio.',
      kind: 'gallery',
      ratio: 'landscape',
      treatment: 'warm steel',
    },
    {
      id: 'grain-overlay',
      src: grainTexture,
      alt: 'Subtle grain texture used across the studio visuals.',
      kind: 'texture',
      ratio: 'square',
      treatment: 'grain',
    },
  ],
  brandHints: ['after-dark atelier', 'precise grooming', 'quiet confidence', 'local luxury'],
  brandColors: ['#090909', '#b98652', '#efe5d5'],
  toneHints: ['measured', 'assured', 'high-touch'],
  visualMood: 'Noir bronze studio with cinematic restraint',
  seoTitle: 'Black Quay Atelier | Premium Barber in Cork',
  seoDescription:
    'A premium barber studio in Cork offering tailored cuts, beard detail, and a quieter, more considered service atmosphere.',
  localSeoData: {
    areaServed: ['Cork'],
    geoPrecision: 'city',
    serviceType: 'Premium barber services',
  },
  desiredLuxuryLevel: 'editorial',
  visualIntensity: 'cinematic',
  photographyStyle: 'Low-light portraiture, reflective surfaces, and warmer interior detail.',
  atmosphereKeywords: ['warm brass', 'shadowed mirrors', 'tailored silhouettes', 'quiet night energy'],
  preferredContrast: 'high',
  sectionDensityPreference: 'airy',
  proofPoints: [
    'Measured appointments with attention to shape, texture, and finishing.',
    'Tailored cut and beard work with a calmer studio rhythm.',
    'A darker Cork atmosphere built for clients who value detail.',
  ],
  heroSignature: 'A darker, more considered barber experience with quiet confidence at its core.',
  materialFinish: 'Charcoal lacquer, warm bronze trim, and smoke ivory type.',
  imageTreatment: 'Film grain, metallic edge lines, and restrained glow.',
};
