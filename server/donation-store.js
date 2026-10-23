const fs = require('node:fs');
const path = require('node:path');

// SQLite commits the event and donation together; Stripe retries are deduplicated.
function recordWebhookEvent(event, databasePath) {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  try {
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, created INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS donations (
        intent_id TEXT PRIMARY KEY, amount INTEGER NOT NULL, currency TEXT NOT NULL,
        status TEXT NOT NULL, event_created INTEGER NOT NULL
      );
      BEGIN IMMEDIATE;
    `);
    const inserted = db.prepare('INSERT OR IGNORE INTO webhook_events (id, created) VALUES (?, ?)').run(event.id, event.created);
    if (inserted.changes) {
      const intent = event.data.object;
      const status = event.type === 'payment_intent.succeeded' ? 'succeeded'
        : event.type === 'payment_intent.processing' ? 'processing' : 'failed';
      db.prepare(`INSERT INTO donations (intent_id, amount, currency, status, event_created) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(intent_id) DO UPDATE SET status = excluded.status, event_created = excluded.event_created
        WHERE donations.status != 'succeeded' AND (excluded.status = 'succeeded' OR excluded.event_created > donations.event_created)
      `).run(intent.id, intent.amount, intent.currency, status, event.created);
    }
    db.exec('COMMIT;');
  } catch (error) {
    if (db.isTransaction) db.exec('ROLLBACK;');
    throw error;
  } finally {
    db.close();
  }
}

module.exports = { recordWebhookEvent };
