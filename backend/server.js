import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

app.post('/api/create-web-call', async (req, res) => {
  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Retell API error: ${error}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Create web call error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🟢 Elite AI Concierge backend running on port ${PORT}`);
});

export default app;
