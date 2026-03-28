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
  DollarSign,
  Headphones,
  TrendingUp,
  Search,
  Grid3X3,
  ChevronDown,
  HelpCircle,
  Settings,
  Menu,
  X,
  Users,
  FolderOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/commissions", label: "Commissions", icon: DollarSign },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/training", label: "Training", icon: Award },
  { href: "/support", label: "Support", icon: Headphones },
  { href: "/mdf", label: "MDF", icon: TrendingUp },
  { href: "/announcements", label: "News", icon: Bell },
];

const ADMIN_NAV_ITEMS = [
  { href: "/client-tickets", label: "Client Tickets", icon: Users },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  if (!user) return null;

  const isPending = user.status === "pending";
  const NAV_ITEMS = user.isAdmin ? [...BASE_NAV_ITEMS, ...ADMIN_NAV_ITEMS] : BASE_NAV_ITEMS;
  const currentTab = NAV_ITEMS.find(i => location === i.href) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f3]">
      {/* Salesforce-style Top Header */}
      <header className="sf-header text-white flex-shrink-0 z-50 relative">
        <div className="h-11 flex items-center px-4 gap-3">
          {/* App Launcher */}
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="App Launcher" aria-label="App Launcher">
            <Grid3X3 className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 mr-4">
            <span className="font-bold text-base tracking-tight">Siebert Partners</span>
          </Link>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
            {NAV_ITEMS.map(item => {
              const isActive = location === item.href;
              const disabled = isPending && item.href !== "/dashboard" && item.href !== "/profile";
              return (
                <Link 
                  key={item.href} 
                  href={disabled ? "#" : item.href}
                  onClick={(e) => disabled && e.preventDefault()}
                >
                  <div className={cn(
                    "px-3 py-2 text-[13px] font-medium rounded-t transition-colors whitespace-nowrap cursor-pointer",
                    isActive 
                      ? "bg-[#f3f3f3] text-[#032d60]" 
                      : disabled 
                        ? "opacity-40 cursor-not-allowed text-white/70" 
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-1.5 hover:bg-white/10 rounded ml-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
              <input
                type="text"
                placeholder="Search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="h-7 w-48 pl-8 pr-3 text-xs bg-white/15 border border-white/20 rounded text-white placeholder:text-white/50 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
              />
            </div>

            <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Help" aria-label="Help">
              <HelpCircle className="w-4 h-4 text-white/80" />
            </button>

            {/* User Avatar */}
            <div className="relative ml-1">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu" aria-expanded={showUserMenu}
                className="w-7 h-7 rounded-full bg-[#fe9339] flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-white/30 transition-all"
              >
                {user.contactName.charAt(0).toUpperCase()}
              </button>
              
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded shadow-lg border border-[#d8dde6] z-50 text-foreground overflow-hidden">
                    <div className="p-4 border-b border-[#d8dde6] bg-[#fafaf9]">
                      <p className="font-semibold text-sm">{user.contactName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.companyName}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded bg-[#0176d3]/10 text-[#0176d3] uppercase">{user.tier} Partner</span>
                    </div>
                    <Link href="/profile" onClick={() => setShowUserMenu(false)}>
                      <div className="px-4 py-2.5 text-sm hover:bg-[#f3f3f3] flex items-center gap-2 cursor-pointer">
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Settings
                      </div>
                    </Link>
                    <button onClick={logout} className="w-full px-4 py-2.5 text-sm hover:bg-[#f3f3f3] flex items-center gap-2 text-left border-t border-[#d8dde6]">
                      <LogOut className="w-3.5 h-3.5 text-muted-foreground" /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#032d60] pb-2 px-2">
            {NAV_ITEMS.map(item => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium",
                    isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                  )}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
            <div className="border-t border-white/10 mt-1 pt-1">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-white/80 hover:bg-white/10">
                  <User className="w-4 h-4" /> Profile
                </div>
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-white/80 hover:bg-white/10">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        {isPending && location !== "/profile" ? (
          <div className="max-w-2xl mx-auto mt-12 px-4">
            <div className="sf-card p-8 text-center">
              <div className="w-14 h-14 bg-[#fe9339]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-[#fe9339]" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Application Under Review</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Thank you for applying to the Siebert Services Partner Program. Our team is currently reviewing your application.
              </p>
              <Link href="/profile">
                <button className="sf-btn sf-btn-primary">Review Your Profile</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
