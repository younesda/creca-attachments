import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import { AppShell } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Finances from "./pages/Finances";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Mock data doesn't go stale
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* App Routes wrapped in AppShell */}
      <Route path="/app" component={() => <AppShell><Dashboard /></AppShell>} />
      <Route path="/app/dashboard" component={() => <AppShell><Dashboard /></AppShell>} />
      <Route path="/app/clients" component={() => <AppShell><Clients /></AppShell>} />
      <Route path="/app/projects" component={() => <AppShell><Projects /></AppShell>} />
      <Route path="/app/tasks" component={() => <AppShell><Tasks /></AppShell>} />
      <Route path="/app/finances" component={() => <AppShell><Finances /></AppShell>} />
      <Route path="/app/invoices" component={() => <AppShell><Invoices /></AppShell>} />
      <Route path="/app/analytics" component={() => <AppShell><Analytics /></AppShell>} />
      
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
