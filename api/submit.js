/* ===== Elite AI Submit API — Neon Postgres + Resend Email ===== */
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function sendNotificationEmail(answers) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return;

  const fields = Object.entries(answers)
    .filter(([k, v]) => v && v !== 'not specified' && !['final_summary','submission_status'].includes(k))
    .map(([k, v]) => `<strong>${k.replace(/_/g, ' ')}:</strong> ${v}`)
    .join('<br>');

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Elite AI <onboarding@eliteai.space>',
        to: ['kat@eliteai.space'],
        subject: '🎉 New AI Receptionist Setup — ' + (answers.business_name || 'Unknown'),
        html: `
          <h2>New AI Setup Submission</h2>
          <p><strong>Business:</strong> ${answers.business_name || 'N/A'}</p>
          <p><strong>Industry:</strong> ${answers.industry || 'N/A'}</p>
          <p><strong>Contact:</strong> ${answers.contact_name || 'N/A'} | ${answers.contact_email || 'N/A'} | ${answers.contact_phone || 'N/A'}</p>
          <hr>
          <p>${fields}</p>
          <hr>
          <p><em>Submitted via eliteai.space</em></p>
        `
      })
    });
  } catch (e) {
    console.error('Resend error:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'Missing answers' });

  const a = answers;
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
        a.business_name||'', a.industry||'', a.business_links||'',
        a.location_service_area||'', a.main_services||'', a.pricing_info||'',
        a.opening_hours||'', a.languages||'', a.main_ai_goal||'',
        a.booking_method||'', a.customer_info_to_collect||'',
        a.common_customer_questions||'', a.escalation_rules||'',
        a.lead_destination||'', a.lead_destination_detail||'',
        a.tone_of_voice||'', a.restrictions||'', a.special_business_rules||'',
        a.contact_name||'', a.contact_email||'', a.contact_phone||'',
        JSON.stringify(a), 'submitted'
      ]
    );

    // Send email notification to Kat
    await sendNotificationEmail(a);

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Submit error:', e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
}
