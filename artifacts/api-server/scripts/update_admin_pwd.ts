import bcrypt from 'bcryptjs';
import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

const PASSWORD = 'Errnmgxczs1!';

async function updatePassword() {
  try {
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    console.log('✓ Password hashed');

    const result = await db.update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.email, 'admin@siebertrservices.com'))
      .returning();

    if (result.length === 0) {
      console.error('✗ No user found with that email');
      process.exit(1);
    }

    console.log('✓ Password updated for:', result[0].email);
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

updatePassword();
