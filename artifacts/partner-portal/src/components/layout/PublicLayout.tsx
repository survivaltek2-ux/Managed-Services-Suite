import React from "react";
import { Link } from "wouter";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Siebert <span className="text-primary">Partners</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Partner Login
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button size="sm" className="rounded-full px-6">Apply Now</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-slate-200">
              Siebert Partners
            </span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Siebert Repair Services LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
