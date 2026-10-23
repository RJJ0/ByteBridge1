const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const express = require('express');
const { createHmac, timingSafeEqual } = require('node:crypto');
const cors = require('cors');
const Stripe = require('stripe');
const { recordWebhookEvent } = require('./donation-store');

function createApp({ env = process.env, stripeClient, recordEvent = recordWebhookEvent } = {}) {
  const app = express();
  const production = env.NODE_ENV === 'production';
  const secretKey = (env.STRIPE_SECRET_KEY || '').trim();
  const keyValid = /^sk_(test|live)_\S+$/.test(secretKey)
    && (production || secretKey.startsWith('sk_test_'));
  const stripe = stripeClient || (keyValid ? new Stripe(secretKey, { timeout: 10000, maxNetworkRetries: 1 }) : null);
  const minAmount = Number(env.DONATION_MIN_AMOUNT || 10000);
  const maxAmount = Number(env.DONATION_MAX_AMOUNT || 10000000);
  if (!Number.isSafeInteger(minAmount) || !Number.isSafeInteger(maxAmount)
    || minAmount <= 0 || maxAmount < minAmount || maxAmount > 99999999) {
    throw new Error('Invalid donation amount limits. Use integer centavos.');
  }
  const allowedOrigins = (env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map(value => value.trim()).filter(Boolean);
  const validAmount = amount => Number.isSafeInteger(amount) && amount >= minAmount && amount <= maxAmount;
  const signReference = id => createHmac('sha256', secretKey).update(`bytebridge-status:${id}`).digest('hex');
  const paymentReference = id => `${id}.${signReference(id)}`;
  app.disable('x-powered-by');
  app.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
  // CORS alone does not reject requests; enforce the allowlist for browser callers too.
  app.use((req, res, next) => {
    if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) return res.status(403).json({ error: 'Origin not allowed.' });
    next();
  });

  app.post('/webhook', express.raw({ type: 'application/json', limit: '256kb' }), (req, res) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ error: 'Webhook not configured.' });
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
    const intent = event.data.object;
    if (!['payment_intent.succeeded', 'payment_intent.processing', 'payment_intent.payment_failed'].includes(event.type)
      || intent.metadata?.project !== 'bytebridge') return res.json({ received: true });
    if (intent.currency !== 'php' || !validAmount(intent.amount)
      || (event.type === 'payment_intent.succeeded' && intent.amount_received !== intent.amount)
      || event.livemode !== secretKey.startsWith('sk_live_')) {
      return res.status(400).json({ error: 'Unexpected donation details.' });
    }
    try {
      recordEvent(event, env.DONATION_DATABASE_PATH || path.join(__dirname, 'data', 'donations.sqlite'));
      return res.json({ received: true });
    } catch {
      // A non-2xx response lets Stripe retry. Never acknowledge an unpersisted donation.
      return res.status(500).json({ error: 'Unable to record donation event.' });
    }
  });

  app.use(express.json({ limit: '8kb' }));
  const requests = new Map();
  function rateLimit(req, res, next) {
    const now = Date.now();
    for (const [ip, entry] of requests) if (entry.expires <= now) requests.delete(ip);
    const key = req.ip;
    const entry = requests.get(key) || { count: 0, expires: now + 15 * 60 * 1000 };
    if (entry.count >= 120 || (!requests.has(key) && requests.size >= 10000)) {
      res.set('Retry-After', '900');
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    entry.count++;
    requests.set(key, entry);
    next();
  }
  let verifiedUntil = 0;
  let verification;
  async function verifyAccount() {
    if (!stripe || !keyValid) return false;
    if (production && !env.STRIPE_WEBHOOK_SECRET) return false;
    if (Date.now() < verifiedUntil) return true;
    verification ??= (async () => {
      const account = await stripe.accounts.retrieve();
      if (!account.country) return false;
      // Test keys can create test payments before the live account is activated.
      if (secretKey.startsWith('sk_live_') && (!account.charges_enabled || account.capabilities?.card_payments !== 'active')) return false;
      const country = await stripe.countrySpecs.retrieve(account.country);
      if (!country.supported_payment_currencies.includes('php')) return false;
      verifiedUntil = Date.now() + 60000;
      return true;
    })();
    try { return await verification; } finally { verification = undefined; }
  }
  app.get('/donation-config', rateLimit, async (_req, res) => {
    try {
      const enabled = await verifyAccount();
      res.status(enabled ? 200 : 503).json({ enabled, currency: 'php', minAmount, maxAmount });
    } catch {
      res.status(503).json({ enabled: false, error: 'Unable to verify Stripe payment availability.' });
    }
  });
  app.post('/create-payment-intent', rateLimit, async (req, res) => {
    const { amount, currency, requestId } = req.body || {};
    if (!validAmount(amount) || currency !== 'php'
      || typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return res.status(400).json({ error: 'Provide a valid PHP amount in centavos and a UUID requestId.' });
    }
    try {
      if (!await verifyAccount()) return res.status(503).json({ error: 'PHP card payments are unavailable.' });
      const intent = await stripe.paymentIntents.create({
        amount, currency: 'php', allowed_payment_method_types: ['card'],
        metadata: { project: 'bytebridge', request_id: requestId },
      }, { idempotencyKey: `bytebridge-donation-${requestId}` });
      if (intent.amount !== amount || intent.currency !== 'php' || !intent.client_secret
        || intent.livemode !== secretKey.startsWith('sk_live_')) {
        return res.status(502).json({ error: 'Payment details could not be verified.' });
      }
      return res.json({ clientSecret: intent.client_secret, amount: intent.amount, currency: intent.currency, reference: paymentReference(intent.id) });
    } catch (error) {
      // Do not log Stripe errors: they can contain sensitive request/response details.
      return res.status(error.type === 'StripeIdempotencyError' ? 409 : 502).json({ error: 'Unable to prepare this payment. Please try again.' });
    }
  });
  // Read-only verification: references authorize status lookup, never a new payment.
  app.post('/donation-status', rateLimit, async (req, res) => {
    if (!stripe || !keyValid) return res.status(503).json({ error: 'Payment verification unavailable.' });
    const { reference, clientSecret } = req.body || {};
    let id;
    if (typeof reference === 'string' && /^pi_[A-Za-z0-9]+\.[a-f0-9]{64}$/.test(reference)) {
      const [candidate, signature] = reference.split('.');
      if (timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(signReference(candidate), 'hex'))) id = candidate;
    } else if (!reference && typeof clientSecret === 'string' && /^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(clientSecret)) {
      id = clientSecret.split('_secret_')[0];
    }
    if (!id) return res.status(400).json({ error: 'Invalid payment reference.' });
    try {
      const intent = await stripe.paymentIntents.retrieve(id);
      if (intent.id !== id || (!reference && intent.client_secret !== clientSecret)
        || intent.metadata?.project !== 'bytebridge' || intent.currency !== 'php'
        || !Number.isSafeInteger(intent.amount) || intent.amount <= 0 || intent.amount > 99999999
        || intent.livemode !== secretKey.startsWith('sk_live_')
        || (intent.status === 'succeeded' && intent.amount_received !== intent.amount)) {
        return res.status(404).json({ error: 'Payment could not be verified.' });
      }
      return res.json({ status: intent.status, currency: intent.currency,
        amount: intent.status === 'succeeded' ? intent.amount_received : null, reference: paymentReference(id) });
    } catch {
      return res.status(502).json({ error: 'Payment could not be verified.' });
    }
  });
  app.use((error, _req, res, _next) => {
    res.status(error.status === 413 ? 413 : 400).json({ error: 'Invalid request.' });
  });
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4242);
  createApp().listen(port, '127.0.0.1', () => {
    console.log(`Donation API listening at http://localhost:${port}`);
    if (!/^sk_test_/.test(process.env.STRIPE_SECRET_KEY || '') && process.env.NODE_ENV !== 'production') {
      console.log('Checkout disabled: configure a valid Stripe test secret key in server/.env.');
    }
  });
}
module.exports = { createApp };
