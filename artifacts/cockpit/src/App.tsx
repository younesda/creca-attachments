import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { AppShell } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Finances from "./pages/Finances";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import AIPage from "./pages/AI";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

function AppRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />

      <Route path="/app" component={() => <AppRoute><Dashboard /></AppRoute>} />
      <Route path="/app/dashboard" component={() => <AppRoute><Dashboard /></AppRoute>} />
      <Route path="/app/clients" component={() => <AppRoute><Clients /></AppRoute>} />
      <Route path="/app/projects" component={() => <AppRoute><Projects /></AppRoute>} />
      <Route path="/app/tasks" component={() => <AppRoute><Tasks /></AppRoute>} />
      <Route path="/app/finances" component={() => <AppRoute><Finances /></AppRoute>} />
      <Route path="/app/invoices" component={() => <AppRoute><Invoices /></AppRoute>} />
      <Route path="/app/analytics" component={() => <AppRoute><Analytics /></AppRoute>} />
      <Route path="/app/ai" component={() => <AppRoute><AIPage /></AppRoute>} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
