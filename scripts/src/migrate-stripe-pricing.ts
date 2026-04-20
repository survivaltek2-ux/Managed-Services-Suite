import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS stripe_product_id text`);
    await client.query(`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS stripe_monthly_price_id text`);
    await client.query(`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS stripe_annual_price_id text`);
    console.log("✓ Added stripe_product_id, stripe_monthly_price_id, stripe_annual_price_id to pricing_tiers");

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
