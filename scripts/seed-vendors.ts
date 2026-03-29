import { db, telarusVendorsTable } from "@workspace/db";

const SAMPLE_VENDORS = [
  {
    externalId: "vendor-001",
    name: "Comcast Business",
    accountType: "Partner",
    industry: "Telecommunications",
    website: "https://business.comcast.com",
    partnerType: "Channel Partner",
    isActive: true,
    products: JSON.stringify([
      { name: "Internet 500", category: "Connectivity", description: "500 Mbps internet service" },
      { name: "Voice Solutions", category: "Voice", description: "Business phone systems" },
      { name: "Ethernet", category: "Connectivity", description: "Dedicated ethernet service" },
    ]),
    phone: "1-800-391-3000",
    description: "Leading provider of business internet and voice solutions",
  },
  {
    externalId: "vendor-002",
    name: "AT&T Business",
    accountType: "Partner",
    industry: "Telecommunications",
    website: "https://www.business.att.com",
    partnerType: "Channel Partner",
    isActive: true,
    products: JSON.stringify([
      { name: "AT&T Fiber", category: "Connectivity", description: "High-speed fiber internet" },
      { name: "Unified Communications", category: "Voice", description: "UCaaS platform" },
      { name: "Managed Services", category: "IT Services", description: "Managed IT services" },
    ]),
    phone: "1-800-331-0500",
    description: "Global communications and IT services provider",
  },
  {
    externalId: "vendor-003",
    name: "Verizon Business",
    accountType: "Partner",
    industry: "Telecommunications",
    website: "https://www.verizonbusiness.com",
    partnerType: "Channel Partner",
    isActive: true,
    products: JSON.stringify([
      { name: "Fios for Business", category: "Connectivity", description: "Fiber internet service" },
      { name: "Cloud Connect", category: "Cloud Services", description: "Secure cloud connectivity" },
      { name: "Security Services", category: "Security", description: "Threat protection and monitoring" },
    ]),
    phone: "1-800-922-0204",
    description: "Enterprise telecommunications and security solutions",
  },
  {
    externalId: "vendor-004",
    name: "CenturyLink",
    accountType: "Partner",
    industry: "Telecommunications",
    website: "https://www.centurylink.com",
    partnerType: "Channel Partner",
    isActive: true,
    products: JSON.stringify([
      { name: "Prism Internet", category: "Connectivity", description: "Broadband internet service" },
      { name: "VoIP Phone Service", category: "Voice", description: "Business VoIP" },
      { name: "Colocation", category: "Data Center", description: "Data center services" },
    ]),
    phone: "1-877-453-0950",
    description: "Telecommunications and data center services",
  },
  {
    externalId: "vendor-005",
    name: "Vonage Business",
    accountType: "Partner",
    industry: "Software/Services",
    website: "https://www.vonage.com/business",
    partnerType: "Technology Partner",
    isActive: true,
    products: JSON.stringify([
      { name: "Cloud Phone", category: "Voice", description: "Cloud-based phone system" },
      { name: "Video Conferencing", category: "Collaboration", description: "Video meeting platform" },
      { name: "Contact Center", category: "Contact Center", description: "Cloud contact center" },
    ]),
    phone: "1-844-866-2362",
    description: "Unified communications platform",
  },
];

async function seedVendors() {
  try {
    console.log("🌱 Seeding vendors...");
    
    for (const vendor of SAMPLE_VENDORS) {
      const existing = await db.select()
        .from(telarusVendorsTable)
        .where({ externalId: vendor.externalId });
      
      if (existing.length > 0) {
        console.log(`⏭️  Vendor "${vendor.name}" already exists, skipping`);
        continue;
      }
      
      await db.insert(telarusVendorsTable).values(vendor);
      console.log(`✅ Added vendor: ${vendor.name}`);
    }
    
    const count = await db.select().from(telarusVendorsTable);
    console.log(`\n✨ Seeding complete! Total vendors: ${count.length}`);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedVendors();
