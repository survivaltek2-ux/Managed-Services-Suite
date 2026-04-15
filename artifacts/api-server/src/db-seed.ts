import { db, marketplaceVendorsTable, marketplaceProductsTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";

function deriveEmail(website: string): string {
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    return `partners@${host}`;
  } catch {
    return "partners@vendor.com";
  }
}

function mapCategory(industry: string): string {
  const lc = industry.toLowerCase();
  if (lc.includes("contact center") || lc.includes("ccaas") || lc.includes("call center")) return "Contact Center";
  if (lc.includes("ucaas") || lc.includes("unified communications") || lc.includes("voip") || lc.includes("sip")) return "Communications";
  if (lc.includes("iot") || lc.includes("internet of things")) return "IoT";
  if (lc.includes("cybersecurity") || lc.includes("security") || lc.includes("soc") || lc.includes("siem") || lc.includes("ztna") || lc.includes("firewall")) return "Security";
  if (lc.includes("data center") || lc.includes("colocation") || lc.includes("colo")) return "Data Centers";
  if (lc.includes("cloud") || lc.includes("saas") || lc.includes("iaas") || lc.includes("paas")) return "Cloud";
  if (lc.includes("managed") || lc.includes("msp") || lc.includes("it service")) return "Managed IT";
  if (lc.includes("sd-wan") || lc.includes("networking") || lc.includes("network")) return "Networking";
  if (lc.includes("mobility") || lc.includes("fleet") || lc.includes("telematics")) return "Mobility";
  if (lc.includes("telecom") || lc.includes("connectivity") || lc.includes("internet") || lc.includes("broadband") || lc.includes("fiber") || lc.includes("wan")) return "Connectivity";
  if (lc.includes("payment") || lc.includes("fintech") || lc.includes("billing")) return "Payments";
  if (lc.includes("expense") || lc.includes("tem ")) return "Expense Management";
  if (lc.includes("ai ") || lc.includes("artificial intelligence") || lc.includes("machine learning") || lc.includes("automation")) return "AI & Automation";
  return "Technology";
}

export async function seedDatabase(): Promise<void> {
  try {
    const [{ vendorCount }] = await db
      .select({ vendorCount: count() })
      .from(marketplaceVendorsTable);

    if (vendorCount >= 100) {
      console.log(`[seed] DB already seeded (${vendorCount} vendors). Skipping.`);
      return;
    }

    console.log(`[seed] Only ${vendorCount} vendors found. Seeding from supplier catalog...`);

    const { SUPPLIERS } = await import("./data/suppliers.js");

    const BATCH = 50;
    let vendorCount2 = 0;
    let productCount = 0;

    for (let i = 0; i < SUPPLIERS.length; i += BATCH) {
      const batch = SUPPLIERS.slice(i, i + BATCH);

      const vendorRows = batch.map(s => ({
        name: s.name,
        description: s.keyProducts.slice(0, 300),
        contactEmail: deriveEmail(s.website),
        website: s.website,
        commissionPercent: "15.00",
        status: "approved" as const,
      }));

      const inserted = await db
        .insert(marketplaceVendorsTable)
        .values(vendorRows)
        .onConflictDoNothing()
        .returning({ id: marketplaceVendorsTable.id, name: marketplaceVendorsTable.name });

      vendorCount2 += inserted.length;

      const productRows = inserted.map(v => {
        const supplier = batch.find(s => s.name === v.name)!;
        return {
          vendorId: v.id,
          title: supplier.keyProducts.split(",")[0].trim().slice(0, 120) || supplier.name,
          description: `${supplier.keyProducts.slice(0, 400)}`,
          category: mapCategory(supplier.industry),
          commissionRate: "15.00",
          status: "active" as const,
        };
      });

      if (productRows.length > 0) {
        await db.insert(marketplaceProductsTable).values(productRows).onConflictDoNothing();
        productCount += productRows.length;
      }
    }

    console.log(`[seed] Complete: inserted ${vendorCount2} vendors, ${productCount} products.`);
  } catch (err) {
    console.error("[seed] Seeding failed (non-fatal):", err);
  }
}
