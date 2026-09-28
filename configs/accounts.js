/* ================================================================
   AVVA INSIGHTS — DEMO ACCOUNTS WITH ROLES
   ----------------------------------------------------------------
   Each account maps workspace IDs to roles.
   Role determines which sidebar items appear.
   Replace with real auth API on AWS migration.
   ================================================================ */
window.AVVA_ACCOUNTS = [

  /* ---------- Platform Admin (access to all workspaces) ---------- */
  {
    email: "admin@avva.demo",
    password: "admin123",
    name: "AVVA Administrator",
    role: "Platform Admin",
    workspaces: { "*": "admin" }
  },
  {
    email: "reemerge@avva.demo",
    password: "reemerge123",
    name: "Reemerge Staff",
    role: "Portfolio Manager",
    workspaces: { "*": "admin" }
  },

  /* ---------- KZN Department of Agriculture — 5 roles ---------- */
  {
    email: "ceo@kzndoa.demo",
    password: "ceo123",
    name: "Dr. Sipho Ndlovu",
    role: "Chief Executive Officer",
    workspaces: { "kzn-doa": "executive" }
  },
  {
    email: "manager@kzndoa.demo",
    password: "manager123",
    name: "Nomsa Khumalo",
    role: "Programme Manager",
    workspaces: { "kzn-doa": "manager" }
  },
  {
    email: "admin@kzndoa.demo",
    password: "admin123",
    name: "Thabo Mthembu",
    role: "System Administrator",
    workspaces: { "kzn-doa": "admin" }
  },
  {
    email: "officer@kzndoa.demo",
    password: "officer123",
    name: "Zanele Dlamini",
    role: "Programme Officer",
    workspaces: { "kzn-doa": "officer" }
  },
  {
    email: "viewer@kzndoa.demo",
    password: "viewer123",
    name: "Board Member",
    role: "Viewer",
    workspaces: { "kzn-doa": "viewer" }
  },

  /* ---------- Legacy single-workspace accounts (kept for testing) ---------- */
  {
    email: "kzn@avva.demo",
    password: "kzn123",
    name: "KZN Agriculture Officer",
    role: "Programme Officer",
    workspaces: { "kzn-doa": "officer" }
  },
  {
    email: "health@avva.demo",
    password: "health123",
    name: "Health Fund Manager",
    role: "Impact Manager",
    workspaces: { "healthcare-fund": "manager" }
  },
  {
    email: "mfg@avva.demo",
    password: "mfg123",
    name: "Manufacturing Lead",
    role: "Programme Lead",
    workspaces: { "manufacturing-fund": "manager" }
  },
  {
    email: "social@avva.demo",
    password: "social123",
    name: "Social Development Lead",
    role: "Programme Lead",
    workspaces: { "social-development": "manager" }
  },
  {
    email: "hennessy@avva.demo",
    password: "brand123",
    name: "Hennessy Brand Manager",
    role: "Brand Manager",
    workspaces: { "hennessy": "manager" }
  }
];

/* ================================================================
   ROLE → NAVIGATION RULES
   ----------------------------------------------------------------
   Which sidebar items are hidden for each role.
   Item IDs match those in the workspace config's navigation array.
   ================================================================ */
window.AVVA_ROLE_RULES = {
  executive: {
    label: "Executive",
    hide: ["post-programme", "users", "sources", "audit", "logs", "settings", "vulascan", "audit-feed"]
  },
  manager: {
    label: "Manager",
    hide: ["users", "sources", "audit", "logs", "settings"]
  },
  admin: {
    label: "Administrator",
    hide: []
  },
  officer: {
    label: "Officer",
    hide: ["funding", "revenue", "users", "sources", "audit", "logs", "settings", "ai", "vulascan", "audit-feed", "post-programme"]
  },
  viewer: {
    label: "Viewer",
    hide: ["post-programme", "users", "sources", "audit", "logs", "settings", "vulascan", "audit-feed"]
  }
};
