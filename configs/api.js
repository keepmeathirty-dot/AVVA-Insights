/* ================================================================
   AVVA INSIGHTS — BACKEND API CONFIGURATION
   ----------------------------------------------------------------
   Safe to commit. Contains only the API endpoint URL.
   No secrets live here — JWT is stored in localStorage after login.
   ================================================================ */
window.AVVA_API = {
  // Filled in after deploying the CloudFormation stack
  endpoint: "__AWS_API_ENDPOINT__",

  // When true, AVVA uses localStorage (fallback for offline demo)
  // When false, AVVA uses the real backend API
  useLocalFallback: true,

  // JWT storage key
  tokenKey: 'avva_jwt',

  // Helper: is the API configured?
  isConfigured() {
    return this.endpoint && this.endpoint !== "__AWS_API_ENDPOINT__";
  },

  // Helper: auth header for API calls
  authHeader() {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

console.log('[AVVA] API config loaded — endpoint configured:', window.AVVA_API.isConfigured());
