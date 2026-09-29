# AVVA AI Proxy — Deployment Guide

This Lambda function acts as a secure middleman between AVVA Insights 
(and VulaScan) and the AI provider. The API key lives here — never in 
the browser.

## Prerequisites
- AWS account with access (af-south-1 / Cape Town region)
- An API key from your AI provider (OpenAI, Gemini, or Groq)

## Step 1 — Create the Lambda function

1. Log in to AWS Console
2. Go to **Lambda** service
3. Click **Create function**
4. Choose **Author from scratch**
5. **Function name**: `avva-ai-proxy`
6. **Runtime**: Python 3.12
7. **Architecture**: x86_64
8. Click **Create function**

## Step 2 — Paste the code

1. In the Lambda function page, scroll to **Code source**
2. Delete the default `lambda_function.py` content
3. Paste the contents of `avva-ai-proxy.py`
4. Click **Deploy**

## Step 3 — Set environment variables

1. Go to **Configuration** tab → **Environment variables**
2. Click **Edit** → **Add environment variable**
3. Add these:
   - `AI_PROVIDER` = `openai` (or `gemini`, `groq`)
   - `AI_API_KEY` = `your-real-api-key-here`
   - `AI_MODEL` = `gpt-4o-mini` (or `gemini-1.5-flash`, etc.)
   - `ALLOWED_ORIGINS` = `https://avva-insights.onrender.com,https://yoursite.com`
4. Click **Save**

## Step 4 — Create the API endpoint

1. Go to **API Gateway** service
2. Click **Create API** → **HTTP API** → **Build**
3. **API name**: `avva-ai-gateway`
4. Click **Add integration** → **Lambda** → choose `avva-ai-proxy`
5. **Configure routes**:
   - Method: POST
   - Resource path: `/chat`
6. Click **Next** → **Create**
7. Copy the **Invoke URL** — looks like:
   `https://abc123.execute-api.af-south-1.amazonaws.com/chat`

## Step 5 — Wire it into AVVA

1. Open `configs/ai.js` in your repo
2. Replace `__AWS_LAMBDA_ENDPOINT__` with the Invoke URL
3. Set `demoMode: false`
4. Commit → Render auto-deploys

## Step 6 — Test

1. Open your AVVA dashboard
2. Go to **AI Assistant** in the sidebar
3. Type a question
4. You should get a real AI response

## Security notes
- The API key NEVER leaves AWS — it's in environment variables
- Browser clients only see the Lambda endpoint URL
- Set `ALLOWED_ORIGINS` to your actual domains (not `*`) before going live
- Monitor usage in CloudWatch → Logs → `/aws/lambda/avva-ai-proxy`
