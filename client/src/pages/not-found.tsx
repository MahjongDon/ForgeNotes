import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function NotFound() {
  const [basePath, setBasePath] = useState('/');
  
  useEffect(() => {
    // Try to get the base path from localStorage (set in App.tsx)
    const storedBasePath = localStorage.getItem('forgeNotesBasePath');
    if (storedBasePath) {
      setBasePath(storedBasePath);
    } else {
      // Fallback to determining it from current URL
      let pathname = window.location.pathname;
      if (pathname !== '/' && !pathname.endsWith('.html')) {
        if (!pathname.endsWith('/')) {
          pathname += '/';
        }
        setBasePath(pathname);
      }
    }
  }, []);
  
  const handleReturnHome = () => {
    // Navigate to the base path with the hash
    window.location.href = `${window.location.origin}${basePath}#/`;
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border shadow-md animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive animate-pulse-once" />
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <p className="mt-2 text-xs text-muted-foreground">
            Current path: {window.location.pathname}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AnimatedButton 
            variant="ghost" 
            size="sm"
            className="gap-2"
            onClick={() => window.location.reload()}
            rippleEffect={true}
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </AnimatedButton>
          
          <AnimatedButton 
            variant="outline" 
            className="gap-2"
            onClick={handleReturnHome}
            rippleEffect={true}
            hoverScale={true}
          >
            <Home className="h-4 w-4" />
            Return Home
          </AnimatedButton>
        </CardFooter>
      </Card>
    </div>
  );
}
