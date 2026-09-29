"""
AVVA Insights — AI Proxy Lambda Function
==========================================
This function acts as a secure middleman between the AVVA Insights dashboard
(and VulaScan) and the AI provider.

Why this exists:
- The AI API key must NEVER live in browser JavaScript — anyone could steal it
- Both AVVA and VulaScan call THIS function, which holds the key securely
- Changing AI providers is a one-line change here, not in every app

Environment variables (set these in AWS Lambda console):
- AI_PROVIDER: "openai" | "gemini" | "groq"
- AI_API_KEY:  the real API key from your provider
- AI_MODEL:    the model name (e.g. "gpt-4o-mini", "gemini-1.5-flash")
- ALLOWED_ORIGINS: comma-separated list of allowed websites

Deploy: see lambda/README.md
"""

import json
import os
import urllib.request
import urllib.error


def lambda_handler(event, context):
    """
    Main entry point. AWS calls this when the function is invoked.
    
    `event` contains the HTTP request (via API Gateway)
    `context` contains metadata (we don't need it here)
    """
    
    # ---- 1. HANDLE CORS PREFLIGHT ----
    # Browsers send an "OPTIONS" request first to check permissions
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return cors_response(200, {"message": "CORS OK"})
    
    # ---- 2. READ THE INCOMING REQUEST ----
    try:
        body = json.loads(event.get("body", "{}"))
        messages = body.get("messages", [])
        workspace_context = body.get("context", "")
        system_prompt = body.get("systemPrompt", "")
        
        if not messages:
            return cors_response(400, {"error": "No messages provided"})
    except json.JSONDecodeError:
        return cors_response(400, {"error": "Invalid JSON body"})
    
    # ---- 3. READ ENVIRONMENT VARIABLES ----
    provider = os.environ.get("AI_PROVIDER", "openai")
    api_key = os.environ.get("AI_API_KEY", "")
    model = os.environ.get("AI_MODEL", "gpt-4o-mini")
    
    if not api_key:
        return cors_response(500, {
            "error": "AI_API_KEY not configured. Set it in Lambda environment variables."
        })
    
    # ---- 4. BUILD THE REQUEST TO THE AI PROVIDER ----
    # Add system prompt + workspace context as the first message
    full_messages = []
    if system_prompt:
        enriched_prompt = system_prompt
        if workspace_context:
            enriched_prompt += f"\n\nCurrent workspace data:\n{workspace_context}"
        full_messages.append({"role": "system", "content": enriched_prompt})
    full_messages.extend(messages)
    
    # ---- 5. CALL THE AI PROVIDER ----
    if provider == "openai" or provider == "groq":
        # OpenAI and Groq use the same request format
        base_url = "https://api.openai.com/v1/chat/completions"
        if provider == "groq":
            base_url = "https://api.groq.com/openai/v1/chat/completions"
        response = call_openai_compatible(base_url, api_key, model, full_messages)
    
    elif provider == "gemini":
        response = call_gemini(api_key, model, full_messages)
    
    else:
        return cors_response(400, {"error": f"Unknown provider: {provider}"})
    
    # ---- 6. RETURN THE RESPONSE ----
    if "error" in response:
        return cors_response(500, response)
    
    return cors_response(200, response)


def call_openai_compatible(base_url, api_key, model, messages):
    """Handles OpenAI, Groq, and any OpenAI-compatible API."""
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500
    }).encode("utf-8")
    
    req = urllib.request.Request(
        base_url,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply, "provider": "openai-compatible"}
    except urllib.error.HTTPError as e:
        return {"error": f"AI provider error: {e.code} {e.read().decode('utf-8')}"}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}


def call_gemini(api_key, model, messages):
    """Handles Google Gemini API — different request shape."""
    # Gemini uses a different structure: system prompt is separate
    system = ""
    contents = []
    for m in messages:
        if m["role"] == "system":
            system = m["content"]
        else:
            # Gemini uses "user" and "model" roles instead of "user" and "assistant"
            role = "user" if m["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m["content"]}]})
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {"contents": contents}
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply, "provider": "gemini"}
    except urllib.error.HTTPError as e:
        return {"error": f"Gemini error: {e.code} {e.read().decode('utf-8')}"}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}


def cors_response(status_code, body):
    """Adds CORS headers so the browser can call this from any origin."""
    allowed = os.environ.get("ALLOWED_ORIGINS", "*")
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allowed,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(body)
    }
