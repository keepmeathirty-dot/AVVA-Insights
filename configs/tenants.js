/* ================================================================
   AVVA INSIGHTS — TENANT REGISTRY
   ----------------------------------------------------------------
   Each tenant is an institution with isolated data.
   Every tenant has:
     - id: used in URLs (/kzndoa)
     - label: display name
     - workspaces: which workspace configs this tenant can access
     - tables: DynamoDB table names (created by CloudFormation)
     - branding: accent colour, logo info
     - plan: billing tier
   ----------------------------------------------------------------
   Add a new tenant:
     1. Deploy cloudformation/avva-tenant-template.yaml with tenant ID
     2. Add entry below
     3. That's it — /tenant-id will load their workspace
   ================================================================ */
window.AVVA_TENANTS = [
  {
    id: "kzndoa",
    label: "KwaZulu-Natal Department of Agriculture",
    shortLabel: "KZN DoA",
    status: "active",
    workspaces: ["kzn-doa"],
    defaultWorkspace: "kzn-doa",
    tables: {
      users: "avva-users-kzndoa",
      workspaces: "avva-workspaces-kzndoa",
      programmes: "avva-programmes-kzndoa",
      audit: "avva-audit-kzndoa"
    },
    branding: { accent: "#4f25d8", logoText: "KZN DoA" },
    plan: "enterprise",
    createdAt: "2026-01-01"
  },
  {
    id: "tigerbrands",
    label: "Tiger Brands",
    shortLabel: "Tiger Brands",
    status: "active",
    workspaces: ["fmcg-intelligence"],
    defaultWorkspace: "fmcg-intelligence",
    tables: {
      users: "avva-users-tigerbrands",
      workspaces: "avva-workspaces-tigerbrands",
      programmes: "avva-programmes-tigerbrands",
      audit: "avva-audit-tigerbrands"
    },
    branding: { accent: "#ea580c", logoText: "Tiger Brands" },
    plan: "enterprise",
    createdAt: "2026-10-15"
  },
  {
    id: "hennessy",
    label: "Hennessy",
    shortLabel: "Hennessy",
    status: "active",
    workspaces: ["hennessy"],
    defaultWorkspace: "hennessy",
    tables: {
      users: "avva-users-hennessy",
      workspaces: "avva-workspaces-hennessy",
      programmes: "avva-programmes-hennessy",
      audit: "avva-audit-hennessy"
    },
    branding: { accent: "#b8860b", logoText: "Hennessy" },
    plan: "enterprise",
    createdAt: "2026-10-01"
  },
  {
    id: "reemerge",
    label: "Reemerge Group — Platform Admin",
    shortLabel: "Platform",
    status: "active",
    workspaces: ["*"],
    defaultWorkspace: "kzn-doa",
    tables: {
      users: "avva-users-prod",
      workspaces: "avva-workspaces-prod",
      programmes: "avva-programmes-prod",
      audit: "avva-audit-prod"
    },
    branding: { accent: "#4f25d8", logoText: "Reemerge" },
    plan: "platform",
    createdAt: "2026-01-01"
  }
];

/* Helper: find tenant by URL path */
window.AVVA_getTenant = function(id) {
  return window.AVVA_TENANTS.find(t => t.id === id) || null;
};

/* Helper: detect tenant from URL path (e.g. /kzndoa/dashboard.html) */
window.AVVA_detectTenantFromPath = function() {
  const path = window.location.pathname.replace(/^\/+/, '');
  const segments = path.split('/');
  if (!segments[0]) return null;
  // Ignore known file names
  if (segments[0].endsWith('.html')) return null;
  return window.AVVA_getTenant(segments[0]);
};

console.log('[AVVA] Tenant registry loaded —', window.AVVA_TENANTS.length, 'tenants');
