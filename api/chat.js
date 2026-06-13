/* ===== Elite AI Chat API — Single question/response handler =====
 *
 * INTEGRATION PLACEHOLDERS:
 * - OpenAI API / GPT-5.5 LLM logic
 * - Supabase / Vercel Postgres for database
 *
 * MVP: Uses file-based storage for demo. Switch to Supabase for production.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase client — add SUPABASE_URL and SUPABASE_KEY to Vercel env vars
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const useSupabase = supabaseUrl && supabaseKey;

let supabase = null;
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Fallback: in-memory store (development only)
const memStore = {};

function getStore() {
  return supabase ? 'supabase' : 'memory';
}

async function getSession(sessionId) {
  if (supabase) {
    const { data } = await supabase.from('ai_receptionist_submissions').select('*').eq('session_id', sessionId).single();
    return data;
  }
  return memStore[sessionId] || null;
}

async function saveSession(sessionId, data) {
  if (supabase) {
    const { error } = await supabase.from('ai_receptionist_submissions').upsert({
      session_id: sessionId,
      ...data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id' });
    if (error) console.error('Supabase save error:', error);
  } else {
    memStore[sessionId] = { ...memStore[sessionId], ...data, updated_at: new Date().toISOString() };
  }
}

// System prompt for OpenAI conversational responses
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, step, field, answer, answers } = req.body;

  if (!sessionId || !step || !answer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Save answer
  const saveData = { [field]: answer, step_completed: step };
  await saveSession(sessionId, saveData);

  // Determine next question
  const nextStep = step + 1;

  // OpenAI GPT-5.5 integration placeholder
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
          model: 'gpt-5.5', // will update to actual model when available
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

  // Fallback: built-in responses
  if (!llmResponse) {
    const fallbacks = {
      1: `Great choice for ${answer}! Let me ask a couple more things.`,
      2: `Perfect, ${answer} — that helps us tailor everything.`,
      3: answer !== 'not specified' && answer !== 'not provided' ? `Got the links — helpful context for your AI.` : `No worries, we'll work with what we have.`,
      4: `Location noted: ${answer}. This helps with local optimization.`,
      5: `Excellent, ${answer} — these will be core to the AI's knowledge.`,
      6: answer !== 'not specified' ? `Pricing info saved. The AI will reference these accurately.` : `We can add pricing later — no problem.`,
      7: `Opening hours set: ${answer}. The AI will respect these.`,
      8: `Languages: ${answer}. The AI will be fluent in all of them.`,
      9: `Goal: ${answer}. This will be the AI's primary focus.`,
      10: `Booking method: ${answer}. We'll configure it accordingly.`,
      11: `Customer info to collect: ${answer}. Noted.`,
      12: answer !== 'not specified' ? `These are common questions — the AI will handle them smoothly.` : `We'll build a strong FAQ base for your AI.`,
      13: answer !== 'not specified' ? `Escalation rules set. The AI knows when to hand off to a human.` : `We'll set sensible defaults for escalation.`,
      14: `Lead destination: ${answer}. Perfect.`,
      14.5: answer !== 'not specified' ? `Destination detail saved: ${answer}.` : `We'll configure this during onboarding.`,
      15: `Tone: ${answer}. The AI will match this perfectly.`,
      16: answer !== 'not specified' ? `Restrictions noted. The AI will strictly follow these.` : `We'll apply sensible default guardrails.`,
      17: answer !== 'not specified' ? `Special rules saved. Very helpful.` : `We'll cover the essentials in the build.`,
      18: `Contact details received. We'll reach out with your AI preview.`
    };
    llmResponse = fallbacks[step] || 'Got it, thanks!';
  }

  return res.status(200).json({
    success: true,
    nextStep: nextStep,
    llmResponse: llmResponse
  });
}
