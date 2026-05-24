"use client";

import { Button, Input } from "@watch-store/ui";
import Link from "next/link";
import { useState } from "react";
import { useCreateEnquiry } from "@/hooks/use-enquiry";

const ENQUIRY_CATEGORIES = [
  "Availability",
  "Customization",
  "Pricing",
  "Servicing",
  "General",
];

export default function EnquirePage() {
  const createEnquiry = useCreateEnquiry();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    category: ENQUIRY_CATEGORIES[0],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send enquiry");
    }
  }

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Concierge desk</p>
        <h1 className="font-serif text-4xl font-semibold">Private enquiry</h1>
        <p className="text-muted-foreground leading-relaxed">
          Ask about availability, bespoke configurations, delivery timelines, or investment-grade timepieces
          curated for your collection.
        </p>
      </div>

      {submitted ? (
        <div className="luxury-surface space-y-4 rounded-2xl border p-8 text-center">
          <h2 className="font-serif text-2xl">Enquiry received</h2>
          <p className="text-muted-foreground text-sm">
            Our horology specialists will respond within one business day.
          </p>
          <Button asChild variant="outline">
            <Link href="/shop">Return to collection</Link>
          </Button>
        </div>
      ) : (
        <form className="luxury-surface space-y-4 rounded-2xl border p-8" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
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
            className="border-input bg-background min-h-40 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Describe your interest, preferred references, or customization request..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" size="lg" disabled={createEnquiry.isPending}>
            {createEnquiry.isPending ? "Sending..." : "Submit enquiry"}
          </Button>
        </form>
      )}
    </article>
  );
}
