import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLogin, useRegister, useListTickets, useCreateTicket, TicketInputPriority, TicketInputCategory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label, Textarea, Badge } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Lock, LogOut, TicketIcon, PlusCircle, AlertCircle } from "lucide-react";

export default function Portal() {
  const { isAuthenticated, token, user, login, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Forms
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketPriority, setTicketPriority] = useState<TicketInputPriority>(TicketInputPriority.medium);
  const [ticketCat, setTicketCat] = useState<TicketInputCategory>(TicketInputCategory.other);

  const { toast } = useToast();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const createTicketMutation = useCreateTicket({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: tickets, refetch: refetchTickets } = useListTickets({
    query: { 
      queryKey: ["tickets"],
      enabled: isAuthenticated 
    },
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ data: { email, password } });
      login(res.token, res.user);
      toast({ title: "Welcome back!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Login failed", description: "Invalid credentials." });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerMutation.mutateAsync({ data: { name, email, password, company } });
      login(res.token, res.user);
      toast({ title: "Account created successfully!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Registration failed", description: "Please check your inputs." });
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicketMutation.mutateAsync({
        data: { subject: ticketSubject, description: ticketDesc, priority: ticketPriority, category: ticketCat }
      });
      toast({ title: "Ticket created successfully!" });
      setShowNewTicket(false);
      setTicketSubject("");
      setTicketDesc("");
      refetchTickets();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create ticket." });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return "destructive";
      case 'high': return "destructive"; // Can use a custom orange if added
      case 'medium': return "default";
      case 'low': return "secondary";
      default: return "default";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-display font-bold text-navy">Client Portal</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {isRegistering ? "Create your account" : "Log in to manage your services and tickets"}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input required value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input required value={company} onChange={e => setCompany(e.target.value)} />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full mt-6 h-12 text-base shadow-primary/20 shadow-lg" disabled={loginMutation.isPending || registerMutation.isPending}>
                {isRegistering ? "Register Account" : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isRegistering ? "Already have an account?" : "Need portal access?"}
              </span>{" "}
              <button onClick={() => setIsRegistering(!isRegistering)} className="text-primary font-bold hover:underline">
                {isRegistering ? "Sign In" : "Register"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">{user?.company}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowNewTicket(true)} className="gap-2 border-primary text-primary hover:bg-primary/5">
              <PlusCircle className="w-4 h-4" /> New Ticket
            </Button>
            <Button variant="ghost" onClick={logout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Create Ticket Modal / Inline form */}
        {showNewTicket && (
          <Card className="mb-8 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="flex items-center justify-between text-xl">
                <span>Create Support Ticket</span>
                <Button variant="ghost" size="sm" onClick={() => setShowNewTicket(false)}>Cancel</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input required value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                      value={ticketCat} onChange={e => setTicketCat(e.target.value as TicketInputCategory)}
                    >
                      {Object.values(TicketInputCategory).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Priority</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {Object.values(TicketInputPriority).map(p => (
                        <label key={p} className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${ticketPriority === p ? 'bg-primary/10 border-primary' : ''}`}>
                          <input type="radio" name="priority" checked={ticketPriority === p} onChange={() => setTicketPriority(p)} className="text-primary" />
                          <span className="capitalize font-medium text-sm text-navy">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea required value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} placeholder="Please describe the issue in detail..." />
                  </div>
                </div>
                <Button type="submit" className="mt-4" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <div>
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
            <TicketIcon className="w-5 h-5" /> Recent Tickets
          </h2>
          
          {!tickets ? (
            <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
          ) : tickets.length === 0 ? (
            <Card className="border-dashed bg-transparent shadow-none">
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p>No support tickets found.</p>
                <Button variant="link" onClick={() => setShowNewTicket(true)}>Open a new ticket</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map(t => (
                <Card key={t.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground">#{t.id}</span>
                        <h3 className="font-bold text-navy text-lg">{t.subject}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">{t.category}</span>
                        <span>•</span>
                        <span>Opened {format(new Date(t.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      <Badge variant={getPriorityColor(t.priority) as any} className="capitalize">{t.priority} Priority</Badge>
                      <Badge variant={t.status === 'closed' || t.status === 'resolved' ? 'secondary' : 'outline'} className="capitalize bg-white">{t.status.replace('_', ' ')}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
