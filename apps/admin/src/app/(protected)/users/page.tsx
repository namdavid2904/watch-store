"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatDate } from "@/lib/format";

export default function UsersPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => client.listUsers(),
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "CUSTOMER" | "ADMIN" }) =>
      client.updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage customer and admin roles</p>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.data?.map((user) => (
              <tr key={user.id} className="border-border border-t">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <select
                    className="border-input bg-background h-9 rounded-md border px-2"
                    value={user.role}
                    onChange={(event) =>
                      updateRole.mutate({
                        userId: user.id,
                        role: event.target.value as "CUSTOMER" | "ADMIN",
                      })
                    }
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
