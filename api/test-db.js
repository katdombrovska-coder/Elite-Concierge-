/* ===== Quick DB diagnostic ===== */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const results = [];
  
  // 1. Check env vars
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasResendKey = !!process.env.RESEND_API_KEY;
  results.push({ check: 'DATABASE_URL exists', value: hasDbUrl });
  results.push({ check: 'RESEND_API_KEY exists', value: hasResendKey });
  
  if (!hasDbUrl) {
    return res.status(200).json({ error: 'DATABASE_URL not set', results });
  }
  
  // 2. Try to import pg
  try {
    const pg = await import('pg');
    results.push({ check: 'pg module loaded', value: true });
    
    // 3. Try to connect
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    results.push({ check: 'DB connection', value: 'connected' });
    
    // 4. Check table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ai_receptionist_submissions'
      )
    `);
    results.push({ check: 'table exists', value: tableCheck.rows[0].exists });
    
    // 5. Check columns
    if (tableCheck.rows[0].exists) {
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'ai_receptionist_submissions'
        ORDER BY ordinal_position
      `);
      results.push({ check: 'columns', value: cols.rows.map(r => r.column_name) });
      
      const hasSelectedPackage = cols.rows.some(r => r.column_name === 'selected_package');
      results.push({ check: 'selected_package column exists', value: hasSelectedPackage });
    }
    
    await client.release();
    await pool.end();
    
  } catch (e) {
    results.push({ check: 'error', message: e.message, stack: e.stack });
  }
  
  return res.status(200).json({ results });
}
