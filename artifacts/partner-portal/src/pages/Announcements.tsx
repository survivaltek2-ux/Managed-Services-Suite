import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAnnouncements } from "@/hooks/use-announcements";
import { format } from "date-fns";
import { Megaphone, Pin } from "lucide-react";

export default function Announcements() {
  const { data: items = [], isLoading } = useAnnouncements();

  const displayItems = items.length > 0 ? items : [
    { id: 1, title: "New Zoom Promo for Q3", body: "We're launching an aggressive 20% discount on Zoom Rooms licensing for all net-new logos closed this quarter. Check the resources tab for the new pitch deck.", category: "promotions", pinned: true, publishedAt: new Date().toISOString() },
    { id: 2, title: "Platform Maintenance Notice", body: "The partner portal will undergo scheduled maintenance this Sunday at 2 AM EST for approximately 2 hours. Deal registration will be unavailable during this window.", category: "system", pinned: false, publishedAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Announcements</h1>
            <span className="text-xs text-muted-foreground">{displayItems.length} items</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
        {isLoading ? (
          <div className="sf-card p-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          displayItems.map(item => (
            <div key={item.id} className={`sf-card overflow-hidden ${item.pinned ? 'ring-1 ring-[#0176d3]/20' : ''}`}>
              <div className={`px-4 py-3 flex items-center gap-3 ${item.pinned ? 'bg-[#0176d3]/5 border-b border-[#0176d3]/10' : 'bg-[#fafaf9] border-b border-border'}`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center ${item.pinned ? 'bg-[#0176d3] text-white' : 'bg-[#706e6b]/10 text-[#706e6b]'}`}>
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                    {item.pinned && <Pin className="w-3 h-3 text-[#0176d3] fill-[#0176d3] flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="sf-badge sf-badge-default text-[10px] uppercase">{item.category}</span>
                    <span className="text-[11px] text-muted-foreground">{format(new Date(item.publishedAt), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-foreground/80 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  );
}
