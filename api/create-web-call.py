import httpx

async def handler(req):
    # Only allow POST
    if req.method != "POST":
        return {"error": "Method not allowed"}, 405
    
    retell_api_key = __import__("os").environ.get("RETELL_API_KEY", "")
    retell_agent_id = __import__("os").environ.get("RETELL_AGENT_ID", "")
    
    if not retell_api_key or not retell_agent_id:
        return {"error": "Backend misconfigured: Retell not set up"}, 503
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            "https://api.retellai.com/v2/create-web-call",
            headers={
                "Authorization": f"Bearer {retell_api_key}",
                "Content-Type": "application/json",
            },
            json={"agent_id": retell_agent_id},
        )
    
    if resp.status_code >= 400:
        return {"error": f"Retell error {resp.status_code}"}, 502
    
    data = resp.json()
    return {
        "access_token": data.get("access_token"),
        "call_id": data.get("call_id"),
    }, 200
