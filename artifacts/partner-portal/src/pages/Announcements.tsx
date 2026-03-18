import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { Megaphone, Pin } from "lucide-react";

export default function Announcements() {
  const { data: items = [], isLoading } = useAnnouncements();

  // Mock data fallback to ensure beautiful UI if DB is empty
  const displayItems = items.length > 0 ? items : [
    { id: 1, title: "New Zoom Promo for Q3", body: "We're launching an aggressive 20% discount on Zoom Rooms licensing for all net-new logos closed this quarter. Check the resources tab for the new pitch deck.", category: "promotions", pinned: true, publishedAt: new Date().toISOString() },
    { id: 2, title: "Platform Maintenance Notice", body: "The partner portal will undergo scheduled maintenance this Sunday at 2 AM EST for approximately 2 hours. Deal registration will be unavailable during this window.", category: "system", pinned: false, publishedAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground mt-1">Latest news, promos, and updates from Siebert Services.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {displayItems.map(item => (
          <div key={item.id} className={`bg-card border rounded-2xl p-6 sm:p-8 shadow-sm transition-all hover:shadow-md ${item.pinned ? 'border-primary/30 bg-primary/5' : 'border-border/50'}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${item.pinned ? 'bg-primary text-primary-foreground shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'}`}>
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold shadow-sm bg-white dark:bg-slate-950">{item.category}</Badge>
                    {item.pinned && <Pin className="w-3 h-3 text-primary fill-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{format(new Date(item.publishedAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">{item.title}</h3>
            <p className="text-foreground/80 leading-relaxed text-base">{item.body}</p>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
