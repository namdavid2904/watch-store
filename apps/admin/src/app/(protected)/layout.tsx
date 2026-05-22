import { AdminAuthGuard } from "@/components/admin-auth-guard";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <aside className="w-56 border-r p-4">
          <h1 className="mb-6 text-lg font-semibold">Admin</h1>
          <nav className="flex flex-col gap-2 text-sm">
            <a href="/dashboard">Dashboard</a>
            <a href="/products">Products</a>
            <a href="/orders">Orders</a>
            <a href="/inventory">Inventory</a>
            <a href="/enquiries">Enquiries</a>
            <a href="/login">Sign out</a>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
