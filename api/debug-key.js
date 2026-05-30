export default function handler(req, res) {
  const key = process.env.RETELL_API_KEY;
  
  res.status(200).json({
    key_exists: !!key,
    key_length: key ? key.length : 0,
    key_prefix: key ? key.substring(0, 15) : 'NOT_SET',
    key_suffix: key ? key.substring(key.length - 10) : 'NOT_SET',
    has_whitespace: key ? /\s/.test(key) : false
  });
}
