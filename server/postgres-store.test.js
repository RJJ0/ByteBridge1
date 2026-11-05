const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPostgresStore } = require('./postgres-store');

test('PostgreSQL writes commit together and duplicate events skip donation updates', async () => {
  const queries = [];
  let duplicate = false;
  let releases = 0;
  const store = createPostgresStore({ query: async () => {}, connect: async () => ({
    query: async (sql, values) => { queries.push({ sql, values }); return { rowCount: duplicate ? 0 : 1 }; },
    release: () => releases++,
  }) });
  const event = { id: 'evt_test', created: 200, type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test', amount: 25000, currency: 'php' } } };
  await store.record(event);
  assert.equal(queries[0].sql, 'BEGIN');
  assert.deepEqual(queries[2].values, ['pi_test', 25000, 'php', 'succeeded', 200]);
  assert.equal(queries[3].sql, 'COMMIT');
  queries.length = 0;
  duplicate = true;
  await store.record(event);
  assert.equal(queries.length, 3);
  assert.equal(queries[2].sql, 'COMMIT');
  assert.equal(releases, 2);
});

test('PostgreSQL failures roll back and propagate so Stripe can retry', async () => {
  const queries = [];
  let released = false;
  const store = createPostgresStore({ query: async () => {}, connect: async () => ({
    query: async sql => { queries.push(sql); if (sql.includes('INSERT')) throw new Error('unavailable'); },
    release: () => { released = true; },
  }) });
  await assert.rejects(store.record({ id: 'evt_test', created: 200 }), /unavailable/);
  assert.equal(queries.at(-1), 'ROLLBACK');
  assert.equal(released, true);
});

test('failed schema initialization can be retried', async () => {
  let calls = 0;
  const store = createPostgresStore({ query: async () => { if (++calls === 1) throw new Error('offline'); } });
  await assert.rejects(store.ready(), /offline/);
  await store.ready();
  assert.equal(calls, 2);
});
