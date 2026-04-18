import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { SchemaTag } from "@/components/SchemaTag";
import { MultiChannelContactBar } from "@/components/MultiChannelContactBar";

const SITE_ORIGIN = "https://siebertservices.com";

// Friendly labels for known top-level routes; unknown paths get a title-cased
// version of the slug as the breadcrumb name.
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

function titleize(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const hideMobileBar = location.startsWith("/admin") || location.startsWith("/portal");

  const breadcrumbs = useMemo(() => {
    // Skip breadcrumbs for admin/portal apps and the bare home page
    if (hideMobileBar) return null;
    const segments = location.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    const crumbs = [{ name: "Home", url: `${SITE_ORIGIN}/` }];
    let acc = "";
    for (const seg of segments) {
      acc += `/${seg}`;
      const label = ROUTE_LABELS[seg] || titleize(seg);
      crumbs.push({ name: label, url: `${SITE_ORIGIN}${acc}` });
    }
    return crumbs;
  }, [location, hideMobileBar]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Global structured data — Organization rendered on every page */}
      <SchemaTag id="schema-org" type="Organization" />
      {breadcrumbs && (
        <SchemaTag
          id="schema-breadcrumb-global"
          type="BreadcrumbList"
          crumbs={breadcrumbs}
        />
      )}
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      {!hideMobileBar && <MultiChannelContactBar />}
    </div>
  );
}
