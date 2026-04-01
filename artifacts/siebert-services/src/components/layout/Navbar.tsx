import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useState, useEffect, useRef } from "react";
import { Menu, X, PhoneCall, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

const partnerLinks = [
  { name: "Zoom", href: "/zoom" },
  { name: "Extreme Networks", href: "/extreme-networks" },
  { name: "HP", href: "/hp" },
  { name: "Dell", href: "/dell" },
  { name: "Juniper Networks", href: "/juniper-networks" },
  { name: "Vivint", href: "/vivint" },
  { name: "Altice / Optimum", href: "/altice" },
];

const topNavLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Recommended Products", href: "/recommended" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPartnerActive = partnerLinks.some((l) => location === l.href);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white/90 backdrop-blur-lg border-border/50 shadow-sm py-3" : "bg-navy border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl shadow-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <div className={cn("font-display font-bold text-base sm:text-xl tracking-tight transition-colors hidden sm:block", isScrolled ? "text-navy" : "text-white")}>
              Siebert <span className="text-primary">Services</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {topNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary relative",
                  isScrolled ? "text-navy-light" : "text-white/90",
                  location === link.href && "text-primary"
                )}
              >
                {link.name}
                {location === link.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}

            {/* Partners Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPartnersOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary relative",
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-border py-2 z-50">
                  <div className="px-3 pb-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vendor Partners</p>
                  </div>
                  {partnerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setPartnersOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors mx-1 rounded-xl",
                        location === link.href ? "bg-primary/10 text-primary" : "text-navy hover:bg-gray-50"
                      )}
                    >
                      {link.name}
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <div className={cn("flex items-center gap-2 text-sm font-semibold mr-2", isScrolled ? "text-navy" : "text-white")}>
              <PhoneCall className="w-4 h-4 text-primary" />
              <span>866-484-9180</span>
            </div>
            <Link href="/portal">
              <Button variant={isScrolled ? "outline" : "ghost"} className={cn(!isScrolled && "text-white hover:bg-white/10")}>
                {isAuthenticated ? "Dashboard" : "Client Portal"}
              </Button>
            </Link>
            <Link href="/quote">
              <Button className="shadow-primary/30">Get a Quote</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-1.5 text-primary hover:bg-white/10 rounded-lg transition-colors"
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
              {partnerLinks.map((link) => (
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
