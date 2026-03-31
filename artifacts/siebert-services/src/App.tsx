import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import ZoomPartner from "./pages/ZoomPartner";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Quote from "./pages/Quote";
import Portal from "./pages/Portal";
import Admin from "./pages/Admin";
import ProposalView from "./pages/ProposalView";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Privacy from "./pages/Privacy";
import ExtremeNetworks from "./pages/ExtremeNetworks";
import HP from "./pages/HP";
import Dell from "./pages/Dell";
import JuniperNetworks from "./pages/JuniperNetworks";
import InternetPlans from "./pages/InternetPlans";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function PublicRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/zoom" component={ZoomPartner} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/quote" component={Quote} />
        <Route path="/portal" component={Portal} />
        <Route path="/internet-plans" component={InternetPlans} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/proposal/:number" component={ProposalView} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/extreme-networks" component={ExtremeNetworks} />
        <Route path="/hp" component={HP} />
        <Route path="/dell" component={Dell} />
        <Route path="/juniper-networks" component={JuniperNetworks} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/admin" component={Admin} />
            <Route>
              <PublicRouter />
            </Route>
          </Switch>
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
