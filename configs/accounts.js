/* ================================================================
   AVVA INSIGHTS — DEMO ACCOUNTS
   ----------------------------------------------------------------
   Each account lists which workspaces it can access.
   Use "*" to grant access to all workspaces.
   Replace this file with a real auth API on AWS migration.
   ================================================================ */
window.AVVA_ACCOUNTS = [
  {
    email: "admin@avva.demo",
    password: "admin123",
    name: "AVVA Administrator",
    role: "Platform Admin",
    workspaces: ["*"]
  },
  {
    email: "reemerge@avva.demo",
    password: "reemerge123",
    name: "Reemerge Staff",
    role: "Portfolio Manager",
    workspaces: ["*"]
  },
  {
    email: "kzn@avva.demo",
    password: "kzn123",
    name: "KZN Agriculture Officer",
    role: "Programme Officer",
    workspaces: ["kzn-doa"]
  },
  {
    email: "health@avva.demo",
    password: "health123",
    name: "Health Fund Manager",
    role: "Impact Manager",
    workspaces: ["healthcare-fund"]
  },
  {
    email: "mfg@avva.demo",
    password: "mfg123",
    name: "Manufacturing Programme Lead",
    role: "Programme Lead",
    workspaces: ["manufacturing-fund"]
  },
  {
    email: "social@avva.demo",
    password: "social123",
    name: "Social Development Lead",
    role: "Programme Lead",
    workspaces: ["social-development"]
  },
  {
    email: "hennessy@avva.demo",
    password: "brand123",
    name: "Hennessy Brand Manager",
    role: "Brand Manager",
    workspaces: ["hennessy"]
  }
];
