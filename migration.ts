import 'server-only';
import { createPool } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

async function runMigration() {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  let client;
  try {
    console.log('connecting to database');
    client = await pool.connect();
    console.log('connected to database');

    console.log('starting safe migration');

    // 1. create backup transactions table
    console.log('creating backup transactions table');
    await client.query(`
      CREATE TABLE "business-monitor_transactions_backup"
      AS SELECT * FROM "business-monitor_transactions";
    `);

    // 2. adding new timestamp column
    console.log('adding new timestamp column');
    await client.query(`
      ALTER TABLE "business-monitor_transactions"
      ADD COLUMN "date_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    // 3. migrate date to date_timestamp
    console.log('migrating date to date_timestamp');
    await client.query(`
      UPDATE "business-monitor_transactions"
      SET "date_timestamp" = (date::TIMESTAMP WITH TIME ZONE);
    `);

    // 4. drop old date column
    console.log('dropping old date column');
    await client.query(`
      ALTER TABLE "business-monitor_transactions" DROP COLUMN "date";
    `);

    // 5. rename date_timestamp to date
    console.log('renaming date_timestamp to date');
    await client.query(`
      ALTER TABLE "business-monitor_transactions" RENAME COLUMN "date_timestamp" TO "date";
    `);
    console.log('migration successful');

    // 6. drop backup transactions table
    console.log('dropping backup transactions table');
    await client.query(`
      DROP TABLE "business-monitor_transactions_backup";
    `);
    console.log('migration complete');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  if (client) {
    client.release();
  }
  if (pool) {
    await pool.end();
  }
  process.exit(0);
}

runMigration().catch(console.error);
