// Which products need a valid doctor's prescription before they are dispatched.
//
// Growth hormone (somatropin) and the GLP-1 family (semaglutide, tirzepatide,
// retatrutide) are prescription medicines. The shop shows a notice on these
// products and asks the buyer to confirm at checkout that they hold a valid
// prescription and will share it before dispatch.
//
// Plain JS-compatible types so scripts/build-products.mjs can load it through Vite.

type RxCheckable = { category?: string; slug?: string; name?: string };

const RX_CATEGORIES = new Set(['hgh', 'metabolic']);
const RX_NAME = /(somatropin|growth hormone|\bhgh\b|semaglutide|tirzepatide|retatrutide)/i;
const INVESTIGATIONAL = /retatrutide/i;

export const isPrescriptionOnly = (p: RxCheckable): boolean =>
  RX_CATEGORIES.has(p.category ?? '') || RX_NAME.test(`${p.slug ?? ''} ${p.name ?? ''}`);

// Retatrutide is still in clinical trials and is not approved anywhere yet.
export const isInvestigational = (p: RxCheckable): boolean =>
  INVESTIGATIONAL.test(`${p.slug ?? ''} ${p.name ?? ''}`);

export const RX_SHORT = 'Valid prescription required';

export const rxNotice = (p: RxCheckable): string =>
  isInvestigational(p)
    ? 'Valid prescription required. Retatrutide is an investigational medicine: it is still in clinical trials and not approved by any regulator. Orders are dispatched only after a valid prescription from a registered doctor is received.'
    : 'Valid prescription required. This is a prescription medicine. Orders are dispatched only after a valid prescription from a registered doctor is received.';
