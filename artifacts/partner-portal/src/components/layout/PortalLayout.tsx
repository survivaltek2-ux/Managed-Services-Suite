import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Handshake, 
  Target, 
  BookOpen, 
  Award, 
  Bell, 
  User, 
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals", label: "Deal Registration", icon: Handshake },
  { href: "/leads", label: "My Leads", icon: Target },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/training", label: "Training & Certs", icon: Award },
  { href: "/announcements", label: "Announcements", icon: Bell },
  { href: "/profile", label: "My Profile", icon: User },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isPending = user.status === "pending";

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1120] text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col shadow-2xl",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <div className="bg-primary/20 text-primary p-1.5 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Siebert Partners</span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-white line-clamp-1">{user.companyName}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{user.contactName}</p>
            <div className="mt-3 inline-flex">
               <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary capitalize font-medium">
                 {user.tier} Partner
               </Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            // Disable links if pending, except profile/dashboard
            const disabled = isPending && item.href !== "/dashboard" && item.href !== "/profile";
            
            return (
              <Link key={item.href} href={disabled ? "#" : item.href} onClick={(e) => disabled && e.preventDefault()}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : disabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-white/5 hover:text-white"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b bg-white dark:bg-slate-900 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none text-foreground">{user.contactName}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-background">
              {user.contactName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {isPending && location !== "/profile" ? (
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Application Under Review</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for applying to the Siebert Services Partner Program. Our team is currently reviewing your application. You will receive an email once approved, which will unlock full portal access.
                </p>
                <Link href="/profile">
                  <Button variant="outline">Review Your Profile</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
