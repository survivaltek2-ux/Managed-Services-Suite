import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Client } = pg;
const PASSWORD = 'Errnmgxczs1!';
const DB_URL = 'postgresql://neondb_owner:npg_VwMFrx3q9lfU@ep-muddy-river-amrt11wa.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

(async () => {
  const client = new Client({ connectionString: DB_URL });
  try {
    await client.connect();
    console.log('✓ Connected to production database');

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    console.log('✓ Password hashed');

    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, 'admin@siebertrservices.com']
    );

    if (result.rowCount === 0) {
      console.error('✗ No user found with that email');
      process.exit(1);
    }

    console.log('✓ Password updated for:', result.rows[0].email);
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
