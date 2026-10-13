const crypto = require('crypto');

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const serviceKeyAuth = (req, res, next) => {
  const configuredKey = process.env.ERP_SERVICE_API_KEY;

  if (!configuredKey || !configuredKey.trim()) {
    console.error('[Security Critical] ERP_SERVICE_API_KEY is not configured on ERP server');
    return res.status(500).json({ error: 'Server authentication misconfiguration' });
  }

  const providedKey = req.headers['x-service-key'];
  if (!providedKey) {
    return res.status(401).json({ error: 'Unauthorized: Missing X-Service-Key header' });
  }

  if (!timingSafeEqualStr(providedKey, configuredKey)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid service key' });
  }

  req.authType = 'service-key';
  next();
};

module.exports = {
  serviceKeyAuth,
  timingSafeEqualStr
};
