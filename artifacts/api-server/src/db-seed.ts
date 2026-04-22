import { db, marketplaceVendorsTable, marketplaceProductsTable, testimonialsTable, caseStudiesTable, certificationsTable, companyStatsTable, pricingTiersTable, industriesTable, servicesTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";
import { INDUSTRIES_SEED } from "./data/industries-seed.js";

async function seedTrustContent(): Promise<void> {
  try {
    // Testimonials are intentionally NOT seeded — only real, authentic
    // client testimonials added by an admin through the CMS should appear.

    // Certifications
    const [{ cCount }] = await db.select({ cCount: count() }).from(certificationsTable);
    if (cCount === 0) {
      const certs = [
        { name: "Microsoft Solutions Partner", category: "partner" },
        { name: "Microsoft 365 CSP", category: "partner" },
        { name: "Cisco Select Partner", category: "partner" },
        { name: "Fortinet Authorized Partner", category: "partner" },
        { name: "CompTIA Security+", category: "certification" },
        { name: "CompTIA Network+", category: "certification" },
        { name: "AWS Select Tier Partner", category: "partner" },
        { name: "Zoom Certified Partner", category: "partner" },
        { name: "HP Amplify Partner", category: "partner" },
        { name: "Dell Technologies Partner", category: "partner" },
      ];
      await db.insert(certificationsTable).values(certs.map((c, i) => ({ ...c, sortOrder: i })));
      console.log(`[seed] Inserted ${certs.length} certifications`);
    }

    // Company stats
    const [{ sCount }] = await db.select({ sCount: count() }).from(companyStatsTable);
    if (sCount === 0) {
      await db.insert(companyStatsTable).values([
        { label: "Average response time", value: "< 10", suffix: "min", icon: "Clock", sortOrder: 0 },
        { label: "Client retention rate", value: "98", suffix: "%", icon: "Heart", sortOrder: 1 },
        { label: "Businesses served", value: "250", suffix: "+", icon: "Building2", sortOrder: 2 },
        { label: "Endpoints managed", value: "12,000", suffix: "+", icon: "Monitor", sortOrder: 3 },
        { label: "Years in business", value: "15", suffix: "+", icon: "Award", sortOrder: 4 },
        { label: "Uptime SLA", value: "99.9", suffix: "%", icon: "ShieldCheck", sortOrder: 5 },
      ]);
      console.log("[seed] Inserted 6 company stats");
    }

    // Case studies
    const [{ csCount }] = await db.select({ csCount: count() }).from(caseStudiesTable);
    if (csCount === 0) {
      await db.insert(caseStudiesTable).values([
        {
          slug: "northbridge-realty-365-migration",
          title: "Cutting helpdesk costs 42% for a 60-agent real estate firm",
          client: "Northbridge Realty Group",
          industry: "Real Estate",
          summary: "A multi-office real estate brokerage replaced two part-time IT contractors with Siebert's managed plan, then migrated 60 agents to Microsoft 365 with zero downtime.",
          problem: "Northbridge had 60 agents across three offices relying on a patchwork of contractors. Tickets sat for days, email outages were common, and they had no centralized backup or MFA.",
          solution: "We onboarded all 60 endpoints onto our RMM and EDR stack, migrated mailboxes from a legacy IMAP host to Microsoft 365 Business Standard, rolled out MFA company-wide, and put SharePoint document libraries in front of their agent files.",
          result: "Helpdesk spend dropped 42% in the first quarter. Average ticket time fell from 38 hours to 11 minutes for tier-1 issues. Cyber-insurance premium decreased 18%.",
          metrics: JSON.stringify([
            { label: "Helpdesk cost", value: "-42%" },
            { label: "Avg response", value: "11 min" },
            { label: "Insurance premium", value: "-18%" },
          ]),
          services: JSON.stringify(["Managed IT", "Microsoft 365", "Cybersecurity"]),
          quote: "Siebert took our entire IT stack off our plate. We finally have one number to call when anything breaks.",
          quoteAuthor: "Maria Chen",
          quoteRole: "Director of Operations, Northbridge Realty Group",
          featured: true,
          sortOrder: 0,
        },
        {
          slug: "halcyon-manufacturing-security-audit",
          title: "Passing a cyber-insurance audit in 90 days",
          client: "Halcyon Manufacturing",
          industry: "Manufacturing",
          summary: "A 120-employee manufacturer was denied renewal on their cyber policy. Siebert built a 90-day remediation plan and got them re-insured at a lower premium.",
          problem: "Halcyon's insurer flagged 14 control gaps: no EDR, no MFA on remote access, flat network, no documented IR plan, and an unpatched ERP server exposed to the internet.",
          solution: "We deployed SentinelOne EDR across 140 endpoints, segmented OT and IT networks with Fortinet NGFWs, enforced MFA via Entra ID Conditional Access, patched and reverse-proxied the ERP, and authored an incident response playbook.",
          result: "All 14 controls remediated in 78 days. Renewal approved with a $1.2M coverage increase and 22% lower premium. Zero security incidents in the 12 months following.",
          metrics: JSON.stringify([
            { label: "Controls remediated", value: "14/14" },
            { label: "Premium reduction", value: "-22%" },
            { label: "Incidents (12mo)", value: "0" },
          ]),
          services: JSON.stringify(["Cybersecurity", "Network Infrastructure", "Compliance"]),
          quote: "After 90 days with Siebert we cut shadow IT in half and finally passed our cyber-insurance security audit.",
          quoteAuthor: "David Okafor",
          quoteRole: "VP of Finance, Halcyon Manufacturing",
          featured: true,
          sortOrder: 1,
        },
        {
          slug: "vesper-hospitality-multi-site-rollout",
          title: "Standardizing IT across 11 hotel properties",
          client: "Vesper Hospitality Group",
          industry: "Hospitality",
          summary: "Vesper acquired 11 boutique hotels with 11 different IT vendors. Siebert consolidated everything onto a single managed stack with zero guest-facing downtime.",
          problem: "Each property had its own ISP, firewall vendor, PMS integration, and helpdesk. Guest Wi-Fi complaints were the #1 negative review driver. Front-desk PCs ran 4 different versions of Windows.",
          solution: "We surveyed all 11 sites, designed a standardized stack (Meraki networking, Ubiquiti guest Wi-Fi, Windows 11 imaged endpoints, Zoom Phone replacing legacy PBXs), and executed cutovers in 2-property waves over 14 weeks during overnight maintenance windows.",
          result: "100% standardization across all 11 properties. Wi-Fi-related guest complaints dropped 91%. Single $14K/mo managed contract replaced ~$31K/mo in fragmented vendor spend.",
          metrics: JSON.stringify([
            { label: "Properties unified", value: "11/11" },
            { label: "Wi-Fi complaints", value: "-91%" },
            { label: "Vendor spend", value: "-55%" },
          ]),
          services: JSON.stringify(["Managed IT", "Networking", "Zoom Phone", "Procurement"]),
          quote: "Siebert built us a runbook, did the cutover after-hours, and we had zero guest-facing downtime.",
          quoteAuthor: "Aisha Bello",
          quoteRole: "IT Manager, Vesper Hospitality Group",
          featured: false,
          sortOrder: 2,
        },
      ]);
      console.log("[seed] Inserted 3 case studies");
    }

    // Pricing tiers — backfill any canonical tiers missing by slug.
    // Existing rows are never overwritten (admin edits are preserved).
    const canonicalTiers = [
        {
          slug: "consumer", name: "Consumer",
          tagline: "Essential remote IT support for individuals and very small home-office setups.",
          startingPrice: "49", annualPrice: "42", priceUnit: "per user / month", pricePrefix: "Starting at",
          mostPopular: false, sortOrder: -1,
          ctaLabel: "Get Started", ctaLink: "/quote",
          autoActivate: true,
          features: JSON.stringify([
            "Business-hours help desk (M–F 8–5)",
            "Remote monitoring & patching",
            "Endpoint antivirus",
            "Microsoft 365 administration",
            "Email & phone support",
          ]),
          excludedFeatures: JSON.stringify([
            "24/7 after-hours support",
            "Endpoint Detection & Response (EDR)",
            "vCIO strategic planning",
            "On-site dispatch included (New York only)",
            "Quarterly business reviews",
          ]),
        },
        {
          slug: "essentials", name: "Essentials",
          tagline: "Core managed IT for small teams that need reliable coverage.",
          startingPrice: "89", priceUnit: "per user / month", pricePrefix: "Starting at",
          mostPopular: false, sortOrder: 0,
          ctaLabel: "Get Started", ctaLink: "/quote",
          features: JSON.stringify([
            "Business-hours help desk (M–F 8–5)",
            "Remote monitoring & patching",
            "Endpoint antivirus",
            "Microsoft 365 administration",
            "Quarterly health check",
            "Email & phone support",
          ]),
          excludedFeatures: JSON.stringify([
            "24/7 after-hours support",
            "Endpoint Detection & Response (EDR)",
            "vCIO strategic planning",
            "On-site dispatch included (New York only)",
          ]),
        },
        {
          slug: "business", name: "Business",
          tagline: "Full-stack IT, security, and cloud for growing businesses.",
          startingPrice: "149", priceUnit: "per user / month", pricePrefix: "Starting at",
          mostPopular: true, sortOrder: 1,
          ctaLabel: "Get Started", ctaLink: "/quote",
          features: JSON.stringify([
            "Business-hours help desk (M–F 8–5)",
            "Remote monitoring & patching",
            "Endpoint antivirus",
            "Microsoft 365 administration",
            "Quarterly health check",
            "Email & phone support",
            "__divider__:Everything in Essentials, plus:",
            "Extended-hours help desk (7am–8pm)",
            "Endpoint Detection & Response (EDR)",
            "Microsoft 365 + security hardening",
            "Multi-factor authentication rollout",
            "Backup & disaster-recovery monitoring",
            "Quarterly business reviews (vCIO)",
            "On-site dispatch (4 hrs / month, New York only)",
          ]),
          excludedFeatures: JSON.stringify([
            "24/7 after-hours support",
            "Dedicated SOC analyst",
            "Compliance program management",
          ]),
        },
        {
          slug: "enterprise", name: "Enterprise",
          tagline: "24/7 coverage, compliance, and a named team for complex orgs.",
          startingPrice: "229", priceUnit: "per user / month", pricePrefix: "Starting at",
          mostPopular: false, sortOrder: 2,
          ctaLabel: "Talk to Sales", ctaLink: "/quote",
          features: JSON.stringify([
            "Business-hours help desk (M–F 8–5)",
            "Remote monitoring & patching",
            "Endpoint antivirus",
            "Microsoft 365 administration",
            "Quarterly health check",
            "Email & phone support",
            "Extended-hours help desk (7am–8pm)",
            "Endpoint Detection & Response (EDR)",
            "Microsoft 365 + security hardening",
            "Multi-factor authentication rollout",
            "Backup & disaster-recovery monitoring",
            "Quarterly business reviews (vCIO)",
            "On-site dispatch (4 hrs / month, New York only)",
            "__divider__:Everything in Business, plus:",
            "24/7/365 help desk + emergency line",
            "Full EDR + Managed SOC monitoring",
            "Microsoft 365 E3/E5 management",
            "MFA, conditional access, SSO design",
            "Immutable backup + tested restores",
            "Compliance program (HIPAA, SOC 2, CMMC)",
            "Named vCIO + monthly strategy meetings",
            "Unlimited on-site dispatch (New York only)",
            "Dedicated account team",
          ]),
          excludedFeatures: JSON.stringify([]),
        },
      ];

    const existingTierSlugs = new Set(
      (await db.select({ slug: pricingTiersTable.slug }).from(pricingTiersTable)).map((r) => r.slug)
    );
    const tiersToInsert = canonicalTiers.filter((t) => !existingTierSlugs.has(t.slug));
    if (tiersToInsert.length > 0) {
      await db.insert(pricingTiersTable).values(tiersToInsert);
      console.log(`[seed] Backfilled ${tiersToInsert.length} pricing tier(s): ${tiersToInsert.map((t) => t.slug).join(", ")}`);
    }

    // Consumer services
    const [{ consumerSvcCount }] = await db.select({ consumerSvcCount: count() }).from(servicesTable)
      .where(eq(servicesTable.category, "consumer"));
    if (consumerSvcCount === 0) {
      await db.insert(servicesTable).values([
        {
          title: "Personal Device Support",
          description: "Remote help desk support for home computers, laptops, tablets, and smartphones. Get expert help fast without leaving the house.",
          icon: "Laptop",
          category: "consumer",
          features: JSON.stringify([
            "Remote troubleshooting for PCs, Macs & laptops",
            "Slow computer tune-ups & cleanup",
            "Printer & peripheral setup",
            "Software installation & updates",
            "Browser & email troubleshooting",
          ]),
          sortOrder: 100,
        },
        {
          title: "Home Office Security",
          description: "Keep your home devices safe from viruses, malware, and online threats. Includes antivirus setup, password manager guidance, and safe browsing tips.",
          icon: "ShieldCheck",
          category: "consumer",
          features: JSON.stringify([
            "Antivirus & malware protection",
            "Password manager setup",
            "Phishing & scam awareness",
            "Safe Wi-Fi & router hardening",
            "Suspicious activity removal",
          ]),
          sortOrder: 101,
        },
        {
          title: "Personal Cloud & Backup",
          description: "Never lose a photo or document again. We set up and manage cloud backup for your personal files across OneDrive, Google Drive, or iCloud.",
          icon: "Cloud",
          category: "consumer",
          features: JSON.stringify([
            "OneDrive, Google Drive & iCloud setup",
            "Automatic photo & document backup",
            "Cloud storage organization",
            "File recovery assistance",
            "Cross-device sync",
          ]),
          sortOrder: 102,
        },
        {
          title: "Microsoft 365 Personal Setup",
          description: "Get the most out of your Microsoft 365 subscription. We handle setup, migration of old emails, and ongoing support for Outlook, Word, Excel, and Teams.",
          icon: "Mail",
          category: "consumer",
          features: JSON.stringify([
            "Microsoft 365 account setup & activation",
            "Outlook email migration & configuration",
            "OneDrive & Teams setup",
            "App installation on all devices",
            "Ongoing M365 support",
          ]),
          sortOrder: 103,
        },
      ]);
      console.log("[seed] Inserted 4 consumer services");
    }
  } catch (err) {
    console.error("[seed] Trust content seeding failed (non-fatal):", err);
  }
}

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

async function seedIndustries(): Promise<void> {
  try {
    const [{ iCount }] = await db.select({ iCount: count() }).from(industriesTable);
    if (iCount > 0) return;
    const rows = INDUSTRIES_SEED.map((ind, i) => ({
      slug: ind.slug,
      name: ind.name,
      shortLabel: ind.shortLabel || "",
      navTitle: ind.navTitle || "",
      metaDescription: ind.metaDescription || "",
      heroEyebrow: ind.hero?.eyebrow || "",
      heroTitle: ind.hero?.title || "",
      heroSubtitle: ind.hero?.subtitle || "",
      painPoints: JSON.stringify(ind.painPoints || []),
      regulations: JSON.stringify(ind.regulations || []),
      softwareStacks: JSON.stringify(ind.softwareStacks || []),
      whatWeDo: JSON.stringify(ind.whatWeDo || []),
      testimonialQuote: ind.testimonial?.quote || "",
      testimonialName: ind.testimonial?.name || "",
      testimonialRole: ind.testimonial?.role || "",
      testimonialCompany: ind.testimonial?.company || "",
      caseStudyHint: ind.caseStudyHint || "",
      relatedServices: JSON.stringify(ind.relatedServices || []),
      ctaLabel: ind.ctaLabel || "Book a consultation",
      sortOrder: i,
      active: true,
    }));
    if (rows.length > 0) {
      await db.insert(industriesTable).values(rows).onConflictDoNothing();
      console.log(`[seed] Inserted ${rows.length} industries`);
    }
  } catch (err) {
    console.error("[seed] Industries seed failed (non-fatal):", err);
  }
}

export async function seedDatabase(): Promise<void> {
  await seedTrustContent();
  await seedIndustries();
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
