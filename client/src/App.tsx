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
    
    // Special handling for direct access on Netlify
    const handleNetlifyDirectAccess = () => {
      // Check if this is a direct access URL (no hash) on Netlify
      // If accessing a path like /notes/123 directly on Netlify (or any static host)
      // we should replace it with a hash route
      const pathname = window.location.pathname;
      if (pathname !== '/' && !window.location.hash) {
        // Store the path for navigation after redirect
        sessionStorage.setItem('redirectPath', pathname);
        // Redirect to the root with the hash
        window.location.replace(`${window.location.origin}/#${pathname}`);
        return true;
      }
      return false;
    };
    
    // If we handled a direct Netlify access, no need to continue
    if (handleNetlifyDirectAccess()) {
      return;
    }
    
    // Determine base path for subdomain routing
    const getBasePath = () => {
      // Get the URL pathname
      let pathname = window.location.pathname;
      
      // If pathname is not just '/', use it as the base
      if (pathname !== '/' && !pathname.endsWith('.html')) {
        // Make sure it ends with a slash
        if (!pathname.endsWith('/')) {
          pathname += '/';
        }
        return pathname;
      }
      
      return '/';
    };
    
    const base = getBasePath();
    
    // Check if we were redirected from a 404 page
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      // Convert the path to a hash-based route
      const hashPath = "#" + redirectPath;
      // Clear the stored path
      sessionStorage.removeItem('redirectPath');
      // Update the URL to use the hash
      window.location.hash = hashPath;
    } 
    // Set initial hash if none exists (for GitHub Pages compatibility)
    else if (!window.location.hash) {
      window.location.hash = "#/";
    }
    
    // Handle hash changes for deep linking
    const handleHashChange = () => {
      setForceUpdate({});
    };
    
    // Store the base path in localStorage for consistency
    localStorage.setItem('forgeNotesBasePath', base);
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Use the currentPath from hash
  const currentPath = window.location.hash.replace('#', '') || '/';
  
  // Wouter's Switch doesn't accept a base prop, so we'll adapt our routing approach
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
