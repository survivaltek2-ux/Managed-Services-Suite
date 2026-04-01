import { Link } from "wouter";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button, Input } from "@/components/ui";

export function Footer() {
  return (
    <footer className="bg-navy pt-20 pb-10 border-t-4 border-primary overflow-hidden relative">
      {/* Decorative background element */}
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
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Certified Zoom Partner
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display font-bold text-base sm:text-lg mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Client Portal', href: '/portal' },
                { label: 'Zoom Partner', href: '/zoom' },
                { label: 'Extreme Networks', href: '/extreme-networks' },
                { label: 'HP', href: '/hp' },
                { label: 'Dell', href: '/dell' },
                { label: 'Juniper Networks', href: '/juniper-networks' },
                { label: 'Vivint', href: '/vivint' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors flex items-center gap-2 group"
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
            <h4 className="text-white font-display font-bold text-base sm:text-lg mb-4 sm:mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span>4 Maple Court<br/>Washingtonville, NY 10992</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>866-484-9180</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>support@siebertrservices.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-display font-bold text-base sm:text-lg mb-4 sm:mb-6">Newsletter</h4>
            <p className="text-white/70 mb-4">Stay updated with the latest in managed IT, cybersecurity, and vendor product news.</p>
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

        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-white/50 text-xs sm:text-sm">
            © {new Date().getFullYear()} Siebert Repair Services LLC DBA Siebert Services. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-white/50">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
