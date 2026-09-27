window.AVVA_CONFIG = {
  id: "manufacturing-fund",
  workspaceName: "KZN Manufacturing Support Workspace",
  pageTitle: "KwaZulu-Natal Manufacturing Support Workspace",
  pageSubtitle: "Industrial growth. Supplier development. Jobs sustained.",
  dataDisclaimer: "Manufacturing income and employment figures based on Stats SA Manufacturing Report (2021) and QLFS (2023). Programme disbursement data is modelled for demonstration.",
  org: { name: "Reemerge Group", tagline: "Making Invisible Markets Visible." },
  user: { initials: "TM", name: "Thabo Mkhize", role: "Industrial Programme Lead" },

  term: { entity: "Manufacturer", entityPlural: "Manufacturers", entityLower: "manufacturer", entityLowerPlural: "manufacturers" },

  sectors: ["Manufacturing"],

  geoScope: "districts",

  map: {
    title: "Manufacturing Support Observatory",
    subtitle: "Where industrial funding and equipment support is delivered across KZN",
    center: [-29.0, 30.6],
    zoom: 8
  },

  layers: [
    { id: "manufacturers", label: "Manufacturers Supported", default: true },
    { id: "jobs", label: "Jobs Sustained", default: true },
    { id: "equipment", label: "Equipment Deployed", default: false },
    { id: "output", label: "Output Value", default: false }
  ],

  periods: ["Live", "Day", "Week", "Month", "Quarter", "Year"],
  defaultPeriod: "Month",

  metrics: [
    { id: "manufacturers", label: "Manufacturers Supported", icon: "▥", colour: "cyan", format: "number" },
    { id: "funding", label: "Funding Disbursed", icon: "▰", colour: "purple", format: "currency-m" },
    { id: "jobs", label: "Jobs Sustained", icon: "♧", colour: "green", format: "number" },
    { id: "output", label: "Output Value", icon: "◉", colour: "gold", format: "currency-m" },
    { id: "growth", label: "Growth Rate", icon: "↗", colour: "teal", format: "percent", aggregate: "average" },
    { id: "topHub", label: "Top Hub", icon: "★", colour: "purple", format: "static", value: "eThekwini" },
    { id: "verification", label: "Verification Rate", icon: "✓", colour: "green", format: "static", value: "79%" }
  ],

  brief: {
    title: "AI Industrial Brief",
    subtitle: "Auto-summary · generated from current manufacturing data",
    items: [
      { icon: "♙", html: "<b>eThekwini</b> dominates KZN manufacturing — <b>R271 billion</b> in sales (11.6% of national total)." },
      { icon: "♧", html: "KZN accounts for <b>19%</b> of national manufacturing employment." },
      { icon: "▰", html: "Manufacturing sector contributes <b>13.2%</b> of South Africa's economic activity." },
      { icon: "▢", html: "SMMEs represent <b>58%</b> of manufacturing employment nationally." }
    ]
  },

  programmes: {
    title: "Active Funding Streams",
    subtitle: "Industrial support programmes",
    items: [
      ["Manufacturing Competitiveness Enhancement", "R62.4m", 71],
      ["Industrial Equipment Deployment Fund", "R38.6m", 64],
      ["Supplier Development Programme", "R24.2m", 78],
      ["Export Readiness Initiative", "R16.8m", 52],
      ["Skills Development & Training", "R12.4m", 68]
    ]
  },

  bottomLeft: {
    type: "sdg",
    title: "SDG Industrial Alignment",
    subtitle: "Contribution to Sustainable Development Goals",
    tiles: [
      ["8", "DECENT WORK", "#a21942"],
      ["9", "INDUSTRY & INNOVATION", "#fd6925"],
      ["10", "REDUCED INEQUALITIES", "#dd1367"],
      ["12", "RESPONSIBLE CONSUMPTION", "#bf8b2e"],
      ["17", "PARTNERSHIPS", "#19486a"]
    ],
    percentages: ["74%", "81%", "67%", "59%", "62%"]
  },

  trends: {
    title: "Manufacturing Support Trends",
    subtitle: "Manufacturers · Jobs · Output",
    period: "(12 Months)"
  },

  impact: {
    title: "Industrial Impact Indicators",
    subtitle: "Programme outcomes",
    items: [
      ["Manufacturer Survival Rate", "76%"],
      ["Jobs Sustained", "auto:jobs"],
      ["Output Growth", "+8.4%"],
      ["Export Participation", "34%"],
      ["Supplier Linkages", "1,847"]
    ]
  },

  quality: {
    title: "Data Quality & Coverage",
    subtitle: "Manufacturer verification measures",
    items: [
      ["Manufacturer Coverage", 85],
      ["Geographic Coverage", 88],
      ["Data Completeness", 84],
      ["Equipment Verification", 79]
    ]
  },

  navigation: [
    { section: "", items: [
      { id: "command", label: "Command Centre", icon: "⌂", view: "map" },
      { id: "manufacturers", label: "Manufacturer Observatory", icon: "◎", view: "map" },
      { id: "post-programme", label: "Post a Programme", icon: "＋", view: "form", action: "open-programme-form" },
      { id: "programmes", label: "Funding Streams", icon: "▤", view: "cards", cards: { type: "programmes" } },
      { id: "funding", label: "Funding Tracker", icon: "▣", view: "table", table: { source: "districts", columns: ["name","manufacturers","funding","jobs","output"] } },
      { id: "geo", label: "District Analysis", icon: "◇", view: "table", table: { source: "districts", columns: ["name","manufacturers","funding","jobs","output","growth"] } },
      { id: "jobs", label: "Jobs Insights", icon: "♧", view: "table", table: { source: "districts", columns: ["name","jobs","manufacturers"] } },
      { id: "impact", label: "Impact Monitoring", icon: "⌁", view: "table", table: { source: "districts", columns: ["name","jobs","growth"] } },
      { id: "reports", label: "Reports", icon: "▤", view: "cards", cards: { type: "reports" } },
      { id: "ai", label: "AI Assistant", icon: "✧", view: "chat" }
    ]},
    { section: "TOOLS", items: [
      { id: "explorer", label: "Data Explorer", icon: "▦", view: "table", table: { source: "districts", columns: ["name","manufacturers","funding","jobs","output","growth"] } },
      { id: "compare", label: "Compare Districts", icon: "≋", view: "table", table: { source: "districts", columns: ["name","manufacturers","jobs"] } },
      { id: "alerts", label: "Alerts", icon: "♧", view: "cards", cards: { type: "alerts" }, badge: "2" },
      { id: "audit", label: "Audit Feed", icon: "▢", view: "info" }
    ]},
    { section: "ADMIN", items: [
      { id: "settings", label: "Workspace Settings", icon: "⚙", view: "info" },
      { id: "users", label: "User Management", icon: "♧", view: "info" },
      { id: "sources", label: "Data Sources", icon: "▱", view: "info" },
      { id: "logs", label: "Audit Logs", icon: "▤", view: "info" }
    ]}
  ],

  districts: {
    "eThekwini":      { manufacturers: 284, funding: 62400000, jobs: 48700, output: 271000000000, growth: 8.4, bounds: [[-30.10, 30.75], [-29.60, 31.30]] },
    "uMgungundlovu":  { manufacturers: 142, funding: 38600000, jobs: 22400, output: 42800000000, growth: 6.2, bounds: [[-29.85, 29.95], [-29.30, 30.75]] },
    "Ugu":            { manufacturers:  86, funding: 24200000, jobs: 12800, output: 18600000000, growth: 4.8, bounds: [[-30.90, 29.90], [-30.15, 30.75]] },
    "iLembe":         { manufacturers:  74, funding: 19800000, jobs: 10200, output: 14200000000, growth: 5.6, bounds: [[-29.55, 30.90], [-28.95, 31.45]] },
    "King Cetshwayo": { manufacturers:  68, funding: 17400000, jobs:  9400, output: 11800000000, growth: 4.2, bounds: [[-29.05, 31.55], [-28.30, 32.30]] },
    "Zululand":       { manufacturers:  62, funding: 16200000, jobs:  8600, output: 10400000000, growth: 3.8, bounds: [[-28.75, 31.15], [-27.85, 32.10]] },
    "uThukela":       { manufacturers:  48, funding: 12400000, jobs:  6200, output:  7800000000, growth: 4.4, bounds: [[-28.85, 29.25], [-28.20, 30.00]] },
    "Amajuba":        { manufacturers:  42, funding: 10800000, jobs:  5400, output:  6800000000, growth: 3.6, bounds: [[-28.00, 29.60], [-27.40, 30.25]] },
    "uMzinyathi":     { manufacturers:  38, funding:  9600000, jobs:  4800, output:  5800000000, growth: 3.2, bounds: [[-28.85, 30.30], [-28.10, 31.00]] },
    "uMkhanyakude":   { manufacturers:  34, funding:  8400000, jobs:  4200, output:  4800000000, growth: 2.8, bounds: [[-28.05, 31.95], [-27.10, 32.95]] },
    "Harry Gwala":    { manufacturers:  28, funding:  6800000, jobs:  3400, output:  3800000000, growth: 2.4, bounds: [[-30.55, 29.30], [-29.85, 30.20]] }
  },

  primaryMetric: "manufacturers",
  primaryMetricLabel: "Manufacturers",
  colourScale: ["#dbeafe", "#93c5fd", "#3b82f6", "#1e3a8a"],

  accent: { primary: "#2563eb", light: "#dbeafe", mid: "#3b82f6" }
};
