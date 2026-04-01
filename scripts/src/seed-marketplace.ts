import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

const vendors = [
  {
    name: "RingCentral",
    description: "Leading cloud communications platform for business phone, video, and messaging.",
    contact_email: "partners@ringcentral.com",
    website: "https://www.ringcentral.com",
    commission_percent: "20.00",
    status: "approved",
  },
  {
    name: "Nextiva",
    description: "Business VoIP and customer experience platform trusted by over 100,000 businesses.",
    contact_email: "partners@nextiva.com",
    website: "https://www.nextiva.com",
    commission_percent: "15.00",
    status: "approved",
  },
  {
    name: "NordLayer",
    description: "Business VPN and network access security platform for remote teams.",
    contact_email: "partners@nordlayer.com",
    website: "https://nordlayer.com",
    commission_percent: "25.00",
    status: "approved",
  },
  {
    name: "Malwarebytes",
    description: "Advanced cybersecurity for businesses — stops threats that others miss.",
    contact_email: "partners@malwarebytes.com",
    website: "https://www.malwarebytes.com",
    commission_percent: "30.00",
    status: "approved",
  },
  {
    name: "1Password",
    description: "The world's most-loved password manager for teams and businesses.",
    contact_email: "partners@1password.com",
    website: "https://1password.com",
    commission_percent: "25.00",
    status: "approved",
  },
  {
    name: "Backblaze",
    description: "Simple, affordable cloud backup and storage for business.",
    contact_email: "partners@backblaze.com",
    website: "https://www.backblaze.com",
    commission_percent: "10.00",
    status: "approved",
  },
  {
    name: "SimpliSafe",
    description: "Professional home and small business security with no contracts.",
    contact_email: "partners@simplisafe.com",
    website: "https://www.simplisafe.com",
    commission_percent: "15.00",
    status: "approved",
  },
  {
    name: "Microsoft",
    description: "Microsoft 365 productivity suite for business — email, collaboration, and security.",
    contact_email: "partners@microsoft.com",
    website: "https://www.microsoft.com",
    commission_percent: "10.00",
    status: "approved",
  },
];

const productsByVendor: Record<string, Array<{
  title: string;
  description: string;
  category: string;
  price: string | null;
  commission_rate: string;
  status: string;
}>> = {
  RingCentral: [
    {
      title: "RingCentral MVP — Core",
      description: "Business phone, video meetings, and team messaging in one platform. Up to 20 users.",
      category: "VoIP",
      price: "30.00",
      commission_rate: "20.00",
      status: "active",
    },
    {
      title: "RingCentral MVP — Advanced",
      description: "Enhanced call management, analytics, and CRM integrations for growing teams.",
      category: "VoIP",
      price: "35.00",
      commission_rate: "20.00",
      status: "active",
    },
  ],
  Nextiva: [
    {
      title: "Nextiva Business Communication — Essential",
      description: "Unlimited calls, video meetings, and team chat for small businesses.",
      category: "VoIP",
      price: "23.95",
      commission_rate: "15.00",
      status: "active",
    },
    {
      title: "Nextiva Business Communication — Professional",
      description: "Unlimited conference calls, screen sharing, and advanced integrations.",
      category: "VoIP",
      price: "27.95",
      commission_rate: "15.00",
      status: "active",
    },
  ],
  NordLayer: [
    {
      title: "NordLayer Lite",
      description: "Secure remote access VPN for small teams — up to 10 users.",
      category: "VPN",
      price: "8.00",
      commission_rate: "25.00",
      status: "active",
    },
    {
      title: "NordLayer Business",
      description: "Advanced business VPN with dedicated servers, 2FA, and SSO.",
      category: "VPN",
      price: "11.00",
      commission_rate: "25.00",
      status: "active",
    },
  ],
  Malwarebytes: [
    {
      title: "Malwarebytes for Teams",
      description: "Real-time malware, ransomware, and zero-day threat protection for small businesses.",
      category: "Cybersecurity",
      price: null,
      commission_rate: "30.00",
      status: "active",
    },
    {
      title: "Malwarebytes Endpoint Protection",
      description: "Enterprise-grade endpoint security with centralized management dashboard.",
      category: "Cybersecurity",
      price: null,
      commission_rate: "30.00",
      status: "active",
    },
  ],
  "1Password": [
    {
      title: "1Password Teams",
      description: "Secure password sharing and management for teams up to 10 users.",
      category: "Password Management",
      price: "4.99",
      commission_rate: "25.00",
      status: "active",
    },
    {
      title: "1Password Business",
      description: "Advanced security controls, audit logs, and custom roles for growing businesses.",
      category: "Password Management",
      price: "7.99",
      commission_rate: "25.00",
      status: "active",
    },
  ],
  Backblaze: [
    {
      title: "Backblaze Business Backup",
      description: "Unlimited computer backup for every employee. Flat per-computer pricing.",
      category: "Backup",
      price: "7.00",
      commission_rate: "10.00",
      status: "active",
    },
    {
      title: "Backblaze B2 Cloud Storage",
      description: "S3-compatible cloud storage at a fraction of AWS prices.",
      category: "Backup",
      price: null,
      commission_rate: "10.00",
      status: "active",
    },
  ],
  SimpliSafe: [
    {
      title: "SimpliSafe Home Security System",
      description: "DIY setup, no contracts, professional 24/7 monitoring for homes and small offices.",
      category: "Home Security",
      price: null,
      commission_rate: "15.00",
      status: "active",
    },
  ],
  Microsoft: [
    {
      title: "Microsoft 365 Business Basic",
      description: "Web versions of Office apps, 1TB cloud storage, Teams, and Exchange email.",
      category: "Cloud Productivity",
      price: "6.00",
      commission_rate: "10.00",
      status: "active",
    },
    {
      title: "Microsoft 365 Business Standard",
      description: "Full Office apps (Word, Excel, PowerPoint) plus Teams, SharePoint, and Exchange.",
      category: "Cloud Productivity",
      price: "12.50",
      commission_rate: "10.00",
      status: "active",
    },
  ],
};

async function run() {
  await client.connect();
  console.log("Connected to database");

  try {
    let totalVendors = 0;
    let totalProducts = 0;

    for (const vendor of vendors) {
      // Check if vendor already exists
      const existing = await client.query(
        "SELECT id FROM marketplace_vendors WHERE name = $1",
        [vendor.name]
      );

      let vendorId: number;
      if (existing.rows.length > 0) {
        vendorId = existing.rows[0].id;
        console.log(`  → Vendor already exists: ${vendor.name} (id=${vendorId})`);
      } else {
        const result = await client.query(
          `INSERT INTO marketplace_vendors (name, description, contact_email, website, commission_percent, status)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [vendor.name, vendor.description, vendor.contact_email, vendor.website, vendor.commission_percent, vendor.status]
        );
        vendorId = result.rows[0].id;
        totalVendors++;
        console.log(`  ✓ Created vendor: ${vendor.name} (id=${vendorId})`);
      }

      const products = productsByVendor[vendor.name] || [];
      for (const product of products) {
        const existingProduct = await client.query(
          "SELECT id FROM marketplace_products WHERE title = $1 AND vendor_id = $2",
          [product.title, vendorId]
        );

        if (existingProduct.rows.length > 0) {
          console.log(`    → Product already exists: ${product.title}`);
          continue;
        }

        await client.query(
          `INSERT INTO marketplace_products (vendor_id, title, description, category, price, commission_rate, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [vendorId, product.title, product.description, product.category, product.price, product.commission_rate, product.status]
        );
        totalProducts++;
        console.log(`    ✓ Created product: ${product.title}`);
      }
    }

    console.log(`\n✅ Seeding complete: ${totalVendors} vendors, ${totalProducts} products added.`);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
