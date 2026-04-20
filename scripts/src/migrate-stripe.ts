import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text`);
    console.log("✓ Added stripe_customer_id to users");
    
    await client.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_customer_id text`);
    await client.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_connect_account_id text`);
    console.log("✓ Added stripe fields to partners");
    
    await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS partner_id integer`);
    await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text`);
    await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id text`);
    await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text`);
    console.log("✓ Added stripe fields to invoices");
    
    await client.query(`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS stripe_transfer_id text`);
    await client.query(`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS payout_method text`);
    console.log("✓ Added stripe fields to partner_commissions");
    
    await client.query(`DO $$ BEGIN
      CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);
    
    await client.query(`CREATE TABLE IF NOT EXISTS subscriptions (
      id serial PRIMARY KEY,
      user_id integer,
      partner_id integer,
      stripe_subscription_id text NOT NULL UNIQUE,
      stripe_customer_id text NOT NULL,
      stripe_price_id text NOT NULL,
      stripe_product_id text,
      plan_id text NOT NULL,
      plan_name text NOT NULL,
      status subscription_status NOT NULL DEFAULT 'incomplete',
      current_period_start timestamp,
      current_period_end timestamp,
      cancel_at_period_end boolean NOT NULL DEFAULT false,
      canceled_at timestamp,
      billing_cycle text NOT NULL DEFAULT 'monthly',
      amount decimal(12,2),
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);
    console.log("✓ Created subscriptions table");
    
    await client.query("COMMIT");
    console.log("\nMigration completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
