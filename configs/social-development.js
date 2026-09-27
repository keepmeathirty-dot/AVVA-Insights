window.AVVA_CONFIG = {
  id: "social-development",
  workspaceName: "KZN Social Development Workspace",
  pageTitle: "KwaZulu-Natal Social Development Workspace",
  pageSubtitle: "NGO support. Youth empowerment. Community impact.",
  dataDisclaimer: "NPO registration figures based on DSD State of NPO Register (2024/25). Programme disbursement data is modelled for demonstration purposes.",
  org: { name: "Reemerge Group", tagline: "Making Invisible Markets Visible." },
  user: { initials: "SM", name: "Sipho Mahlangu", role: "Social Development Lead" },

  term: { entity: "Organisation", entityPlural: "Organisations", entityLower: "organisation", entityLowerPlural: "organisations" },

  geoScope: "districts",

  map: {
    title: "NGO Support Observatory",
    subtitle: "Where social development funding and training is delivered across KZN",
    center: [-29.0, 30.6],
    zoom: 8
  },

  layers: [
    { id: "ngos", label: "NGOs Supported", default: true },
    { id: "beneficiaries", label: "Beneficiaries Reached", default: true },
    { id: "training", label: "Training Delivered", default: false },
    { id: "funding", label: "Funding Intensity", default: false }
  ],

  periods: ["Live", "Day", "Week", "Month", "Quarter", "Year"],
  defaultPeriod: "Month",

  metrics: [
    { id: "ngos", label: "NGOs Supported", icon: "▥", colour: "purple", format: "number" },
    { id: "funding", label: "Funding Disbursed", icon: "▰", colour: "green", format: "currency-m" },
    { id: "beneficiaries", label: "Beneficiaries Reached", icon: "♧", colour: "teal", format: "number" },
    { id: "training", label: "Training Delivered", icon: "◉", colour: "gold", format: "number" },
    { id: "completion", label: "Completion Rate", icon: "◇", colour: "cyan", format: "percent", aggregate: "average" },
    { id: "topDistrict", label: "Top District", icon: "★", colour: "purple", format: "static", value: "eThekwini" },
    { id: "verification", label: "Verification Rate", icon: "✓", colour: "green", format: "static", value: "74%" }
  ],

  brief: {
    title: "AI Social Impact Brief",
    subtitle: "Auto-summary · generated from current organisation data",
    items: [
      { icon: "♙", html: "<b>KZN has 50,165 registered NPOs</b> — 17.8% of South Africa's total." },
      { icon: "♧", html: "<b>eThekwini</b> hosts the largest concentration of social development organisations." },
      { icon: "▰", html: "Development & Housing NPOs: <b>70,060</b> nationally — largest sector category." },
      { icon: "▢", html: "Youth-owned and women-led organisations represent <b>42%</b> of supported entities." }
    ]
  },

  programmes: {
    title: "Active Funding Streams",
    subtitle: "Social development programmes",
    items: [
      ["NGO Capacity Building Fund", "R28.4m", 68],
      ["Youth Entrepreneurship Support", "R22.6m", 74],
      ["Women-Led Organisation Grant", "R18.2m", 81],
      ["Skills Training Initiative", "R14.8m", 62],
      ["Community Development Programme", "R11.4m", 55]
    ]
  },

  bottomLeft: {
    type: "sdg",
    title: "SDG Social Alignment",
    subtitle: "Contribution to Sustainable Development Goals",
    tiles: [
      ["1", "NO POVERTY", "#e5243b"],
      ["4", "QUALITY EDUCATION", "#c5192d"],
      ["5", "GENDER EQUALITY", "#ff3a21"],
      ["8", "DECENT WORK", "#a21942"],
      ["10", "REDUCED INEQUALITIES", "#dd1367"]
    ],
    percentages: ["76%", "83%", "79%", "68%", "72%"]
  },

  trends: {
    title: "NGO Support Trends",
    subtitle: "Organisations · Beneficiaries · Training",
    period: "(12 Months)"
  },

  impact: {
    title: "Social Impact Indicators",
    subtitle: "Programme outcomes",
    items: [
      ["NGO Survival Rate", "79%"],
      ["Beneficiaries Reached", "auto:beneficiaries"],
      ["Training Completion", "84%"],
      ["Employment Outcomes", "42%"],
      ["Community Partnerships", "3,847"]
    ]
  },

  quality: {
    title: "Data Quality & Coverage",
    subtitle: "Organisation verification measures",
    items: [
      ["NGO Coverage", 82],
      ["Geographic Coverage", 86],
      ["Data Completeness", 81],
      ["Compliance Verification", 74]
    ]
  },

  navigation: [
    { section: "", items: [
      { id: "command", label: "Command Centre", icon: "⌂" },
      { id: "ngos", label: "NGO Observatory", icon: "◎" },
      { id: "funding", label: "Funding Streams", icon: "▤" },
      { id: "beneficiaries", label: "Beneficiary Insights", icon: "♧" },
      { id: "geo", label: "District Analysis", icon: "◇" },
      { id: "training", label: "Training Tracker", icon: "▣" },
      { id: "impact", label: "Impact Monitoring", icon: "⌁" },
      { id: "reports", label: "Reports", icon: "▤" },
      { id: "ai", label: "AI Assistant", icon: "✧" }
    ]},
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
    "eThekwini":      { ngos: 1284, funding: 28400000, beneficiaries: 48200, training: 842, completion: 78, bounds: [[-30.10, 30.75], [-29.60, 31.30]] },
    "uMgungundlovu":  { ngos:  642, funding: 16200000, beneficiaries: 26400, training: 486, completion: 74, bounds: [[-29.85, 29.95], [-29.30, 30.75]] },
    "Ugu":            { ngos:  428, funding: 11800000, beneficiaries: 18200, training: 342, completion: 68, bounds: [[-30.90, 29.90], [-30.15, 30.75]] },
    "iLembe":         { ngos:  386, funding: 10400000, beneficiaries: 16400, training: 298, completion: 71, bounds: [[-29.55, 30.90], [-28.95, 31.45]] },
    "King Cetshwayo": { ngos:  342, funding:  9400000, beneficiaries: 14800, training: 268, completion: 62, bounds: [[-29.05, 31.55], [-28.30, 32.30]] },
    "Zululand":       { ngos:  318, funding:  8600000, beneficiaries: 13200, training: 242, completion: 58, bounds: [[-28.75, 31.15], [-27.85, 32.10]] },
    "uThukela":       { ngos:  284, funding:  7800000, beneficiaries: 11800, training: 218, completion: 64, bounds: [[-28.85, 29.25], [-28.20, 30.00]] },
    "Amajuba":        { ngos:  218, funding:  5800000, beneficiaries:  8600, training: 164, completion: 66, bounds: [[-28.00, 29.60], [-27.40, 30.25]] },
    "uMzinyathi":     { ngos:  246, funding:  6400000, beneficiaries:  9800, training: 182, completion: 54, bounds: [[-28.85, 30.30], [-28.10, 31.00]] },
    "uMkhanyakude":   { ngos:  268, funding:  7200000, beneficiaries: 10800, training: 196, completion: 48, bounds: [[-28.05, 31.95], [-27.10, 32.95]] },
    "Harry Gwala":    { ngos:  192, funding:  5200000, beneficiaries:  7600, training: 142, completion: 52, bounds: [[-30.55, 29.30], [-29.85, 30.20]] }
  },

  primaryMetric: "ngos",
  primaryMetricLabel: "NGOs",
  colourScale: ["#fce7f3", "#f9a8d4", "#ec4899", "#831843"],

  accent: { primary: "#db2777", light: "#fce7f3", mid: "#ec4899" }
};
