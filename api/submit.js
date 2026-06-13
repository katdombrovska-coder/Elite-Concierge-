/* ===== Elite AI Submit API — Save final setup submission =====
 *
 * INTEGRATION PLACEHOLDERS:
 * - Supabase / Vercel Postgres for database
 * - Resend email integration (notify Kat of new submission)
 * - Google Sheets or Airtable sync
 * - Retell AI agent creation trigger
 * - Stripe activation
 * - WhatsApp notification
 *
 * MVP: Saves to Supabase. Later: trigger emails, Retell, Stripe, etc.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const useSupabase = supabaseUrl && supabaseKey;

let supabase = null;
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Fallback memory store
const submissions = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: 'Missing answers' });
  }

  const record = {
    session_id: sessionId,
    created_at: new Date().toISOString(),
    business_name: answers.business_name || '',
    industry: answers.industry || '',
    business_links: answers.business_links || '',
    location_service_area: answers.location_service_area || '',
    main_services: answers.main_services || '',
    pricing_info: answers.pricing_info || '',
    opening_hours: answers.opening_hours || '',
    languages: answers.languages || '',
    main_ai_goal: answers.main_ai_goal || '',
    booking_method: answers.booking_method || '',
    customer_info_to_collect: answers.customer_info_to_collect || '',
    common_customer_questions: answers.common_customer_questions || '',
    escalation_rules: answers.escalation_rules || '',
    lead_destination: answers.lead_destination || '',
    lead_destination_detail: answers.lead_destination_detail || '',
    tone_of_voice: answers.tone_of_voice || '',
    restrictions: answers.restrictions || '',
    special_business_rules: answers.special_business_rules || '',
    contact_name: answers.contact_name || '',
    contact_email: answers.contact_email || '',
    contact_phone: answers.contact_phone || '',
    final_summary: JSON.stringify(answers, null, 2),
    submission_status: 'submitted'
  };

  if (supabase) {
    const { error } = await supabase.from('ai_receptionist_submissions').insert(record);
    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    submissions.push(record);
  }

  // INTEGRATION PLACEHOLDER: Send email notification via Resend
  // await sendEmail({ to: 'kat@eliteai.space', subject: 'New AI Setup Submission', body: ... });

  // INTEGRATION PLACEHOLDER: Sync to Google Sheets
  // await syncToSheets(record);

  // INTEGRATION PLACEHOLDER: WhatsApp notification
  // await sendWhatsApp(process.env.KAT_WHATSAPP, 'New AI setup submission: ' + record.business_name);

  return res.status(200).json({ success: true, id: sessionId });
}
