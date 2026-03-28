import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import PublicHome from "./pages/PublicHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Leads from "./pages/Leads";
import Resources from "./pages/Resources";
import Training from "./pages/Training";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import Commissions from "./pages/Commissions";
import SupportTickets from "./pages/SupportTickets";
import ClientTickets from "./pages/ClientTickets";
import Documents from "./pages/Documents";
import NotFound from "./pages/not-found";

import { useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading...</div>;
  }
  
  if (!user) {
    window.location.href = `${import.meta.env.BASE_URL}login`;
    return null;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Portal Routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/deals"><ProtectedRoute component={Deals} /></Route>
      <Route path="/leads"><ProtectedRoute component={Leads} /></Route>
      <Route path="/resources"><ProtectedRoute component={Resources} /></Route>
      <Route path="/training"><ProtectedRoute component={Training} /></Route>
      <Route path="/announcements"><ProtectedRoute component={Announcements} /></Route>
      <Route path="/commissions"><ProtectedRoute component={Commissions} /></Route>
      <Route path="/support"><ProtectedRoute component={SupportTickets} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route path="/client-tickets"><ProtectedRoute component={ClientTickets} /></Route>
      <Route path="/documents"><ProtectedRoute component={Documents} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
