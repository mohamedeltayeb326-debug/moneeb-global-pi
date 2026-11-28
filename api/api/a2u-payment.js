module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    recipient,
    amount = 0.01,
    memo = 'MONEEB GLOBAL Testnet A2U verification',
    uid
  } = req.body || {};

  const PI_API_KEY = process.env.PI_API_KEY;

  if (!PI_API_KEY) {
    return res.status(500).json({ error: 'PI_API_KEY is missing in Vercel settings' });
  }

  if (!recipient || typeof recipient !== 'string' || !recipient.startsWith('G')) {
    return res.status(400).json({
      error: 'Valid Testnet recipient wallet address starting with G is required'
    });
  }

  const baseUrl = 'https://api.minepi.com/v2/payments';

  try {
    const paymentPayload = {
      payment: {
        amount: Number(amount),
        memo,
        metadata: {
          purpose: 'testnet_a2u_5_wallets_verification',
          app: 'Moneeb Crops',
          recipientWallet: recipient
        },
        ...(uid ? { uid } : {})
      }
    };

    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });

    const data = await createRes.json();
    return res.status(createRes.status).json({
      recipient,
      amount: Number(amount),
      piApiResponse: data
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
