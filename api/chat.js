/* ===== Elite AI Chat API — GPT-4o-mini + persistent storage =====
 *
 * Storage: Vercel KV (Redis) — never sleeps, reliable
 * Fallback: in-memory for development
 * LLM: OpenAI gpt-4o-mini
 *
 * PLACEHOLDERS:
 * - Resend email integration
 * - Google Sheets / Airtable sync
 * - Retell AI agent creation
 * - Stripe activation
 * - WhatsApp notification
 */

import { kv } from '@vercel/kv';

// Check if KV is configured
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

async function getSession(sessionId) {
  if (hasKV) {
    const data = await kv.get('elite-ai:session:' + sessionId);
    return data || null;
  }
  return null;
}

async function saveSession(sessionId, data) {
  if (hasKV) {
    const existing = await kv.get('elite-ai:session:' + sessionId);
    const merged = { ...(existing || {}), ...data, updated_at: new Date().toISOString() };
    await kv.set('elite-ai:session:' + sessionId, JSON.stringify(merged));

    // Also add to submissions set for admin listing
    if (data.submission_status === 'submitted') {
      await kv.lpush('elite-ai:submissions', sessionId);
    }
  }
}

async function saveSubmission(sessionId, answers) {
  if (hasKV) {
    const record = {
      session_id: sessionId,
      created_at: new Date().toISOString(),
      ...answers,
      final_summary: JSON.stringify(answers),
      submission_status: 'submitted'
    };
    await kv.set('elite-ai:submission:' + sessionId, JSON.stringify(record));
    await kv.lpush('elite-ai:submissions', sessionId);
  }
}

async function getAllSubmissions() {
  if (!hasKV) return [];
  const ids = await kv.lrange('elite-ai:submissions', 0, -1);
  const unique = [...new Set(ids)];
  const submissions = [];
  for (const id of unique) {
    const data = await kv.get('elite-ai:submission:' + id);
    if (data) submissions.push(typeof data === 'string' ? JSON.parse(data) : data);
  }
  // Sort by date desc
  submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return submissions;
}

async function updateSubmissionStatus(sessionId, status) {
  if (hasKV) {
    const data = await kv.get('elite-ai:submission:' + sessionId);
    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      parsed.submission_status = status;
      await kv.set('elite-ai:submission:' + sessionId, JSON.stringify(parsed));
    }
  }
}

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
- If they say "skip" or "I don't know", acknowledge and move on smoothly.`;

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

    const submissions = await getAllSubmissions();
    return res.status(200).json({ submissions });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, step, field, answer, answers, action } = req.body;

  // Admin: update status
  if (action === 'update_status') {
    await updateSubmissionStatus(sessionId, answer);
    return res.status(200).json({ success: true });
  }

  // Submit final setup
  if (action === 'submit') {
    await saveSubmission(sessionId, answers || {});

    // INTEGRATION PLACEHOLDER: Send email notification via Resend
    // await fetch('https://api.resend.com/emails', { method: 'POST', ... });

    // INTEGRATION PLACEHOLDER: Sync to Google Sheets
    // await syncToSheets(answers);

    // INTEGRATION PLACEHOLDER: WhatsApp notification
    // await sendWhatsApp(process.env.KAT_WHATSAPP, 'New AI setup submission');

    return res.status(200).json({ success: true });
  }

  // Chat: process answer
  if (!sessionId || !step || !answer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Save answer to session
  const session = await getSession(sessionId);
  const currentAnswers = (session && session.answers) || {};
  currentAnswers[field] = answer;
  await saveSession(sessionId, { answers: currentAnswers });

  const nextStep = step + 1;

  // OpenAI GPT-4o-mini response
  let llmResponse = null;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    try {
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `User answered: "${answer}". Now ask the next question. Keep it warm and brief (2 sentences max).` }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      const data = await openaiResp.json();
      if (data.choices && data.choices[0]) {
        llmResponse = data.choices[0].message.content.trim();
      }
    } catch (e) {
      console.error('OpenAI error:', e.message);
    }
  }

  // Fallback responses when OpenAI is unavailable
  if (!llmResponse) {
    const fallbacks = {
      1: `Great — ${answer} is noted! Let me ask a few more things.`,
      2: `Perfect, ${answer} — that helps us tailor everything.`,
      3: answer !== 'not specified' && answer !== 'not provided' ? `Got the links — helpful context for your AI.` : `No worries, we'll work with what we have.`,
      4: `Location noted: ${answer}. This helps with local optimization.`,
      5: `Excellent — these will be core to the AI's knowledge.`,
      6: answer !== 'not specified' ? `Pricing info saved. The AI will reference these accurately.` : `We can add pricing later — no problem.`,
      7: `Opening hours set: ${answer}. The AI will respect these.`,
      8: `Languages: ${answer}. The AI will be fluent in all of them.`,
      9: `Goal: ${answer}. This will be the AI's primary focus.`,
      10: `Booking method: ${answer}. We'll configure it accordingly.`,
      11: `Customer info to collect: ${answer}. Noted.`,
      12: answer !== 'not specified' ? `Common questions noted — the AI will handle them smoothly.` : `We'll build a strong FAQ base for your AI.`,
      13: answer !== 'not specified' ? `Escalation rules set. The AI knows when to hand off.` : `We'll set sensible defaults for escalation.`,
      14: `Lead destination: ${answer}. Perfect.`,
      14.5: answer !== 'not specified' ? `Destination detail saved.` : `We'll configure this during onboarding.`,
      15: `Tone: ${answer}. The AI will match this perfectly.`,
      16: answer !== 'not specified' ? `Restrictions noted. The AI will strictly follow these.` : `We'll apply sensible default guardrails.`,
      17: answer !== 'not specified' ? `Special rules saved. Very helpful.` : `We'll cover the essentials in the build.`,
      18: `Contact details received. We'll reach out with your AI preview.`
    };
    llmResponse = fallbacks[step] || 'Got it, thanks!';
  }

  return res.status(200).json({
    success: true,
    nextStep,
    llmResponse
  });
}
