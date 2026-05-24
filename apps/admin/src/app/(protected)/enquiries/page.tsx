"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EnquiryStatus } from "@watch-store/api-client";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from "@watch-store/ui";
import { useState } from "react";
import { useAdminClient } from "@/hooks/use-admin-client";
import { formatDate } from "@/lib/format";

const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED"];
const ENQUIRY_CATEGORIES = ["Availability", "Customization", "Pricing", "Servicing", "General"];

export default function EnquiriesPage() {
  const client = useAdminClient();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [newTag, setNewTag] = useState("");

  const enquiriesQuery = useQuery({
    queryKey: ["admin", "enquiries", statusFilter, categoryFilter],
    queryFn: () =>
      client.listEnquiries(
        statusFilter || undefined,
        categoryFilter || undefined
      ),
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "enquiries", selectedId],
    queryFn: () => client.getEnquiry(selectedId!),
    enabled: Boolean(selectedId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) =>
      client.updateEnquiryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
    },
  });

  const addReply = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => client.addEnquiryReply(id, body),
    onSuccess: () => {
      setReplyBody("");
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries", selectedId] });
    },
  });

  const addTag = useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) => client.addEnquiryTag(id, tag),
    onSuccess: () => {
      setNewTag("");
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries", selectedId] });
    },
  });

  const removeTag = useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) => client.removeEnquiryTag(id, tag),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "enquiries", selectedId] }),
  });

  return (
    <section className="space-y-8">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Concierge ops</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Enquiry inbox</h1>
        <p className="text-muted-foreground mt-1 text-sm">Triage, tag, and respond to client inquiries</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | "")}
        >
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {ENQUIRY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="luxury-surface border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0 px-4 pb-4">
            {enquiriesQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : enquiriesQuery.data?.length === 0 ? (
              <p className="text-muted-foreground p-4 text-sm">No enquiries match your filters.</p>
            ) : (
              enquiriesQuery.data?.map((enquiry) => (
                <button
                  key={enquiry.id}
                  type="button"
                  onClick={() => setSelectedId(enquiry.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selectedId === enquiry.id ? "border-accent bg-muted/30" : "border-border hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{enquiry.subject ?? enquiry.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {enquiry.email} · {formatDate(enquiry.createdAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">{enquiry.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{enquiry.message}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Detail & response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedId ? (
              <p className="text-muted-foreground text-sm">Select an enquiry to view the thread.</p>
            ) : detailQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : detailQuery.data ? (
              <>
                <div className="space-y-2">
                  <p className="font-medium">{detailQuery.data.name}</p>
                  <p className="text-muted-foreground text-sm">{detailQuery.data.email}</p>
                  {detailQuery.data.category ? (
                    <Badge variant="outline">{detailQuery.data.category}</Badge>
                  ) : null}
                  <select
                    className="border-input bg-background mt-2 h-9 rounded-md border px-2 text-sm"
                    value={detailQuery.data.status}
                    onChange={(e) =>
                      updateStatus.mutate({
                        id: detailQuery.data.id,
                        status: e.target.value as EnquiryStatus,
                      })
                    }
                  >
                    {ENQUIRY_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm leading-relaxed">{detailQuery.data.message}</p>

                <div className="flex flex-wrap gap-2">
                  {detailQuery.data.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                      onClick={() => removeTag.mutate({ id: detailQuery.data.id, tag })}
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!newTag.trim()}
                    onClick={() => addTag.mutate({ id: detailQuery.data.id, tag: newTag.trim() })}
                  >
                    Tag
                  </Button>
                </div>

                <ul className="divide-border/60 max-h-48 space-y-3 overflow-y-auto divide-y text-sm">
                  {detailQuery.data.replies.map((reply) => (
                    <li key={reply.id} className="pt-3 first:pt-0">
                      <p className="font-medium">{reply.adminName}</p>
                      <p className="text-muted-foreground text-xs">{formatDate(reply.createdAt)}</p>
                      <p className="mt-1">{reply.body}</p>
                    </li>
                  ))}
                </ul>

                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Compose a reply..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
                <Button
                  disabled={!replyBody.trim() || addReply.isPending}
                  onClick={() => addReply.mutate({ id: detailQuery.data.id, body: replyBody.trim() })}
                >
                  Send reply
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
