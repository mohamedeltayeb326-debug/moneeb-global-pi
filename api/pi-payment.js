export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, paymentId, txid } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;

  if (!PI_API_KEY) {
    return res.status(500).json({ error: 'PI_API_KEY is missing in Vercel settings' });
  }

  const baseUrl = 'https://api.minepi.com/v2/payments';
  const endpoint = action === 'approve'
    ? `${baseUrl}/${paymentId}/approve`
    : `${baseUrl}/${paymentId}/complete`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: action === 'complete' ? JSON.stringify({ txid }) : undefined
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
