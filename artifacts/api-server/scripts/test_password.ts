import bcrypt from 'bcryptjs';
import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

const TEST_PASSWORD = 'Errnmgxczs1!';

async function testPassword() {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, 'admin@siebertrservices.com')).limit(1);
    
    if (user.length === 0) {
      console.log('✗ User not found');
      process.exit(1);
    }
    
    const isValid = await bcrypt.compare(TEST_PASSWORD, user[0].password);
    console.log('✓ Password test for:', user[0].email);
    console.log(isValid ? '✓ Password matches hash' : '✗ Password does NOT match hash');
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testPassword();
