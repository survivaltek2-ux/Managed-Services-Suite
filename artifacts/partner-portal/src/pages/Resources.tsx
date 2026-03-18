import { PortalLayout } from "@/components/layout/PortalLayout";
import { useResources, useTrackDownload } from "@/hooks/use-resources";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileText, Video, Link as LinkIcon, Download, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export default function Resources() {
  const { data: resources = [], isLoading } = useResources();
  const { mutate: trackDownload } = useTrackDownload();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = ["all", "marketing", "sales", "technical", "zoom"];

  const filtered = resources.filter(r => 
    (category === "all" || r.category === category) &&
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (id: number, url: string) => {
    trackDownload(id);
    window.open(url, "_blank");
  };

  return (
    <PortalLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Marketing & Sales Resources</h1>
          <p className="text-muted-foreground mt-1">Co-branded collateral, data sheets, and pitch decks.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search resources..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl shadow-sm border-border/50 bg-card"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border shadow-sm ${
              category === c 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card text-muted-foreground border-border hover:bg-slate-50 hover:text-foreground'
            }`}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-muted-foreground">Loading resources...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border/50 rounded-2xl">No resources found matching criteria.</div>
        ) : (
          filtered.map(res => (
            <div key={res.id} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="mb-4 flex items-start justify-between">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {res.type === 'video' ? <Video className="w-6 h-6" /> : 
                   res.type === 'link' ? <LinkIcon className="w-6 h-6" /> : 
                   <FileText className="w-6 h-6" />}
                </div>
                {res.featured && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none">Featured</Badge>}
              </div>
              
              <h3 className="font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{res.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">{res.description}</p>
              
              <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                <Badge variant="outline" className="text-[10px] capitalize font-semibold shadow-sm">{res.category}</Badge>
                <Button size="sm" variant="ghost" className="rounded-lg h-8 px-2 hover:bg-primary hover:text-white" onClick={() => handleDownload(res.id, res.url)}>
                  <Download className="w-4 h-4 mr-1.5" /> Get
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  );
}
