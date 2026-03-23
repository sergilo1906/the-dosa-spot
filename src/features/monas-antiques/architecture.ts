import type { MonaAntiquesImageSlot } from './images';
import { monasAntiquesScope } from './scope';

export type MonaAntiquesPageId = 'home' | 'collection' | 'about' | 'visit';
export type MonaAntiquesBlockCriticality = 'critical' | 'recommended' | 'optional';
export type MonaAntiquesBlockComplexity = 'low' | 'medium' | 'high';

export interface MonaAntiquesPageNavItem {
  pageId: MonaAntiquesPageId;
  label: string;
  href: string;
  purpose: string;
}

export interface MonaAntiquesPageBlockBlueprint {
  id: string;
  name: string;
  purpose: string;
  expectedContent: string;
  visualType: string;
  cta: string | null;
  criticality: MonaAntiquesBlockCriticality;
  complexity: MonaAntiquesBlockComplexity;
}

export interface MonaAntiquesPageBlueprint {
  id: MonaAntiquesPageId;
  label: string;
  navLabel: string;
  route: string;
  description: string;
  purpose: string;
  intro: string;
  previewImageSlot: MonaAntiquesImageSlot;
  supportImageSlot?: MonaAntiquesImageSlot | null;
  implementationNotes: string[];
  blocks: MonaAntiquesPageBlockBlueprint[];
}

function monasRoute(segment?: string) {
  const cleanSegment = segment?.trim().replace(/^\/+|\/+$/g, '') ?? '';
  if (!cleanSegment) return monasAntiquesScope.route.pathname;
  return `${monasAntiquesScope.route.pathname}${cleanSegment}/`;
}

export const monasAntiquesRoutes = {
  home: monasRoute(),
  collection: monasRoute('collection'),
  about: monasRoute('about'),
  visit: monasRoute('visit'),
} as const;

export const monasAntiquesNavigation = {
  header: [
    {
      pageId: 'home',
      label: 'Home',
      href: monasAntiquesRoutes.home,
      purpose: 'Set the tone fast and lead into collection and visit intent.',
    },
    {
      pageId: 'collection',
      label: 'Collection',
      href: monasAntiquesRoutes.collection,
      purpose: 'Show a curated selection without drifting into e-commerce behavior.',
    },
    {
      pageId: 'about',
      label: 'About the Shop',
      href: monasAntiquesRoutes.about,
      purpose: 'Explain the boutique feel, trust, and physical-shop character.',
    },
    {
      pageId: 'visit',
      label: 'Visit & Enquiries',
      href: monasAntiquesRoutes.visit,
      purpose: 'Keep practical location and contact actions clear and truthful.',
    },
  ] satisfies MonaAntiquesPageNavItem[],
  headerCta: {
    label: 'Plan Your Visit',
    href: monasAntiquesRoutes.visit,
    purpose: 'Single practical CTA in the header; boutique-simple, not corporate.',
  },
  footer: {
    style: 'repeat-primary-navigation',
    note: 'Repeat the four-page navigation and pair it with practical visit details only. No dense corporate footer.',
  },
} as const;

export const monasAntiquesPages = {
  home: {
    id: 'home',
    label: 'Home',
    navLabel: 'Home',
    route: monasAntiquesRoutes.home,
    description:
      "Architecture scaffold for Mona's Antiques home page. This placeholder locks the page order and content intent without building the final UI yet.",
    purpose: 'Open with atmosphere and trust, then move quickly into selection and in-store visit intent.',
    intro:
      'The home page should feel like the front door of a curated boutique: one strong editorial impression, one real-world trust anchor, and a clear path into collection or visit.',
    previewImageSlot: 'heroMain',
    supportImageSlot: 'storefrontMain',
    implementationNotes: [
      'Use the real storefront early, but only as proof support rather than the dominant hero image.',
      'Keep the home page to six sections max so the experience stays curated instead of sprawling.',
      'Do not introduce fake inventory or fake collector-history claims.',
    ],
    blocks: [
      {
        id: 'home-hero',
        name: 'Hero',
        purpose: 'State the boutique positioning, location, and first emotional cue in one move.',
        expectedContent:
          "Short positioning line, Mona's name, Cork mention, one-line editorial intro, primary CTA to Collection, and secondary CTA to Visit.",
        visualType: 'Hero jewellery image with a smaller storefront proof inset.',
        cta: 'Explore the Collection',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'home-curated-highlights',
        name: 'Curated Highlights',
        purpose: 'Give a fast read of what the shop feels known for without pretending to show the full stock.',
        expectedContent:
          'Three concise highlight cards around one-of-a-kind finds, antique jewellery character, and in-store discovery cues.',
        visualType: 'Collection detail cards with one or two portrait jewellery frames.',
        cta: 'View Collection',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'home-boutique-trust',
        name: 'Boutique / Trust Block',
        purpose: "Reinforce that Mona's is a real physical boutique with local credibility and a curated reputation.",
        expectedContent:
          'Storefront confirmation, review themes, Cork location cues, and a quiet note about in-person browsing or calling ahead.',
        visualType: 'Storefront-led proof card paired with jewel-dark trust cards.',
        cta: 'Visit & Enquiries',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'home-selected-pieces',
        name: 'Selected Pieces',
        purpose: 'Preview the collection in a controlled, editorial way rather than as a retail catalogue wall.',
        expectedContent:
          'Four to six curated frames with short captions, gentle category cues, and an availability note that selection changes in store.',
        visualType: 'Mixed portrait and square jewellery images with ambience support.',
        cta: 'See More Pieces',
        criticality: 'recommended',
        complexity: 'medium',
      },
      {
        id: 'home-visit-shop',
        name: 'Visit the Shop',
        purpose: 'Move from mood into practical visit intent without breaking the boutique tone.',
        expectedContent:
          'Address summary, phone, opening-hours strategy, and one practical line that makes the next step obvious.',
        visualType: 'Storefront or location-support panel with practical data card.',
        cta: 'Plan Your Visit',
        criticality: 'critical',
        complexity: 'low',
      },
      {
        id: 'home-final-cta',
        name: 'Final CTA',
        purpose: 'Close warmly and clearly with one invitation to visit or enquire.',
        expectedContent:
          'Short reassurance line, one primary action, and one quieter fallback action such as call or directions.',
        visualType: 'Single jewel-dark CTA row with minimal supporting copy.',
        cta: 'Visit & Enquiries',
        criticality: 'recommended',
        complexity: 'low',
      },
    ],
  },
  collection: {
    id: 'collection',
    label: 'Collection',
    navLabel: 'Collection',
    route: monasAntiquesRoutes.collection,
    description:
      "Architecture scaffold for Mona's Antiques collection page. This placeholder locks the curated gallery structure without turning it into a shop grid.",
    purpose: 'Show a composed, gallery-like overview of selected pieces without implying live stock or ecommerce behavior.',
    intro:
      'This page should feel like a curated viewing room. The visitor sees enough range to trust the selection, but never so much that the boutique starts reading like a mass retailer.',
    previewImageSlot: 'collection02',
    supportImageSlot: 'collection03',
    implementationNotes: [
      'Do not add a live filter system in the demo. Optional passive chips are fine, but no fake faceted browsing.',
      'Every collection section should reinforce that pieces are one-off or availability-led, not permanently listed stock.',
      'Favor captions and atmosphere over prices or inventory mechanics.',
    ],
    blocks: [
      {
        id: 'collection-intro',
        name: 'Collection Intro',
        purpose: 'Frame the page as a curated overview rather than a shopping category page.',
        expectedContent:
          'Short introduction, one note about one-of-a-kind selection, and a calm expectation that the mix changes over time.',
        visualType: 'Single strong jewellery frame with a restrained intro block.',
        cta: 'Plan Your Visit',
        criticality: 'critical',
        complexity: 'low',
      },
      {
        id: 'collection-grid',
        name: 'Curated Pieces Grid',
        purpose: 'Carry the page with the main selection showcase.',
        expectedContent:
          'Six to eight editorial cards or frames with short captions and gentle grouping by mood or piece type, not by hard taxonomy.',
        visualType: 'Mixed portrait and square grid with jewellery-led crops and occasional ambience support.',
        cta: null,
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'collection-availability',
        name: 'In-Store Availability Note',
        purpose: 'Keep the page truthful about stock, uniqueness, and the reality of a physical boutique.',
        expectedContent:
          'Short note explaining that selection moves, pieces may be one-off, and the best route is to visit or enquire directly.',
        visualType: 'Text-led paper or jewel card with optional small detail image.',
        cta: 'Ask Before You Visit',
        criticality: 'critical',
        complexity: 'low',
      },
      {
        id: 'collection-final-cta',
        name: 'Visit / Enquiry CTA',
        purpose: 'Convert browsing interest into a real-world next step.',
        expectedContent:
          'Brief invitation to visit the shop or call ahead if looking for a particular type of piece.',
        visualType: 'Compact CTA row with one practical data card.',
        cta: 'Visit & Enquiries',
        criticality: 'recommended',
        complexity: 'low',
      },
    ],
  },
  about: {
    id: 'about',
    label: 'About the Shop',
    navLabel: 'About the Shop',
    route: monasAntiquesRoutes.about,
    description:
      "Architecture scaffold for Mona's Antiques about page. This placeholder locks the trust and boutique-story order without inventing a false founder narrative.",
    purpose: 'Reinforce the physical shop, curated point of view, and reasons the boutique feels distinctive.',
    intro:
      "This page is about trust and atmosphere, not mythology. It should explain what kind of boutique Mona's is, what the visit feels like, and why the selection feels worth the stop.",
    previewImageSlot: 'storefrontMain',
    supportImageSlot: 'collection01',
    implementationNotes: [
      'Do not invent a backstory or founder biography that the repo cannot support.',
      'Use real storefront/interior cues to make the shop tangible.',
      'Review themes can support this page later, but only if they stay factual and selective.',
    ],
    blocks: [
      {
        id: 'about-intro',
        name: 'Intro / Positioning',
        purpose: 'Explain the boutique in plain, elegant terms before showing deeper atmosphere or trust.',
        expectedContent:
          "Short positioning statement, Cork context, and a clean explanation of the boutique's curated antique-jewellery feel.",
        visualType: 'Paper-led intro with one supporting image or caption.',
        cta: 'View Collection',
        criticality: 'critical',
        complexity: 'low',
      },
      {
        id: 'about-storefront',
        name: 'Storefront or Space-Led Block',
        purpose: 'Make the physical shop feel real and immediate.',
        expectedContent:
          'Storefront view, interior display cue, and a short paragraph on browsing in person rather than buying from a generic online shelf.',
        visualType: 'Storefront-led frame paired with one interior or display image.',
        cta: 'Plan Your Visit',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'about-special',
        name: 'What Makes the Shop Feel Special',
        purpose: 'Translate the curated value of the boutique into a few scannable proof points.',
        expectedContent:
          'Three or four short cards on one-of-a-kind pieces, editorial atmosphere, considered display, and in-person discovery.',
        visualType: 'Paper or jewel cards with light editorial support imagery.',
        cta: null,
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'about-trust',
        name: 'Boutique Experience / Trust',
        purpose: 'Reinforce the experience people can expect without overstating claims.',
        expectedContent:
          'Selective review themes, reassurance around browsing, and any factual trust cues around local reputation or visit ease.',
        visualType: 'Jewel-dark trust panels with minimal badges.',
        cta: 'Visit & Enquiries',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'about-visit-reinforcement',
        name: 'Location Reinforcement',
        purpose: 'End the page by routing the user back toward the visit decision.',
        expectedContent:
          'Short location reminder, practical contact prompt, and one calm invitation to stop by or enquire.',
        visualType: 'Compact CTA row with practical visit data.',
        cta: 'Plan Your Visit',
        criticality: 'recommended',
        complexity: 'low',
      },
    ],
  },
  visit: {
    id: 'visit',
    label: 'Visit & Enquiries',
    navLabel: 'Visit & Enquiries',
    route: monasAntiquesRoutes.visit,
    description:
      "Architecture scaffold for Mona's Antiques visit page. This placeholder locks the practical structure for address, contact, and enquiry handling.",
    purpose: 'Keep the page clear, practical, and truthful so visiting or enquiring feels easy.',
    intro:
      'This page should be the clearest one in the set. It needs to support directions, contact, and light enquiry without sounding transactional or making unverified claims.',
    previewImageSlot: 'storefrontMain',
    supportImageSlot: 'ambience02',
    implementationNotes: [
      'If opening hours are not fully confirmed in Mona-only data, render a calm call-ahead note instead of fixed hours.',
      'Use a map embed only if the route and location data are verified and safe to maintain. Otherwise prefer a directions link and storefront context.',
      'Do not force a contact form unless there is a truthful enquiry route to support it.',
    ],
    blocks: [
      {
        id: 'visit-header',
        name: 'Visit Header',
        purpose: 'Set the page purpose instantly and route the visitor into practical next steps.',
        expectedContent:
          'Short heading, Cork location framing, and one line explaining that this page is for visiting, calling, or making a simple enquiry.',
        visualType: 'Storefront-led header with clear supporting copy.',
        cta: 'Get Directions',
        criticality: 'critical',
        complexity: 'low',
      },
      {
        id: 'visit-details',
        name: 'Address / Phone / Opening Info Block',
        purpose: 'Concentrate the core practical data in one trustworthy place.',
        expectedContent:
          'Address, phone, opening hours if verified, and a graceful fallback line if hours still need confirmation.',
        visualType: 'Structured information cards with minimal decoration.',
        cta: 'Call the Shop',
        criticality: 'critical',
        complexity: 'low',
      },
      {
        id: 'visit-map',
        name: 'Map or Location Context',
        purpose: 'Help the visitor understand where the shop is without relying on invented detail.',
        expectedContent:
          'Map embed or directions module, storefront reminder, and one short note on finding the shop in context.',
        visualType: 'Map block if verified, otherwise location card with storefront support image.',
        cta: 'Open Directions',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'visit-enquiry',
        name: 'Enquiry / Contact Block',
        purpose: 'Handle lightweight questions about visits or selection without overbuilding a sales funnel.',
        expectedContent:
          'Phone-first contact path, optional email or form only if confirmed later, and a note that specific pieces are best confirmed directly.',
        visualType: 'Calm contact panel with optional simple form treatment.',
        cta: 'Ask About a Visit',
        criticality: 'critical',
        complexity: 'medium',
      },
      {
        id: 'visit-final-cta',
        name: 'Final CTA',
        purpose: 'Close with one last practical invitation and reassurance.',
        expectedContent:
          'Short line encouraging a visit or call ahead, without inventing urgency or pushing transactions.',
        visualType: 'Compact jewel-dark reassurance strip.',
        cta: "Visit Mona's",
        criticality: 'recommended',
        complexity: 'low',
      },
    ],
  },
} as const satisfies Record<MonaAntiquesPageId, MonaAntiquesPageBlueprint>;

export function getMonasAntiquesPageById(pageId: MonaAntiquesPageId) {
  return monasAntiquesPages[pageId];
}

export function getMonasAntiquesAllPages() {
  return Object.values(monasAntiquesPages);
}

export function getMonasAntiquesBlocksByCriticality(criticality: MonaAntiquesBlockCriticality) {
  return getMonasAntiquesAllPages().flatMap((page) =>
    page.blocks
      .filter((block) => block.criticality === criticality)
      .map((block) => ({
        pageId: page.id,
        pageLabel: page.label,
        route: page.route,
        block,
      })),
  );
}
