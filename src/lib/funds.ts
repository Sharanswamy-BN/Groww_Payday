export type Fund = {
  id: string;
  name: string;
  amc: string;
  category: string;
  risk: string;
  minSip: number;
  accent: string;
  initials: string;
};

export const FUNDS: Fund[] = [
  {
    id: "hdfc-flexi",
    name: "HDFC Flexi Cap Fund",
    amc: "HDFC Mutual Fund",
    category: "Flexi Cap",
    risk: "Very High",
    minSip: 100,
    accent: "#00B386",
    initials: "HF",
  },
  {
    id: "sbi-large",
    name: "SBI Large Cap Fund",
    amc: "SBI Mutual Fund",
    category: "Large Cap",
    risk: "High",
    minSip: 500,
    accent: "#5367FF",
    initials: "SL",
  },
  {
    id: "icici-elss",
    name: "ICICI Pru ELSS Tax Saver",
    amc: "ICICI Prudential",
    category: "ELSS",
    risk: "Very High",
    minSip: 500,
    accent: "#EB5B3C",
    initials: "IE",
  },
  {
    id: "axis-small",
    name: "Axis Small Cap Fund",
    amc: "Axis Mutual Fund",
    category: "Small Cap",
    risk: "Very High",
    minSip: 100,
    accent: "#7C5CFC",
    initials: "AS",
  },
  {
    id: "mirae-large",
    name: "Mirae Asset Large Cap Fund",
    amc: "Mirae Asset",
    category: "Large Cap",
    risk: "High",
    minSip: 500,
    accent: "#0F9D58",
    initials: "ML",
  },
  {
    id: "parag-flexi",
    name: "Parag Parikh Flexi Cap Fund",
    amc: "PPFAS Mutual Fund",
    category: "Flexi Cap",
    risk: "Very High",
    minSip: 1000,
    accent: "#1B4332",
    initials: "PP",
  },
];

export function getFund(id: string) {
  return FUNDS.find((f) => f.id === id) ?? null;
}
