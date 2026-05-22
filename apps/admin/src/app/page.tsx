import { Button } from "@watch-store/ui";

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Manage products, orders, and inventory.</p>
      <Button asChild>
        <a href="/dashboard">Go to Dashboard</a>
      </Button>
    </section>
  );
}
