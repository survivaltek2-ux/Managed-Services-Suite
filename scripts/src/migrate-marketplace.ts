import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log("Connected to database");

  try {
    // Create enums (ignore if already exists)
    const enums = [
      `DO $$ BEGIN
        CREATE TYPE marketplace_vendor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
      EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN
        CREATE TYPE marketplace_product_status AS ENUM ('draft', 'active', 'inactive');
      EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN
        CREATE TYPE marketplace_order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
      EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN
        CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN null; END $$`,
    ];

    for (const sql of enums) {
      await client.query(sql);
    }
    console.log("✓ Enums created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_vendors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        contact_email TEXT NOT NULL,
        website TEXT,
        commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
        status marketplace_vendor_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ marketplace_vendors table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_products (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES marketplace_vendors(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC(12, 2),
        commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
        status marketplace_product_status NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ marketplace_products table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_orders (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES partners(id),
        product_id INTEGER NOT NULL REFERENCES marketplace_products(id),
        vendor_id INTEGER NOT NULL REFERENCES marketplace_vendors(id),
        status marketplace_order_status NOT NULL DEFAULT 'pending',
        amount NUMERIC(12, 2) NOT NULL,
        commission_amount NUMERIC(12, 2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ marketplace_orders table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_payouts (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES partners(id),
        total_commission NUMERIC(12, 2) NOT NULL,
        status payout_status NOT NULL DEFAULT 'pending',
        payout_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ marketplace_payouts table created");

    console.log("\n✅ Marketplace migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
