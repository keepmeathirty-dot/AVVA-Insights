window.AVVA_CONFIG = {
  id: "kzn-doa",
  workspaceName: "KZN Dept. of Agriculture",
  pageTitle: "KwaZulu-Natal Agriculture Workspace",
  pageSubtitle: "Farm support. Funding accountability. Evidence for the province.",
  dataDisclaimer: "Farm figures based on Stats SA Census of Commercial Agriculture 2017 and modelled estimates. Not actual DoA beneficiary records.",
  org: { name: "Reemerge Group", tagline: "Making Invisible Markets Visible." },
  user: { initials: "AM", name: "Anna Mbeki", role: "Impact Manager" },

  term: { entity: "Farm", entityPlural: "Farms", entityLower: "farm", entityLowerPlural: "farms" },

  geoScope: "districts",

  map: {
    title: "Farm Support Observatory",
    subtitle: "Explore where agricultural support is delivered across KwaZulu-Natal",
    center: [-29.0, 30.6],
    zoom: 8
  },

  layers: [
    { id: "density", label: "Farm Density", default: true },
    { id: "funding", label: "Funding Intensity", default: true },
    { id: "commercial", label: "Commercialisation %", default: false },
    { id: "flags", label: "Flagged Projects", default: false }
  ],

  periods: ["Live", "Day", "Week", "Month", "Quarter", "Year"],
  defaultPeriod: "Month",

  metrics: [
    { id: "farms", label: "Farms Assisted", icon: "▥", colour: "green", format: "number" },
    { id: "funding", label: "Funding Disbursed", icon: "▰", colour: "purple", format: "currency-m" },
    { id: "jobs", label: "Jobs Created", icon: "♧", colour: "teal", format: "number" },
    { id: "commercial", label: "Commercialisation Rate", icon: "◉", colour: "gold", format: "percent", aggregate: "average" },
    { id: "flags", label: "Flagged Projects", icon: "⚠", colour: "red", format: "number" },
    { id: "coverage", label: "District Coverage", icon: "◇", colour: "cyan", format: "static", value: "11 / 11" },
    { id: "verification", label: "Verification Rate", icon: "✓", colour: "purple", format: "static", value: "76%" }
  ],

  brief: {
    title: "AI Impact Brief",
    subtitle: "Auto-summary · generated from current district data",
    items: [
      { icon: "♙", html: "<b>uMgungundlovu</b> leads KZN with <b>696</b> commercial farms, employing 18,828 people." },
      { icon: "♧", html: "Overall commercialisation rate at <b>18%</b> — below the 30% departmental target." },
      { icon: "▰", html: "<b>30 projects</b> flagged for review across 5 districts, mostly in uMkhanyakude and Harry Gwala." },
      { icon: "▢", html: "VulaScan verified <b>76%</b> of reported farm activity this period." }
    ]
  },

  programmes: {
    title: "Active Programmes",
    subtitle: "Portfolio overview",
    items: [
      ["KZN Growth Fund — Agri Portfolio", "1,342", 58],
      ["Comprehensive Agricultural Support Programme", "2,187", 72],
      ["Land Care Programme", "1,018", 41],
      ["Farmer Support & Development", "3,421", 63],
      ["VulaScan Field Verification", "842", 37]
    ]
  },

  bottomLeft: {
    type: "sdg",
    title: "SDG Impact Overview",
    subtitle: "Alignment with Sustainable Development Goals",
    tiles: [
      ["1", "NO POVERTY", "#ef3437"],
      ["2", "ZERO HUNGER", "#ff771e"],
      ["5", "GENDER EQUALITY", "#a40948"],
      ["8", "DECENT WORK", "#d82670"],
      ["10", "REDUCED INEQUALITIES", "#c98b10"]
    ],
    percentages: ["78%", "82%", "74%", "71%", "65%"]
  },

  trends: {
    title: "Farms Assisted Trends",
    subtitle: "Registered · Assisted · Commercially Active",
    period: "(12 Months)"
  },

  impact: {
    title: "Impact Indicators",
    subtitle: "Programme outcomes",
    items: [
      ["Farm Survival Rate (12m)", "81%"],
      ["Average Income Growth", "18.6%"],
      ["Jobs Supported", "auto:jobs"],
      ["Digital Adoption Rate", "63%"],
      ["Market Linkages", "22,418"]
    ]
  },

  quality: {
    title: "Data Quality & Coverage",
    subtitle: "Verification measures",
    items: [
      ["Farm Coverage", 92],
      ["Geographic Coverage", 87],
      ["Data Completeness", 90],
      ["VulaScan Verification", 76]
    ]
  },

  navigation: [
    { section: "", items: [
      { id: "command", label: "Command Centre", icon: "⌂" },
      { id: "observatory", label: "Farm Observatory", icon: "◎" },
      { id: "programmes", label: "Support Programmes", icon: "▤" },
      { id: "insights", label: "Farm Insights", icon: "♧" },
      { id: "geo", label: "District Analysis", icon: "◇" },
      { id: "women", label: "Women & Youth", icon: "♧" },
      { id: "funding", label: "Funding Tracker", icon: "▣" },
      { id: "impact", label: "Impact Monitoring", icon: "⌁" },
      { id: "reports", label: "Reports", icon: "▤" },
      { id: "ai", label: "AI Assistant", icon: "✧" }
    ]},
    { section: "TOOLS", items: [
      { id: "explorer", label: "Data Explorer", icon: "▦" },
      { id: "compare", label: "Compare Districts", icon: "≋" },
      { id: "alerts", label: "Alerts", icon: "♧" },
      { id: "vulascan", label: "VulaScan Feed", icon: "▢" }
    ]},
    { section: "ADMIN", items: [
      { id: "settings", label: "Workspace Settings", icon: "⚙" },
      { id: "users", label: "User Management", icon: "♧" },
      { id: "sources", label: "Data Sources", icon: "▱" },
      { id: "audit", label: "Audit Logs", icon: "▤" }
    ]}
  ],

  districts: {
    "eThekwini":      { farms: 892, funding: 42000000, jobs: 22400, commercial: 34, flags: 2, bounds: [[-30.10, 30.75], [-29.60, 31.30]] },
    "uMgungundlovu":  { farms: 696, funding: 38000000, jobs: 18828, commercial: 28, flags: 1, bounds: [[-29.85, 29.95], [-29.30, 30.75]] },
    "uThukela":       { farms: 364, funding: 12500000, jobs:  4200, commercial: 15, flags: 3, bounds: [[-28.85, 29.25], [-28.20, 30.00]] },
    "Zululand":       { farms: 358, funding: 14800000, jobs:  5100, commercial: 19, flags: 2, bounds: [[-28.75, 31.15], [-27.85, 32.10]] },
    "uMzinyathi":     { farms: 312, funding: 11200000, jobs:  3800, commercial: 11, flags: 4, bounds: [[-28.85, 30.30], [-28.10, 31.00]] },
    "King Cetshwayo": { farms: 298, funding: 10500000, jobs:  3400, commercial: 16, flags: 3, bounds: [[-29.05, 31.55], [-28.30, 32.30]] },
    "Amajuba":        { farms: 242, funding:  8900000, jobs:  2600, commercial: 18, flags: 2, bounds: [[-28.00, 29.60], [-27.40, 30.25]] },
    "uMkhanyakude":   { farms: 224, funding:  7400000, jobs:  2100, commercial:  9, flags: 5, bounds: [[-28.05, 31.95], [-27.10, 32.95]] },
    "iLembe":         { farms: 208, funding:  8200000, jobs:  2400, commercial: 22, flags: 2, bounds: [[-29.55, 30.90], [-28.95, 31.45]] },
    "Ugu":            { farms: 196, funding:  6800000, jobs:  1900, commercial: 14, flags: 3, bounds: [[-30.90, 29.90], [-30.15, 30.75]] },
    "Harry Gwala":    { farms: 184, funding:  6200000, jobs:  1700, commercial: 12, flags: 4, bounds: [[-30.55, 29.30], [-29.85, 30.20]] }
  },

  primaryMetric: "farms",
  primaryMetricLabel: "Farms",
  colourScale: ["#a7f3d0", "#34d399", "#059669", "#064e3b"],

  accent: { primary: "#4f25d8", light: "#f0eeff", mid: "#6845e8" }
};
