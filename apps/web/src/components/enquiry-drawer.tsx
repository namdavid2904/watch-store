"use client";

import { Alert, AlertDescription, Button, Input } from "@watch-store/ui";
import { useState } from "react";
import { useCreateEnquiry } from "@/hooks/use-enquiry";

const ENQUIRY_CATEGORIES = [
  "Availability",
  "Customization",
  "Pricing",
  "Servicing",
  "General",
];

type EnquiryDrawerProps = {
  open: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
};

export function EnquiryDrawer({ open, onClose, productId, productName }: EnquiryDrawerProps) {
  const createEnquiry = useCreateEnquiry();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: productName ? `Enquiry: ${productName}` : "",
    category: ENQUIRY_CATEGORIES[0],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createEnquiry.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim() || undefined,
        subject: form.subject.trim() || undefined,
        category: form.category,
        message: form.message.trim(),
        productId,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send enquiry");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close enquiry drawer" onClick={onClose} />
      <aside className="luxury-surface relative flex h-full w-full max-w-md flex-col border-l shadow-2xl">
        <div className="border-border/60 flex items-center justify-between border-b px-6 py-5">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Concierge</p>
            <h2 className="font-serif text-2xl">Private enquiry</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {submitted ? (
            <Alert variant="success">
              <AlertDescription>
                Your enquiry has been received. Our concierge team will respond within one business day.
              </AlertDescription>
            </Alert>
          ) : (
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              {productName ? (
                <p className="text-muted-foreground text-sm">
                  Regarding: <span className="text-foreground font-medium">{productName}</span>
                </p>
              ) : null}
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input placeholder="Mobile (optional)" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <select
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {ENQUIRY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <textarea
                className="border-input bg-background min-h-32 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Tell us about your interest, sizing preferences, or customization request..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={createEnquiry.isPending}>
                {createEnquiry.isPending ? "Sending..." : "Send enquiry"}
              </Button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

export function EnquiryFab({ productId, productName }: { productId?: string; productName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground fixed bottom-6 right-6 z-40 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition hover:opacity-90"
      >
        Enquire
      </button>
      <EnquiryDrawer open={open} onClose={() => setOpen(false)} productId={productId} productName={productName} />
    </>
  );
}
