const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

export default async function handler(req, res) {
  // Debug logging
  console.log('RETELL_API_KEY exists:', !!RETELL_API_KEY);
  console.log('RETELL_API_KEY length:', RETELL_API_KEY?.length);
  console.log('RETELL_API_KEY has whitespace:', /\s/.test(RETELL_API_KEY || ''));
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    return res.status(200).json({ error: 'Retell not configured. Set RETELL_API_KEY and RETELL_AGENT_ID.' });
  }

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: RETELL_AGENT_ID }),
    });

    const respBody = await response.text();

    if (!response.ok) {
      console.error(`Retell ${response.status}: ${respBody}`);
      return res.status(200).json({ error: `Retell ${response.status}: ${respBody}` });
    }

    return res.status(200).json(JSON.parse(respBody));
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(200).json({ error: err.message });
  }
}
