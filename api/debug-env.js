export default function handler(req, res) {
  const key = process.env.RETELL_API_KEY || 'NOT SET';
  const agent = process.env.RETELL_AGENT_ID || 'NOT SET';
  res.status(200).json({
    key_length: key.length,
    key_prefix: key.substring(0, 10) + '...',
    key_suffix: '...' + key.substring(key.length - 6),
    agent_id: agent,
    has_whitespace: /\s/.test(key),
    key_hex: Buffer.from(key).toString('hex').substring(0, 40) + '...'
  });
}
