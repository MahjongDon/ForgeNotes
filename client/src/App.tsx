import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect } from "react";
import { useState } from "react";

// For the static site, we use a simple router - hash-based navigation is handled at the link level
function Router() {
  // Force initial re-render after component mounts to make sure we 
  // handle hash-based URLs properly
  const [, setForceUpdate] = useState({});
  
  useEffect(() => {
    // This ensures our router takes into account any hash in the URL on initial load
    setForceUpdate({});
    
    // Set initial hash if none exists (for GitHub Pages compatibility)
    if (!window.location.hash && window.location.pathname === "/") {
      window.location.hash = "#/";
    }
    
    // Handle hash changes for deep linking
    const handleHashChange = () => {
      setForceUpdate({});
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
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
    localStorage.setItem('forgeNotesVersion', '1.0.1');
  }, []);
  
  // Hydration effect to ensure proper loading
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Mark as hydrated after initial render
    setIsHydrated(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isHydrated ? (
        <>
          <Router />
          <Toaster />
        </>
      ) : (
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="text-xl font-semibold">Loading ForgeNotes...</div>
        </div>
      )}
    </QueryClientProvider>
  );
}

export default App;
