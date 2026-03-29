import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@siebertrservices.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Errnmgxczs1!";
const ADMIN_NAME = "Siebert Admin";
const ADMIN_COMPANY = "Siebert Services";

async function createAdmin() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL)).limit(1);
  if (existing.length > 0) {
    // Update to admin role if already exists
    await db.update(usersTable).set({ role: "admin" }).where(eq(usersTable.email, ADMIN_EMAIL));
    console.log(`✅ Updated existing user ${ADMIN_EMAIL} to admin role`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.insert(usersTable).values({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    company: ADMIN_COMPANY,
    role: "admin",
  });
  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  console.log(`⚠️  Please change this password after first login`);
}

createAdmin().catch(console.error).finally(() => process.exit(0));
