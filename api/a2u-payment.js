module.exports = async function handler(req, res) {
  // السماح بطلبات CORS من واجهة التطبيق
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'PI_API_KEY is missing in Vercel Environment Variables'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = (body.action || body.type || '').toLowerCase();
    const paymentId = body.paymentId || body.payment_id || body.id || body.identifier;
    const txid = body.txid || body.transactionId || body.transaction_id;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'paymentId is required',
        receivedBody: body
      });
    }

    const baseUrl = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`;
    const headers = {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // 1. الموافقة على الدفع (Server Approval)
    if (action === 'approve' || (!action && !txid)) {
      const piResponse = await fetch(`${baseUrl}/approve`, {
        method: 'POST',
        headers
      });
      const data = await piResponse.json().catch(() => ({}));
      return res.status(piResponse.status).json({
        success: piResponse.ok,
        action: 'approve',
        paymentId,
        piApiResponse: data
      });
    }

    // 2. استكمال الدفع بعد التوقيع على البلوكشين (Server Completion)
    if (action === 'complete' || (!action && txid)) {
      if (!txid) {
        return res.status(400).json({
          success: false,
          error: 'txid is required for complete action'
        });
      }

      const piResponse = await fetch(`${baseUrl}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ txid })
      });
      const data = await piResponse.json().catch(() => ({}));
      return res.status(piResponse.status).json({
        success: piResponse.ok,
        action: 'complete',
        paymentId,
        txid,
        piApiResponse: data
      });
    }

    // 3. إلغاء الدفع عند الحاجة
    if (action === 'cancel') {
      const piResponse = await fetch(`${baseUrl}/cancel`, {
        method: 'POST',
        headers
      });
      const data = await piResponse.json().catch(() => ({}));
      return res.status(piResponse.status).json({
        success: piResponse.ok,
        action: 'cancel',
        paymentId,
        piApiResponse: data
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Supported actions: approve, complete, cancel'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};
