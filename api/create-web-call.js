export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RETELL_API_KEY = process.env.RETELL_API_KEY || 'key_631a6e889dfcfa38df342ad86221';
  const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID || 'agent_3f3c271c4814e6f07278f7db49';

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: RETELL_AGENT_ID }),
    });

    const respBody = await response.text();

    if (!response.ok) {
      console.error(`Retell ${response.status}: ${respBody}`);
      return res.status(500).json({ error: `Retell ${response.status}: ${respBody}` });
    }

    return res.status(200).json(JSON.parse(respBody));
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
