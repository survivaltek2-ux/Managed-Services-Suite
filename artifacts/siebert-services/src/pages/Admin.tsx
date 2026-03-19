import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Settings,
  Briefcase,
  MessageSquare,
  Users,
  HelpCircle,
  Inbox,
  FileText,
  Ticket as TicketIcon,
  LogOut,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Save
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type TabType = "dashboard" | "settings" | "services" | "testimonials" | "team" | "faq" | "contacts" | "quotes" | "tickets";

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "settings", label: "Site Settings", icon: <Settings size={20} /> },
  { id: "services", label: "Services", icon: <Briefcase size={20} /> },
  { id: "testimonials", label: "Testimonials", icon: <MessageSquare size={20} /> },
  { id: "team", label: "Team Members", icon: <Users size={20} /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle size={20} /> },
  { id: "contacts", label: "Contacts", icon: <Inbox size={20} /> },
  { id: "quotes", label: "Quotes", icon: <FileText size={20} /> },
  { id: "tickets", label: "Tickets", icon: <TicketIcon size={20} /> },
];

export default function Admin() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // Check admin role
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData(activeTab);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, activeTab]);

  const getHeaders = () => ({
    "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
    "Content-Type": "application/json"
  });

  const fetchData = async (tab: TabType) => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const [cRes, qRes, tRes, sRes] = await Promise.all([
          fetch("/api/admin/contacts", { headers: getHeaders() }),
          fetch("/api/admin/quotes", { headers: getHeaders() }),
          fetch("/api/admin/tickets", { headers: getHeaders() }),
          fetch("/api/admin/cms/services", { headers: getHeaders() })
        ]);
        const [c, q, t, s] = await Promise.all([
          cRes.ok ? cRes.json() : [],
          qRes.ok ? qRes.json() : [],
          tRes.ok ? tRes.json() : [],
          sRes.ok ? sRes.json() : []
        ]);
        setDashboardStats({
          contacts: Array.isArray(c) ? c.length : 0,
          quotes: Array.isArray(q) ? q.length : 0,
          tickets: Array.isArray(t) ? t.length : 0,
          services: Array.isArray(s) ? s.length : 0
        });
      } else if (tab === "settings") {
        const res = await fetch("/api/admin/cms/settings", { headers: getHeaders() });
        if (res.ok) setSettings(await res.json());
      } else if (tab === "services") {
        const res = await fetch("/api/admin/cms/services", { headers: getHeaders() });
        if (res.ok) setServices(await res.json());
      } else if (tab === "testimonials") {
        const res = await fetch("/api/admin/cms/testimonials", { headers: getHeaders() });
        if (res.ok) setTestimonials(await res.json());
      } else if (tab === "team") {
        const res = await fetch("/api/admin/cms/team", { headers: getHeaders() });
        if (res.ok) setTeam(await res.json());
      } else if (tab === "faq") {
        const res = await fetch("/api/admin/cms/faq", { headers: getHeaders() });
        if (res.ok) setFaqs(await res.json());
      } else if (tab === "contacts") {
        const res = await fetch("/api/admin/contacts", { headers: getHeaders() });
        if (res.ok) setContacts(await res.json());
      } else if (tab === "quotes") {
        const res = await fetch("/api/admin/quotes", { headers: getHeaders() });
        if (res.ok) setQuotes(await res.json());
      } else if (tab === "tickets") {
        const res = await fetch("/api/admin/tickets", { headers: getHeaders() });
        if (res.ok) setTickets(await res.json());
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast({ title: "Error fetching data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      console.log("Attempting login with email:", email);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", res.status);
      const data = await res.json();
      console.log("Login response data:", data);

      if (res.ok) {
        if (data.user.role === "admin") {
          console.log("Login successful, user role:", data.user.role);
          login(data.token, data.user);
          toast({ title: "Logged in as Admin successfully" });
        } else {
          const msg = `Access denied. Your role is '${data.user.role}', admin role required.`;
          console.warn(msg);
          setLoginError(msg);
        }
      } else {
        const errorMsg = data.error || data.message || "Invalid credentials";
        console.error("Login failed:", errorMsg);
        setLoginError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "An error occurred during login";
      console.error("Login error:", err);
      setLoginError(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="text-primary w-6 h-6" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Sign in with your administrator account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg font-medium whitespace-pre-wrap break-words">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <h2 className="text-xl font-bold font-display tracking-tight text-white/90 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              logout();
              toast({ title: "Logged out" });
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-navy capitalize tracking-tight">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === "dashboard" && <DashboardTab stats={dashboardStats} />}
              {activeTab === "settings" && <SettingsTab settings={settings} fetchSettings={() => fetchData("settings")} token={token || ""} />}
              {activeTab === "services" && <ServicesTab services={services} fetchServices={() => fetchData("services")} token={token || ""} />}
              {activeTab === "testimonials" && <TestimonialsTab testimonials={testimonials} fetchTestimonials={() => fetchData("testimonials")} token={token || ""} />}
              {activeTab === "team" && <TeamTab team={team} fetchTeam={() => fetchData("team")} token={token || ""} />}
              {activeTab === "faq" && <FaqTab faqs={faqs} fetchFaqs={() => fetchData("faq")} token={token || ""} />}
              {activeTab === "contacts" && <ContactsTab contacts={contacts} />}
              {activeTab === "quotes" && <QuotesTab quotes={quotes} />}
              {activeTab === "tickets" && <TicketsTab tickets={tickets} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- TABS COMPONENTS ---

function DashboardTab({ stats }: { stats: any }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Contacts" value={stats.contacts} icon={<Inbox className="text-blue-500" />} />
      <StatCard title="Quote Requests" value={stats.quotes} icon={<FileText className="text-emerald-500" />} />
      <StatCard title="Support Tickets" value={stats.tickets} icon={<TicketIcon className="text-amber-500" />} />
      <StatCard title="Active Services" value={stats.services} icon={<Briefcase className="text-purple-500" />} />
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-navy">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTab({ settings, fetchSettings, token }: { settings: any[], fetchSettings: () => void, token: string }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const data: Record<string, string> = {};
    settings.forEach(s => {
      data[s.key] = s.value;
    });
    setFormData(data);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { settings: Object.entries(formData).map(([key, value]) => ({ key, value })) };
      
      const res = await fetch("/api/admin/cms/settings", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: "Settings saved successfully" });
        fetchSettings();
      } else {
        toast({ title: "Failed to save settings", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const textareas = ["hero_description", "about_story", "zoom_partner_description"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className={textareas.includes(key) ? "md:col-span-2 space-y-2" : "space-y-2"}>
              <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
              {textareas.includes(key) ? (
                <Textarea value={value} onChange={e => handleChange(key, e.target.value)} />
              ) : (
                <Input value={value} onChange={e => handleChange(key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ServicesTab({ services, fetchServices, token }: { services: any[], fetchServices: () => void, token: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", description: "", icon: "", category: "", features: "", sortOrder: 0, active: true });

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", icon: "", category: "", features: "", sortOrder: 0, active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item, features: Array.isArray(item.features) ? item.features.join("\n") : item.features || "" });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/cms/services/${editingItem.id}` : "/api/admin/cms/services";
      
      const payload = {
        ...formData,
        features: formData.features.split("\n").map(f => f.trim()).filter(Boolean),
        sortOrder: Number(formData.sortOrder)
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: "Saved successfully" });
        setIsDialogOpen(false);
        fetchServices();
      } else {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/cms/services/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}` }
      });
      if (res.ok) {
        toast({ title: "Deleted" });
        fetchServices();
      }
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2"/> Add Service</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Active</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-navy">{item.title}</td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.active ? "default" : "secondary"}>{item.active ? "Yes" : "No"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <div className="p-8 text-center text-muted-foreground">No services found.</div>}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Icon (Lucide icon name)</Label>
                <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea className="min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Features (One per line)</Label>
              <Textarea className="min-h-[120px]" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4" />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestimonialsTab({ testimonials, fetchTestimonials, token }: { testimonials: any[], fetchTestimonials: () => void, token: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", company: "", role: "", content: "", rating: 5, sortOrder: 0, active: true });

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", company: "", role: "", content: "", rating: 5, sortOrder: 0, active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/cms/testimonials/${editingItem.id}` : "/api/admin/cms/testimonials";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...formData, sortOrder: Number(formData.sortOrder), rating: Number(formData.rating) })
      });
      if (res.ok) {
        toast({ title: "Saved successfully" });
        setIsDialogOpen(false);
        fetchTestimonials();
      } else {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/cms/testimonials/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}` }
      });
      if (res.ok) {
        toast({ title: "Deleted" });
        fetchTestimonials();
      }
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2"/> Add Testimonial</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-navy">{item.name}</td>
                  <td className="px-6 py-4">{item.company}</td>
                  <td className="px-6 py-4">{item.rating}/5</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {testimonials.length === 0 && <div className="p-8 text-center text-muted-foreground">No testimonials found.</div>}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <Input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea className="min-h-[100px]" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input type="checkbox" id="testi-active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4" />
                <Label htmlFor="testi-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamTab({ team, fetchTeam, token }: { team: any[], fetchTeam: () => void, token: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", role: "", bio: "", imageUrl: "", sortOrder: 0, active: true });

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", role: "", bio: "", imageUrl: "", sortOrder: 0, active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/cms/team/${editingItem.id}` : "/api/admin/cms/team";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...formData, sortOrder: Number(formData.sortOrder) })
      });
      if (res.ok) {
        toast({ title: "Saved successfully" });
        setIsDialogOpen(false);
        fetchTeam();
      } else {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/cms/team/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}` }
      });
      if (res.ok) {
        toast({ title: "Deleted" });
        fetchTeam();
      }
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2"/> Add Member</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-navy">{item.name}</td>
                  <td className="px-6 py-4">{item.role}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {team.length === 0 && <div className="p-8 text-center text-muted-foreground">No team members found.</div>}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea className="min-h-[100px]" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input type="checkbox" id="team-active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4" />
                <Label htmlFor="team-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FaqTab({ faqs, fetchFaqs, token }: { faqs: any[], fetchFaqs: () => void, token: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "", sortOrder: 0, active: true });

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ question: "", answer: "", category: "", sortOrder: 0, active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/api/admin/cms/faq/${editingItem.id}` : "/api/admin/cms/faq";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...formData, sortOrder: Number(formData.sortOrder) })
      });
      if (res.ok) {
        toast({ title: "Saved successfully" });
        setIsDialogOpen(false);
        fetchFaqs();
      } else {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/cms/faq/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}` }
      });
      if (res.ok) {
        toast({ title: "Deleted" });
        fetchFaqs();
      }
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2"/> Add FAQ</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Question</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-navy">{item.question}</td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {faqs.length === 0 && <div className="p-8 text-center text-muted-foreground">No FAQs found.</div>}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea className="min-h-[100px]" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="faq-active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4" />
              <Label htmlFor="faq-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Read-only tables

function ContactsTab({ contacts }: { contacts: any[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Service</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4">{item.email}</td>
                <td className="px-6 py-4">{item.service}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && <div className="p-8 text-center text-muted-foreground">No contacts found.</div>}
      </div>
    </Card>
  );
}

function QuotesTab({ quotes }: { quotes: any[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Budget</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium">{item.company}</td>
                <td className="px-6 py-4">{item.budget}</td>
                <td className="px-6 py-4">
                  <Badge variant={item.status === 'new' ? 'default' : 'secondary'}>{item.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && <div className="p-8 text-center text-muted-foreground">No quotes found.</div>}
      </div>
    </Card>
  );
}

function TicketsTab({ tickets }: { tickets: any[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-muted-foreground">#{item.id}</td>
                <td className="px-6 py-4 font-medium">{item.subject}</td>
                <td className="px-6 py-4">
                  <Badge variant={
                    item.priority === 'critical' ? 'destructive' :
                    item.priority === 'high' ? 'default' :
                    'secondary'
                  }>
                    {item.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{item.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <div className="p-8 text-center text-muted-foreground">No tickets found.</div>}
      </div>
    </Card>
  );
}
