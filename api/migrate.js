/* ===== One-time DB migration ===== */
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Security: simple key check
  const key = req.query.key || req.headers['x-migrate-key'];
  if (key !== 'kat-ex-migrate-2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const results = [];
  const client = await pool.connect();
  
  try {
    // Add missing columns
    const migrations = [
      'ALTER TABLE ai_receptionist_submissions ADD COLUMN IF NOT EXISTS selected_package TEXT',
      'ALTER TABLE ai_receptionist_submissions ADD COLUMN IF NOT EXISTS business_summary TEXT',
      'ALTER TABLE ai_receptionist_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()'
    ];
    
    for (const sql of migrations) {
      try {
        await client.query(sql);
        results.push({ sql, status: 'ok' });
      } catch(e) {
        results.push({ sql, status: 'error', message: e.message });
      }
    }
    
    // Verify columns
    const cols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='ai_receptionist_submissions' ORDER BY ordinal_position"
    );
    
    await client.release();
    
    return res.status(200).json({
      success: true,
      migrations: results,
      allColumns: cols.rows.map(r => r.column_name)
    });
  } catch(e) {
    await client.release();
    return res.status(500).json({ error: e.message });
  }
}
