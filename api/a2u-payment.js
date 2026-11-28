module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    return res.status(500).json({ error: 'PI_API_KEY is missing in Vercel Environment Variables' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { uid, recipient, amount, memo } = body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'uid is required' });
    }

    const piResponse = await fetch('https://api.minepi.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment: {
          amount: Number(amount) || 0.01,
          memo: memo || 'Testnet A2U',
          metadata: { recipient: recipient || '' },
          uid
        }
      })
    });

    const data = await piResponse.json().catch(() => ({}));
    return res.status(piResponse.status).json({
      success: piResponse.ok,
      action: 'create',
      recipient,
      amount: Number(amount) || 0.01,
      piApiResponse: data
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};
