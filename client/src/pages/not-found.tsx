import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
