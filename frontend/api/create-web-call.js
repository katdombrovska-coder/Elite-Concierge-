export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RETELL_API_KEY = process.env.RETELL_API_KEY;
  const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    return res.status(503).json({ error: 'Retell not configured' });
  }

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: RETELL_AGENT_ID }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell error:', response.status, errorText);
      return res.status(502).json({ error: `Retell error ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json({
      access_token: data.access_token,
      call_id: data.call_id,
    });
  } catch (error) {
    console.error('Request failed:', error);
    return res.status(502).json({ error: 'Retell request failed' });
  }
}
