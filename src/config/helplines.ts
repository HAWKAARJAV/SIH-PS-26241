export type Helpline = {
  id: string;
  name: string;
  number: string;
  tel: string;
  note: string;
  source: string;
  verifiedAt: string;
};

/** Re-check every number on the official site before a live demo. */
export const HELPLINES: Helpline[] = [
  {
    id: "skill-india",
    name: "Skill India / NSDC",
    number: "088000-55555",
    tel: "tel:08800055555",
    note: "Course and Skill India queries.",
    source: "https://nsdcindia.org",
    verifiedAt: "2026-10-03",
  },
  {
    id: "childline",
    name: "CHILDLINE",
    number: "1098",
    tel: "tel:1098",
    note: "Help for children in distress. Available across India.",
    source: "https://www.childlineindia.org",
    verifiedAt: "2026-10-03",
  },
  {
    id: "tele-manas",
    name: "Tele-MANAS",
    number: "14416",
    tel: "tel:14416",
    note: "Mental health support from the Government of India.",
    source: "https://telemanas.mohfw.gov.in",
    verifiedAt: "2026-10-03",
  },
];
