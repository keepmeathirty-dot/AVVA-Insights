window.AVVA_CONFIG = {
  id: "healthcare-fund",
  workspaceName: "KZN Health Fund Workspace",
  pageTitle: "KwaZulu-Natal Health Fund Workspace",
  pageSubtitle: "Facility support. Workforce development. Evidence for health impact.",
  dataDisclaimer: "Facility and workforce figures based on Stats SA and DHIS data (2023-2025). Programme disbursement data is modelled for demonstration purposes.",
  org: { name: "Reemerge Group", tagline: "Making Invisible Markets Visible." },
  user: { initials: "NM", name: "Nomsa Mthembu", role: "Health Programme Manager" },

  term: { entity: "Facility", entityPlural: "Facilities", entityLower: "facility", entityLowerPlural: "facilities" },

  geoScope: "districts",

  map: {
    title: "Health Facility Support Observatory",
    subtitle: "Where health funding and equipment support is delivered across KZN",
    center: [-29.0, 30.6],
    zoom: 8
  },

  layers: [
    { id: "facilities", label: "Facilities Supported", default: true },
    { id: "staff", label: "Staff Trained", default: true },
    { id: "equipment", label: "Equipment Deployed", default: false },
    { id: "coverage", label: "Service Coverage %", default: false }
  ],

  periods: ["Live", "Day", "Week", "Month", "Quarter", "Year"],
  defaultPeriod: "Month",

  metrics: [
    { id: "facilities", label: "Facilities Supported", icon: "▥", colour: "teal", format: "number" },
    { id: "funding", label: "Funding Disbursed", icon: "▰", colour: "purple", format: "currency-m" },
    { id: "staff", label: "Staff Trained", icon: "♧", colour: "green", format: "number" },
    { id: "beds", label: "Bed Capacity", icon: "◉", colour: "gold", format: "number" },
    { id: "coverage", label: "Service Coverage", icon: "◇", colour: "cyan", format: "percent", aggregate: "average" },
    { id: "topFacility", label: "Top District", icon: "★", colour: "purple", format: "static", value: "eThekwini" },
    { id: "verification", label: "Verification Rate", icon: "✓", colour: "green", format: "static", value: "82%" }
  ],

  brief: {
    title: "AI Health Impact Brief",
    subtitle: "Auto-summary · generated from current facility data",
    items: [
      { icon: "♙", html: "<b>eThekwini</b> supports the largest facility network — 128 clinics and 12 hospitals." },
      { icon: "♧", html: "KZN has <b>547 clinics + 153 mobile clinics</b> serving 24.3M primary healthcare visits annually." },
      { icon: "▰", html: "<b>32,151 nursing professionals</b> employed in KZN public health sector." },
      { icon: "▢", html: "Equipment deployment reached <b>76%</b> of targeted facilities this period." }
    ]
  },

  programmes: {
    title: "Active Funding Streams",
    subtitle: "Health support programmes",
    items: [
      ["Primary Healthcare Infrastructure Fund", "R48.2m", 68],
      ["Medical Equipment Deployment Programme", "R32.1m", 74],
      ["Health Worker Training Initiative", "R18.6m", 82],
      ["Mobile Clinic Expansion Project", "R12.4m", 55],
      ["Facility Compliance Support", "R8.8m", 41]
    ]
  },

  bottomLeft: {
    type: "sdg",
    title: "SDG Health Alignment",
    subtitle: "Contribution to Sustainable Development Goals",
    tiles: [
      ["3", "GOOD HEALTH", "#4c9f38"],
      ["5", "GENDER EQUALITY", "#ff3a21"],
      ["8", "DECENT WORK", "#a21942"],
      ["10", "REDUCED INEQUALITIES", "#dd1367"],
      ["17", "PARTNERSHIPS", "#19486a"]
    ],
    percentages: ["82%", "71%", "64%", "69%", "58%"]
  },

  trends: {
    title: "Facility Support Trends",
    subtitle: "Facilities · Staff · Equipment",
    period: "(12 Months)"
  },

  impact: {
    title: "Health Impact Indicators",
    subtitle: "Programme outcomes",
    items: [
      ["Facility Compliance Rate", "78%"],
      ["Staff Retention Rate", "84%"],
      ["Patients Reached", "auto:beds"],
      ["Equipment Utilisation", "71%"],
      ["Community Health Workers", "12,847"]
    ]
  },

  quality: {
    title: "Data Quality & Coverage",
    subtitle: "Facility verification measures",
    items: [
      ["Facility Coverage", 89],
      ["Geographic Coverage", 91],
      ["Data Completeness", 87],
      ["Equipment Verification", 82]
    ]
  },

    navigation: [
    { section: "", items: [
      { id: "command", label: "Command Centre", icon: "⌂", view: "map" },
      { id: "facilities", label: "Facility Observatory", icon: "◎", view: "map" },
      { id: "post-programme", label: "Post a Programme", icon: "＋", view: "form", action: "open-programme-form" },
      { id: "programmes", label: "Funding Streams", icon: "▤", view: "cards", cards: { type: "programmes" } },
      { id: "funding", label: "Funding Tracker", icon: "▣", view: "table", table: { source: "districts", columns: ["name","facilities","funding","staff","beds","coverage"] } },
      { id: "geo", label: "District Analysis", icon: "◇", view: "table", table: { source: "districts", columns: ["name","facilities","funding","staff","beds","coverage"] } },
      { id: "workforce", label: "Workforce Insights", icon: "♧", view: "table", table: { source: "districts", columns: ["name","staff","facilities"] } },
      { id: "impact", label: "Impact Monitoring", icon: "⌁", view: "table", table: { source: "districts", columns: ["name","beds","coverage"] } },
      { id: "reports", label: "Reports", icon: "▤", view: "cards", cards: { type: "reports" } },
      { id: "ai", label: "AI Assistant", icon: "✧", view: "chat" }
    ]},
    { section: "TOOLS", items: [
      { id: "explorer", label: "Data Explorer", icon: "▦", view: "table", table: { source: "districts", columns: ["name","facilities","funding","staff","beds","coverage"] } },
      { id: "compare", label: "Compare Districts", icon: "≋", view: "table", table: { source: "districts", columns: ["name","facilities","beds"] } },
      { id: "alerts", label: "Alerts", icon: "♧", view: "cards", cards: { type: "alerts" }, badge: "3" },
      { id: "audit", label: "Audit Feed", icon: "▢", view: "info" }
    ]},
    { section: "ADMIN", items: [
      { id: "settings", label: "Workspace Settings", icon: "⚙", view: "info" },
      { id: "users", label: "User Management", icon: "♧", view: "info" },
      { id: "sources", label: "Data Sources", icon: "▱", view: "info" },
      { id: "logs", label: "Audit Logs", icon: "▤", view: "info" }
    ]}
  ],
  sectors: ["Healthcare"],
    { section: "TOOLS", items: [
      { id: "explorer", label: "Data Explorer", icon: "▦" },
      { id: "compare", label: "Compare Districts", icon: "≋" },
      { id: "alerts", label: "Alerts", icon: "♧" },
      { id: "audit", label: "Audit Feed", icon: "▢" }
    ]},
    { section: "ADMIN", items: [
      { id: "settings", label: "Workspace Settings", icon: "⚙" },
      { id: "users", label: "User Management", icon: "♧" },
      { id: "sources", label: "Data Sources", icon: "▱" },
      { id: "logs", label: "Audit Logs", icon: "▤" }
    ]}
  ],

  districts: {
    "eThekwini":      { facilities: 128, funding: 48200000, staff: 8420, beds: 6840, coverage: 78, bounds: [[-30.10, 30.75], [-29.60, 31.30]] },
    "uMgungundlovu":  { facilities:  68, funding: 28600000, staff: 4210, beds: 3420, coverage: 72, bounds: [[-29.85, 29.95], [-29.30, 30.75]] },
    "Ugu":            { facilities:  52, funding: 18400000, staff: 2840, beds: 2180, coverage: 65, bounds: [[-30.90, 29.90], [-30.15, 30.75]] },
    "iLembe":         { facilities:  44, funding: 15200000, staff: 2210, beds: 1680, coverage: 68, bounds: [[-29.55, 30.90], [-28.95, 31.45]] },
    "King Cetshwayo": { facilities:  58, funding: 19800000, staff: 3120, beds: 2460, coverage: 61, bounds: [[-29.05, 31.55], [-28.30, 32.30]] },
    "Zululand":       { facilities:  62, funding: 21400000, staff: 3480, beds: 2720, coverage: 58, bounds: [[-28.75, 31.15], [-27.85, 32.10]] },
    "uThukela":       { facilities:  48, funding: 14600000, staff: 2340, beds: 1820, coverage: 62, bounds: [[-28.85, 29.25], [-28.20, 30.00]] },
    "Amajuba":        { facilities:  38, funding: 11200000, staff: 1680, beds: 1240, coverage: 66, bounds: [[-28.00, 29.60], [-27.40, 30.25]] },
    "uMzinyathi":     { facilities:  42, funding: 12800000, staff: 1920, beds: 1460, coverage: 54, bounds: [[-28.85, 30.30], [-28.10, 31.00]] },
    "uMkhanyakude":   { facilities:  46, funding: 13400000, staff: 2040, beds: 1580, coverage: 48, bounds: [[-28.05, 31.95], [-27.10, 32.95]] },
    "Harry Gwala":    { facilities:  36, funding: 10200000, staff: 1520, beds: 1140, coverage: 52, bounds: [[-30.55, 29.30], [-29.85, 30.20]] }
  },

  primaryMetric: "facilities",
  primaryMetricLabel: "Facilities",
  colourScale: ["#ccfbf1", "#5eead4", "#14b8a6", "#0f766e"],

  accent: { primary: "#0d9488", light: "#ccfbf1", mid: "#14b8a6" }
};
