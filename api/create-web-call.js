export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RETELL_API_KEY = process.env.RETELL_API_KEY;
  const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    return res.status(500).json({ error: 'Retell API key or agent ID not configured' });
  }

  // Debug logging
  console.log('Key length:', RETELL_API_KEY.length);
  console.log('Key prefix:', RETELL_API_KEY.substring(0, 15));
  console.log('Key suffix:', RETELL_API_KEY.substring(RETELL_API_KEY.length - 10));
  console.log('Has whitespace:', /\s/.test(RETELL_API_KEY));

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
      return res.status(200).json({ 
        error: `Retell ${response.status}: ${respBody}`,
        debug: {
          key_length: RETELL_API_KEY.length,
          key_prefix: RETELL_API_KEY.substring(0, 15),
          key_suffix: RETELL_API_KEY.substring(RETELL_API_KEY.length - 10)
        }
      });
    }

    return res.status(200).json(JSON.parse(respBody));
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(200).json({ error: err.message });
  }
}
