import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log("Running proposal enhancements migration...\n");

  try {
    // Add partner_id to quote_proposals if not exists
    await client.query(`
      ALTER TABLE quote_proposals 
      ADD COLUMN IF NOT EXISTS partner_id integer
    `);
    console.log("✓ Added partner_id to quote_proposals");

    // Create proposal_templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposal_templates (
        id serial PRIMARY KEY,
        partner_id integer,
        name text NOT NULL,
        description text,
        title text NOT NULL,
        summary text,
        terms text,
        discount_type text NOT NULL DEFAULT 'fixed',
        discount numeric(12,2) NOT NULL DEFAULT 0,
        tax numeric(12,2) NOT NULL DEFAULT 0,
        line_items jsonb NOT NULL DEFAULT '[]',
        is_global boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);
    console.log("✓ Created proposal_templates table");

    console.log("\n✅ Migration complete.");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
