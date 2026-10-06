/* ================================================================
   AVVA INSIGHTS — BACKEND API CONFIGURATION
   ================================================================ */
window.AVVA_API = {
  endpoint: "https://cm9nwo7nml.execute-api.af-south-1.amazonaws.com",
  region: "af-south-1",
  useLocalFallback: false,
  tokenKey: 'avva_jwt',

  isConfigured() {
    return this.endpoint && this.endpoint !== "__AWS_API_ENDPOINT__" && this.endpoint !== "YOUR_ENDPOINT_HERE";
  },

  authHeader() {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

console.log('[AVVA] API config loaded — endpoint configured:', window.AVVA_API.isConfigured());
