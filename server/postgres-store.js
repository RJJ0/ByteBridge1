// A single checked-out connection keeps event deduplication and status updates atomic.
function createPostgresStore(pool) {
  let initialization;
  function ready() {
    initialization ??= pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, created BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS donations (
        intent_id TEXT PRIMARY KEY, amount INTEGER NOT NULL, currency TEXT NOT NULL,
        status TEXT NOT NULL, event_created BIGINT NOT NULL
      );
    `).catch(error => { initialization = undefined; throw error; });
    return initialization;
  }

  async function record(event) {
    await ready();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query(
        'INSERT INTO webhook_events (id, created) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
        [event.id, event.created],
      );
      if (inserted.rowCount) {
        const intent = event.data.object;
        const status = event.type === 'payment_intent.succeeded' ? 'succeeded'
          : event.type === 'payment_intent.processing' ? 'processing' : 'failed';
        await client.query(`
          INSERT INTO donations (intent_id, amount, currency, status, event_created) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (intent_id) DO UPDATE SET status = EXCLUDED.status, event_created = EXCLUDED.event_created
          WHERE donations.status != 'succeeded'
            AND (EXCLUDED.status = 'succeeded' OR EXCLUDED.event_created > donations.event_created)
        `, [intent.id, intent.amount, intent.currency, status, event.created]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  return { ready, record };
}

module.exports = { createPostgresStore };
