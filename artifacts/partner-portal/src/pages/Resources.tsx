import { PortalLayout } from "@/components/layout/PortalLayout";
import { useResources, useTrackDownload } from "@/hooks/use-resources";
import { FileText, Video, Link as LinkIcon, Download, Search, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

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
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Resources</h1>
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8" />
          </div>
          <div className="flex border border-border rounded overflow-hidden">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  category === c
                    ? "bg-[#0176d3] text-white"
                    : "bg-white text-muted-foreground hover:bg-[#f3f3f3]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="sf-card p-12 text-center text-muted-foreground">Loading resources...</div>
        ) : filtered.length === 0 ? (
          <div className="sf-card p-12 text-center text-muted-foreground">No resources found matching your criteria.</div>
        ) : (
          <div className="sf-card overflow-hidden">
            <table className="w-full sf-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(res => (
                  <tr key={res.id}>
                    <td>
                      <div className="w-8 h-8 bg-[#0176d3]/10 rounded flex items-center justify-center">
                        {res.type === "video" ? <Video className="w-4 h-4 text-[#0176d3]" /> :
                         res.type === "link" ? <LinkIcon className="w-4 h-4 text-[#0176d3]" /> :
                         <FileText className="w-4 h-4 text-[#0176d3]" />}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-[#0176d3]">{res.title}</div>
                      {res.featured && <span className="sf-badge sf-badge-warning text-[10px] mt-0.5">Featured</span>}
                    </td>
                    <td className="text-sm text-muted-foreground max-w-md">
                      <span className="line-clamp-2">{res.description}</span>
                    </td>
                    <td><span className="sf-badge sf-badge-default capitalize">{res.category}</span></td>
                    <td>
                      <button onClick={() => handleDownload(res.id, res.url)} className="sf-btn sf-btn-neutral text-xs h-7 px-3">
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
