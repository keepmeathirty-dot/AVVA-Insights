/* ================================================================
   AVVA INSIGHTS — AI CONFIGURATION
   ----------------------------------------------------------------
   This file contains NO secrets. Safe to commit to GitHub.
   The real API key lives in AWS Lambda environment variables.
   
   Both AVVA Insights and VulaScan call the same Lambda proxy.
   ================================================================ */
window.AVVA_AI_CONFIG = {
  // The Lambda function endpoint — filled in after AWS deployment
  // Example: https://abc123.execute-api.af-south-1.amazonaws.com/prod/chat
  proxyEndpoint: "__AWS_LAMBDA_ENDPOINT__",

  // AWS region — where the Lambda will live
  region: "af-south-1",

  // Model preference sent to Lambda
  // The Lambda picks the actual provider (OpenAI, Gemini, etc.)
  model: "default",

  // Demo mode — when true, uses canned responses instead of calling Lambda
  // Turn this OFF once the Lambda endpoint is live
  demoMode: true,

  // Maximum conversation history kept in the browser (messages)
  maxHistory: 20,

  // System prompt template — the Lambda injects workspace context into this
  systemPromptTemplate: `You are the AVVA Insights Assistant, an analytical helper for institutions using the AVVA Insights platform. You help users understand their workspace data — funding, beneficiaries, districts, and impact. Answer concisely and factually based on the workspace data provided. Never invent numbers. If you don't know, say so.`,
  
  // Demo responses — used when demoMode is true
  // Clearly labelled so demo doesn't get confused with real AI
  demoResponses: {
    default: "This is a demo response. Once the AI proxy is deployed on AWS, I'll answer based on your workspace data. For now, this shows what the experience will look like.",
    
    keywords: {
      "funding": "Funding for this workspace is distributed across all 11 districts. eThekwini and uMgungundlovu receive the largest allocations based on farm density and commercialisation potential.",
      "farm": "This workspace tracks farm support across KwaZulu-Natal. uMgungundlovu leads with 696 commercial farms, followed by eThekwini with 892 farming units.",
      "district": "All 11 KZN districts are covered. The highest activity is in eThekwini, uMgungundlovu, and uThukela. The lowest supported are Harry Gwala and uMkhanyakude.",
      "jobs": "Jobs supported across the workspace total 68,428. The largest contributors are eThekwini and uMgungundlovu, driven by commercial-scale operations.",
      "programme": "There are 5 active funding streams plus any programmes posted through the platform. You can post new programmes from the sidebar.",
      "commercial": "The average commercialisation rate is 18%. uMkhanyakude and Harry Gwala are below target and flagged for support."
    }
  }
};
