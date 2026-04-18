import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { SchemaTag } from "@/components/SchemaTag";
import { MultiChannelContactBar } from "@/components/MultiChannelContactBar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Hide global mobile contact bar on admin/portal routes (full-screen apps)
  const hideMobileBar = location.startsWith("/admin") || location.startsWith("/portal");

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Global structured data — Organization rendered on every page */}
      <SchemaTag id="schema-org" type="Organization" />
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      {!hideMobileBar && <MultiChannelContactBar />}
    </div>
  );
}
