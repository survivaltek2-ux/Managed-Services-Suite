import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

const connectivityPartners = [
  { name: "Comcast Business", href: "/comcast-business" },
  { name: "Spectrum Business", href: "/spectrum-business" },
  { name: "AT&T Business", href: "/att-business" },
  { name: "Verizon Business", href: "/verizon-business" },
  { name: "Cox Business", href: "/cox-business" },
  { name: "Altice / Optimum", href: "/altice" },
  { name: "Lumen Technologies", href: "/lumen" },
  { name: "T-Mobile Business", href: "/t-mobile-business" },
];

const techPartners = [
  { name: "Zoom", href: "/zoom" },
  { name: "RingCentral", href: "/ringcentral" },
  { name: "Microsoft 365", href: "/microsoft-365" },
  { name: "8x8", href: "/8x8" },
  { name: "Cisco / Meraki", href: "/cisco-meraki" },
  { name: "Fortinet", href: "/fortinet" },
  { name: "Palo Alto Networks", href: "/palo-alto-networks" },
  { name: "Extreme Networks", href: "/extreme-networks" },
  { name: "Juniper Networks", href: "/juniper-networks" },
  { name: "HP", href: "/hp" },
  { name: "Dell", href: "/dell" },
  { name: "Vivint", href: "/vivint" },
  { name: "ADT Business", href: "/adt-business" },
];

const allPartnerLinks = [...connectivityPartners, ...techPartners];

const serviceLinks = [
  { name: "Managed IT Support", href: "/services/managed-it", description: "Help desk, monitoring, on-site dispatch" },
  { name: "Cybersecurity", href: "/services/cybersecurity", description: "EDR, SOC, vCISO, awareness training" },
  { name: "Cloud & Microsoft 365", href: "/services/cloud", description: "M365, Azure, Google Workspace, AWS" },
  { name: "Backup & Disaster Recovery", href: "/services/backup-disaster-recovery", description: "Immutable backups, tested restores" },
  { name: "Compliance", href: "/services/compliance", description: "HIPAA, CMMC, GLBA, SOC 2, PCI" },
  { name: "Network Infrastructure", href: "/services/network", description: "Firewalls, Wi-Fi, SD-WAN, cabling" },
];

const industryLinks = [
  { name: "Healthcare", href: "/industries/healthcare" },
  { name: "Legal", href: "/industries/legal" },
  { name: "Financial Services", href: "/industries/financial-services" },
  { name: "Dental", href: "/industries/dental" },
  { name: "Government Contractors", href: "/industries/government-contractors" },
  { name: "Manufacturing", href: "/industries/manufacturing" },
];

const topNavLinks = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "Recommended Products", href: "/recommended" },
  { name: "Resources", href: "/resources" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const industriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPartnersOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (industriesRef.current && !industriesRef.current.contains(e.target as Node)) {
        setIndustriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPartnerActive = allPartnerLinks.some((l) => location === l.href);
  const isServicesActive = location === "/services" || serviceLinks.some((l) => location === l.href);
  const isIndustriesActive = location === "/industries" || location.startsWith("/industries/");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white/90 backdrop-blur-lg border-border/50 shadow-sm py-3" : "bg-navy border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0 leading-none">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl shadow-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <div className={cn("font-display font-bold text-base sm:text-xl tracking-tight transition-colors hidden sm:block leading-none", isScrolled ? "text-navy" : "text-white")}>
              Siebert <span className="text-primary">Services</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 mx-auto">
            {topNavLinks.map((link) => {
              const isActive =
                location === link.href ||
                (link.href !== "/" && location.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "h-6 inline-flex items-center text-sm font-semibold leading-none transition-colors hover:text-primary relative",
                    isScrolled ? "text-navy-light" : "text-white/90",
                    isActive && "text-primary"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setServicesOpen((o) => !o)}
                className={cn(
                  "h-6 inline-flex items-center gap-1 text-sm font-semibold leading-none transition-colors hover:text-primary relative",
                  isScrolled ? "text-navy-light" : "text-white/90",
                  (isServicesActive || servicesOpen) && "text-primary"
                )}
              >
                Services
                <ChevronDown className={cn("w-4 h-4 transition-transform", servicesOpen && "rotate-180")} />
                {isServicesActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] bg-white rounded-2xl shadow-xl border border-border py-3 z-50">
                  <div className="px-2">
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setServicesOpen(false)}
                        className={cn(
                          "flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors",
                          location === link.href ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold leading-tight">{link.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{link.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-40 mt-1 shrink-0" />
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border/60 mt-2 pt-2 px-4">
                    <Link
                      href="/services"
                      onClick={() => setServicesOpen(false)}
                      className="flex items-center justify-between text-sm font-bold text-primary hover:underline py-1"
                    >
                      View all services
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Industries Dropdown */}
            <div
              className="relative"
              ref={industriesRef}
            >
              <button
                onClick={() => setIndustriesOpen((o) => !o)}
                className={cn(
                  "h-6 inline-flex items-center gap-1 text-sm font-semibold leading-none transition-colors hover:text-primary relative",
                  isScrolled ? "text-navy-light" : "text-white/90",
                  (isIndustriesActive || industriesOpen) && "text-primary"
                )}
              >
                Industries
                <ChevronDown className={cn("w-4 h-4 transition-transform", industriesOpen && "rotate-180")} />
                {isIndustriesActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>

              {industriesOpen && (
                <div className="absolute top-full right-0 w-[320px] z-50 pt-2">
                  <div className="bg-white rounded-2xl shadow-xl border border-border py-3">
                    <div className="px-2">
                      {industryLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIndustriesOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                            location === link.href ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
                          )}
                        >
                          {link.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border/60 mt-2 pt-2 px-4">
                      <Link
                        href="/industries"
                        onClick={() => setIndustriesOpen(false)}
                        className="flex items-center justify-between text-sm font-bold text-primary hover:underline py-1"
                      >
                        All industries
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Partners Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPartnersOpen((o) => !o)}
                className={cn(
                  "h-6 inline-flex items-center gap-1 text-sm font-semibold leading-none transition-colors hover:text-primary relative",
                  isScrolled ? "text-navy-light" : "text-white/90",
                  (isPartnerActive || partnersOpen) && "text-primary"
                )}
              >
                Partners
                <ChevronDown className={cn("w-4 h-4 transition-transform", partnersOpen && "rotate-180")} />
                {isPartnerActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>

              {partnersOpen && (
                <div className="absolute top-full right-0 mt-3 w-[540px] bg-white rounded-2xl shadow-xl border border-border py-4 z-50">
                  <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                    <div className="px-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Connectivity & ISP</p>
                      {connectivityPartners.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setPartnersOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors rounded-xl",
                            location === link.href ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
                          )}
                        >
                          {link.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </Link>
                      ))}
                    </div>
                    <div className="px-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Technology & Security</p>
                      {techPartners.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setPartnersOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors rounded-xl",
                            location === link.href ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
                          )}
                        >
                          {link.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={cn(
              "lg:hidden ml-auto inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
              isScrolled ? "text-navy hover:bg-navy/5" : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-xl py-3 px-3 flex flex-col gap-1 animate-fade-in max-h-[calc(100vh-64px)] overflow-y-auto">
          {topNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl font-semibold flex items-center justify-between",
                location === link.href ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
              )}
            >
              {link.name}
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          ))}

          {/* Mobile Services accordion */}
          <button
            onClick={() => setMobileServicesOpen((o) => !o)}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold flex items-center justify-between w-full text-left",
              isServicesActive ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
            )}
          >
            Services
            <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", mobileServicesOpen && "rotate-180")} />
          </button>
          {mobileServicesOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {serviceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { setMobileMenuOpen(false); setMobileServicesOpen(false); }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between",
                    location === link.href ? "bg-primary/10 text-primary" : "text-navy-light hover:bg-gray-50"
                  )}
                >
                  {link.name}
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              ))}
              <Link
                href="/services"
                onClick={() => { setMobileMenuOpen(false); setMobileServicesOpen(false); }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-primary/5"
              >
                View all services →
              </Link>
            </div>
          )}

          {/* Mobile Industries accordion */}
          <button
            onClick={() => setMobileIndustriesOpen((o) => !o)}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold flex items-center justify-between w-full text-left",
              isIndustriesActive ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
            )}
          >
            Industries
            <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", mobileIndustriesOpen && "rotate-180")} />
          </button>
          {mobileIndustriesOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {industryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { setMobileMenuOpen(false); setMobileIndustriesOpen(false); }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between",
                    location === link.href ? "bg-primary/10 text-primary" : "text-navy-light hover:bg-gray-50"
                  )}
                >
                  {link.name}
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              ))}
              <Link
                href="/industries"
                onClick={() => { setMobileMenuOpen(false); setMobileIndustriesOpen(false); }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-primary/5"
              >
                All industries →
              </Link>
            </div>
          )}

          {/* Mobile Partners accordion */}
          <button
            onClick={() => setMobilePartnersOpen((o) => !o)}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold flex items-center justify-between w-full text-left",
              isPartnerActive ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
            )}
          >
            Partners
            <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", mobilePartnersOpen && "rotate-180")} />
          </button>
          {mobilePartnersOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {allPartnerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { setMobileMenuOpen(false); setMobilePartnersOpen(false); }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between",
                    location === link.href ? "bg-primary/10 text-primary" : "text-navy-light hover:bg-gray-50"
                  )}
                >
                  {link.name}
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              ))}
            </div>
          )}

          <hr className="my-2" />
          <div className="flex flex-col gap-2 px-0">
            <Link href="/portal" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full justify-center text-sm">
                {isAuthenticated ? "Dashboard" : "Client Portal"}
              </Button>
            </Link>
            <Link href="/quote" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button className="w-full justify-center text-sm">Get a Quote</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
