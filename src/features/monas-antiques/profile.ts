import type { MonaAntiquesBlockCtaCopy } from './content';
import { monasAntiquesDataFallbackCopy } from './content';

export type MonaAntiquesResolvedCtaKind = 'internal' | 'external' | 'phone' | 'email';

export interface MonaAntiquesResolvedCta {
  label: string;
  href: string;
  note: string;
  kind: MonaAntiquesResolvedCtaKind;
}

export const monasAntiquesBusinessProfile = {
  summary:
    "A small Cork boutique built around antique jewellery, quieter browsing, and the kind of distinctive pieces that make more sense in person than in a dense online catalogue.",
  location: {
    streetAddress: '79 Oliver Plunkett Street',
    city: 'Cork',
    county: 'County Cork',
    country: 'Ireland',
    shortLabel: '79 Oliver Plunkett Street, Cork',
    longLabel: '79 Oliver Plunkett Street, Cork, County Cork, Ireland',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=79%20Oliver%20Plunkett%20Street%2C%20Cork%2C%20County%20Cork%2C%20Ireland',
    locationContext:
      'Oliver Plunkett Street gives the shop a recognisable city-centre setting and a straightforward route for a planned stop-in.',
    verification: {
      confidence: 'high',
      notes:
        "Address and phone were cross-checked against public gallery and directory listings for Mona's Antiques in Cork.",
      sources: [
        {
          label: 'All The Galleries',
          url: 'https://www.allthegalleries.com/dealers/monas-antiques-2587.html',
        },
        {
          label: 'Golden Pages',
          url: 'https://www.goldenpages.ie/monas-antiques-cork-city/',
        },
        {
          label: 'Collect Ireland',
          url: 'https://www.collectireland.com/monas-antiques/',
        },
      ],
    },
  },
  contact: {
    phone: '(021) 427 8171',
    callHref: 'tel:+353214278171',
    email: null,
    emailHref: null,
    bestContactNote:
      'For the current selection or a planned visit, a direct call remains the clearest route.',
  },
  visit: {
    openingHours: null,
    openingHoursNote: monasAntiquesDataFallbackCopy.openingHours,
    selectionNote: monasAntiquesDataFallbackCopy.availability,
  },
} as const;

export function resolveMonasAntiquesCta(
  cta?: MonaAntiquesBlockCtaCopy | null,
): MonaAntiquesResolvedCta | null {
  if (!cta) return null;

  switch (cta.availability) {
    case 'always':
      if (!cta.href) return null;

      return {
        label: cta.label,
        href: cta.href,
        note: cta.note,
        kind: cta.href.startsWith('http') ? 'external' : 'internal',
      };

    case 'requires-phone':
      if (!monasAntiquesBusinessProfile.contact.callHref) return null;

      return {
        label: cta.label,
        href: monasAntiquesBusinessProfile.contact.callHref,
        note: cta.note,
        kind: 'phone',
      };

    case 'requires-directions-url':
      if (!monasAntiquesBusinessProfile.location.directionsUrl) return null;

      return {
        label: cta.label,
        href: monasAntiquesBusinessProfile.location.directionsUrl,
        note: cta.note,
        kind: 'external',
      };

    case 'requires-email-or-form':
      if (!monasAntiquesBusinessProfile.contact.emailHref) return null;

      return {
        label: cta.label,
        href: monasAntiquesBusinessProfile.contact.emailHref,
        note: cta.note,
        kind: 'email',
      };

    default:
      return null;
  }
}
