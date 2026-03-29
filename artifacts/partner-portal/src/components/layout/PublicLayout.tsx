import React from "react";
import { Link } from "wouter";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 h-20 sm:h-24 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="bg-primary text-white p-1.5 sm:p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <span className="font-display font-bold text-lg sm:text-2xl tracking-tight text-foreground">
              <span className="hidden sm:inline">Siebert <span className="text-primary">Partners</span></span>
              <span className="sm:hidden">Partners</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-sm sm:text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button size="lg" className="rounded-full px-6 sm:px-8 text-sm sm:text-base">Apply Now</Button>
            </Link>
            <Link href="/register" className="sm:hidden">
              <Button size="sm" className="rounded-full px-4 text-sm">Apply</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-slate-950 text-slate-400 py-8 sm:py-12 border-t border-slate-900">
        <div className="container mx-auto px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-primary shrink-0" />
            <span className="font-display font-bold text-base sm:text-lg text-slate-200">
              Siebert Partners
            </span>
          </div>
          <p className="text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Siebert Repair Services LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
