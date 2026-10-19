// Catalogue corrections applied on top of whatever the store loads (the code
// catalogue, this browser's cached copy, or the products in Firestore).
// Firestore still holds the old documents until the admin deletes or edits
// them, so without this the shop would keep showing them.

import { Product } from '../types';

// Removed duplicate listings -> the listing that replaces each one.
export const RETIRED_PRODUCTS: Record<string, { replacedBySlug: string; slug: string }> = {
  // Denik's HGH is sold as Ototropin; "Denik Somatropin HGH" was the same kit.
  'prod-denik-hgh-100iu': { slug: 'denik-somatropin-hgh-100iu-kit', replacedBySlug: 'denik-pharma-ototropin-100iu' },
  // Two listings for the same Denik BPC-157 vial; "Denik BPC" has the right price.
  'prod-denik-bpc157-vial': { slug: 'denik-bpc-157-lyophilized-vial', replacedBySlug: 'denik-bpc' },
};

// Name fixes. Applied only while the stored name is still the old one, so a
// later edit in the admin dashboard wins.
const RENAMED: Record<string, { from: string; to: string }> = {
  'prod-potencia-ghrp-kit': { from: 'Potencia Biotech GHRP Kit', to: 'Potencia Biotech GHRP-2 Kit' },
};

const RETIRED_SLUGS: Record<string, string> = Object.fromEntries(
  Object.values(RETIRED_PRODUCTS).map(r => [r.slug, r.replacedBySlug])
);

// Old links to a removed listing open the listing that replaced it.
export const resolveProductSlug = (slug: string): string => RETIRED_SLUGS[slug] ?? slug;

export const applyCatalogueFixes = <T extends Pick<Product, 'id' | 'name'>>(products: T[]): T[] =>
  products
    .filter(p => !RETIRED_PRODUCTS[p.id])
    .map(p => {
      const fix = RENAMED[p.id];
      return fix && p.name === fix.from ? { ...p, name: fix.to } : p;
    });
