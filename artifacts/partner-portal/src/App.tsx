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
import Marketplace from "./pages/Marketplace";
import SupportTickets from "./pages/SupportTickets";
import ClientTickets from "./pages/ClientTickets";
import Documents from "./pages/Documents";
import AdminInquiries from "./pages/AdminInquiries";
import ProposalGenerator from "./pages/ProposalGenerator";
import AdminPartners from "./pages/AdminPartners";
import AdminCommissions from "./pages/AdminCommissions";
import AdminTsdVendorRouting from "./pages/AdminTsdVendorRouting";
import AdminDocuments from "./pages/AdminDocuments";
import AdminInvoices from "./pages/AdminInvoices";
import AdminLeads from "./pages/AdminLeads";
import AdminAffiliateClicks from "./pages/AdminAffiliateClicks";
import AdminAffiliatePrograms from "./pages/AdminAffiliatePrograms";
import AdminImpact from "./pages/AdminImpact";
import AdminMarketplace from "./pages/AdminMarketplace";
import AdminTsdProducts from "./pages/AdminTsdProducts";
import AIPageEditor from "./pages/admin/AIPageEditor";
import ServiceAvailability from "./pages/ServiceAvailability";
import Vivint from "./pages/Vivint";
import Billing from "./pages/Billing";
import AdminBilling from "./pages/AdminBilling";
import ResetPassword from "./pages/ResetPassword";
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
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected Portal Routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/deals"><ProtectedRoute component={Deals} /></Route>
      <Route path="/leads"><ProtectedRoute component={Leads} /></Route>
      <Route path="/resources"><ProtectedRoute component={Resources} /></Route>
      <Route path="/training"><ProtectedRoute component={Training} /></Route>
      <Route path="/announcements"><ProtectedRoute component={Announcements} /></Route>
      <Route path="/commissions"><ProtectedRoute component={Commissions} /></Route>
      <Route path="/marketplace"><ProtectedRoute component={Marketplace} /></Route>
      <Route path="/support"><ProtectedRoute component={SupportTickets} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route path="/client-tickets"><ProtectedRoute component={ClientTickets} /></Route>
      <Route path="/documents"><ProtectedRoute component={Documents} /></Route>
      <Route path="/admin/inquiries"><ProtectedRoute component={AdminInquiries} /></Route>
      <Route path="/proposals/generate"><ProtectedRoute component={ProposalGenerator} /></Route>

      {/* Admin-only Partner Management Routes */}
      <Route path="/admin/partners"><ProtectedRoute component={AdminPartners} /></Route>
      <Route path="/admin/leads"><ProtectedRoute component={AdminLeads} /></Route>
      <Route path="/admin/commissions"><ProtectedRoute component={AdminCommissions} /></Route>
      <Route path="/admin/tsd-vendor-routing"><ProtectedRoute component={AdminTsdVendorRouting} /></Route>
      <Route path="/admin/documents"><ProtectedRoute component={AdminDocuments} /></Route>
      <Route path="/admin/invoices"><ProtectedRoute component={AdminInvoices} /></Route>
      <Route path="/admin/affiliate-clicks"><ProtectedRoute component={AdminAffiliateClicks} /></Route>
      <Route path="/admin/affiliate-programs"><ProtectedRoute component={AdminAffiliatePrograms} /></Route>
      <Route path="/admin/impact"><ProtectedRoute component={AdminImpact} /></Route>
      <Route path="/admin/marketplace"><ProtectedRoute component={AdminMarketplace} /></Route>
      <Route path="/admin/tsd-products"><ProtectedRoute component={AdminTsdProducts} /></Route>
      <Route path="/admin/ai-page-editor"><ProtectedRoute component={AIPageEditor} /></Route>
      <Route path="/admin/billing"><ProtectedRoute component={AdminBilling} /></Route>
      <Route path="/billing"><ProtectedRoute component={Billing} /></Route>
      <Route path="/service-availability"><ProtectedRoute component={ServiceAvailability} /></Route>
      <Route path="/vivint"><ProtectedRoute component={Vivint} /></Route>

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
