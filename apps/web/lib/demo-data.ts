// ─── Shared demo data for all pages ──────────────────────────────────────────
// Replace with real API calls when backend is ready.

export type ShipmentStatus =
  | "in_transit"
  | "loading"
  | "scheduled"
  | "proposed"
  | "delivered"
  | "delayed"

export interface Shipment {
  id: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  eta: string
  etd: string // estimated time of departure
  daysOut: number
  cargo: string
  weight: string
  status: ShipmentStatus
  carrier: string
  vessel: string
  progress: number
  corridor: string
  value: string
  // detail-level fields
  hsCode: string
  incoterms: string
  consignee: string
  broker: string
  blNumber: string
  packingList: string[]
  milestones: Milestone[]
  contacts: Contact[]
}

export interface Milestone {
  label: string
  timestamp: string
  done: boolean
  active: boolean
  note?: string
}

export interface Contact {
  role: string
  name: string
  company: string
  email: string
  phone: string
}

export interface Corridor {
  id: string
  name: string
  originRegion: string
  destRegion: string
  originFlag: string
  destFlag: string
  activeShipments: number
  avgTransitDays: number
  onTimeRate: number
  preferredCarrier: string
  totalShipments: number
  totalValue: string
  incoterms: string
  incotermNote: string
  // SVG map coords (0-1000 x, 0-500 y) for route arc endpoints
  originMapX: number
  originMapY: number
  destMapX: number
  destMapY: number
  carrierRankings: CarrierRanking[]
}

export interface CarrierRanking {
  carrier: string
  shipments: number
  avgDays: number
  onTimeRate: number
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export const SHIPMENTS: Shipment[] = [
  {
    id: "SHP-2026-0142",
    origin: "Shanghai",
    originCode: "SHA",
    destination: "Los Angeles",
    destinationCode: "LAX",
    eta: "Mar 18, 2026",
    etd: "Mar 3, 2026",
    daysOut: 5,
    cargo: "Electronics",
    weight: "24.5t",
    status: "in_transit",
    carrier: "COSCO Shipping",
    vessel: "COSCO PACIFIC",
    progress: 68,
    corridor: "Trans-Pacific",
    value: "$1.2M",
    hsCode: "8471.30",
    incoterms: "FOB",
    consignee: "TechDist USA LLC",
    broker: "Pacific Customs Brokers",
    blNumber: "COSU6194861830",
    packingList: ["48x Pallet — Laptops (2,400 units)", "12x Crate — Server Blades (120 units)", "6x Drum — Display Panels (360 units)"],
    milestones: [
      { label: "Booked", timestamp: "Mar 1, 2026", done: true, active: false, note: "Booking confirmed with COSCO" },
      { label: "Cargo Received", timestamp: "Mar 3, 2026", done: true, active: false, note: "CFS Shanghai — all units verified" },
      { label: "Vessel Departed", timestamp: "Mar 5, 2026", done: true, active: false, note: "COSCO PACIFIC — Voyage 026E" },
      { label: "In Transit", timestamp: "Mar 5–18, 2026", done: false, active: true, note: "Trans-Pacific crossing" },
      { label: "Port Arrival", timestamp: "Mar 18, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "Pending", done: false, active: false },
      { label: "Delivered", timestamp: "Pending", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "Wei Zhang", company: "COSCO Shipping", email: "w.zhang@cosco.com", phone: "+86 21 6596 6000" },
      { role: "Customs Broker", name: "Linda Reyes", company: "Pacific Customs Brokers", email: "l.reyes@pacificbrokers.com", phone: "+1 310 555 0184" },
      { role: "Consignee", name: "Marcus Hill", company: "TechDist USA LLC", email: "m.hill@techdist.com", phone: "+1 213 555 0247" },
    ],
  },
  {
    id: "SHP-2026-0148",
    origin: "Hamburg",
    originCode: "HAM",
    destination: "New York",
    destinationCode: "NYC",
    eta: "Mar 21, 2026",
    etd: "Mar 13, 2026",
    daysOut: 8,
    cargo: "Industrial Machinery",
    weight: "38.2t",
    status: "loading",
    carrier: "MSC",
    vessel: "MSC OSCAR",
    progress: 15,
    corridor: "North Atlantic",
    value: "$840K",
    hsCode: "8457.10",
    incoterms: "CIF",
    consignee: "Blackridge Manufacturing Inc.",
    broker: "Atlantic Trade Services",
    blNumber: "MSCU7831042900",
    packingList: ["8x Heavy Crate — CNC Machining Centers (8 units)", "22x Pallet — Spare Parts & Tooling"],
    milestones: [
      { label: "Booked", timestamp: "Mar 7, 2026", done: true, active: false },
      { label: "Cargo Received", timestamp: "Mar 11, 2026", done: true, active: false },
      { label: "Loading", timestamp: "Mar 13, 2026", done: false, active: true, note: "Loading at Hamburg Eurogate Terminal" },
      { label: "Vessel Departed", timestamp: "Mar 14, 2026 (ETD)", done: false, active: false },
      { label: "Port Arrival", timestamp: "Mar 21, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "Pending", done: false, active: false },
      { label: "Delivered", timestamp: "Pending", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "Klaus Bauer", company: "MSC Germany", email: "k.bauer@msc.com", phone: "+49 40 555 0329" },
      { role: "Customs Broker", name: "Sarah Monroe", company: "Atlantic Trade Services", email: "s.monroe@atlantictrade.com", phone: "+1 718 555 0093" },
      { role: "Consignee", name: "Robert Chen", company: "Blackridge Manufacturing Inc.", email: "r.chen@blackridge.com", phone: "+1 212 555 0618" },
    ],
  },
  {
    id: "SHP-2026-0153",
    origin: "Dubai",
    originCode: "DXB",
    destination: "Rotterdam",
    destinationCode: "RTM",
    eta: "Mar 24, 2026",
    etd: "Mar 17, 2026",
    daysOut: 11,
    cargo: "Petrochemicals",
    weight: "52.1t",
    status: "scheduled",
    carrier: "Maersk Line",
    vessel: "MAERSK ESSEN",
    progress: 0,
    corridor: "Middle East-Europe",
    value: "$2.1M",
    hsCode: "2902.20",
    incoterms: "DDP",
    consignee: "Eurochem Distributors BV",
    broker: "Rotterdam Customs Agency",
    blNumber: "—",
    packingList: ["ISO Tank x4 — Benzene (80,000L)", "ISO Tank x2 — Toluene (40,000L)"],
    milestones: [
      { label: "Booked", timestamp: "Mar 9, 2026", done: true, active: false },
      { label: "Cargo Received", timestamp: "Mar 15, 2026 (scheduled)", done: false, active: false },
      { label: "Loading", timestamp: "Mar 17, 2026 (scheduled)", done: false, active: true, note: "Jebel Ali Port — Terminal 3" },
      { label: "Vessel Departed", timestamp: "Mar 17, 2026 (ETD)", done: false, active: false },
      { label: "Port Arrival", timestamp: "Mar 24, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "Pending", done: false, active: false },
      { label: "Delivered", timestamp: "Pending", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "Amira Hassan", company: "Maersk UAE", email: "a.hassan@maersk.com", phone: "+971 4 555 0441" },
      { role: "Customs Broker", name: "Jan de Vries", company: "Rotterdam Customs Agency", email: "j.devries@rca.nl", phone: "+31 10 555 0772" },
      { role: "Consignee", name: "Pieter Smit", company: "Eurochem Distributors BV", email: "p.smit@eurochem.nl", phone: "+31 20 555 0345" },
    ],
  },
  {
    id: "SHP-2026-0139",
    origin: "Tokyo",
    originCode: "TKO",
    destination: "Seattle",
    destinationCode: "SEA",
    eta: "Mar 25, 2026",
    etd: "Mar 18, 2026",
    daysOut: 12,
    cargo: "Automotive Parts",
    weight: "18.7t",
    status: "proposed",
    carrier: "NYK Line",
    vessel: "—",
    progress: 0,
    corridor: "Trans-Pacific",
    value: "$560K",
    hsCode: "8708.29",
    incoterms: "EXW",
    consignee: "Pacific Auto Supply Co.",
    broker: "Northwest Brokers LLC",
    blNumber: "—",
    packingList: ["Pending manifest"],
    milestones: [
      { label: "Booked", timestamp: "Pending approval", done: false, active: true },
      { label: "Cargo Received", timestamp: "—", done: false, active: false },
      { label: "Loading", timestamp: "—", done: false, active: false },
      { label: "Vessel Departed", timestamp: "—", done: false, active: false },
      { label: "Port Arrival", timestamp: "Mar 25, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "—", done: false, active: false },
      { label: "Delivered", timestamp: "—", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "—", company: "NYK Line (pending)", email: "—", phone: "—" },
      { role: "Consignee", name: "Dan Wilkes", company: "Pacific Auto Supply Co.", email: "d.wilkes@pacauto.com", phone: "+1 206 555 0381" },
    ],
  },
  {
    id: "SHP-2026-0137",
    origin: "Mumbai",
    originCode: "BOM",
    destination: "London",
    destinationCode: "LHR",
    eta: "Mar 27, 2026",
    etd: "Mar 20, 2026",
    daysOut: 14,
    cargo: "Textiles",
    weight: "12.3t",
    status: "proposed",
    carrier: "Hapag-Lloyd",
    vessel: "—",
    progress: 0,
    corridor: "Indian Ocean-Europe",
    value: "$290K",
    hsCode: "6205.20",
    incoterms: "FOB",
    consignee: "British Textile Imports Ltd.",
    broker: "UK Customs Partners",
    blNumber: "—",
    packingList: ["Pending manifest"],
    milestones: [
      { label: "Booked", timestamp: "Pending approval", done: false, active: true },
      { label: "Cargo Received", timestamp: "—", done: false, active: false },
      { label: "Loading", timestamp: "—", done: false, active: false },
      { label: "Vessel Departed", timestamp: "—", done: false, active: false },
      { label: "Port Arrival", timestamp: "Mar 27, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "—", done: false, active: false },
      { label: "Delivered", timestamp: "—", done: false, active: false },
    ],
    contacts: [
      { role: "Consignee", name: "Emma Clarke", company: "British Textile Imports Ltd.", email: "e.clarke@bti.co.uk", phone: "+44 20 555 0129" },
    ],
  },
  {
    id: "SHP-2026-0131",
    origin: "Singapore",
    originCode: "SIN",
    destination: "Sydney",
    destinationCode: "SYD",
    eta: "Mar 16, 2026",
    etd: "Mar 9, 2026",
    daysOut: 3,
    cargo: "Consumer Goods",
    weight: "9.4t",
    status: "in_transit",
    carrier: "PIL",
    vessel: "KOTA RAJIN",
    progress: 82,
    corridor: "SE Asia-Australia",
    value: "$178K",
    hsCode: "9403.20",
    incoterms: "CIF",
    consignee: "Southern Retail Imports Pty Ltd.",
    broker: "Sydney Trade Clearance",
    blNumber: "PILSGSIN0012993",
    packingList: ["32x Pallet — Furniture flat-pack (320 units)", "8x Carton — Home accessories"],
    milestones: [
      { label: "Booked", timestamp: "Mar 6, 2026", done: true, active: false },
      { label: "Cargo Received", timestamp: "Mar 8, 2026", done: true, active: false },
      { label: "Vessel Departed", timestamp: "Mar 9, 2026", done: true, active: false },
      { label: "In Transit", timestamp: "Mar 9–16, 2026", done: false, active: true },
      { label: "Port Arrival", timestamp: "Mar 16, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "Pending", done: false, active: false },
      { label: "Delivered", timestamp: "Pending", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "Mei Lin", company: "PIL Singapore", email: "m.lin@pilship.com", phone: "+65 6748 9000" },
      { role: "Customs Broker", name: "Tom Bradley", company: "Sydney Trade Clearance", email: "t.bradley@sydneytrade.com.au", phone: "+61 2 555 0294" },
      { role: "Consignee", name: "Anna Nguyen", company: "Southern Retail Imports", email: "a.nguyen@sri.com.au", phone: "+61 2 555 0841" },
    ],
  },
  {
    id: "SHP-2026-0129",
    origin: "Rotterdam",
    originCode: "RTM",
    destination: "São Paulo",
    destinationCode: "GRU",
    eta: "Mar 14, 2026",
    etd: "Feb 24, 2026",
    daysOut: 1,
    cargo: "Pharmaceuticals",
    weight: "3.2t",
    status: "delayed",
    carrier: "CMA CGM",
    vessel: "CMA LIBRA",
    progress: 91,
    corridor: "Europe-South America",
    value: "$4.5M",
    hsCode: "3004.90",
    incoterms: "DAP",
    consignee: "Pharma Brasil Distribuidora",
    broker: "São Paulo Customs Experts",
    blNumber: "CMDU4839201774",
    packingList: ["Temperature-controlled container x1 — Insulin vials (50,000 units)", "Dry container x1 — OTC medications (200 cartons)"],
    milestones: [
      { label: "Booked", timestamp: "Feb 19, 2026", done: true, active: false },
      { label: "Cargo Received", timestamp: "Feb 22, 2026", done: true, active: false },
      { label: "Vessel Departed", timestamp: "Feb 24, 2026", done: true, active: false },
      { label: "In Transit", timestamp: "Feb 24 – Mar 14, 2026", done: false, active: true, note: "⚠ Delayed — port congestion at Santos" },
      { label: "Port Arrival", timestamp: "Mar 14, 2026 (ETA revised)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "Pending", done: false, active: false },
      { label: "Delivered", timestamp: "Pending", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "Sophie Leblanc", company: "CMA CGM Netherlands", email: "s.leblanc@cma-cgm.com", phone: "+31 10 555 0512" },
      { role: "Customs Broker", name: "Carlos Moreira", company: "São Paulo Customs Experts", email: "c.moreira@spce.com.br", phone: "+55 11 555 0093" },
      { role: "Consignee", name: "Juliana Faria", company: "Pharma Brasil", email: "j.faria@pharmabr.com.br", phone: "+55 11 555 0274" },
    ],
  },
  {
    id: "SHP-2026-0118",
    origin: "Shenzhen",
    originCode: "SZX",
    destination: "Felixstowe",
    destinationCode: "FXT",
    eta: "Apr 2, 2026",
    etd: "Mar 19, 2026",
    daysOut: 20,
    cargo: "Solar Panels",
    weight: "61.4t",
    status: "scheduled",
    carrier: "Evergreen",
    vessel: "EVER GLORY",
    progress: 0,
    corridor: "Asia-Europe",
    value: "$3.2M",
    hsCode: "8541.40",
    incoterms: "CIF",
    consignee: "GreenEnergy UK Ltd.",
    broker: "Felixstowe Customs Solutions",
    blNumber: "—",
    packingList: ["80x Pallet — Monocrystalline panels (1,600 units)", "20x Crate — Mounting hardware"],
    milestones: [
      { label: "Booked", timestamp: "Mar 10, 2026", done: true, active: false },
      { label: "Cargo Received", timestamp: "Mar 16, 2026 (scheduled)", done: false, active: false },
      { label: "Loading", timestamp: "Mar 19, 2026 (scheduled)", done: false, active: true },
      { label: "Vessel Departed", timestamp: "Mar 19, 2026 (ETD)", done: false, active: false },
      { label: "Port Arrival", timestamp: "Apr 2, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "—", done: false, active: false },
      { label: "Delivered", timestamp: "—", done: false, active: false },
    ],
    contacts: [
      { role: "Carrier Rep", name: "Kevin Wu", company: "Evergreen Shipping", email: "k.wu@evergreen-line.com", phone: "+86 755 555 0627" },
      { role: "Consignee", name: "Oliver Grant", company: "GreenEnergy UK", email: "o.grant@greenenergy.co.uk", phone: "+44 1394 555 0183" },
    ],
  },
  {
    id: "SHP-2026-0109",
    origin: "Busan",
    originCode: "PUS",
    destination: "Mombasa",
    destinationCode: "MBA",
    eta: "Apr 8, 2026",
    etd: "Mar 22, 2026",
    daysOut: 26,
    cargo: "Construction Equipment",
    weight: "84.0t",
    status: "proposed",
    carrier: "OOCL",
    vessel: "—",
    progress: 0,
    corridor: "Asia-East Africa",
    value: "$1.8M",
    hsCode: "8429.51",
    incoterms: "FOB",
    consignee: "Nairobi Build Supplies Ltd.",
    broker: "East Africa Customs Agency",
    blNumber: "—",
    packingList: ["Pending manifest"],
    milestones: [
      { label: "Booked", timestamp: "Pending approval", done: false, active: true },
      { label: "Cargo Received", timestamp: "—", done: false, active: false },
      { label: "Loading", timestamp: "—", done: false, active: false },
      { label: "Vessel Departed", timestamp: "—", done: false, active: false },
      { label: "Port Arrival", timestamp: "Apr 8, 2026 (ETA)", done: false, active: false },
      { label: "Customs Clearance", timestamp: "—", done: false, active: false },
      { label: "Delivered", timestamp: "—", done: false, active: false },
    ],
    contacts: [
      { role: "Consignee", name: "James Mwangi", company: "Nairobi Build Supplies", email: "j.mwangi@nbs.co.ke", phone: "+254 20 555 0411" },
    ],
  },
]

// ─── Trade Corridors ──────────────────────────────────────────────────────────

export const CORRIDORS: Corridor[] = [
  {
    id: "trans-pacific",
    name: "Trans-Pacific",
    originRegion: "East Asia",
    destRegion: "North America",
    originFlag: "🇨🇳",
    destFlag: "🇺🇸",
    activeShipments: 3,
    avgTransitDays: 14,
    onTimeRate: 87,
    preferredCarrier: "COSCO Shipping",
    totalShipments: 42,
    totalValue: "$28.4M",
    incoterms: "FOB",
    incotermNote: "Seller loads at origin port; buyer assumes risk from that point.",
    originMapX: 780,
    originMapY: 190,
    destMapX: 120,
    destMapY: 210,
    carrierRankings: [
      { carrier: "COSCO Shipping", shipments: 18, avgDays: 13, onTimeRate: 91 },
      { carrier: "Evergreen", shipments: 12, avgDays: 14, onTimeRate: 85 },
      { carrier: "NYK Line", shipments: 8, avgDays: 15, onTimeRate: 82 },
      { carrier: "ONE", shipments: 4, avgDays: 16, onTimeRate: 78 },
    ],
  },
  {
    id: "north-atlantic",
    name: "North Atlantic",
    originRegion: "Northern Europe",
    destRegion: "North America",
    originFlag: "🇩🇪",
    destFlag: "🇺🇸",
    activeShipments: 2,
    avgTransitDays: 9,
    onTimeRate: 92,
    preferredCarrier: "MSC",
    totalShipments: 31,
    totalValue: "$19.1M",
    incoterms: "CIF",
    incotermNote: "Seller covers cost, insurance and freight to destination port.",
    originMapX: 460,
    originMapY: 165,
    destMapX: 170,
    destMapY: 195,
    carrierRankings: [
      { carrier: "MSC", shipments: 14, avgDays: 9, onTimeRate: 94 },
      { carrier: "Maersk Line", shipments: 10, avgDays: 10, onTimeRate: 91 },
      { carrier: "CMA CGM", shipments: 7, avgDays: 10, onTimeRate: 88 },
    ],
  },
  {
    id: "middle-east-europe",
    name: "Middle East–Europe",
    originRegion: "Middle East",
    destRegion: "Northern Europe",
    originFlag: "🇦🇪",
    destFlag: "🇳🇱",
    activeShipments: 2,
    avgTransitDays: 12,
    onTimeRate: 84,
    preferredCarrier: "Maersk Line",
    totalShipments: 19,
    totalValue: "$31.7M",
    incoterms: "DDP",
    incotermNote: "Seller responsible for all costs and risks through to final delivery.",
    originMapX: 590,
    originMapY: 230,
    destMapX: 475,
    destMapY: 155,
    carrierRankings: [
      { carrier: "Maersk Line", shipments: 9, avgDays: 11, onTimeRate: 88 },
      { carrier: "Hapag-Lloyd", shipments: 6, avgDays: 12, onTimeRate: 82 },
      { carrier: "MSC", shipments: 4, avgDays: 13, onTimeRate: 79 },
    ],
  },
  {
    id: "indian-ocean-europe",
    name: "Indian Ocean–Europe",
    originRegion: "South Asia",
    destRegion: "Western Europe",
    originFlag: "🇮🇳",
    destFlag: "🇬🇧",
    activeShipments: 1,
    avgTransitDays: 18,
    onTimeRate: 79,
    preferredCarrier: "Hapag-Lloyd",
    totalShipments: 14,
    totalValue: "$8.9M",
    incoterms: "FOB",
    incotermNote: "Seller loads at origin port; buyer covers freight and insurance.",
    originMapX: 635,
    originMapY: 255,
    destMapX: 450,
    destMapY: 150,
    carrierRankings: [
      { carrier: "Hapag-Lloyd", shipments: 6, avgDays: 17, onTimeRate: 83 },
      { carrier: "Maersk Line", shipments: 5, avgDays: 18, onTimeRate: 78 },
      { carrier: "MSC", shipments: 3, avgDays: 20, onTimeRate: 73 },
    ],
  },
  {
    id: "europe-south-america",
    name: "Europe–South America",
    originRegion: "Northern Europe",
    destRegion: "South America",
    originFlag: "🇳🇱",
    destFlag: "🇧🇷",
    activeShipments: 1,
    avgTransitDays: 18,
    onTimeRate: 76,
    preferredCarrier: "CMA CGM",
    totalShipments: 11,
    totalValue: "$22.3M",
    incoterms: "DAP",
    incotermNote: "Seller delivers to named destination; buyer handles import customs.",
    originMapX: 475,
    originMapY: 155,
    destMapX: 280,
    destMapY: 355,
    carrierRankings: [
      { carrier: "CMA CGM", shipments: 5, avgDays: 17, onTimeRate: 80 },
      { carrier: "Hamburg Süd", shipments: 4, avgDays: 19, onTimeRate: 75 },
      { carrier: "MSC", shipments: 2, avgDays: 20, onTimeRate: 70 },
    ],
  },
  {
    id: "se-asia-australia",
    name: "SE Asia–Australia",
    originRegion: "Southeast Asia",
    destRegion: "Australia",
    originFlag: "🇸🇬",
    destFlag: "🇦🇺",
    activeShipments: 1,
    avgTransitDays: 7,
    onTimeRate: 90,
    preferredCarrier: "PIL",
    totalShipments: 23,
    totalValue: "$5.6M",
    incoterms: "CIF",
    incotermNote: "Seller covers cost, insurance and freight to Sydney port.",
    originMapX: 760,
    originMapY: 280,
    destMapX: 820,
    destMapY: 390,
    carrierRankings: [
      { carrier: "PIL", shipments: 11, avgDays: 7, onTimeRate: 93 },
      { carrier: "Evergreen", shipments: 7, avgDays: 7, onTimeRate: 89 },
      { carrier: "ANL", shipments: 5, avgDays: 8, onTimeRate: 85 },
    ],
  },
  {
    id: "asia-europe",
    name: "Asia–Europe (Suez)",
    originRegion: "East Asia",
    destRegion: "Western Europe",
    originFlag: "🇨🇳",
    destFlag: "🇬🇧",
    activeShipments: 1,
    avgTransitDays: 28,
    onTimeRate: 81,
    preferredCarrier: "Evergreen",
    totalShipments: 16,
    totalValue: "$41.2M",
    incoterms: "CIF",
    incotermNote: "Via Suez Canal. Seller covers freight and insurance to UK port.",
    originMapX: 780,
    originMapY: 220,
    destMapX: 450,
    destMapY: 150,
    carrierRankings: [
      { carrier: "Evergreen", shipments: 6, avgDays: 27, onTimeRate: 85 },
      { carrier: "COSCO Shipping", shipments: 5, avgDays: 28, onTimeRate: 80 },
      { carrier: "ONE", shipments: 5, avgDays: 30, onTimeRate: 77 },
    ],
  },
  {
    id: "asia-east-africa",
    name: "Asia–East Africa",
    originRegion: "East Asia",
    destRegion: "East Africa",
    originFlag: "🇰🇷",
    destFlag: "🇰🇪",
    activeShipments: 1,
    avgTransitDays: 21,
    onTimeRate: 72,
    preferredCarrier: "OOCL",
    totalShipments: 7,
    totalValue: "$9.4M",
    incoterms: "FOB",
    incotermNote: "Buyer arranges freight from Busan; high port risk at Mombasa.",
    originMapX: 790,
    originMapY: 200,
    destMapX: 575,
    destMapY: 310,
    carrierRankings: [
      { carrier: "OOCL", shipments: 3, avgDays: 20, onTimeRate: 75 },
      { carrier: "Hapag-Lloyd", shipments: 2, avgDays: 22, onTimeRate: 70 },
      { carrier: "MSC", shipments: 2, avgDays: 23, onTimeRate: 68 },
    ],
  },
]
