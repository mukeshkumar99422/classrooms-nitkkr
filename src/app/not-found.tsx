import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold mt-4">Page not found</h1>
        <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
