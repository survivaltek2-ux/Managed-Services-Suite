import React, { useState, useEffect, useMemo, useRef } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["contract", "proposal", "invoice", "report", "agreement", "other"];

export default function AdminDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "other", partnerId: "" });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = getAuthHeaders();

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/documents", { headers }).then(r => r.ok ? r.json() : []),
      fetch("/api/admin/partners", { headers }).then(r => r.ok ? r.json() : []),
    ])
      .then(([docs, pts]) => {
        setDocuments(Array.isArray(docs) ? docs : []);
        setPartners(Array.isArray(pts) ? pts : []);
      })
      .catch(() => toast({ title: "Failed to load data", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => documents.filter((d: any) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.description || "").toLowerCase().includes(search.toLowerCase()) || (d.partnerCompany || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || d.category === categoryFilter;
    return matchSearch && matchCat && d.active !== false;
  }), [documents, search, categoryFilter]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!file || !form.name) return;
    setUploading(true);
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      if (file.size > 10 * 1024 * 1024) { toast({ title: "File must be under 10MB", variant: "destructive" }); return; }
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: form.name, description: form.description || null, filename: file.name, mimeType: file.type || "application/octet-stream", size: file.size, content, category: form.category, partnerId: form.partnerId || null }),
      });
      if (res.ok) {
        toast({ title: "Document uploaded" });
        setUploadOpen(false);
        setFile(null);
        setForm({ name: "", description: "", category: "other", partnerId: "" });
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: err.message || "Upload failed", variant: "destructive" });
      }
    } catch { toast({ title: "Upload failed", variant: "destructive" }); } finally { setUploading(false); }
  };

  const handleDownload = async (doc: any) => {
    setDownloading(doc.id);
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}/download`, { headers });
      if (!res.ok) { toast({ title: "Download failed", variant: "destructive" }); return; }
      const { content, filename, mimeType } = await res.json();
      const byteChars = atob(content);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch { toast({ title: "Download failed", variant: "destructive" }); } finally { setDownloading(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE", headers });
      if (res.ok) { toast({ title: "Document deleted" }); load(); }
      else toast({ title: "Failed to delete", variant: "destructive" });
    } catch { toast({ title: "Delete failed", variant: "destructive" }); }
  };

  if (!user || !user.isAdmin) {
    return (
      <PortalLayout>
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="mb-2">
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">Upload, manage, and share documents with partners</p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Documents</CardTitle>
                <Button size="sm" onClick={() => setUploadOpen(true)}><Upload className="w-4 h-4 mr-1" /> Upload Document</Button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search documents..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="h-9 px-3 rounded-md border text-sm bg-background" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-5 py-3 text-left">Name</th>
                        <th className="px-5 py-3 text-left">Category</th>
                        <th className="px-5 py-3 text-left">Partner</th>
                        <th className="px-5 py-3 text-left">Uploaded By</th>
                        <th className="px-5 py-3 text-left">Size</th>
                        <th className="px-5 py-3 text-left">Date</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((doc: any) => (
                        <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="px-5 py-3">
                            <div className="font-medium">{doc.name}</div>
                            {doc.description && <div className="text-xs text-muted-foreground truncate max-w-[220px]">{doc.description}</div>}
                          </td>
                          <td className="px-5 py-3 capitalize">{doc.category}</td>
                          <td className="px-5 py-3">{doc.partnerCompany || <span className="text-muted-foreground">All Partners</span>}</td>
                          <td className="px-5 py-3 capitalize">{doc.uploadedBy}</td>
                          <td className="px-5 py-3 text-muted-foreground">{formatBytes(doc.size)}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Download" onClick={() => handleDownload(doc)} disabled={downloading === doc.id}>
                                {downloading === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Delete" onClick={() => handleDelete(doc.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No documents found.</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Document Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Partner Agreement 2026" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={2} /></div>
                <div><Label>Category</Label>
                  <select className="w-full h-9 px-3 rounded-md border text-sm bg-background mt-1" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div><Label>Partner (optional — leave blank for all partners)</Label>
                  <select className="w-full h-9 px-3 rounded-md border text-sm bg-background mt-1" value={form.partnerId} onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))}>
                    <option value="">All Partners (Global)</option>
                    {partners.map((p: any) => <option key={p.id} value={p.id}>{p.companyName}</option>)}
                  </select>
                </div>
                <div><Label>File * (max 10MB)</Label>
                  <input type="file" ref={fileRef} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                  <Button variant="outline" className="w-full mt-1" onClick={() => fileRef.current?.click()}>
                    {file ? file.name : "Choose File..."}
                  </Button>
                  {file && <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setUploadOpen(false); setFile(null); }}>Cancel</Button>
                <Button onClick={handleUpload} disabled={!form.name || !file || uploading}>
                  {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-1" /> Upload</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PortalLayout>
  );
}
