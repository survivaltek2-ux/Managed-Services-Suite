import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

async function verifyPassword() {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, 'admin@siebertrservices.com')).limit(1);
    
    if (user.length === 0) {
      console.log('✗ User not found');
      process.exit(1);
    }
    
    console.log('✓ User found:', user[0].email);
    console.log('✓ Password hash exists:', user[0].password.substring(0, 20) + '...');
    console.log('✓ Hash length:', user[0].password.length);
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

verifyPassword();
