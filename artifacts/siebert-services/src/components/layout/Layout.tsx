import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { SchemaTag } from "@/components/SchemaTag";
import { MultiChannelContactBar } from "@/components/MultiChannelContactBar";
import { ChatWidget } from "@/components/ChatWidget";
import { BookingInline } from "@/components/Booking";

const SITE_ORIGIN = "https://siebertservices.com";

const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  about: "About",
  services: "Services",
  contact: "Contact",
  quote: "Get a Quote",
  blog: "Blog",
  recommended: "Recommended Products",
  "internet-plans": "Internet Plans",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  zoom: "Zoom",
  ringcentral: "RingCentral",
  "microsoft-365": "Microsoft 365",
  "8x8": "8x8",
  "cisco-meraki": "Cisco / Meraki",
  fortinet: "Fortinet",
  "palo-alto-networks": "Palo Alto Networks",
  "extreme-networks": "Extreme Networks",
  "juniper-networks": "Juniper Networks",
  hp: "HP",
  dell: "Dell",
  vivint: "Vivint",
  "adt-business": "ADT Business",
  "comcast-business": "Comcast Business",
  "spectrum-business": "Spectrum Business",
  "att-business": "AT&T Business",
  "verizon-business": "Verizon Business",
  "cox-business": "Cox Business",
  altice: "Altice / Optimum",
  lumen: "Lumen Technologies",
  "t-mobile-business": "T-Mobile Business",
};

// Vendor / service routes that should expose Service JSON-LD + an inline
// booking embed near the bottom of the page.
const SERVICE_ROUTES: Record<string, { name: string; description: string; serviceType: string }> = {
  "/services": { name: "Managed IT Services", description: "Full-stack managed IT, voice, networking, and security for SMB and mid-market.", serviceType: "Managed IT Services" },
  "/zoom": { name: "Zoom Phone & Workplace", description: "Authorized Zoom reseller — phone, meetings, contact center, and managed deployment.", serviceType: "Unified Communications" },
  "/ringcentral": { name: "RingCentral UCaaS", description: "RingCentral business phone, messaging, video, and contact center deployment.", serviceType: "Unified Communications" },
  "/microsoft-365": { name: "Microsoft 365 for Business", description: "Microsoft 365 licensing, migration, security hardening, and ongoing administration.", serviceType: "Productivity & Collaboration" },
  "/8x8": { name: "8x8 XCaaS", description: "8x8 unified communications and contact-center deployment and support.", serviceType: "Unified Communications" },
  "/cisco-meraki": { name: "Cisco Meraki Networking", description: "Meraki cloud-managed wireless, switching, and security appliances with full deployment.", serviceType: "Network Infrastructure" },
  "/fortinet": { name: "Fortinet Security", description: "FortiGate firewalls, FortiSwitch, and Fortinet SASE deployment and management.", serviceType: "Network Security" },
  "/palo-alto-networks": { name: "Palo Alto Networks", description: "Palo Alto NGFW, Prisma, and Cortex deployment and managed security services.", serviceType: "Network Security" },
  "/extreme-networks": { name: "Extreme Networks", description: "Extreme cloud networking, switching, and Wi-Fi for enterprise environments.", serviceType: "Network Infrastructure" },
  "/juniper-networks": { name: "Juniper Networks", description: "Juniper Mist AI, switching, and SRX security platforms.", serviceType: "Network Infrastructure" },
  "/hp": { name: "HP Business Hardware", description: "HP business workstations, laptops, printers, and managed hardware lifecycle.", serviceType: "Hardware Procurement" },
  "/dell": { name: "Dell Business Hardware", description: "Dell PowerEdge servers, OptiPlex desktops, Latitude laptops, and managed deployment.", serviceType: "Hardware Procurement" },
  "/vivint": { name: "Vivint Smart Home Security", description: "Authorized Vivint reseller — professional installation, 24/7 monitoring, and managed support.", serviceType: "Home Security" },
  "/adt-business": { name: "ADT Business Security", description: "ADT commercial security, monitoring, and access control deployment.", serviceType: "Business Security" },
  "/comcast-business": { name: "Comcast Business Internet & Voice", description: "Comcast Business fiber, cable, voice, and SD-WAN solutions.", serviceType: "Business Internet" },
  "/spectrum-business": { name: "Spectrum Business Internet", description: "Spectrum Business fiber and cable internet, voice, and TV solutions.", serviceType: "Business Internet" },
  "/att-business": { name: "AT&T Business", description: "AT&T fiber, wireless, and managed network services for business.", serviceType: "Business Internet" },
  "/verizon-business": { name: "Verizon Business", description: "Verizon fiber, 5G business internet, and mobility solutions.", serviceType: "Business Internet" },
  "/cox-business": { name: "Cox Business", description: "Cox Business internet, voice, and managed networking.", serviceType: "Business Internet" },
  "/altice": { name: "Altice / Optimum Business", description: "Optimum Business fiber and cable internet plus voice services.", serviceType: "Business Internet" },
  "/lumen": { name: "Lumen Technologies", description: "Lumen fiber, dedicated internet access, and managed enterprise networking.", serviceType: "Enterprise Connectivity" },
  "/t-mobile-business": { name: "T-Mobile for Business", description: "T-Mobile 5G business internet, mobility, and IoT solutions.", serviceType: "Business Wireless" },
  "/internet-plans": { name: "Business Internet Plan Finder", description: "Compare available business internet providers and plans by address across the United States.", serviceType: "Business Internet" },
};

function titleize(slug: string): string {
  return slug.split("-").filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const isAppShell = location.startsWith("/admin") || location.startsWith("/portal");

  const breadcrumbs = useMemo(() => {
    if (isAppShell) return null;
    const segments = location.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    const crumbs = [{ name: "Home", url: `${SITE_ORIGIN}/` }];
    let acc = "";
    for (const seg of segments) {
      acc += `/${seg}`;
      crumbs.push({ name: ROUTE_LABELS[seg] || titleize(seg), url: `${SITE_ORIGIN}${acc}` });
    }
    return crumbs;
  }, [location, isAppShell]);

  // Look up vendor/service route entry — match exact path or first segment
  const serviceMeta = useMemo(() => {
    if (isAppShell) return null;
    const direct = SERVICE_ROUTES[location];
    if (direct) return direct;
    const firstSeg = "/" + (location.split("/").filter(Boolean)[0] ?? "");
    return SERVICE_ROUTES[firstSeg] ?? null;
  }, [location, isAppShell]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SchemaTag id="schema-org" type="Organization" />
      {breadcrumbs && (
        <SchemaTag id="schema-breadcrumb-global" type="BreadcrumbList" crumbs={breadcrumbs} />
      )}
      {serviceMeta && (
        <SchemaTag
          id="schema-service-route"
          type="Service"
          name={serviceMeta.name}
          description={serviceMeta.description}
          serviceType={serviceMeta.serviceType}
        />
      )}
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      {serviceMeta && !isAppShell && (
        <section className="bg-gradient-to-br from-blue-50 to-white py-16 px-4 border-t border-blue-100">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ready to talk through {serviceMeta.name}?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pick a 15-minute slot below — we'll review your environment, scope the work,
              and send pricing the same day.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <BookingInline height={680} />
          </div>
        </section>
      )}
      <Footer />
      {!isAppShell && <MultiChannelContactBar />}
    </div>
  );
}
