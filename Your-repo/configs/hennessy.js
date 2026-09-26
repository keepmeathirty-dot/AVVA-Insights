window.AVVA_CONFIG = {
  id: "hennessy",
  workspaceName: "Hennessy Brand Intelligence",
  pageTitle: "Hennessy Brand Intelligence Workspace",
  pageSubtitle: "Market distribution. Consumer reach. Evidence for brand strategy.",
  dataDisclaimer: "Illustrative prototype data for demonstration. Not actual Hennessy or LVMH sales figures.",
  org: { name: "Reemerge Group", tagline: "Making Invisible Markets Visible." },
  user: { initials: "JM", name: "James Mokoena", role: "Brand Manager" },

  term: { entity: "Outlet", entityPlural: "Outlets", entityLower: "outlet", entityLowerPlural: "outlets" },

  geoScope: "both",

  map: {
    title: "Distribution Observatory",
    subtitle: "Where the brand is being purchased across KZN and nationally",
    center: [-29.0, 30.6],
    zoom: 7
  },

  layers: [
    { id: "volume", label: "Sales Volume", default: true },
    { id: "premium", label: "Premium Tier %", default: true },
    { id: "density", label: "Outlet Density", default: false },
    { id: "growth", label: "Growth Districts", default: false }
  ],

  periods: ["Live", "Day", "Week", "Month", "Quarter", "Year"],
  defaultPeriod: "Month",

  metrics: [
    { id: "outlets", label: "Active Outlets", icon: "▥", colour: "purple", format: "number" },
    { id: "revenue", label: "Revenue (Period)", icon: "▰", colour: "green", format: "currency-m" },
    { id: "units", label: "Units Sold", icon: "◉", colour: "teal", format: "number" },
    { id: "penetration", label: "Market Penetration", icon: "◇", colour: "gold", format: "percent", aggregate: "average" },
    { id: "growth", label: "Growth Rate", icon: "↗", colour: "cyan", format: "percent", aggregate: "average" },
    { id: "topMarket", label: "Top Market", icon: "★", colour: "purple", format: "static", value: "eThekwini" },
    { id: "marketingRoi", label: "Marketing ROI", icon: "✓", colour: "green", format: "static", value: "1.82" }
  ],

  brief: {
    title: "AI Brand Brief",
    subtitle: "Auto-summary · generated from current market data",
    items: [
      { icon: "♙", html: "<b>eThekwini</b> accounts for <b>38%</b> of KZN revenue — flagship market." },
      { icon: "♧", html: "Coastal districts show <b>2.3×</b> growth versus inland — seasonal tourism effect." },
      { icon: "▰", html: "<b>18 low-penetration districts</b> identified for retail expansion." },
      { icon: "▢", html: "Premium tier sales up <b>14%</b> — driven by on-trade channel." }
    ]
  },

  programmes: {
    title: "Active Campaigns",
    subtitle: "Marketing & retail programmes",
    items: [
      ["Durban Metro Premium Push", "R2.4m", 72],
      ["Coastal Retail Expansion", "R1.8m", 58],
      ["On-Trade Partnership Programme", "R3.1m", 81],
      ["National Heritage Campaign", "R4.2m", 65],
      ["Digital Awareness Drive", "R1.2m", 44]
    ]
  },

  bottomLeft: {
    type: "channels",
    title: "Sales by Channel",
    subtitle: "Revenue split across distribution channels",
    channels: [
      { label: "Off-Trade (Retail)", value: 48, colour: "#6d42ed" },
      { label: "On-Trade (Bars/Restaurants)", value: 33, colour: "#20b8ae" },
      { label: "E-Commerce", value: 19, colour: "#aebad0" }
    ]
  },

  trends: {
    title: "Sales Trend",
    subtitle: "Units · Revenue · Outlet Growth",
    period: "(12 Months)"
  },

  impact: {
    title: "Market Indicators",
    subtitle: "Consumer & distribution performance",
    items: [
      ["Repeat Purchase Rate", "64%"],
      ["Premium Tier Uplift", "+14%"],
      ["Active Retail Outlets", "auto:outlets"],
      ["Digital Channel Growth", "+22%"],
      ["Retail Partnerships", "1,247"]
    ]
  },

  quality: {
    title: "Data Quality & Coverage",
    subtitle: "Retail audit verification",
    items: [
      ["Outlet Coverage", 94],
      ["Geographic Coverage", 89],
      ["Data Completeness", 91],
      ["Audit Verification", 82]
    ]
  },

  navigation: [
    { section: "", items: [
      { id: "command", label: "Command Centre", icon: "⌂" },
      { id: "distribution", label: "Distribution Map", icon: "◎" },
      { id: "campaigns", label: "Campaigns", icon: "▤" },
      { id: "consumer", label: "Consumer Insights", icon: "♧" },
      { id: "geo", label: "Market Analysis", icon: "◇" },
      { id: "channels", label: "Channel Mix", icon: "◐" },
      { id: "revenue", label: "Revenue Tracker", icon: "▣" },
      { id: "premium", label: "Premium Tier", icon: "⌁" },
      { id: "reports", label: "Reports", icon: "▤" },
      { id: "ai", label: "AI Assistant", icon: "✧" }
    ]},
    { section: "TOOLS", items: [
      { id: "explorer", label: "Data Explorer", icon: "▦" },
      { id: "compare", label: "Compare Regions", icon: "≋" },
      { id: "alerts", label: "Alerts", icon: "♧" },
      { id: "audit", label: "Retail Audit Feed", icon: "▢" }
    ]},
    { section: "ADMIN", items: [
      { id: "settings", label: "Workspace Settings", icon: "⚙" },
      { id: "users", label: "User Management", icon: "♧" },
      { id: "sources", label: "Data Sources", icon: "▱" },
      { id: "logs", label: "Audit Logs", icon: "▤" }
    ]}
  ],

  districts: {
    "eThekwini":      { outlets: 1284, revenue: 7200000, units: 16200, penetration: 62, growth: 9.4, bounds: [[-30.10, 30.75], [-29.60, 31.30]] },
    "uMgungundlovu":  { outlets:  412, revenue: 2100000, units:  4800, penetration: 41, growth: 7.1, bounds: [[-29.85, 29.95], [-29.30, 30.75]] },
    "Ugu":            { outlets:  348, revenue: 2400000, units:  5400, penetration: 44, growth: 12.8, bounds: [[-30.90, 29.90], [-30.15, 30.75]] },
    "iLembe":         { outlets:  284, revenue: 1800000, units:  4100, penetration: 38, growth: 11.2, bounds: [[-29.55, 30.90], [-28.95, 31.45]] },
    "King Cetshwayo": { outlets:  261, revenue: 1400000, units:  3200, penetration: 31, growth: 6.8, bounds: [[-29.05, 31.55], [-28.30, 32.30]] },
    "Amajuba":        { outlets:  198, revenue:  900000, units:  2100, penetration: 26, growth: 4.2, bounds: [[-28.00, 29.60], [-27.40, 30.25]] },
    "uThukela":       { outlets:  212, revenue: 1100000, units:  2500, penetration: 29, growth: 5.6, bounds: [[-28.85, 29.25], [-28.20, 30.00]] },
    "Zululand":       { outlets:  241, revenue: 1300000, units:  3000, penetration: 27, growth: 8.1, bounds: [[-28.75, 31.15], [-27.85, 32.10]] },
    "uMzinyathi":     { outlets:  162, revenue:  680000, units:  1600, penetration: 19, growth: 3.8, bounds: [[-28.85, 30.30], [-28.10, 31.00]] },
    "uMkhanyakude":   { outlets:  148, revenue:  580000, units:  1400, penetration: 16, growth: 5.2, bounds: [[-28.05, 31.95], [-27.10, 32.95]] },
    "Harry Gwala":    { outlets:  146, revenue:  540000, units:  1300, penetration: 18, growth: 4.6, bounds: [[-30.55, 29.30], [-29.85, 30.20]] }
  },

  provinces: {
    "Gauteng":        { outlets: 3820, revenue: 18400000, units: 41200, penetration: 71, growth: 6.8, bounds: [[-26.90, 27.20], [-25.10, 29.10]] },
    "Western Cape":   { outlets: 2540, revenue: 12800000, units: 28900, penetration: 64, growth: 5.4, bounds: [[-34.85, 18.30], [-30.30, 24.90]] },
    "KwaZulu-Natal":  { outlets: 3816, revenue: 19900000, units: 45400, penetration: 34, growth: 8.2, bounds: [[-31.00, 28.90], [-26.80, 33.00]] },
    "Eastern Cape":   { outlets: 1420, revenue:  5100000, units: 12100, penetration: 28, growth: 4.2, bounds: [[-34.05, 22.70], [-30.00, 30.00]] },
    "Free State":     { outlets:  980, revenue:  3800000, units:  8900, penetration: 31, growth: 3.6, bounds: [[-30.70, 24.30], [-26.70, 29.40]] },
    "Mpumalanga":     { outlets:  890, revenue:  3400000, units:  7800, penetration: 29, growth: 4.8, bounds: [[-27.30, 28.90], [-24.20, 32.00]] },
    "North West":     { outlets:  760, revenue:  2900000, units:  6600, penetration: 26, growth: 3.4, bounds: [[-28.10, 22.20], [-24.60, 28.10]] },
    "Limpopo":        { outlets:  680, revenue:  2400000, units:  5500, penetration: 22, growth: 3.1, bounds: [[-25.50, 25.80], [-22.10, 31.90]] },
    "Northern Cape":  { outlets:  320, revenue:  1100000, units:  2400, penetration: 19, growth: 2.4, bounds: [[-32.90, 16.40], [-24.70, 25.70]] }
  },

  primaryMetric: "revenue",
  primaryMetricLabel: "Revenue",
  colourScale: ["#fdf3d7", "#e6b95e", "#b8860b", "#5c2e00"],

  accent: { primary: "#b8860b", light: "#fdf3d7", mid: "#d4a017" }
};
