#!/usr/bin/env tsx
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@siebertservices.com";
const ADMIN_PASSWORD = "SiebertAdmin2024!";
const ADMIN_NAME = "Administrator";
const ADMIN_COMPANY = "Siebert Services";

async function createAdmin() {
  try {
    console.log("🔧 Creating admin user...");

    // Check if admin already exists
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, ADMIN_EMAIL));

    if (existing.length > 0) {
      console.log("ℹ️  Admin user already exists!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    const [admin] = await db
      .insert(usersTable)
      .values({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        company: ADMIN_COMPANY,
        phone: null,
        role: "admin",
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔐 Password: ${ADMIN_PASSWORD}`);
    console.log("\n⚠️  Change this password immediately after first login!");
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
