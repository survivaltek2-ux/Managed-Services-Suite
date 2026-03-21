import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useState, useEffect } from "react";
import { Menu, X, PhoneCall, ChevronRight, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAuth as useReplitAuth } from "@workspace/replit-auth-web";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { user: replitUser, isLoading: replitAuthLoading, login: replitLogin, logout: replitLogout } = useReplitAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Zoom Partner", href: "/zoom" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white/90 backdrop-blur-lg border-border/50 shadow-sm py-3" : "bg-navy border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <div className={cn("font-display font-bold text-xl tracking-tight transition-colors", isScrolled ? "text-navy" : "text-white")}>
              Siebert <span className="text-primary">Services</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary relative group",
                  isScrolled ? "text-navy-light" : "text-white/90",
                  location === link.href && (isScrolled ? "text-primary" : "text-primary")
                )}
              >
                {link.name}
                {location === link.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <div className={cn("flex items-center gap-2 text-sm font-semibold mr-2", isScrolled ? "text-navy" : "text-white")}>
              <PhoneCall className="w-4 h-4 text-primary" />
              <span>1-800-SIEBERT</span>
            </div>
            {!replitAuthLoading && (
              replitUser ? (
                <Button
                  variant={isScrolled ? "outline" : "ghost"}
                  className={cn("gap-1.5", !isScrolled && "text-white hover:bg-white/10")}
                  onClick={replitLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              ) : (
                <Button
                  variant={isScrolled ? "outline" : "ghost"}
                  className={cn("gap-1.5", !isScrolled && "text-white hover:bg-white/10")}
                  onClick={replitLogin}
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Button>
              )
            )}
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
            className="lg:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-xl py-4 px-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => (
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
          <hr className="my-2" />
          <div className="flex flex-col gap-3 px-4">
            {!replitAuthLoading && (
              replitUser ? (
                <Button variant="outline" className="w-full justify-center gap-1.5" onClick={() => { setMobileMenuOpen(false); replitLogout(); }}>
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-center gap-1.5" onClick={() => { setMobileMenuOpen(false); replitLogin(); }}>
                  <LogIn className="w-4 h-4" />
                  Log In
                </Button>
              )
            )}
            <Link href="/portal" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                {isAuthenticated ? "Dashboard" : "Client Portal"}
              </Button>
            </Link>
            <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center">Get a Quote</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
