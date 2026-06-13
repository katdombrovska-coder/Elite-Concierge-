/* ===== Elite AI Admin API — Fetch submissions =====
 *
 * Simple password-protected endpoint.
 * Password stored in SUPABASE_URL or env var ADMIN_PASSWORD.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const adminPassword = process.env.ADMIN_PASSWORD || 'elite-ai-admin';
const useSupabase = supabaseUrl && supabaseKey;

let supabase = null;
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Fallback memory store (same as submit.js — only works if same serverless instance)
const submissions = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Check password
  const pwd = req.headers['x-admin-password'] || req.query.password;
  if (pwd !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Fetch all submissions
    if (supabase) {
      const { data, error } = await supabase
        .from('ai_receptionist_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ submissions: data });
    }
    return res.status(200).json({ submissions: submissions });
  }

  if (req.method === 'POST') {
    // Update submission status
    const { id, status } = req.body;
    if (supabase && id) {
      const { error } = await supabase
        .from('ai_receptionist_submissions')
        .update({ submission_status: status })
        .eq('session_id', id);
      if (error) return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
