export interface DemoScopeRoute {
  pathname: string;
  robots: 'noindex, nofollow';
}

export interface MonaAntiquesScope {
  slug: string;
  businessName: string;
  businessCategory: string;
  futureNiche: 'retail-shop';
  status: 'placeholder' | 'design-lock' | 'architecture-lock' | 'content-lock' | 'demo-implemented';
  imageDelivery: 'browser-native-remote-img';
  route: DemoScopeRoute;
  paths: {
    featureRoot: string;
    imageMapFile: string;
    contentFile: string;
    businessProfileFile: string;
    themeConfigFile: string;
    themeStylesheet: string;
    architectureFile: string;
    blueprintComponent: string;
    livePageComponent: string;
    pageEntry: string;
    futureBusinessInputRoot: string;
    futurePublicAssetRoot: string;
  };
  guardrails: string[];
}

export const monasAntiquesScope = {
  slug: 'monas-antiques',
  businessName: "Mona's Antiques",
  businessCategory: 'antique jewellery / antiques boutique',
  futureNiche: 'retail-shop',
  status: 'demo-implemented',
  imageDelivery: 'browser-native-remote-img',
  route: {
    pathname: '/demo/monas-antiques/',
    robots: 'noindex, nofollow',
  },
  paths: {
    featureRoot: 'src/features/monas-antiques/',
    imageMapFile: 'src/features/monas-antiques/images.ts',
    contentFile: 'src/features/monas-antiques/content.ts',
    businessProfileFile: 'src/features/monas-antiques/profile.ts',
    themeConfigFile: 'src/features/monas-antiques/theme.ts',
    themeStylesheet: 'src/features/monas-antiques/theme.css',
    architectureFile: 'src/features/monas-antiques/architecture.ts',
    blueprintComponent: 'src/features/monas-antiques/BlueprintPage.astro',
    livePageComponent: 'src/features/monas-antiques/DemoPage.astro',
    pageEntry: 'src/pages/demo/monas-antiques.astro',
    futureBusinessInputRoot: 'business-input/monas-antiques/',
    futurePublicAssetRoot: 'public/businesses/monas-antiques/',
  },
  guardrails: [
    'Do not register Mona in src/data/preset-definitions.ts until a full business package exists.',
    'Do not create business-input/monas-antiques/ until the onboarding pipeline is ready to run end to end.',
    'Keep Mona-specific copy, assets, and future components inside src/features/monas-antiques/ or its planned public/businesses path.',
    'Keep Mona on plain <img> remote URLs unless a later block explicitly needs Astro image optimization.',
    'Apply Mona visuals through the theme-monas wrapper and Mona-only classes; do not override root tokens globally.',
    'Treat the current routes as Mona-only demo routes: no final SEO claims, no client-validated copy claims, and no shared-brand data.',
    'Use profile.ts to resolve phone and directions CTAs instead of hardcoding practical links into shared components.',
  ],
} as const satisfies MonaAntiquesScope;
