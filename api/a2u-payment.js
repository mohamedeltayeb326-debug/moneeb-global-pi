module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    return res.status(500).json({
      error: 'PI_API_KEY is missing in Vercel settings'
    });
  }

  const {
    action = 'create',
    paymentId,
    txid,
    recipient,
    recipients,
    amount = 0.01,
    memo = 'MONEEB GLOBAL Testnet A2U payment',
    uid,
    metadata = {}
  } = req.body || {};

  const baseUrl = 'https://api.minepi.com/v2/payments';
  const headers = {
    Authorization: `Key ${PI_API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. استكمال معاملة قائمة (Complete)
    if (action === 'complete') {
      if (!paymentId) {
        return res.status(400).json({ error: 'paymentId is required for complete action' });
      }
      const completeRes = await fetch(`${baseUrl}/${paymentId}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify(txid ? { txid } : {})
      });
      const completeData = await completeRes.json();
      return res.status(completeRes.status).json({
        action: 'complete',
        paymentId,
        piApiResponse: completeData
      });
    }

    // 2. الموافقة على معاملة قائمة (Approve)
    if (action === 'approve') {
      if (!paymentId) {
        return res.status(400).json({ error: 'paymentId is required for approve action' });
      }
      const approveRes = await fetch(`${baseUrl}/${paymentId}/approve`, {
        method: 'POST',
        headers
      });
      const approveData = await approveRes.json();
      return res.status(approveRes.status).json({
        action: 'approve',
        paymentId,
        piApiResponse: approveData
      });
    }

    // 3. إنشاء وإرسال دفعة أو عدة دفعات App-to-User (Create)
    const targetList = Array.isArray(recipients) && recipients.length > 0
      ? recipients
      : recipient
      ? [recipient]
      : [];

    if (targetList.length === 0) {
      return res.status(400).json({
        error: 'Provide "recipient" (string) or "recipients" (array of Testnet wallet addresses starting with G)'
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: 'Valid positive numeric "amount" is required'
      });
    }

    const results = [];

    for (let i = 0; i < targetList.length; i++) {
      const addr = targetList[i];

      if (typeof addr !== 'string' || !addr.startsWith('G')) {
        results.push({
          recipient: addr,
          success: false,
          error: 'Invalid wallet address; must be a string starting with G'
        });
        continue;
      }

      const payload = {
        payment: {
          amount: numericAmount,
          memo: `${memo} #${i + 1}`,
          metadata: {
            purpose: 'testnet_a2u_verification',
            app: 'Moneeb Crops',
            recipientWallet: addr,
            index: i + 1,
            ...metadata
          },
          ...(uid ? { uid } : {})
        }
      };

      const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await createRes.json();
      } catch {
        data = { rawText: await createRes.text() };
      }

      results.push({
        recipient: addr,
        amount: numericAmount,
        httpStatus: createRes.status,
        success: createRes.ok,
        piApiResponse: data
      });
    }

    return res.status(200).json({
      action: 'create',
      totalProcessed: results.length,
      results
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
