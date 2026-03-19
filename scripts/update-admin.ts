#!/usr/bin/env node
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const EMAIL = "admin@siebertservices.com";

async function updateAdmin() {
  try {
    console.log(`🔄 Updating user ${EMAIL} to admin role...`);
    
    const updated = await db
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.email, EMAIL))
      .returning();

    if (updated.length > 0) {
      console.log(`✅ User updated successfully!`);
      console.log(`📧 Email: ${updated[0].email}`);
      console.log(`👤 Name: ${updated[0].name}`);
      console.log(`🔑 Role: ${updated[0].role}`);
    } else {
      console.log(`❌ User not found with email: ${EMAIL}`);
    }
  } catch (err) {
    console.error("❌ Error updating user:", err);
    process.exit(1);
  }
}

updateAdmin();
