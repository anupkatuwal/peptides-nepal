// Dashain–Tihar 2026 offer: 10% off HGH / Somatropin products with code DASHAIN10.
// Ends at the close of Bhai Tika (the last day of Tihar), Wednesday 11 November 2026,
// Nepal time. After that the banner disappears and the code stops working by itself.
export const FESTIVE_OFFER = {
  code: 'DASHAIN10',
  percent: 10,
  category: 'hgh',
  categoryLabel: 'HGH / Somatropin',
  endsAt: new Date('2026-11-11T23:59:59+05:45'),
  endsLabel: '11 November (Bhai Tika)',
} as const;

export const isFestiveOfferActive = (now: Date = new Date()): boolean =>
  now.getTime() <= FESTIVE_OFFER.endsAt.getTime();
