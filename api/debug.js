export default async function handler(req, res) {
  const KEY = 'key_b6068865c90b2674d3143206156d';
  const AGENT = 'agent_3f3c271c4814e6f07278f7db49';
  
  try {
    const authHeader = `Bearer ${KEY}`;
    
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: AGENT }),
    });

    const text = await response.text();
    
    res.status(200).json({
      status: response.status,
      key_sent: KEY,
      agent_sent: AGENT,
      auth_header: authHeader,
      response: text
    });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
