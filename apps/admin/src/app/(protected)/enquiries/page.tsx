"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EnquiryStatus } from "@watch-store/api-client";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatDate } from "@/lib/format";

const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED"];

export default function EnquiriesPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();

  const enquiriesQuery = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: () => client.listEnquiries(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) => client.updateEnquiryStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">Customer contact form inbox</p>
      </div>

      <div className="space-y-4">
        {enquiriesQuery.data?.map((enquiry) => (
          <article key={enquiry.id} className="border-border rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{enquiry.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {enquiry.email}
                  {enquiry.mobile ? ` · ${enquiry.mobile}` : ""}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{formatDate(enquiry.createdAt)}</p>
              </div>
              <select
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                value={enquiry.status}
                onChange={(event) =>
                  updateStatus.mutate({ id: enquiry.id, status: event.target.value as EnquiryStatus })
                }
              >
                {ENQUIRY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-sm">{enquiry.message}</p>
          </article>
        ))}

        {!enquiriesQuery.isLoading && enquiriesQuery.data?.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border p-6 text-center">No enquiries yet.</p>
        ) : null}
      </div>
    </section>
  );
}
