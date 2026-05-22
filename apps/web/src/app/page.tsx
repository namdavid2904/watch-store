import { Button } from "@watch-store/ui";

export default function HomePage() {
  return (
    <section className="space-y-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Premium Timepieces</h1>
      <p className="text-muted-foreground mx-auto max-w-xl text-lg">
        Discover automatic, quartz, and manual watches from the world&apos;s finest brands.
      </p>
      <Button asChild>
        <a href="/shop">Browse Collection</a>
      </Button>
    </section>
  );
}
