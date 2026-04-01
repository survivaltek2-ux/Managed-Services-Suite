import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log("Running vivint_inquiries migration...\n");

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS vivint_inquiries (
        id serial PRIMARY KEY,
        type text NOT NULL,
        name text NOT NULL,
        email text NOT NULL,
        phone text NOT NULL,
        zip_code text,
        property_type text,
        current_system text,
        interested_in jsonb DEFAULT '[]',
        budget text,
        timeframe text,
        notes text,
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);
    console.log("✓ Created vivint_inquiries table");
    console.log("\n✅ Migration complete.");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
