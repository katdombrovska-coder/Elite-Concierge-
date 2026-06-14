/* ===== Elite AI Chat API — Google Gemini (free) + Neon Postgres =====
 *
 * Storage: Neon Postgres (persistent, never sleeps)
 * LLM: Google Gemini 2.5 Flash (free tier)
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are the Elite AI Setup Assistant — a warm, professional onboarding specialist helping business owners create their custom AI receptionist setup.

RULES:
- Be warm, calm, premium, and concise (2-3 sentences max).
- Acknowledge their answer naturally, then ask the next question.
- Never skip questions.
- Never invent missing information.
- Never promise the AI is already live or guaranteed revenue.
- Never change offer terms (€0 founding setup, 77 testing minutes, from €79/mo).
- Sound human, not robotic.
- If their answer is vague, ask one gentle clarification.
- If they say "skip" or "I don't know", acknowledge and move on smoothly.
- Keep responses short — 1-2 sentences.`;

async function callGemini(answer) {
  if (!GEMINI_KEY) return null;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'I understand. I will be warm, concise, and helpful.' }] },
            { role: 'user', parts: [{ text: `User answered: "${answer}". Acknowledge their answer in 1 short warm sentence and move to the next question. Keep it to 1-2 sentences max.` }] }
          ],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
        })
      }
    );

    const data = await resp.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (e) {
    console.error('Gemini error:', e.message);
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — fetch submissions (admin)
  if (req.method === 'GET') {
    const pwd = req.headers['x-admin-password'] || req.query.password;
    const adminPassword = process.env.ADMIN_PASSWORD || 'elite-ai-admin';
    if (pwd !== adminPassword) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { rows } = await pool.query('SELECT * FROM ai_receptionist_submissions ORDER BY created_at DESC');
      return res.status(200).json({ submissions: rows });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, step, field, answer, answers, action } = req.body;

  // Admin: update status
  if (action === 'update_status') {
    await pool.query('UPDATE ai_receptionist_submissions SET submission_status = $1 WHERE session_id = $2', [answer, sessionId]);
    return res.status(200).json({ success: true });
  }

  // Submit final setup
  if (action === 'submit') {
    const a = answers || {};
    try {
      await pool.query(
        `INSERT INTO ai_receptionist_submissions (
          session_id, business_name, industry, business_links, location_service_area,
          main_services, pricing_info, opening_hours, languages, main_ai_goal,
          booking_method, customer_info_to_collect, common_customer_questions,
          escalation_rules, lead_destination, lead_destination_detail, tone_of_voice,
          restrictions, special_business_rules, contact_name, contact_email,
          contact_phone, final_summary, submission_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        ON CONFLICT (session_id) DO UPDATE SET submission_status='submitted', updated_at=NOW()`,
        [
          sessionId,
          a.business_name || '', a.industry || '', a.business_links || '',
          a.location_service_area || '', a.main_services || '', a.pricing_info || '',
          a.opening_hours || '', a.languages || '', a.main_ai_goal || '',
          a.booking_method || '', a.customer_info_to_collect || '',
          a.common_customer_questions || '', a.escalation_rules || '',
          a.lead_destination || '', a.lead_destination_detail || '',
          a.tone_of_voice || '', a.restrictions || '', a.special_business_rules || '',
          a.contact_name || '', a.contact_email || '', a.contact_phone || '',
          JSON.stringify(a), 'submitted'
        ]
      );
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Chat: process answer
  if (!sessionId || !step || !answer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Save answer to session
  try {
    await pool.query(
      `INSERT INTO ai_receptionist_submissions (session_id, created_at) VALUES ($1, NOW())
       ON CONFLICT (session_id) DO NOTHING`
    );

    const fieldMap = {
      business_name: 'business_name', industry: 'industry', business_links: 'business_links',
      location_service_area: 'location_service_area', main_services: 'main_services',
      pricing_info: 'pricing_info', opening_hours: 'opening_hours', languages: 'languages',
      main_ai_goal: 'main_ai_goal', booking_method: 'booking_method',
      customer_info_to_collect: 'customer_info_to_collect',
      common_customer_questions: 'common_customer_questions',
      escalation_rules: 'escalation_rules', lead_destination: 'lead_destination',
      lead_destination_detail: 'lead_destination_detail', tone_of_voice: 'tone_of_voice',
      restrictions: 'restrictions', special_business_rules: 'special_business_rules',
      contact_name: 'contact_name', contact_email: 'contact_email', contact_phone: 'contact_phone'
    };

    const dbField = fieldMap[field];
    if (dbField) {
      await pool.query(`UPDATE ai_receptionist_submissions SET ${dbField} = $1 WHERE session_id = $2`, [answer, sessionId]);
    }
  } catch (e) {
    console.error('DB save error:', e.message);
  }

  // LLM response via Gemini
  let llmResponse = await callGemini(answer);

  // Fallback when Gemini unavailable
  if (!llmResponse) {
    const fallbacks = {
      1: `Great — ${answer} is noted! Let me ask a few more things.`,
      2: `Perfect, ${answer} — that helps us tailor everything.`,
      3: answer !== 'not specified' ? `Got the links — helpful context for your AI.` : `No worries, we'll work with what we have.`,
      4: `Location noted: ${answer}. This helps with local optimization.`,
      5: `Excellent — these will be core to the AI's knowledge.`,
      6: answer !== 'not specified' ? `Pricing info saved. The AI will reference these.` : `We can add pricing later.`,
      7: `Opening hours set. The AI will respect these.`,
      8: `Languages: ${answer}. The AI will be fluent in all of them.`,
      9: `Goal: ${answer}. This will be the AI's primary focus.`,
      10: `Booking method: ${answer}. We'll configure it accordingly.`,
      11: `Customer info to collect: ${answer}. Noted.`,
      12: answer !== 'not specified' ? `Common questions noted — the AI will handle them.` : `We'll build a strong FAQ base.`,
      13: answer !== 'not specified' ? `Escalation rules set.` : `We'll set sensible defaults.`,
      14: `Lead destination: ${answer}. Perfect.`,
      14.5: answer !== 'not specified' ? `Destination detail saved.` : `We'll configure this during onboarding.`,
      15: `Tone: ${answer}. The AI will match this perfectly.`,
      16: answer !== 'not specified' ? `Restrictions noted.` : `We'll apply sensible guardrails.`,
      17: answer !== 'not specified' ? `Special rules saved. Very helpful.` : `We'll cover the essentials.`,
      18: `Contact details received. We'll reach out with your AI preview.`
    };
    llmResponse = fallbacks[step] || 'Got it, thanks!';
  }

  return res.status(200).json({
    success: true,
    nextStep: step + 1,
    llmResponse
  });
}
