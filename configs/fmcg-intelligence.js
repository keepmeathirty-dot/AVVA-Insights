/* ================================================================
   AVVA INSIGHTS — FMCG INTELLIGENCE WORKSPACE
   Tiger Brands Perfect Store & Informal Retail Demonstration
   ----------------------------------------------------------------
   Synthetic demonstration data. All figures modelled for pitch
   purposes only. Not actual Tiger Brands market data.
   ================================================================ */
window.AVVA_CONFIG = {
  id: "fmcg-intelligence",
  workspaceName: "Tiger Brands — FMCG Intelligence",
  pageTitle: "FMCG Intelligence Workspace",
  pageSubtitle: "Perfect Store execution. Informal retail visibility. Trader development.",
  dataDisclaimer: "Demonstration data. All figures are synthetic and modelled for pitch purposes only.",
  org: { name: "Reemerge Group", tagline: "Making Invisible Markets Visible." },
  user: { initials: "TB", name: "Tiger Brands Team", role: "Commercial Insights" },

  term: { entity: "Merchant", entityPlural: "Merchants", entityLower: "merchant", entityLowerPlural: "merchants" },

  sectors: ["Staple Foods","Snacks & Confectionery","Beverages","Cooking Aids","Household","Personal Care"],

  geoScope: "districts",

  map: {
    title: "Informal Retail Observatory",
    subtitle: "Merchant distribution and product movement across South African corridors",
    center: [-29.0, 24.5],
    zoom: 6
  },

  layers: [
    { id: "movement", label: "Product Movement", default: true },
    { id: "merchants", label: "Participating Merchants", default: true },
    { id: "availability", label: "SKU Availability", default: false },
    { id: "perfectstore", label: "Perfect Store Score", default: false }
  ],

  periods: ["Live","Week","Month","Quarter","Year"],
  defaultPeriod: "Month",

  metrics: [
    { id: "merchants", label: "Participating Merchants", icon: "▥", colour: "purple", format: "number" },
    { id: "active_merchants", label: "Active Merchants", icon: "◉", colour: "green", format: "number" },
    { id: "product_movement_rands", label: "Product Movement", icon: "▰", colour: "gold", format: "currency-m" },
    { id: "sku_availability_pct", label: "SKU Availability", icon: "◇", colour: "teal", format: "percent", aggregate: "average" },
    { id: "perfect_store_score_pct", label: "Perfect Store Score", icon: "★", colour: "cyan", format: "percent", aggregate: "average" },
    { id: "sales_rep_visits", label: "Sales Rep Visits", icon: "♧", colour: "purple", format: "number" },
    { id: "sales_rep_coverage_pct", label: "Sales Rep Coverage", icon: "✓", colour: "green", format: "percent", aggregate: "average" }
  ],

  brief: {
    title: "AI Commercial Intelligence Brief",
    subtitle: "Auto-summary · generated from current merchant data",
    items: [
      { icon: "♙", html: "<b>29 districts</b> reporting across all 9 provinces this period." },
      { icon: "♧", html: "Gauteng corridor leads with <b>R15.0m</b> product movement — 31% of national total." },
      { icon: "▰", html: "SKU availability averages <b>60%</b> — headroom for range expansion in 12 districts." },
      { icon: "▢", html: "Perfect Store execution at <b>63%</b> — 3 priority corridors flagged for rep follow-up." }
    ]
  },

  programmes: {
    title: "Active Trader Programmes",
    subtitle: "Merchant development and Perfect Store initiatives",
    items: [
      ["Perfect Store Pilot — Gauteng", "1,284", 74],
      ["Township Trader Onboarding", "2,187", 62],
      ["VulaScan Business Passport Drive", "1,018", 41],
      ["Supplier Development Programme", "892", 58],
      ["Digital Recordkeeping Initiative", "1,421", 66]
    ]
  },

  bottomLeft: {
    type: "channels",
    title: "Product Movement by Category",
    subtitle: "Category share of reported movement",
    channels: [
      { label: "Staple Foods", value: 34, colour: "#f97316" },
      { label: "Snacks & Confectionery", value: 24, colour: "#dc2626" },
      { label: "Beverages", value: 18, colour: "#0891b2" },
      { label: "Cooking Aids", value: 12, colour: "#7c3aed" },
      { label: "Other Categories", value: 12, colour: "#94a3b8" }
    ]
  },

  trends: { title: "Product Movement Trends", subtitle: "Monthly movement across reporting merchants", period: "(12 Months)" },

  impact: {
    title: "Commercial Impact Indicators",
    subtitle: "Merchant development outcomes",
    items: [
      ["Merchant Retention Rate", "87%"],
      ["Average Movement per Merchant", "R9,850"],
      ["Active Merchant Ratio", "auto:active_merchants"],
      ["Perfect Store Pass Rate", "63%"],
      ["Reported Stock Gaps", "1,247"]
    ]
  },

  quality: {
    title: "Data Quality & Coverage",
    subtitle: "Reporting verification measures",
    items: [
      ["Merchant Coverage", 88],
      ["Geographic Coverage", 84],
      ["Reporting Completeness", 79],
      ["VulaScan Verification", 71]
    ]
  },

  navigation: [
    { section: "", items: [
      { id: "command", label: "Command Centre", icon: "⌂", view: "map" },
      { id: "retail-observatory", label: "Informal Retail Observatory", icon: "◎", view: "map" },
      { id: "merchant-profiles", label: "Merchant Profiles", icon: "▤", view: "cards", cards: { type: "merchants" } },
      { id: "merchant-onboarding", label: "Merchant Onboarding", icon: "＋", view: "info" },
      { id: "product-movement", label: "Product Movement", icon: "▰", view: "table", table: { source: "districts", columns: ["name","product_movement_rands","product_movement_units","merchants","active_merchants"] } },
      { id: "category-brand", label: "Category & Brand Analytics", icon: "◐", view: "table", table: { source: "districts", columns: ["name","product_movement_rands","sku_availability_pct","perfect_store_score_pct"] } },
      { id: "availability", label: "Availability & Stock", icon: "◇", view: "table", table: { source: "districts", columns: ["name","sku_availability_pct","active_merchants"] } },
      { id: "corridor", label: "Corridor Intelligence", icon: "≋", view: "table", table: { source: "districts", columns: ["name","product_movement_rands","merchants","sales_rep_coverage_pct"] } },
      { id: "sales-rep", label: "Sales Representative Support", icon: "♧", view: "table", table: { source: "districts", columns: ["name","sales_rep_visits","sales_rep_coverage_pct"] } },
      { id: "perfect-store", label: "Perfect Store Execution", icon: "★", view: "table", table: { source: "districts", columns: ["name","perfect_store_score_pct","sku_availability_pct"] } },
      { id: "trader-development", label: "Trader Development", icon: "⌁", view: "cards", cards: { type: "programmes" } },
      { id: "reports", label: "Reports & AI Insights", icon: "▤", view: "cards", cards: { type: "reports" } },
      { id: "ai", label: "AI Assistant", icon: "✧", view: "chat" }
    ]},
    { section: "TOOLS", items: [
      { id: "explorer", label: "Data Explorer", icon: "▦", view: "table", table: { source: "districts" } },
      { id: "compare", label: "Compare Corridors", icon: "≋", view: "table", table: { source: "districts", columns: ["name","product_movement_rands","merchants"] } }
    ]},
    { section: "ADMIN", items: [
      { id: "settings", label: "Workspace Settings", icon: "⚙", view: "info" },
      { id: "permissions", label: "Data & Permissions", icon: "♧", view: "info" },
      { id: "sources", label: "Data Sources", icon: "▱", view: "info" },
      { id: "audit", label: "Audit Logs", icon: "▤", view: "info" }
    ]}
  ],

  districts: {
    "City of Johannesburg": { product_movement_rands: 4820000, merchants: 485, active_merchants: 391, sku_availability_pct: 72, perfect_store_score_pct: 74, sales_rep_visits: 184, product_movement_units: 28900, sales_rep_coverage_pct: 86, bounds: [[-26.40,27.75],[-26.00,28.15]] },
    "City of Tshwane":      { product_movement_rands: 3980000, merchants: 412, active_merchants: 340, sku_availability_pct: 69, perfect_store_score_pct: 71, sales_rep_visits: 162, product_movement_units: 24100, sales_rep_coverage_pct: 82, bounds: [[-25.95,27.75],[-25.35,28.65]] },
    "Ekurhuleni":           { product_movement_rands: 3520000, merchants: 368, active_merchants: 298, sku_availability_pct: 66, perfect_store_score_pct: 68, sales_rep_visits: 148, product_movement_units: 21400, sales_rep_coverage_pct: 79, bounds: [[-26.35,28.05],[-25.95,28.55]] },
    "Sedibeng":             { product_movement_rands: 1240000, merchants: 142, active_merchants: 108, sku_availability_pct: 58, perfect_store_score_pct: 61, sales_rep_visits:  58, product_movement_units:  7500, sales_rep_coverage_pct: 71, bounds: [[-26.90,27.75],[-26.40,28.30]] },
    "West Rand":            { product_movement_rands: 1480000, merchants: 168, active_merchants: 131, sku_availability_pct: 61, perfect_store_score_pct: 63, sales_rep_visits:  68, product_movement_units:  8900, sales_rep_coverage_pct: 74, bounds: [[-26.35,27.35],[-25.85,27.85]] },
    "eThekwini":            { product_movement_rands: 4260000, merchants: 438, active_merchants: 359, sku_availability_pct: 70, perfect_store_score_pct: 72, sales_rep_visits: 172, product_movement_units: 25800, sales_rep_coverage_pct: 84, bounds: [[-30.10,30.75],[-29.60,31.30]] },
    "uMgungundlovu":        { product_movement_rands: 1720000, merchants: 196, active_merchants: 152, sku_availability_pct: 62, perfect_store_score_pct: 64, sales_rep_visits:  76, product_movement_units: 10400, sales_rep_coverage_pct: 72, bounds: [[-29.85,29.95],[-29.30,30.75]] },
    "iLembe":               { product_movement_rands: 1080000, merchants: 124, active_merchants:  94, sku_availability_pct: 57, perfect_store_score_pct: 58, sales_rep_visits:  48, product_movement_units:  6500, sales_rep_coverage_pct: 68, bounds: [[-29.55,30.90],[-28.95,31.45]] },
    "Ugu":                  { product_movement_rands: 1010000, merchants: 118, active_merchants:  88, sku_availability_pct: 55, perfect_store_score_pct: 56, sales_rep_visits:  44, product_movement_units:  6100, sales_rep_coverage_pct: 65, bounds: [[-30.90,29.90],[-30.15,30.75]] },
    "King Cetshwayo":       { product_movement_rands: 1140000, merchants: 132, active_merchants:  99, sku_availability_pct: 56, perfect_store_score_pct: 57, sales_rep_visits:  51, product_movement_units:  6900, sales_rep_coverage_pct: 67, bounds: [[-29.05,31.55],[-28.30,32.30]] },
    "City of Cape Town":    { product_movement_rands: 4580000, merchants: 462, active_merchants: 373, sku_availability_pct: 71, perfect_store_score_pct: 75, sales_rep_visits: 178, product_movement_units: 27700, sales_rep_coverage_pct: 85, bounds: [[-34.35,18.30],[-33.45,19.00]] },
    "Cape Winelands":       { product_movement_rands: 1490000, merchants: 168, active_merchants: 132, sku_availability_pct: 63, perfect_store_score_pct: 65, sales_rep_visits:  68, product_movement_units:  9000, sales_rep_coverage_pct: 73, bounds: [[-33.85,18.75],[-33.15,19.85]] },
    "Overberg":             { product_movement_rands:  720000, merchants:  86, active_merchants:  64, sku_availability_pct: 56, perfect_store_score_pct: 56, sales_rep_visits:  32, product_movement_units:  4300, sales_rep_coverage_pct: 62, bounds: [[-34.65,19.35],[-33.85,20.85]] },
    "Garden Route":         { product_movement_rands: 1260000, merchants: 142, active_merchants: 110, sku_availability_pct: 60, perfect_store_score_pct: 62, sales_rep_visits:  55, product_movement_units:  7600, sales_rep_coverage_pct: 70, bounds: [[-34.20,20.60],[-33.30,23.60]] },
    "Nelson Mandela Bay":   { product_movement_rands: 1920000, merchants: 218, active_merchants: 170, sku_availability_pct: 64, perfect_store_score_pct: 66, sales_rep_visits:  88, product_movement_units: 11600, sales_rep_coverage_pct: 75, bounds: [[-34.10,25.20],[-33.60,25.85]] },
    "Buffalo City":         { product_movement_rands: 1440000, merchants: 164, active_merchants: 126, sku_availability_pct: 60, perfect_store_score_pct: 61, sales_rep_visits:  62, product_movement_units:  8700, sales_rep_coverage_pct: 71, bounds: [[-33.30,27.30],[-32.60,28.00]] },
    "O.R. Tambo":           { product_movement_rands:  820000, merchants:  98, active_merchants:  71, sku_availability_pct: 53, perfect_store_score_pct: 54, sales_rep_visits:  38, product_movement_units:  4900, sales_rep_coverage_pct: 60, bounds: [[-32.00,28.50],[-30.50,29.80]] },
    "Amathole":             { product_movement_rands:  930000, merchants: 112, active_merchants:  83, sku_availability_pct: 54, perfect_store_score_pct: 55, sales_rep_visits:  42, product_movement_units:  5600, sales_rep_coverage_pct: 62, bounds: [[-33.05,26.60],[-32.00,28.00]] },
    "Mangaung":             { product_movement_rands: 1600000, merchants: 182, active_merchants: 142, sku_availability_pct: 62, perfect_store_score_pct: 64, sales_rep_visits:  72, product_movement_units:  9600, sales_rep_coverage_pct: 73, bounds: [[-29.40,26.00],[-28.90,26.90]] },
    "Lejweleputswa":        { product_movement_rands:  790000, merchants:  94, active_merchants:  69, sku_availability_pct: 54, perfect_store_score_pct: 55, sales_rep_visits:  36, product_movement_units:  4700, sales_rep_coverage_pct: 61, bounds: [[-28.60,25.00],[-27.40,26.70]] },
    "Ehlanzeni":            { product_movement_rands: 1310000, merchants: 148, active_merchants: 114, sku_availability_pct: 60, perfect_store_score_pct: 61, sales_rep_visits:  58, product_movement_units:  7900, sales_rep_coverage_pct: 70, bounds: [[-26.10,30.50],[-24.70,32.00]] },
    "Gert Sibande":         { product_movement_rands: 1050000, merchants: 122, active_merchants:  92, sku_availability_pct: 56, perfect_store_score_pct: 57, sales_rep_visits:  46, product_movement_units:  6300, sales_rep_coverage_pct: 66, bounds: [[-27.30,28.90],[-26.00,31.00]] },
    "Capricorn":            { product_movement_rands: 1200000, merchants: 138, active_merchants: 105, sku_availability_pct: 58, perfect_store_score_pct: 59, sales_rep_visits:  52, product_movement_units:  7200, sales_rep_coverage_pct: 68, bounds: [[-24.40,28.60],[-23.10,30.20]] },
    "Mopani":               { product_movement_rands:  860000, merchants: 102, active_merchants:  75, sku_availability_pct: 54, perfect_store_score_pct: 55, sales_rep_visits:  38, product_movement_units:  5100, sales_rep_coverage_pct: 61, bounds: [[-24.40,30.20],[-22.90,31.60]] },
    "Vhembe":               { product_movement_rands:  980000, merchants: 116, active_merchants:  86, sku_availability_pct: 55, perfect_store_score_pct: 56, sales_rep_visits:  42, product_movement_units:  5900, sales_rep_coverage_pct: 63, bounds: [[-23.50,29.00],[-22.10,31.90]] },
    "Bojanala Platinum":    { product_movement_rands: 1360000, merchants: 156, active_merchants: 120, sku_availability_pct: 61, perfect_store_score_pct: 62, sales_rep_visits:  60, product_movement_units:  8200, sales_rep_coverage_pct: 71, bounds: [[-25.90,26.50],[-24.70,28.10]] },
    "Ngaka Modiri Molema":  { product_movement_rands:  910000, merchants: 108, active_merchants:  80, sku_availability_pct: 55, perfect_store_score_pct: 56, sales_rep_visits:  40, product_movement_units:  5500, sales_rep_coverage_pct: 63, bounds: [[-26.70,25.00],[-25.30,26.80]] },
    "Frances Baard":        { product_movement_rands:  570000, merchants:  68, active_merchants:  50, sku_availability_pct: 52, perfect_store_score_pct: 53, sales_rep_visits:  26, product_movement_units:  3400, sales_rep_coverage_pct: 58, bounds: [[-28.80,24.00],[-27.60,25.40]] },
    "ZF Mgcawu":            { product_movement_rands:  450000, merchants:  54, active_merchants:  39, sku_availability_pct: 50, perfect_store_score_pct: 51, sales_rep_visits:  20, product_movement_units:  2700, sales_rep_coverage_pct: 55, bounds: [[-29.20,19.00],[-27.80,22.00]] }
  },

  primaryMetric: "product_movement_rands",
  primaryMetricLabel: "Product Movement",
  colourScale: ["#fed7aa","#fb923c","#ea580c","#7c2d12"],

  accent: { primary: "#ea580c", light: "#fff7ed", mid: "#f97316" }
};
