const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const Stripe = require('stripe');
const { createApp } = require('./server');

async function fixture(t, options = {}) {
  const calls = [];
  const intents = new Map();
  const fakeStripe = {
    accounts: { retrieve: async () => ({ charges_enabled: true, country: 'US', capabilities: { card_payments: 'active' } }) },
    countrySpecs: { retrieve: async () => ({ supported_payment_currencies: ['usd', 'php'] }) },
    paymentIntents: { create: async (params, request) => {
      calls.push({ params, request });
      const existing = intents.get(request.idempotencyKey);
      if (existing && existing.amount !== params.amount) throw { type: 'StripeIdempotencyError' };
      const intent = existing || { id: 'pi_fixture', client_secret: 'fixture_client_reference', amount: params.amount, currency: params.currency, livemode: false };
      intents.set(request.idempotencyKey, intent);
      return intent;
    } },
    webhooks: Stripe.webhooks,
    ...options.stripeOverrides,
  };
  const app = createApp({ env: { STRIPE_SECRET_KEY: 'sk_test_fixture', STRIPE_WEBHOOK_SECRET: 'whsec_fixture', ...options.env }, stripeClient: fakeStripe, ...options.appOptions });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, headers = {}) => fetch(`${base}/create-payment-intent`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { base, post, calls };
}

test('configuration confirms account PHP capability and supports both local origins', async t => {
  const { base } = await fixture(t);
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
    const response = await fetch(`${base}/donation-config`, { headers: { Origin: origin } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { enabled: true, currency: 'php', minAmount: 10000, maxAmount: 10000000 });
  }
  assert.equal((await fetch(`${base}/donation-config`, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
});

test('all presets and custom centavos reach Stripe unchanged; retries use Stripe idempotency', async t => {
  const { post, calls } = await fixture(t);
  for (const amount of [10000, 25000, 50000, 100000, 35050]) {
    const requestId = randomUUID();
    const body = { amount, currency: 'php', requestId };
    const first = await post(body);
    assert.equal(first.status, 200);
    const data = await first.json();
    assert.equal(data.amount, amount);
    assert.equal(data.currency, 'php');
    assert.equal(calls.at(-1).params.amount, amount);
    assert.deepEqual(calls.at(-1).params.allowed_payment_method_types, ['card']);
    const second = await post(body);
    assert.deepEqual(await second.json(), data);
    assert.equal(calls.at(-1).request.idempotencyKey, `bytebridge-donation-${requestId}`);
    assert.equal((await post({ ...body, amount: amount + 100 })).status, 409);
  }
});

test('invalid amounts, currency, IDs, and malformed JSON cannot create an intent', async t => {
  const { base, post, calls } = await fixture(t);
  for (const amount of [0, -1, 9999, 10000001, 10000.5, '25000', null]) {
    assert.equal((await post({ amount, currency: 'php', requestId: randomUUID() })).status, 400);
  }
  assert.equal((await post({ amount: 25000, currency: 'usd', requestId: randomUUID() })).status, 400);
  assert.equal((await post({ amount: 25000, currency: 'php', requestId: 'bad' })).status, 400);
  assert.equal((await fetch(`${base}/create-payment-intent`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal(calls.length, 0);
});

test('invalid keys, live development keys, unsupported PHP, and inactive accounts keep checkout disabled', async t => {
  for (const key of ['invalid', 'sk_live_fixture']) {
    const { base, calls } = await fixture(t, { env: { STRIPE_SECRET_KEY: key } });
    const response = await fetch(`${base}/donation-config`);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).enabled, false);
    assert.equal(calls.length, 0);
  }
  for (const stripeOverrides of [
    { countrySpecs: { retrieve: async () => ({ supported_payment_currencies: ['usd'] }) } },
    { accounts: { retrieve: async () => ({ charges_enabled: false }) } },
  ]) {
    const { base, post, calls } = await fixture(t, { stripeOverrides, env: { NODE_ENV: 'production', STRIPE_SECRET_KEY: 'sk_live_fixture' } });
    assert.equal((await fetch(`${base}/donation-config`)).status, 503);
    assert.equal((await post({ amount: 25000, currency: 'php', requestId: randomUUID() })).status, 503);
    assert.equal(calls.length, 0);
  }
});

test('test keys allow sandbox checkout before live account activation', async t => {
  const { base, post } = await fixture(t, { stripeOverrides: {
    accounts: { retrieve: async () => ({ country: 'US', charges_enabled: false, capabilities: {} }) },
  } });
  assert.equal((await fetch(`${base}/donation-config`)).status, 200);
  assert.equal((await post({ amount: 25000, currency: 'php', requestId: randomUUID() })).status, 200);
});

test('Stripe failure or mismatched response cannot return a usable client secret', async t => {
  for (const create of [
    async () => { throw new Error('sensitive upstream error'); },
    async () => ({ amount: 10000, currency: 'php', client_secret: 'fixture', livemode: false }),
    async () => ({ amount: 25000, currency: 'php', client_secret: 'fixture', livemode: true }),
  ]) {
    const { post } = await fixture(t, { stripeOverrides: { paymentIntents: { create } } });
    const response = await post({ amount: 25000, currency: 'php', requestId: randomUUID() });
    assert.equal(response.status, 502);
    const data = await response.json();
    assert.equal(data.clientSecret, undefined);
    assert.equal(JSON.stringify(data).includes('sensitive'), false);
  }
});

test('signed webhooks persist once, protect success from older events, and reject forgeries', async t => {
  const databasePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bytebridge-test-')), 'donations.sqlite');
  const { base } = await fixture(t, { env: { DONATION_DATABASE_PATH: databasePath } });
  const intent = { id: 'pi_fixture', amount: 25000, amount_received: 25000, currency: 'php', metadata: { project: 'bytebridge' } };
  const send = async (event, validSignature = true) => {
    const payload = JSON.stringify(event);
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: validSignature ? 'whsec_fixture' : 'whsec_wrong' });
    return fetch(`${base}/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': signature }, body: payload });
  };
  const success = { id: 'evt_success', type: 'payment_intent.succeeded', created: 200, livemode: false, data: { object: intent } };
  assert.equal((await send(success, false)).status, 400);
  assert.equal((await send(success)).status, 200);
  assert.equal((await send(success)).status, 200);
  assert.equal((await send({ ...success, id: 'evt_failure', type: 'payment_intent.payment_failed', created: 100 })).status, 200);
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(databasePath);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM webhook_events').get().n, 2);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM donations').get().n, 1);
  assert.equal(db.prepare('SELECT status FROM donations').get().status, 'succeeded');
  db.close();
});

test('webhook persistence failures return an error so Stripe can retry', async t => {
  const { base } = await fixture(t, { appOptions: { recordEvent: () => { throw new Error('disk unavailable'); } } });
  const payload = JSON.stringify({ id: 'evt_fixture', type: 'payment_intent.processing', created: 100, livemode: false, data: { object: { amount: 25000, currency: 'php', metadata: { project: 'bytebridge' } } } });
  const response = await fetch(`${base}/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': Stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_fixture' }) }, body: payload });
  assert.equal(response.status, 500);
});
