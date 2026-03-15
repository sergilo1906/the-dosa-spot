import heroPanel from '../../assets/demo/barbers/northside-hero.svg?url';
import detailPanel from '../../assets/demo/barbers/northside-detail.svg?url';
import meshTexture from '../../assets/textures/mesh.svg?url';
import type { BusinessBriefInput } from '../../types/business';

export const northsideSocialStudioInput: BusinessBriefInput = {
  slug: 'northside-social-studio',
  isMockSample: true,
  sampleLabel: 'Mock concept study',
  businessName: 'Northside Social Studio',
  niche: 'barbershop',
  tagline: 'Sharper everyday grooming with a lighter studio rhythm.',
  shortDescription:
    'A contemporary Cork barber studio built around clean shapes, regular upkeep, and a more relaxed premium feel.',
  city: 'Cork',
  country: 'Ireland',
  address: null,
  phone: null,
  email: null,
  website: null,
  openingHours: [],
  coordinates: null,
  socialLinks: [],
  services: [
    {
      title: 'Clean Shape-Up',
      summary: 'Fast tidy-up service built for regulars who want crisp edges without a full session.',
      duration: '25 min',
    },
    {
      title: 'Modern Crop',
      summary: 'Texture-led cut with a softer, younger energy and clean movement through the crown.',
      duration: '45 min',
    },
    {
      title: 'Beard Refresh',
      summary: 'Neck, cheek, and line cleanup to bring everything back into focus.',
      duration: '20 min',
    },
  ],
  faqItems: [
    {
      question: 'Which service works best for regular upkeep?',
      answer:
        'Clean Shape-Up is the quickest route for regular maintenance when you want the edges, neckline, and overall finish brought back into focus without a full session.',
    },
    {
      question: 'What should I book for a softer, more modern finish?',
      answer:
        'Modern Crop is the best starting point if you want cleaner texture, lighter movement through the crown, and a more contemporary finish overall.',
    },
  ],
  realReviews: [],
  imageAssets: [
    {
      id: 'northside-hero',
      src: heroPanel,
      alt: 'Hero artwork for Northside Social Studio with a lighter social energy.',
      kind: 'hero',
      ratio: 'portrait',
      treatment: 'soft contrast',
    },
    {
      id: 'northside-detail',
      src: detailPanel,
      alt: 'Support artwork for Northside Social Studio.',
      kind: 'detail',
      ratio: 'landscape',
      treatment: 'support frame',
    },
    {
      id: 'northside-mesh',
      src: meshTexture,
      alt: 'Mesh texture support visual for the incomplete sample.',
      kind: 'texture',
      ratio: 'square',
      treatment: 'mesh',
    },
  ],
  brandHints: ['social energy', 'clean streetwear polish', 'accessible premium'],
  brandColors: ['#0b0b0b', '#966a47', '#ddd2c2'],
  toneHints: ['friendly', 'lean', 'contemporary'],
  visualMood: 'Low-light social barber studio',
  seoTitle: 'Northside Social Studio | Contemporary Barber in Cork',
  seoDescription:
    'A contemporary barber studio in Cork focused on clean shapes, regular upkeep, and a relaxed premium atmosphere.',
  localSeoData: {
    areaServed: ['Cork'],
    geoPrecision: 'city',
    serviceType: 'Barber services',
  },
  desiredLuxuryLevel: 'elevated',
  visualIntensity: 'bold',
  photographyStyle: 'Minimal editorial portraiture with softer low-light interiors.',
  atmosphereKeywords: ['clean edges', 'social energy', 'soft brass', 'urban calm'],
  preferredContrast: 'balanced',
  sectionDensityPreference: 'balanced',
  proofPoints: [
    'Clean everyday grooming with contemporary detail.',
    'A lighter studio atmosphere with premium polish.',
    'Clear service options for regular upkeep and quick resets.',
  ],
  heroSignature: 'A lighter, more contemporary barber experience built around sharp upkeep and easy confidence.',
  materialFinish: 'Dark graphite, soft bronze, and warm stone text.',
  imageTreatment: 'Minimal grain with editorial framing and lighter contrast.',
};
