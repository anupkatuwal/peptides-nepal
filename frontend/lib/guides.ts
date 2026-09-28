export type Guide = {
  slug: string;
  title: string;
  summary: string;
  readingMinutes: number;
  tag: string;
  sections: { heading: string; paragraphs: string[] }[];
  sources: { title: string; url: string }[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-read-a-coa",
    title: "How to read a Certificate of Analysis",
    summary: "What HPLC purity and mass spectrometry tell you, and the four things to check on every lab report.",
    readingMinutes: 4,
    tag: "Lab testing",
    sections: [
      {
        heading: "What a COA is",
        paragraphs: [
          "A Certificate of Analysis (COA) is the lab report for one batch. It lists the tests run on that batch and the results.",
          "Every product page on this site shows the COA for the batch we are selling now. If a batch has not been tested yet, the page says “Lab report pending”.",
        ],
      },
      {
        heading: "HPLC purity",
        paragraphs: [
          "HPLC (high-performance liquid chromatography) pushes the dissolved sample through a packed column. Different molecules leave the column at different times. A detector draws each one as a peak.",
          "Purity is the size of the main peak as a share of all peaks. A result of 99% means 99% of the detected material is the target peptide.",
        ],
      },
      {
        heading: "Mass spectrometry (identity)",
        paragraphs: [
          "Purity says how much of one thing is in the vial. It does not say what that thing is. Mass spectrometry does.",
          "It measures the mass of the molecule. The lab compares that number with the known mass of the peptide’s sequence. A match confirms identity.",
        ],
      },
      {
        heading: "Four checks on every report",
        paragraphs: [
          "1. The batch (lot) number on the COA matches the number on your vial.",
          "2. The peptide name and the expected mass match the product you bought.",
          "3. The report shows both a purity result and an identity result.",
          "4. The lab name and the test date are printed on the report.",
        ],
      },
    ],
    sources: [
      { title: "High-performance liquid chromatography (Wikipedia)", url: "https://en.wikipedia.org/wiki/High-performance_liquid_chromatography" },
      { title: "Mass spectrometry (Wikipedia)", url: "https://en.wikipedia.org/wiki/Mass_spectrometry" },
      { title: "Peptide purity analysis by HPLC (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=peptide+purity+HPLC+analysis" },
    ],
  },
  {
    slug: "how-signalling-peptides-work",
    title: "How signalling peptides work in the body",
    summary: "Peptides are short chains of amino acids. Many act as messages: they bind a receptor and switch on a response.",
    readingMinutes: 4,
    tag: "Mechanisms",
    sections: [
      {
        heading: "What a peptide is",
        paragraphs: [
          "A peptide is a short chain of amino acids joined by peptide bonds. Long chains are called proteins.",
          "The body makes many peptides as signals. Insulin, oxytocin and ghrelin are all peptide hormones.",
        ],
      },
      {
        heading: "Lock and key",
        paragraphs: [
          "A signalling peptide travels to a target cell. It fits a receptor on the cell’s surface, like a key in a lock.",
          "The bound receptor switches on a chain of events inside the cell. The cell then responds: it releases a hormone, divides, or makes new protein.",
        ],
      },
      {
        heading: "Examples from our catalogue",
        paragraphs: [
          "CJC-1295 copies growth-hormone-releasing hormone (GHRH). It binds the GHRH receptor in the pituitary gland, which signals the gland to release growth hormone.",
          "Ipamorelin copies ghrelin. It binds the growth hormone secretagogue receptor (GHS-R1a), a second route to growth-hormone release.",
          "GHK-Cu is a three-amino-acid peptide bound to copper. Lab studies link it to collagen production in skin cells.",
        ],
      },
    ],
    sources: [
      { title: "Peptide (Wikipedia)", url: "https://en.wikipedia.org/wiki/Peptide" },
      { title: "CJC-1295 research (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=CJC-1295" },
      { title: "Ipamorelin research (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=ipamorelin" },
      { title: "GHK-Cu skin research (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=GHK-Cu+skin" },
    ],
  },
  {
    slug: "what-lyophilised-means",
    title: "What “lyophilised” means",
    summary: "Why our peptides arrive as a dry powder, and how freeze-drying works.",
    readingMinutes: 2,
    tag: "Handling",
    sections: [
      {
        heading: "Freeze-drying in three steps",
        paragraphs: [
          "Lyophilisation is freeze-drying. The peptide solution is frozen.",
          "The pressure is then lowered. The ice turns straight into vapour without melting. This is called sublimation.",
          "What is left is a dry cake or powder at the bottom of the vial.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "Water drives many of the reactions that break molecules down. Removing it makes the product more stable than a liquid, which is why many peptide and protein products ship this way.",
        ],
      },
    ],
    sources: [
      { title: "Freeze-drying (Wikipedia)", url: "https://en.wikipedia.org/wiki/Freeze-drying" },
      { title: "Lyophilization of peptides and proteins (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=lyophilization+peptide+stability" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
