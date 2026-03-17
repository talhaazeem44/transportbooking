export interface RateRow {
  vehicle: string;
  passengers: number;
  rate: string;
  note?: string;
}

export interface RateTable {
  label: string;
  rows: RateRow[];
  note?: string;
}

export interface ServiceData {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
  startingFrom: string;
  description: string;
  features: string[];
  usesRateCalculator: boolean; // true = airport/corporate style
  rateTables: RateTable[];
  disclaimer?: string;
}

export const servicesData: ServiceData[] = [
  {
    slug: "airport-transfers",
    title: "Airport Transfers",
    subtitle: "Flat-rate rides to all major airports",
    icon: "✈️",
    image: "https://images.unsplash.com/photo-1676107648535-931375db52e2?q=80&w=2070&auto=format&fit=crop",
    startingFrom: "From $79",
    description:
      "Toronto Airport Limo provides flat-rate, 24/7 luxury airport transfers to and from Toronto Pearson (YYZ), Billy Bishop (YTZ), Hamilton (YHM), Buffalo Niagara (BUF), and Niagara Falls (IAG) airports. No surge pricing, no surprises — just a guaranteed flat rate every time.",
    features: [
      "Real-time flight monitoring — we track your flight",
      "Professional chauffeurs in formal attire",
      "Complimentary Wi-Fi, bottled water & phone chargers",
      "Meet & Greet inside terminal (+CA$49)",
      "Terminal 1 & 3 pickup at YYZ",
      "24/7 year-round availability",
      "Child seats available on request",
      "No hidden fees — all-inclusive flat rate",
    ],
    usesRateCalculator: true,
    rateTables: [
      {
        label: "Sample Airport Transfer Rates (Sedan — one way)",
        rows: [
          { vehicle: "Downtown Toronto → Pearson (YYZ)", passengers: 4, rate: "$86.45" },
          { vehicle: "Mississauga → Pearson (YYZ)", passengers: 4, rate: "$79.80" },
          { vehicle: "Markham → Pearson (YYZ)", passengers: 4, rate: "$106.40" },
          { vehicle: "Brampton → Pearson (YYZ)", passengers: 4, rate: "$83.00" },
          { vehicle: "Scarborough → Pearson (YYZ)", passengers: 4, rate: "$98.50" },
        ],
        note: "Rates shown are one-way per vehicle. Use the rate calculator below to get your exact city rate.",
      },
    ],
    disclaimer:
      "All rates subject to 5% Fuel Surcharge + 13% HST + 15% Driver Gratuity. 407 toll charges billed separately.",
  },
  {
    slug: "corporate",
    title: "Corporate Travel",
    subtitle: "Professional transportation for executives",
    icon: "💼",
    image: "https://images.unsplash.com/photo-1547731269-e4073e054f12?q=80&w=2114&auto=format&fit=crop",
    startingFrom: "From $79",
    description:
      "Toronto Airport Limo offers discreet, reliable corporate transportation for executives, business delegations, and conference groups. Our professional chauffeurs maintain strict confidentiality, monitor flights in real-time, and ensure you arrive on time — every time.",
    features: [
      "NDA-compliant, background-checked chauffeurs",
      "Real-time flight monitoring",
      "High-speed Wi-Fi, phone chargers, chilled water",
      "Hourly 'as-directed' service available",
      "Custom shuttle scheduling for conferences",
      "On-site event coordinators for large groups",
      "Live GPS tracking",
      "Invoicing available for corporate accounts",
    ],
    usesRateCalculator: true,
    rateTables: [],
    disclaimer:
      "All rates subject to 5% Fuel Surcharge + 13% HST + 15% Driver Gratuity.",
  },
  {
    slug: "weddings",
    title: "Weddings & Galas",
    subtitle: "Make your special day unforgettable",
    icon: "💍",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    startingFrom: "From $275",
    description:
      "Toronto Airport Limo makes your wedding day stress-free and elegant. Our tuxedoed chauffeurs, 'Just Married' signage, complimentary champagne glasses, and immaculate fleet ensure your most important day is picture-perfect from first pickup to last drop-off.",
    features: [
      "Tuxedoed chauffeurs in formal attire",
      "'Just Married' signage included",
      "Complimentary champagne glasses",
      "Flat-panel TVs, DVD players, fibre-optic lighting",
      "Sunroofs and chrome wheels",
      "Customized pickup schedule",
      "Available for bridal party & guest shuttles",
      "Late-night transfer options available",
    ],
    usesRateCalculator: false,
    rateTables: [
      {
        label: "5-Hour Wedding Package",
        rows: [
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$275", note: "Weekdays" },
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$300", note: "Sat / Sun" },
          { vehicle: "Mercedes C300", passengers: 4, rate: "$400", note: "Weekdays" },
          { vehicle: "Mercedes C300", passengers: 4, rate: "$450", note: "Sat / Sun" },
          { vehicle: "Cadillac Escalade ESV", passengers: 6, rate: "$450", note: "Weekdays" },
          { vehicle: "Cadillac Escalade ESV", passengers: 6, rate: "$500", note: "Sat / Sun" },
          { vehicle: "Stretch Limo (6–8 pax)", passengers: 8, rate: "$500", note: "Weekdays" },
          { vehicle: "Stretch Limo (6–8 pax)", passengers: 8, rate: "$600", note: "Sat / Sun" },
          { vehicle: "Stretch SUV Limo (10–14 pax)", passengers: 14, rate: "$650", note: "Weekdays" },
          { vehicle: "Stretch SUV Limo (10–14 pax)", passengers: 14, rate: "$800", note: "Sat / Sun" },
        ],
        note: "Late-night transfer options: $75–$175 depending on vehicle.",
      },
    ],
    disclaimer:
      "All rates subject to 13% HST + 15% Driver Gratuity. Full prepayment required to confirm booking.",
  },
  {
    slug: "casino-trips",
    title: "Casino Expeditions",
    subtitle: "Arrive in style, focus on the game",
    icon: "🎰",
    image: "https://images.unsplash.com/photo-1680516059579-fc0e573f9004?q=80&w=2070&auto=format&fit=crop",
    startingFrom: "From $350",
    description:
      "Enjoy a fully stress-free round-trip to Fallsview Casino, Casino Niagara, Casino Rama, and other Ontario hotspots. Flat, all-inclusive pricing — no hidden fees, no shared rides. Your chauffeur waits for you so you can focus entirely on having a great time.",
    features: [
      "Round-trip service (driver waits for you)",
      "No shared rides — your private vehicle",
      "Service to Fallsview, Niagara, Casino Rama & more",
      "Flat all-inclusive pricing — no hidden fees",
      "Groups up to 14 passengers",
      "Complimentary Wi-Fi, water, phone chargers",
      "Flexible return time",
      "Professional chauffeurs in formal attire",
    ],
    usesRateCalculator: false,
    rateTables: [
      {
        label: "Casino Round-Trip Rates (per vehicle)",
        rows: [
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$350" },
          { vehicle: "Mercedes C300", passengers: 4, rate: "$400" },
          { vehicle: "Cadillac Escalade SUV", passengers: 6, rate: "$500" },
          { vehicle: "Stretch Limo", passengers: 8, rate: "$600" },
          { vehicle: "Stretch SUV Limo (10 pax)", passengers: 10, rate: "$650" },
          { vehicle: "Stretch SUV Limo XL (14 pax)", passengers: 14, rate: "$700" },
        ],
        note: "Rates are per vehicle (not per passenger), round-trip from GTA.",
      },
    ],
    disclaimer:
      "All rates subject to 13% HST + 15% Driver Gratuity. Rates shown are from Greater Toronto Area.",
  },
  {
    slug: "prom",
    title: "Proms & Graduations",
    subtitle: "Arrive like a VIP on your big night",
    icon: "🎓",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
    startingFrom: "From $150",
    description:
      "Make prom night legendary with Toronto Airport Limo. Choose from our Economy 2-way transfer or our Elite unlimited 4-hour package — perfect for red carpet arrivals, multiple stops, and unforgettable photos. Professional chauffeurs in black suits ensure a safe and stylish evening.",
    features: [
      "Chauffeurs in black suits",
      "Leather seating, fibre-optic lighting",
      "Flat-panel TVs, DVD players, stereo sound",
      "Champagne glasses, ice, bottled water & soft drinks",
      "Multiple stops allowed (Elite package)",
      "Photo-ready vehicles — red carpet arrival",
      "Full prepayment locks in your date",
      "GTA-wide pickup and drop-off",
    ],
    usesRateCalculator: false,
    rateTables: [
      {
        label: "Economy Package — 2-Way Transfer",
        rows: [
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$150" },
          { vehicle: "Mercedes C300", passengers: 4, rate: "$200" },
          { vehicle: "Cadillac Escalade SUV", passengers: 6, rate: "$250" },
          { vehicle: "Stretch Limo (6–8 pax)", passengers: 8, rate: "$350" },
          { vehicle: "Stretch SUV Limo (10 pax)", passengers: 10, rate: "$500" },
          { vehicle: "Stretch SUV Limo XL (14 pax)", passengers: 14, rate: "$600" },
        ],
      },
      {
        label: "Elite Package — 4 Hours Unlimited",
        rows: [
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$300" },
          { vehicle: "Mercedes C300", passengers: 4, rate: "$375" },
          { vehicle: "Cadillac Escalade SUV", passengers: 6, rate: "$450" },
          { vehicle: "Stretch Limo (6–8 pax)", passengers: 8, rate: "$550" },
          { vehicle: "Stretch SUV Limo (10 pax)", passengers: 10, rate: "$650" },
          { vehicle: "Stretch SUV Limo XL (14 pax)", passengers: 14, rate: "$750" },
        ],
        note: "Elite includes 2 hours at the start + 2 hours at the end of the event. Multiple stops permitted.",
      },
    ],
    disclaimer:
      "All rates subject to 13% HST + 15% Driver Gratuity. Full prepayment required.",
  },
  {
    slug: "wine-tours",
    title: "Wine Tours",
    subtitle: "Niagara Escarpment & wine country in style",
    icon: "🍷",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop",
    startingFrom: "From $500",
    description:
      "Explore Ontario's finest wineries along the Niagara Escarpment and Niagara-on-the-Lake with a professional chauffeur who knows every wine route. Door-to-door GTA pickup, custom itineraries, and a full 8-hour day to visit as many wineries as you choose.",
    features: [
      "Door-to-door GTA pickup and drop-off",
      "8-hour round-trip day package",
      "Chauffeur knows Niagara Escarpment wine routes",
      "Custom itinerary — visit any wineries you choose",
      "Complimentary chilled water, ice",
      "Climate-controlled luxury vehicles",
      "Groups of 1–12 passengers",
      "25% non-refundable deposit to confirm",
    ],
    usesRateCalculator: false,
    rateTables: [
      {
        label: "8-Hour Wine Tour Package (Round Trip from GTA)",
        rows: [
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$500" },
          { vehicle: "Tesla Model S 85D", passengers: 3, rate: "$800", note: "Zero-emission option" },
          { vehicle: "SUV Stretch Limo XL (up to 12 pax)", passengers: 12, rate: "$1,200" },
        ],
        note: "7% fuel surcharge applies (Tesla exempt). Custom duration packages available on request.",
      },
    ],
    disclaimer:
      "All rates subject to 13% HST + 15% Driver Gratuity. 25% non-refundable deposit required.",
  },
  {
    slug: "night-parties",
    title: "Night on the Town",
    subtitle: "Safe luxury transport for any night out",
    icon: "🌃",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop",
    startingFrom: "Hourly rates",
    description:
      "Whether it's a birthday, stag, bachelorette, concert, or sporting event — Toronto Airport Limo keeps the party going. Our fully equipped stretch limos and party vans feature premium sound systems, fibre-optic lighting, and a full bar setup for the ultimate night out.",
    features: [
      "Hourly 'as-directed' service",
      "Fibre-optic lighting, premium sound system",
      "Full bar setup in stretch limos",
      "Multiple stops — bars, clubs, restaurants",
      "Safe, licensed & insured chauffeurs",
      "Stags, bachelorettes, birthdays & concerts",
      "Groups up to 14 passengers",
      "Complimentary ice, water & soft drinks",
    ],
    usesRateCalculator: false,
    rateTables: [
      {
        label: "Hourly Rates (minimum 3 hours)",
        rows: [
          { vehicle: "Lincoln Town Car", passengers: 4, rate: "$85/hr" },
          { vehicle: "Mercedes C300", passengers: 4, rate: "$100/hr" },
          { vehicle: "Cadillac Escalade SUV", passengers: 6, rate: "$120/hr" },
          { vehicle: "Stretch Limo (6–8 pax)", passengers: 8, rate: "$150/hr" },
          { vehicle: "Stretch SUV Limo (10 pax)", passengers: 10, rate: "$175/hr" },
          { vehicle: "Stretch SUV Limo XL (14 pax)", passengers: 14, rate: "$200/hr" },
        ],
        note: "Minimum 3-hour booking. Rates based on departure from GTA.",
      },
    ],
    disclaimer:
      "All rates subject to 13% HST + 15% Driver Gratuity.",
  },
];
