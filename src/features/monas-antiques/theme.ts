export interface MonaAntiquesAuditItem {
  label: string;
  reason: string;
}

export interface MonaAntiquesPaletteToken {
  label: string;
  value: string;
  role: string;
}

export const monasAntiquesVisualAudit = {
  safeSharedElements: [
    {
      label: 'Base typography stack',
      reason:
        "The project already ships Instrument Serif and Bricolage Grotesque, which suit Mona's without adding new global font risk.",
    },
    {
      label: 'Section container rhythm',
      reason:
        'The existing section shell and spacing variables are structural, not business-specific, so they are safe to inherit through scoped variables.',
    },
    {
      label: 'Simple image rendering',
      reason:
        'Remote images already render through plain <img> tags, so Mona can keep its own media language without changing the shared asset pipeline.',
    },
    {
      label: 'Base head and layout plumbing',
      reason:
        'BaseLayout and BaseHead remain safe for Mona as long as branding, tokens, and visual classes stay inside a Mona-only wrapper.',
    },
  ] satisfies MonaAntiquesAuditItem[],
  needsScopedVariant: [
    {
      label: 'panel-luxe family',
      reason:
        'The panel surfaces are hard-coded to the current noir-bronze hospitality palette, so Mona needs its own panel classes.',
    },
    {
      label: 'button-luxe and button-ghost',
      reason:
        'The current buttons are strongly tied to the bronze gradient look and rounded pill behavior of the active demo.',
    },
    {
      label: 'Hero, services, about, CTA, and gallery section styling',
      reason:
        'The shared section components are visually capable but their framing remains restaurant-first or operationally generic.',
    },
    {
      label: 'Gallery labels and copy framing',
      reason:
        'Labels like "Selected plates" and menu-driven framing would misposition Mona unless replaced with a retail-specific variant.',
    },
  ] satisfies MonaAntiquesAuditItem[],
  highRiskZones: [
    {
      label: 'src/styles/tokens.css',
      reason:
        'Root tokens define the live palette for the whole site. Editing them would recolor every existing page immediately.',
    },
    {
      label: 'src/styles/global.css',
      reason:
        'Most decorative surfaces and buttons are hard-coded here; changing them globally would produce instant regressions.',
    },
    {
      label: 'BaseLayout html theme class',
      reason:
        'The global html theme is currently fixed to theme-noir-bronze, so Mona must override visually inside its own wrapper instead of changing the layout.',
    },
    {
      label: 'Shared section copy and visual labels',
      reason:
        'Several shared components still assume food, services, or booking language and should not be repurposed blindly for Mona.',
    },
  ] satisfies MonaAntiquesAuditItem[],
} as const;

export const monasAntiquesPalette = {
  backgroundMain: {
    label: 'Background main',
    value: '#f3ece3',
    role: 'Primary parchment canvas for most sections.',
  },
  backgroundSecondary: {
    label: 'Background secondary',
    value: '#e7ddd0',
    role: 'Alternate paper surface for soft section shifts and cards.',
  },
  textPrimary: {
    label: 'Text primary',
    value: '#24171b',
    role: 'Main reading color; softer than pure black and better for heritage tone.',
  },
  textSecondary: {
    label: 'Text secondary',
    value: '#6a5c5f',
    role: 'Secondary copy, supporting notes, captions, and UI hints.',
  },
  accentJewel: {
    label: 'Accent jewel',
    value: '#6c3c49',
    role: 'Primary Mona accent for buttons, emphasis, and jewel moments.',
  },
  accentBrass: {
    label: 'Accent brass',
    value: '#b48a54',
    role: 'Fine linework, badges, separators, and subtle premium highlights.',
  },
  borderLine: {
    label: 'Border / line',
    value: '#cbb8a5',
    role: 'Quiet card borders and frame lines on light surfaces.',
  },
  buttonPrimary: {
    label: 'Button primary',
    value: '#5a2f3b',
    role: 'Primary action fill; deep plum rather than bright luxury gold.',
  },
  buttonHover: {
    label: 'Button hover',
    value: '#45222c',
    role: 'Darker pressed state for the primary action.',
  },
  jewelBlock: {
    label: 'Jewel block',
    value: '#25151b',
    role: 'Selective dark sections for trust, CTA, and hero media emphasis.',
  },
} as const satisfies Record<string, MonaAntiquesPaletteToken>;

export const monasAntiquesPaletteSwatches = Object.entries(monasAntiquesPalette).map(([id, token]) => ({
  id,
  ...token,
}));

export const monasAntiquesTheme = {
  id: 'monas-heritage-editorial',
  label: "Mona's Heritage Editorial",
  wrapperClass: 'theme-monas',
  canvasClass: 'monas-canvas',
  derivedFrom: {
    primaryReference: 'dark-boutique-luxury',
    supportingReference: 'retail-clean-modern',
    rationale:
      'Mona needs the authority and intimacy of the boutique family, but softened onto a parchment-led canvas so the result feels heritage-first rather than nightlife-dark.',
  },
  palette: monasAntiquesPalette,
  typography: {
    displayFamily: "'Instrument Serif', serif",
    bodyFamily: "'Bricolage Grotesque Variable', sans-serif",
    displayWeight: 500,
    sectionTitleWeight: 500,
    cardTitleWeight: 560,
    bodyWeight: 430,
    uiWeight: 500,
    perceivedScale: 'Editorial headlines with restrained body sizing.',
    headlineRule: 'Keep headings between 6 and 11 words whenever possible.',
    bodyMeasure: '60ch',
  },
  spacing: {
    density: 'balanced-airy',
    containerWidth: 'min(100% - 2rem, 88rem)',
    heroWidth: 'min(100% - 2rem, 92rem)',
    sectionGap: 'clamp(4.75rem, 8vw, 7.25rem)',
    contentGap: 'clamp(1rem, 2vw, 1.5rem)',
    cardGap: 'clamp(0.95rem, 1.8vw, 1.35rem)',
    stackGap: 'clamp(1.2rem, 2.2vw, 1.8rem)',
    preferredLayoutFeel: 'Breathable, curated, and selective rather than sparse or dense.',
  },
  tone: {
    ui: 'Quietly premium, editorial, and trust-first.',
    motion: 'Low to medium motion, gentle rise only, no flashy parallax or luxury theatrics.',
    contrast: 'Light-paper canvas with occasional jewel-dark anchors.',
  },
  components: {
    hero: {
      direction:
        'Editorial split hero: serif copy on parchment, one dominant jewellery image, and one smaller storefront trust inset.',
      layoutRule:
        'Do not build a dense collage. Use one main image plus one support image max in the first fold.',
      overlayRule:
        'Captions should sit on a soft bottom gradient with uppercase micro labels and no oversized dark boxes.',
    },
    sectionHeading: {
      direction:
        'Small uppercase eyebrow, serif title, body copy under 36ch, and a thin brass separator only when it helps pacing.',
    },
    collectionCard: {
      direction:
        'Paper or jewel card with thin brass border, soft radius, generous image crop, and short title/caption pair.',
    },
    trustBlock: {
      direction:
        'Use jewel-dark cards with parchment text and quiet brass dividers. Trust should feel selective, not badge-heavy.',
    },
    ctaRow: {
      direction:
        'Two-column invitation row with copy on paper and practical visit/contact data in a darker inset card.',
    },
    buttons: {
      direction:
        'Use softly rounded rectangles, not loud pills. Primary is deep plum, secondary is parchment with border.',
    },
    overlays: {
      direction:
        'Keep overlays soft and cinematic. Avoid solid black slabs, frosted glass, and large neon-tinted masks.',
    },
    badges: {
      direction:
        'Micro-badges should read like museum labels: outline or soft paper fill, uppercase, very restrained.',
    },
    inputs: {
      direction:
        'Paper field, plum-tinted line, 18px radius, brass focus ring, and compact uppercase labels if an enquiry form appears later.',
    },
  },
  imageLanguage: {
    primaryRead: 'Gallery-like editorial with storefront realism as an anchor of trust.',
    cornerStyle: 'Soft rounded corners; avoid razor-sharp catalog boxes.',
    frameStyle: 'Thin brass or ink line plus subtle inner mat where helpful.',
    mixRule:
      'Lead with jewellery macro, support with one storefront proof image early, then use ambience images to bridge between collection and trust sections.',
    avoid:
      'Avoid heavy collage, modern DTC white-box product shots, cold blue lighting, and busy antique-shop clutter.',
  },
  avoid: [
    'Do not push Mona into a sans-only modern retail look.',
    'Do not flood every section with dark jewel blocks; use them as punctuation.',
    'Do not stack too many badges, ratings, and proof pills in one place.',
    'Do not use bright gold gradients, glossy glassmorphism, or oversized luxury effects.',
    'Do not let storefront imagery dominate more than the jewellery story.',
  ],
  implementation: {
    strategy:
      'Apply Mona tokens through a wrapper-scoped CSS variable layer and Mona-only classes. Do not edit root tokens or shared component styling globally.',
    sharedClassesToKeepUsing: ['section-shell'],
    monaOnlyClasses: [
      'theme-monas',
      'monas-canvas',
      'monas-panel',
      'monas-panel--soft',
      'monas-panel--jewel',
      'monas-button',
      'monas-button--primary',
      'monas-button--secondary',
      'monas-frame',
      'monas-chip',
      'monas-rule',
    ],
  },
} as const;

export const monasAntiquesComponentPreview = [
  {
    id: 'hero',
    label: 'Hero',
    summary: monasAntiquesTheme.components.hero.direction,
  },
  {
    id: 'collection',
    label: 'Collection cards',
    summary: monasAntiquesTheme.components.collectionCard.direction,
  },
  {
    id: 'trust',
    label: 'Trust blocks',
    summary: monasAntiquesTheme.components.trustBlock.direction,
  },
  {
    id: 'cta',
    label: 'CTA row',
    summary: monasAntiquesTheme.components.ctaRow.direction,
  },
] as const;

export const monasAntiquesThemeCssVars = {
  '--font-sans': "'Bricolage Grotesque Variable'",
  '--font-display': "'Instrument Serif'",
  '--color-ink': '36 23 27',
  '--color-smoke': '243 236 227',
  '--color-bronze': '180 138 84',
  '--color-ember': '108 60 73',
  '--bg-main': '#f3ece3',
  '--bg-elevated': 'rgba(255, 249, 243, 0.82)',
  '--bg-soft': 'rgba(108, 60, 73, 0.06)',
  '--surface-border': 'rgba(61, 43, 39, 0.14)',
  '--surface-border-strong': 'rgba(180, 138, 84, 0.32)',
  '--text-primary': '#24171b',
  '--text-secondary': 'rgba(36, 23, 27, 0.72)',
  '--text-muted': 'rgba(36, 23, 27, 0.54)',
  '--bronze-main': '#b48a54',
  '--bronze-soft': 'rgba(180, 138, 84, 0.12)',
  '--bronze-strong': '#8a6942',
  '--shadow-deep': '0 28px 90px rgba(45, 28, 28, 0.16)',
  '--shadow-bronze': '0 18px 44px rgba(180, 138, 84, 0.16)',
  '--shadow-hero': '0 40px 120px rgba(37, 21, 27, 0.22)',
  '--shadow-soft': '0 18px 60px rgba(45, 28, 28, 0.08)',
  '--radius-panel': '1.75rem',
  '--radius-card': '1.25rem',
  '--radius-frame': '1.5rem',
  '--radius-pill': '1.125rem',
  '--container-main': 'min(100% - 2rem, 88rem)',
  '--section-gap': 'clamp(4.75rem, 8vw, 7.25rem)',
  '--content-gap': 'clamp(1rem, 2vw, 1.5rem)',
  '--monas-paper': '#f3ece3',
  '--monas-paper-deep': '#e7ddd0',
  '--monas-paper-soft': '#fbf6ef',
  '--monas-ink': '#24171b',
  '--monas-muted': '#6a5c5f',
  '--monas-plum': '#6c3c49',
  '--monas-plum-deep': '#45222c',
  '--monas-brass': '#b48a54',
  '--monas-brass-soft': 'rgba(180, 138, 84, 0.14)',
  '--monas-jewel': '#25151b',
  '--monas-jewel-soft': '#342028',
  '--monas-line': 'rgba(61, 43, 39, 0.14)',
  '--monas-overlay': 'linear-gradient(180deg, rgba(17, 11, 14, 0.02), rgba(17, 11, 14, 0.44))',
} as const;

export function getMonasAntiquesThemeInlineStyle() {
  return Object.entries(monasAntiquesThemeCssVars)
    .map(([token, value]) => `${token}: ${value}`)
    .join('; ');
}

export const monasAntiquesThemeInlineStyle = getMonasAntiquesThemeInlineStyle();
