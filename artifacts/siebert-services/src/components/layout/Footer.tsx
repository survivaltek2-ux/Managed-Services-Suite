import { Link } from "wouter";
import { Mail, MapPin, Phone, ArrowRight, Linkedin, Facebook, Twitter, Youtube, Award, ShieldCheck, Cloud, Server } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { BookingButton } from "@/components/Booking";

const connectivityPartners = [
  { label: "Comcast Business", href: "/comcast-business" },
  { label: "Spectrum Business", href: "/spectrum-business" },
  { label: "AT&T Business", href: "/att-business" },
  { label: "Verizon Business", href: "/verizon-business" },
  { label: "Cox Business", href: "/cox-business" },
  { label: "Altice / Optimum", href: "/altice" },
  { label: "Lumen Technologies", href: "/lumen" },
  { label: "T-Mobile Business", href: "/t-mobile-business" },
];

const techPartners = [
  { label: "Zoom", href: "/zoom" },
  { label: "RingCentral", href: "/ringcentral" },
  { label: "Microsoft 365", href: "/microsoft-365" },
  { label: "8x8", href: "/8x8" },
  { label: "Cisco / Meraki", href: "/cisco-meraki" },
  { label: "Fortinet", href: "/fortinet" },
  { label: "Palo Alto Networks", href: "/palo-alto-networks" },
  { label: "Extreme Networks", href: "/extreme-networks" },
  { label: "Juniper Networks", href: "/juniper-networks" },
  { label: "HP", href: "/hp" },
  { label: "Dell", href: "/dell" },
  { label: "Vivint", href: "/vivint" },
  { label: "ADT Business", href: "/adt-business" },
];

const certifications = [
  { icon: <Award className="w-4 h-4" />, label: "Microsoft Partner" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "CompTIA Member" },
  { icon: <Server className="w-4 h-4" />, label: "Cisco Select Partner" },
  { icon: <Cloud className="w-4 h-4" />, label: "Microsoft 365 Specialist" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Fortinet Authorized" },
  { icon: <Award className="w-4 h-4" />, label: "Certified Zoom Partner" },
];

const serviceArea =
  "Proudly serving Hudson Valley businesses — Orange, Rockland, Westchester, Putnam, Dutchess & Ulster counties — and remote support nationwide.";

export function Footer() {
  return (
    <footer className="bg-navy pt-20 pb-10 border-t-4 border-primary overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">

          {/* Brand Col */}
          <div className="space-y-3 sm:space-y-6">
            <Link href="/" className="flex items-center justify-center sm:justify-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-xl shadow-lg">
                S
              </div>
              <div className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                Siebert <span className="text-primary">Services</span>
              </div>
            </Link>
            <p className="text-white/70 leading-relaxed">
              Your hybrid MSP — combining managed IT services with authorized reselling of enterprise technology. One partner for procurement, deployment, management, and support.
            </p>
            <p className="text-white/60 text-sm leading-relaxed">{serviceArea}</p>
            <BookingButton className="w-full sm:w-auto" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display font-bold text-base sm:text-lg mb-4 sm:mb-6">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Get a Quote", href: "/quote" },
                { label: "Client Portal", href: "/portal" },
                { label: "Recommended Products", href: "/recommended" },
                { label: "Internet Plans", href: "/internet-plans" },
                { label: "Blog", href: "/blog" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors flex items-center gap-2 group text-sm"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-display font-bold text-base sm:text-lg mb-4 sm:mb-6">Contact (NAP)</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span>
                  <strong className="block text-white">Siebert Services</strong>
                  4 Maple Court<br />
                  Washingtonville, NY 10992
                </span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:8664849180" className="hover:text-primary">866-484-9180</a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:support@siebertrservices.com" className="hover:text-primary">support@siebertrservices.com</a>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex gap-2 mt-6">
              <a href="https://www.linkedin.com/company/siebert-services" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/siebertservices" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://x.com/siebertservices" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@siebertservices" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-display font-bold text-base sm:text-lg mb-4 sm:mb-6">Newsletter</h4>
            <p className="text-white/70 mb-4 text-sm">Stay updated with the latest in managed IT, cybersecurity, and vendor product news.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary h-12"
              />
              <Button className="w-full h-12 text-base">Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Certifications strip */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-4 text-center sm:text-left">Certifications & Accreditations</p>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {certifications.map((c) => (
              <div key={c.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                <span className="text-primary">{c.icon}</span>
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Partners Section */}
        <div className="border-t border-white/10 pt-8 mb-10">
          <h4 className="text-white font-display font-bold text-base sm:text-lg mb-6">Vendor Partners</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Connectivity & ISP</p>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                {connectivityPartners.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Technology & Security</p>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                {techPartners.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-white/50 text-xs sm:text-sm">
            © {new Date().getFullYear()} Siebert Repair Services LLC DBA Siebert Services. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-white/50">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <a href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
