import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect } from "react";

// For the static site, we only need basic routing which is already handled by wouter
function Router() {
  // This simplified approach works well for our single-page app
  // In a static environment, all routing is handled client-side
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set app version in localStorage for cache-busting
  useEffect(() => {
    localStorage.setItem('forgeNotesVersion', '1.0.0');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
