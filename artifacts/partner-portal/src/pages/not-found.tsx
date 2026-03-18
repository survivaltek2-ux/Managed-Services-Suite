import { Link } from "wouter";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-display font-black text-primary/20">404</h1>
        <h2 className="text-3xl font-display font-bold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full shadow-lg mt-4">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
