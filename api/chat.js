/* ===== Elite AI Chat API — Neon Postgres + Resend Email ===== */
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function generateBusinessSummaryHTML(answers) {
  const np = '<span style="color:#999;font-style:italic">Not provided</span>';
  
  const sectionStyle = 'background:#fafafa;border-left:3px solid #ec1c8c;padding:16px;margin:16px 0;border-radius:4px;';
  const sectionTitle = 'font-size:14px;font-weight:700;color:#ec1c8c;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;';
  const fieldRow = 'display:flex;padding:6px 0;border-bottom:1px solid #f0f0f0;';
  const fieldLabel = 'flex:0 0 140px;font-weight:600;color:#666;font-size:13px;';
  const fieldValue = 'flex:1;color:#333;font-size:13px;';
  
  function field(label, value) {
    if (!value || value === 'Not provided' || value === '') {
      return `<div style="${fieldRow}"><span style="${fieldLabel}">${label}</span><span style="${fieldValue}">${np}</span></div>`;
    }
    return `<div style="${fieldRow}"><span style="${fieldLabel}">${label}</span><span style="${fieldValue}">${value}</span></div>`;
  }
  
  let html = '';
  
  // Business Information
  html += `<div style="${sectionStyle}">`;
  html += `<h3 style="${sectionTitle}">🏢 Business Information</h3>`;
  html += field('Business Name', answers.business_name);
  html += field('Industry', answers.industry);
  html += field('Description', answers.business_description);
  html += field('Website/Links', answers.business_links);
  html += field('Location', answers.location_service_area);
  html += field('Services', answers.main_services);
  html += field('Pricing', answers.pricing_info);
  html += field('Differentiator', answers.differentiator);
  html += field('Hours', answers.opening_hours);
  html += field('Languages', answers.languages);
  html += `</div>`;
  
  // AI Configuration
  html += `<div style="${sectionStyle}">`;
  html += `<h3 style="${sectionTitle}">🤖 AI Configuration</h3>`;
  html += field('AI Goals', answers.main_ai_goal);
  html += field('Booking Method', answers.booking_method);
  html += field('Info to Collect', answers.customer_info_to_collect);
  html += field('FAQ Topics', answers.common_customer_questions);
  html += field('Escalation Rules', answers.escalation_rules);
  html += field('Ideal Customer', answers.ideal_customer);
  html += field('Lead Destination', answers.lead_destination);
  html += field('Destination Details', answers.lead_destination_detail);
  html += field('Tone of Voice', answers.tone_of_voice);
  html += field('Rules/Restrictions', answers.restrictions_rules);
  html += `</div>`;
  
  return html;
}

async function sendNotificationEmail(answers, businessSummary) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return;

  const summaryHtml = generateBusinessSummaryHTML(answers);
  const packageInfo = answers.selected_package ? `<div style="background:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:16px 0;border-radius:4px;"><strong>📦 Selected Package:</strong> ${answers.selected_package}</div>` : '';

  const emailHtml = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;margin:0 auto;background:#fff;">
      <div style="background:#ffffff;padding:32px;text-align:center;border-bottom:2px solid #ec1c8c;">
        <h1 style="color:#333;margin:0;font-size:28px;font-weight:800;">🎉 New AI Receptionist Setup</h1>
        <p style="color:#666;margin:8px 0 0;font-size:15px;">${answers.business_name || 'New Lead'}</p>
      </div>
      
      <div style="padding:24px;">
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#333;">📋 Quick Overview</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;font-weight:600;color:#666;width:120px;">Business:</td>
              <td style="padding:8px 0;color:#333;">${answers.business_name||'N/A'}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:600;color:#666;">Industry:</td>
              <td style="padding:8px 0;color:#333;">${answers.industry||'N/A'}</td>
            </tr>
            ${answers.selected_package ? `<tr><td style="padding:8px 0;font-weight:600;color:#666;">Package:</td><td style="padding:8px 0;color:#ec1c8c;font-weight:700;">${answers.selected_package}</td></tr>` : ''}
            <tr>
              <td style="padding:8px 0;font-weight:600;color:#666;">Contact:</td>
              <td style="padding:8px 0;color:#333;">${answers.contact_name||'N/A'} | ${answers.contact_email||'N/A'}${answers.contact_phone ? ' | ' + answers.contact_phone : ''}</td>
            </tr>
          </table>
        </div>
        
        ${packageInfo}
        
        <h2 style="font-size:18px;color:#333;margin:24px 0 8px;">📝 Complete Setup Details</h2>
        ${summaryHtml}
        
        <div style="margin-top:32px;padding-top:24px;border-top:2px solid #f0f0f0;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">Submitted via eliteai.space on ${new Date().toLocaleString('en-US', {timeZone: 'Europe/Lisbon', dateStyle: 'medium', timeStyle: 'short'})}</p>
        </div>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Elite AI <onboarding@eliteai.space>',
        to: ['kate@eliteai.space'],
        subject: '🎉 New AI Receptionist Setup — ' + (answers.business_name || 'Unknown'),
        html: emailHtml
      })
    });
    console.log('✅ Email sent successfully');
  } catch (e) { console.error('❌ Resend error:', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const pwd = req.headers['x-admin-password'] || req.query.password;
    if (pwd !== 'elite-ai-admin') return res.status(401).json({ error: 'Unauthorized' });
    try {
      const { rows } = await pool.query('SELECT * FROM ai_receptionist_submissions ORDER BY created_at DESC');
      return res.status(200).json({ submissions: rows });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, step, field, answer, answers, action } = req.body;

  if (action === 'update_status') {
    await pool.query('UPDATE ai_receptionist_submissions SET submission_status = $1 WHERE session_id = $2', [answer, sessionId]);
    return res.status(200).json({ success: true });
  }

  if (action === 'submit') {
    const a = answers || {};
    const businessSummary = req.body.business_summary || '';
    try {
      await pool.query(
        `INSERT INTO ai_receptionist_submissions (
          session_id, business_name, industry, business_links, location_service_area,
          main_services, pricing_info, opening_hours, languages, main_ai_goal,
          booking_method, customer_info_to_collect, common_customer_questions,
          escalation_rules, lead_destination, lead_destination_detail, tone_of_voice,
          restrictions, special_business_rules, contact_name, contact_email,
          contact_phone, final_summary, submission_status, business_summary, selected_package
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
        ON CONFLICT (session_id) DO UPDATE SET 
          submission_status='submitted', 
          business_summary=EXCLUDED.business_summary, 
          selected_package=EXCLUDED.selected_package,
          business_name=EXCLUDED.business_name,
          industry=EXCLUDED.industry,
          business_links=EXCLUDED.business_links,
          location_service_area=EXCLUDED.location_service_area,
          main_services=EXCLUDED.main_services,
          pricing_info=EXCLUDED.pricing_info,
          opening_hours=EXCLUDED.opening_hours,
          languages=EXCLUDED.languages,
          main_ai_goal=EXCLUDED.main_ai_goal,
          booking_method=EXCLUDED.booking_method,
          customer_info_to_collect=EXCLUDED.customer_info_to_collect,
          common_customer_questions=EXCLUDED.common_customer_questions,
          escalation_rules=EXCLUDED.escalation_rules,
          lead_destination=EXCLUDED.lead_destination,
          lead_destination_detail=EXCLUDED.lead_destination_detail,
          tone_of_voice=EXCLUDED.tone_of_voice,
          restrictions=EXCLUDED.restrictions,
          special_business_rules=EXCLUDED.special_business_rules,
          contact_name=EXCLUDED.contact_name,
          contact_email=EXCLUDED.contact_email,
          contact_phone=EXCLUDED.contact_phone,
          final_summary=EXCLUDED.final_summary`,
        [sessionId,
          a.business_name||'',a.industry||'',a.business_links||'',a.location_service_area||'',
          a.main_services||'',a.pricing_info||'',a.opening_hours||'',a.languages||'',a.main_ai_goal||'',
          a.booking_method||'',a.customer_info_to_collect||'',a.common_customer_questions||'',
          a.escalation_rules||'',a.lead_destination||'',a.lead_destination_detail||'',
          a.tone_of_voice||'',a.restrictions||'',a.special_business_rules||'',
          a.contact_name||'',a.contact_email||'',a.contact_phone||'',
          JSON.stringify(a), 'submitted', businessSummary, a.selected_package||null]
      );
      // Send email notification with business summary
      await sendNotificationEmail(a, businessSummary);
      return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
  }

  // Save individual answer
  if (!sessionId || !step || !answer) return res.status(400).json({ error: 'Missing required fields' });

  try {
    await pool.query(`INSERT INTO ai_receptionist_submissions (session_id, created_at, selected_package) VALUES ($1, NOW(), $2) ON CONFLICT (session_id) DO UPDATE SET selected_package=$2`, [sessionId, answer]);
    const fieldMap = {
      business_name:'business_name', industry:'industry', business_links:'business_links',
      location_service_area:'location_service_area', main_services:'main_services',
      pricing_info:'pricing_info', opening_hours:'opening_hours', languages:'languages',
      main_ai_goal:'main_ai_goal', booking_method:'booking_method',
      customer_info_to_collect:'customer_info_to_collect', common_customer_questions:'common_customer_questions',
      escalation_rules:'escalation_rules', lead_destination:'lead_destination',
      lead_destination_detail:'lead_destination_detail', tone_of_voice:'tone_of_voice',
      restrictions:'restrictions', special_business_rules:'special_business_rules',
      contact_name:'contact_name', contact_email:'contact_email', contact_phone:'contact_phone',
      selected_package:'selected_package'
    };
    const dbField = fieldMap[field];
    if (dbField && dbField !== 'selected_package') await pool.query(`UPDATE ai_receptionist_submissions SET ${dbField} = $1 WHERE session_id = $2`, [answer, sessionId]);
  } catch (e) { console.error('DB error:', e.message); }

  return res.status(200).json({ success: true, nextStep: step + 1 });
}
