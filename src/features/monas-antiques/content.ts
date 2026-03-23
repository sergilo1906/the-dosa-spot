import type { MonaAntiquesImageSlot } from './images';
import {
  monasAntiquesRoutes,
  type MonaAntiquesPageBlockBlueprint,
  type MonaAntiquesPageId,
} from './architecture';

export type MonaAntiquesCtaAvailability =
  | 'always'
  | 'requires-phone'
  | 'requires-directions-url'
  | 'requires-email-or-form';

export interface MonaAntiquesToneGuide {
  formality: string;
  warmth: string;
  sophistication: string;
  closeness: string;
  density: string;
  headlineStyle: string;
  paragraphStyle: string;
  ctaStyle: string;
  avoid: string[];
}

export interface MonaAntiquesBlockCtaCopy {
  label: string;
  href: string | null;
  availability: MonaAntiquesCtaAvailability;
  note: string;
}

export interface MonaAntiquesCardCopy {
  eyebrow?: string;
  title: string;
  body: string;
  caption?: string;
  imageSlot?: MonaAntiquesImageSlot | null;
}

export interface MonaAntiquesBlockCopy {
  eyebrow?: string;
  title: string;
  supportingCopy?: string;
  body: string;
  primaryCta?: MonaAntiquesBlockCtaCopy | null;
  secondaryCta?: MonaAntiquesBlockCtaCopy | null;
  cards?: MonaAntiquesCardCopy[];
  microcopy?: string[];
}

export interface MonaAntiquesPageCopy {
  pageEyebrow: string;
  pageTitle: string;
  pageSupportingCopy: string;
  pageBody: string;
  blocks: Record<string, MonaAntiquesBlockCopy>;
}

function internalCta(label: string, href: string, note: string): MonaAntiquesBlockCtaCopy {
  return {
    label,
    href,
    availability: 'always',
    note,
  };
}

function conditionalCta(
  label: string,
  availability: Exclude<MonaAntiquesCtaAvailability, 'always'>,
  note: string,
): MonaAntiquesBlockCtaCopy {
  return {
    label,
    href: null,
    availability,
    note,
  };
}

export const monasAntiquesToneGuide = {
  formality: 'Medium-high. Polite, composed, and editorial, without sounding stiff or ceremonial.',
  warmth: 'Measured warmth. Inviting and human, but never chatty or overfamiliar.',
  sophistication: 'High but restrained. Refined language, low hype, no luxury cliches.',
  closeness: 'Local and personal. The copy should feel like guidance from a well-kept shop, not a campaign voice.',
  density: 'Concise. Most paragraphs should sit between one and three short sentences.',
  headlineStyle: 'Short, elegant, and legible. Aim for 4 to 8 words where possible and avoid stacked adjectives.',
  paragraphStyle:
    'Clean supporting paragraphs with one clear idea each. Prefer 18 to 45 words rather than long atmospheric passages.',
  ctaStyle: 'Literal, calm, and visit-led. Use verbs like Explore, Visit, Plan, Call, or Enquire.',
  avoid: [
    'Do not invent provenance, dates, founder history, or years in business.',
    'Do not imply live stock, online checkout, or a full ecommerce catalogue.',
    'Do not sound like a corporate luxury jewellery brand.',
    'Do not overuse words like curated, timeless, exquisite, or exceptional in the same page.',
    'Do not use urgency or pushy conversion language.',
  ],
} as const satisfies MonaAntiquesToneGuide;

export const monasAntiquesDataFallbackCopy = {
  openingHours: 'Opening details can change, so please contact the shop directly for the latest information before making a special trip.',
  availability: 'Availability changes with the current selection, and some pieces may naturally be one-off finds.',
  enquiry:
    'For current pieces or a more specific enquiry, direct contact remains the clearest route.',
  directions:
    'If a verified directions link is available, it can sit here. If not, the page should rely on clear address copy and storefront context rather than a filler map.',
  email:
    'Only show an email CTA if a verified address is available. Otherwise keep the contact path phone-led or visit-led.',
} as const;

export const monasAntiquesContent: Record<MonaAntiquesPageId, MonaAntiquesPageCopy> = {
  home: {
    pageEyebrow: 'Oliver Plunkett Street, Cork',
    pageTitle: 'Antique jewellery, chosen with character.',
    pageSupportingCopy:
      'A small Cork boutique for antique and vintage pieces that feel distinctive, personal, and best seen in person.',
    pageBody:
      "Mona's should read as a quieter kind of jewellery shop: intimate, considered, and a long way from a generic luxury counter or a mass online catalogue.",
    blocks: {
      'home-hero': {
        eyebrow: 'Oliver Plunkett Street, Cork',
        title: 'Antique jewellery, chosen with character.',
        supportingCopy:
          'A small Cork boutique for antique and vintage pieces that feel distinctive, personal, and best seen in person.',
        body:
          "Mona's is the kind of shop you browse slowly. The selection matters, but so does the atmosphere of the visit: intimate, considered, and quietly confident.",
        primaryCta: internalCta('Explore the Collection', monasAntiquesRoutes.collection, 'Primary route from tone-setting into selection.'),
        secondaryCta: internalCta('Plan Your Visit', monasAntiquesRoutes.visit, 'Secondary route for visitors who are already deciding when to stop by.'),
        microcopy: [
          monasAntiquesDataFallbackCopy.availability,
          'The collection is best understood in person rather than as a fixed online list.',
        ],
      },
      'home-curated-highlights': {
        eyebrow: 'Curated Highlights',
        title: 'Why the shop feels different',
        supportingCopy: 'A boutique read in three short notes.',
        body: 'The appeal is not scale. It is the feeling that the selection has been edited with care.',
        primaryCta: internalCta('View Collection', monasAntiquesRoutes.collection, 'Use this CTA after the first explanation of what makes the boutique distinctive.'),
        cards: [
          {
            eyebrow: 'Distinctive finds',
            title: 'Pieces with presence',
            body:
              'Antique and vintage jewellery with more character than a standard run of familiar high-street styles.',
          },
          {
            eyebrow: 'In-store discovery',
            title: 'A slower browse',
            body:
              'The pleasure is in looking closely, asking, comparing, and finding something that feels personal rather than generic.',
          },
          {
            eyebrow: 'Cork boutique',
            title: 'A real local stop',
            body:
              'The experience begins at the storefront and carries through the display cases, not through a polished online checkout flow.',
          },
        ],
      },
      'home-boutique-trust': {
        eyebrow: 'The Boutique',
        title: 'A small shop with a clear point of view',
        supportingCopy: 'Physical, local, and easy to understand at first glance.',
        body:
          "Mona's should feel grounded and credible: a real shop on Oliver Plunkett Street, a compact display environment, and a quieter sense of confidence.",
        primaryCta: internalCta('Visit & Enquiries', monasAntiquesRoutes.visit, 'This block should transition from atmosphere into practical confidence.'),
        cards: [
          {
            eyebrow: 'Street presence',
            title: 'Easy to recognise',
            body:
              'The storefront gives the shop a clear local identity and makes the visit feel tangible from the outset.',
            imageSlot: 'storefrontMain',
          },
          {
            eyebrow: 'Display rhythm',
            title: 'Curated, not crowded',
            body:
              'Drawers, trays, and smaller displays suggest selection rather than volume, which suits the boutique tone better.',
            imageSlot: 'collection01',
          },
          {
            eyebrow: 'Best route',
            title: 'Visit or enquire directly',
            body:
              'For the latest information, direct contact or an in-person visit is more useful than pretending to show live stock online.',
          },
        ],
        microcopy: [monasAntiquesDataFallbackCopy.enquiry],
      },
      'home-selected-pieces': {
        eyebrow: 'Selected Pieces',
        title: 'A glimpse of the collection',
        supportingCopy: 'Enough to set the tone, without turning the page into a catalogue.',
        body:
          'The page should show shape, texture, and atmosphere. It does not need to mimic a full product grid to feel credible.',
        primaryCta: internalCta('See More Pieces', monasAntiquesRoutes.collection, 'Move from home-page preview into the fuller collection page.'),
        cards: [
          {
            eyebrow: 'Display detail',
            title: 'Drawers, trays, and smaller finds',
            body: 'Objects and setting should feel part of the experience, not just a neutral backdrop.',
            imageSlot: 'collection01',
          },
          {
            eyebrow: 'Pearls & classic forms',
            title: 'Softness, light, and older elegance',
            body: 'A gentler frame for pieces that feel timeless without becoming overly formal.',
            imageSlot: 'collection02',
          },
          {
            eyebrow: 'Statement note',
            title: 'Darker stones, stronger character',
            body: 'One or two bolder frames keep the selection from feeling too delicate or too samey.',
            imageSlot: 'collection03',
          },
          {
            eyebrow: 'Still-life mood',
            title: 'Editorial, but still believable',
            body: 'Support imagery should carry the boutique world without drifting into fashion-campaign artifice.',
            imageSlot: 'collection04',
          },
        ],
        microcopy: [
          monasAntiquesDataFallbackCopy.availability,
          'This is a visual edit, not a complete stock view.',
        ],
      },
      'home-visit-shop': {
        eyebrow: 'Visit the Shop',
        title: 'Best seen in person',
        supportingCopy: 'A boutique like this makes the most sense on the street and in the cases.',
        body:
          'If you are planning a visit or hoping to see a certain kind of piece, the clearest route is still to stop by or make a simple direct enquiry before making a special trip.',
        primaryCta: internalCta('Plan Your Visit', monasAntiquesRoutes.visit, 'Primary home-page visit action.'),
        secondaryCta: internalCta('Visit & Enquiries', monasAntiquesRoutes.visit, 'Fallback internal route when a direct phone CTA is not yet confirmed.'),
        microcopy: [monasAntiquesDataFallbackCopy.availability],
      },
      'home-final-cta': {
        eyebrow: 'A quieter kind of jewellery shop',
        title: "Visit Mona's in Cork",
        supportingCopy: 'Browse the collection in person or get in touch before you call by.',
        body: 'The close should feel calm, clear, and useful rather than urgent.',
        primaryCta: internalCta('Visit & Enquiries', monasAntiquesRoutes.visit, 'Final practical CTA from the home page.'),
        secondaryCta: internalCta('Explore the Collection', monasAntiquesRoutes.collection, 'Secondary browse route for visitors still in inspiration mode.'),
        microcopy: ['Small shop. Distinctive finds. Clear next step.'],
      },
    },
  },
  collection: {
    pageEyebrow: 'Collection',
    pageTitle: 'A curated view of the collection',
    pageSupportingCopy: 'Gallery-like rather than stock-led, and designed to suggest the feel of the shop.',
    pageBody:
      "This page should show enough range to feel convincing, but never so much that Mona's starts reading like a large retail catalogue.",
    blocks: {
      'collection-intro': {
        eyebrow: 'Collection',
        title: 'A curated view of the collection',
        supportingCopy: 'Gallery-like rather than stock-led, and designed to suggest the feel of the shop.',
        body:
          'This is a page for atmosphere, character, and a sense of range. It should not imply a fixed online inventory or a full ecommerce catalogue.',
        primaryCta: internalCta('Plan Your Visit', monasAntiquesRoutes.visit, 'Move from browsing intent to practical in-store intent.'),
        microcopy: ['Think selection, not endless stock.'],
      },
      'collection-grid': {
        eyebrow: 'Selected Pieces',
        title: 'A considered edit',
        supportingCopy: 'Portraits, details, and display moments held in one visual rhythm.',
        body:
          "A smaller number of stronger frames will always suit Mona's better than a dense wall of products. The page should feel like a viewing room, not a filterable shop grid.",
        cards: [
          {
            eyebrow: 'Cabinet details',
            title: 'Smaller finds, seen properly',
            body: 'Use display-led frames to show how the shop presents detail and scale.',
            imageSlot: 'collection01',
          },
          {
            eyebrow: 'Pearl note',
            title: 'Softer and more classical',
            body: 'This part of the page gives the collection a gentler, more timeless read.',
            imageSlot: 'collection02',
          },
          {
            eyebrow: 'Statement piece',
            title: 'A little more drama',
            body: 'One stronger frame keeps the mix from feeling too safe or overly decorative.',
            imageSlot: 'collection03',
          },
          {
            eyebrow: 'Still-life support',
            title: 'Mood around the pieces',
            body: 'Use ambience and object styling to reinforce the boutique world without overpowering the jewellery.',
            imageSlot: 'collection04',
          },
        ],
        microcopy: ['Suggested grid labels: Rings & stones, Pearls & detail, Cabinet moments, Still-life notes.'],
      },
      'collection-availability': {
        eyebrow: 'Please Note',
        title: 'Availability changes in store',
        supportingCopy: 'This is a curated overview, not a live stock feed.',
        body:
          'Some pieces will naturally be one-off finds, and the mix on display can shift. If you are hoping to see a particular style, it is worth checking directly before making a special trip.',
        primaryCta: internalCta('Ask Before You Visit', monasAntiquesRoutes.visit, 'Use the visit page as the enquiry handoff rather than promising real-time availability.'),
        microcopy: [
          monasAntiquesDataFallbackCopy.availability,
          'Current pieces are best confirmed directly.',
        ],
      },
      'collection-final-cta': {
        eyebrow: 'See it properly',
        title: 'Plan a visit to the shop',
        supportingCopy: 'The full character of the selection is best understood in person.',
        body:
          'Use the visit page for location, practical details, and the simplest route to make an enquiry about the current selection.',
        primaryCta: internalCta('Plan Your Visit', monasAntiquesRoutes.visit, 'Close the collection page on a physical-shop next step.'),
        secondaryCta: internalCta('Visit & Enquiries', monasAntiquesRoutes.visit, 'Quiet backup action if the page needs two buttons later.'),
      },
    },
  },
  about: {
    pageEyebrow: 'About the Shop',
    pageTitle: 'A small Cork shop with character',
    pageSupportingCopy: 'The appeal is in the feel of the browse as much as in any single piece.',
    pageBody:
      "This page should build confidence without slipping into invented backstory. Mona's should feel physical, local, and quietly distinctive.",
    blocks: {
      'about-intro': {
        eyebrow: 'About the Shop',
        title: 'A small Cork shop with character',
        supportingCopy: 'The appeal is in the feel of the browse as much as in any single piece.',
        body:
          "Mona's should read as a physical boutique first: intimate, distinctive, and quietly confident rather than broad, loud, or over-produced.",
        primaryCta: internalCta('View Collection', monasAntiquesRoutes.collection, 'Let the about page still route toward the collection.'),
      },
      'about-storefront': {
        eyebrow: 'From the Street',
        title: 'Easy to find, better to step into',
        supportingCopy: 'The storefront gives the shop a clear local presence on Oliver Plunkett Street.',
        body:
          'From there, the tone moves inside: drawers, trays, smaller displays, and the kind of arrangement that rewards a slower look.',
        primaryCta: internalCta('Plan Your Visit', monasAntiquesRoutes.visit, 'Use the storefront block to connect identity with visit intent.'),
        microcopy: ['The shop should feel recognisable before it feels glamorous.'],
      },
      'about-special': {
        eyebrow: 'What Stands Out',
        title: 'Curated rather than crowded',
        supportingCopy: 'Selection, display, and pace should all feel considered.',
        body:
          'The boutique value is in the edit: a distinctive mix of pieces, a calmer browsing rhythm, and a display style that feels personal rather than generic.',
        cards: [
          {
            eyebrow: 'Selection',
            title: 'One-off character',
            body: 'Pieces should feel chosen for individuality, not for volume or uniformity.',
          },
          {
            eyebrow: 'Atmosphere',
            title: 'A calmer pace',
            body: 'The visit should feel slower, quieter, and more attentive than a broad luxury showroom.',
          },
          {
            eyebrow: 'Display',
            title: 'Small details matter',
            body: 'Cases, mirrors, trays, and arrangement all contribute to the experience of the shop.',
          },
        ],
      },
      'about-trust': {
        eyebrow: 'Why It Feels Credible',
        title: 'A boutique, not a showroom',
        supportingCopy: 'Local, physical, and grounded in the in-store experience.',
        body:
          'Trust comes from the shop itself: a real address, a recognisable frontage, and a browsing experience that feels considered rather than theatrical.',
        primaryCta: internalCta('Visit & Enquiries', monasAntiquesRoutes.visit, 'Use the about page to move naturally into practical next steps.'),
        microcopy: [monasAntiquesDataFallbackCopy.enquiry],
      },
      'about-visit-reinforcement': {
        eyebrow: 'Visit',
        title: 'See the shop for yourself',
        supportingCopy: 'Use the visit page for the practical details.',
        body:
          'If you are planning to stop by or want to ask about the current selection, the next step should stay simple and direct.',
        primaryCta: internalCta('Plan Your Visit', monasAntiquesRoutes.visit, 'Primary close from the about page.'),
        secondaryCta: internalCta('Explore the Collection', monasAntiquesRoutes.collection, 'Secondary route back into the selection page.'),
      },
    },
  },
  visit: {
    pageEyebrow: 'Visit & Enquiries',
    pageTitle: "Visit Mona's in Cork",
    pageSupportingCopy: 'A clear page for location, practical details, and simple shop enquiries.',
    pageBody:
      'This should be the most straightforward page in the set: where to go, how to get in touch, and how to check the latest details before a visit.',
    blocks: {
      'visit-header': {
        eyebrow: 'Visit & Enquiries',
        title: "Visit Mona's in Cork",
        supportingCopy: 'A clear page for location, practical details, and simple shop enquiries.',
        body:
          'This page should stay practical and low-friction, with calm language around visiting, calling, or checking the latest information before making a special trip.',
        primaryCta: conditionalCta('Get Directions', 'requires-directions-url', 'Render only when a verified directions URL is available.'),
        secondaryCta: conditionalCta('Call the Shop', 'requires-phone', 'Render only when a verified phone number is available.'),
      },
      'visit-details': {
        eyebrow: 'Location & Contact',
        title: 'Keep the essentials together',
        supportingCopy: 'Address, phone, and opening information should sit in one trustworthy place.',
        body:
          "Mona's Antiques is on Oliver Plunkett Street in Cork. If you are making a specific trip, it is sensible to check the latest practical details directly with the shop.",
        primaryCta: conditionalCta('Call the Shop', 'requires-phone', 'Use as the main action here when a phone number is verified.'),
        microcopy: [
          monasAntiquesDataFallbackCopy.openingHours,
          'Opening information should be omitted entirely rather than guessed.',
        ],
      },
      'visit-map': {
        eyebrow: 'Finding the Shop',
        title: 'Directions should be practical',
        supportingCopy: 'Use a map only when the route data is verified.',
        body:
          'If a verified directions link or map is available, this is where it should sit. If not, the page should lean on clear location copy and storefront context rather than a decorative embed.',
        primaryCta: conditionalCta('Open Directions', 'requires-directions-url', 'Only render when the external directions route is verified.'),
        microcopy: [monasAntiquesDataFallbackCopy.directions],
      },
      'visit-enquiry': {
        eyebrow: 'Enquiries',
        title: 'Simple enquiries work best',
        supportingCopy: 'Keep the contact path light and direct.',
        body:
          'The most useful questions are usually the simplest ones: whether it is a good time to call in, or whether the current selection includes the kind of piece you have in mind.',
        primaryCta: conditionalCta('Make an Enquiry', 'requires-email-or-form', 'Use only if a verified email address or enquiry form exists in Mona-only data.'),
        secondaryCta: conditionalCta('Call the Shop', 'requires-phone', 'Fallback contact action if phone is confirmed before email or form.'),
        microcopy: [
          monasAntiquesDataFallbackCopy.enquiry,
          monasAntiquesDataFallbackCopy.email,
        ],
      },
      'visit-final-cta': {
        eyebrow: 'Before You Visit',
        title: 'Plan your stop at the shop',
        supportingCopy: 'Browse in person, or get in touch before you call by.',
        body:
          'The close should feel helpful and unrushed, with one clear next step and no invented urgency.',
        primaryCta: conditionalCta('Open Directions', 'requires-directions-url', 'Preferred final CTA if directions are available.'),
        secondaryCta: conditionalCta('Call the Shop', 'requires-phone', 'Use as the practical fallback if directions are not available.'),
        microcopy: [monasAntiquesDataFallbackCopy.openingHours],
      },
    },
  },
};

export function getMonasAntiquesPageCopy(pageId: MonaAntiquesPageId) {
  return monasAntiquesContent[pageId];
}

export function getMonasAntiquesBlockCopy(
  pageId: MonaAntiquesPageId,
  blockId: MonaAntiquesPageBlockBlueprint['id'],
) {
  return monasAntiquesContent[pageId].blocks[blockId];
}
