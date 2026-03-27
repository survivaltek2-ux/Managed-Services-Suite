import nodemailer from "nodemailer";

async function debugEmail() {
  console.log("\n=== Email Debug Script ===\n");

  // Check environment
  console.log("1. Environment Check:");
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? "***SET***" : "NOT SET"}`);
  console.log(`   SMTP_FROM_EMAIL: ${process.env.SMTP_FROM_EMAIL}`);
  console.log("");

  // Create transport
  console.log("2. Creating Transport:");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
    logger: true,
    debug: true,
  });

  console.log(`   Host: ${transport.options.host}`);
  console.log(`   Port: ${transport.options.port}`);
  console.log(`   Secure: ${transport.options.secure}`);
  console.log(`   Auth User: ${transport.options.auth.user}`);
  console.log("");

  // Test connection
  console.log("3. Testing SMTP Connection:");
  try {
    const verified = await transport.verify();
    console.log(`   ✓ Connection verified: ${verified}`);
  } catch (err: any) {
    console.log(`   ✗ Connection failed:`);
    console.log(`     Code: ${err.code}`);
    console.log(`     Command: ${err.command}`);
    console.log(`     Response: ${err.response}`);
    console.log(`     Message: ${err.message}`);
    console.log("");
    console.log(`   Full error:`, err);
  }

  // Attempt to send test email
  console.log("\n4. Attempting to Send Test Email:");
  try {
    const result = await transport.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "test@test.com",
      to: "test@example.com",
      subject: "Debug Test Email",
      text: "This is a debug test email to verify SMTP configuration.",
    });
    console.log(`   ✓ Email sent successfully`);
    console.log(`   Message ID: ${result.messageId}`);
  } catch (err: any) {
    console.log(`   ✗ Email send failed:`);
    console.log(`     Code: ${err.code}`);
    console.log(`     Command: ${err.command}`);
    console.log(`     Response: ${err.response}`);
    console.log(`     Message: ${err.message}`);
  }

  console.log("\n=== Debug Complete ===\n");
}

debugEmail().catch(console.error);
