/* ================================================================
   AVVA INSIGHTS — BACKEND API CONFIGURATION
   ----------------------------------------------------------------
   Safe to commit. Contains only the API endpoint URL.
   No secrets live here — JWT is stored in localStorage after login.
   ================================================================ */
window.AVVA_API = {
  // The API Gateway endpoint from CloudFormation Outputs
  // Example: https://abc123xyz.execute-api.af-south-1.amazonaws.com
  endpoint: "YOUR_ENDPOINT_HERE",

  // AWS region — must match where the backend is deployed
  region: "af-south-1",

  // When true, AVVA uses localStorage (fallback for offline demo)
  // When false, AVVA uses the real backend API
  useLocalFallback: false,

  // JWT storage key
  tokenKey: 'avva_jwt',

  // Helper: is the API configured?
  isConfigured() {
    return this.endpoint &&
           this.endpoint !== "__AWS_API_ENDPOINT__" &&
           this.endpoint !== "YOUR_ENDPOINT_HERE" &&
           this.endpoint.indexOf('http') === 0;
  },

  // Helper: auth header for API calls
  authHeader() {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }
};

console.log('[AVVA] API config loaded — endpoint configured:', window.AVVA_API.isConfigured());
