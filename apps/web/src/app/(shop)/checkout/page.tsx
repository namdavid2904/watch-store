"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input } from "@watch-store/ui";
import { useAuth } from "@/components/auth-provider";
import { useCheckout } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/catalog";

type Step = "shipping" | "review" | "payment";

const initialAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { initiate, confirm } = useCheckout();
  const [step, setStep] = useState<Step>("shipping");
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/checkout");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-muted-foreground">Preparing checkout...</p>;
  }

  const checkout = initiate.data;

  async function handleContinueToReview() {
    setError(null);
    try {
      await initiate.mutateAsync();
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
    }
  }

  async function handleConfirmOrder() {
    if (!checkout) {
      return;
    }
    setError(null);
    try {
      const result = await confirm.mutateAsync({
        checkoutId: checkout.checkoutId,
        shippingAddress: address,
      });
      router.push(`/checkout/confirmation/${result.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to confirm checkout");
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Step {step === "shipping" ? 1 : step === "review" ? 2 : 3} of 3</p>
      </div>

      {error ? <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}

      {step === "shipping" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleContinueToReview();
          }}
        >
          <h2 className="text-xl font-semibold">Shipping address</h2>
          <Input
            placeholder="Address line 1"
            value={address.line1}
            onChange={(event) => setAddress({ ...address, line1: event.target.value })}
            required
          />
          <Input
            placeholder="Address line 2 (optional)"
            value={address.line2}
            onChange={(event) => setAddress({ ...address, line2: event.target.value })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="City"
              value={address.city}
              onChange={(event) => setAddress({ ...address, city: event.target.value })}
              required
            />
            <Input
              placeholder="State / Province"
              value={address.state}
              onChange={(event) => setAddress({ ...address, state: event.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Postal code"
              value={address.postalCode}
              onChange={(event) => setAddress({ ...address, postalCode: event.target.value })}
              required
            />
            <Input
              placeholder="Country"
              value={address.country}
              onChange={(event) => setAddress({ ...address, country: event.target.value })}
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={initiate.isPending}>
              Continue to review
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cart">Back to cart</Link>
            </Button>
          </div>
        </form>
      ) : null}

      {step === "review" && checkout ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review order</h2>
          <div className="border-border space-y-3 rounded-lg border p-4">
            {checkout.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="border-border flex items-center justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatPrice(checkout.totalAmount)}</span>
            </div>
          </div>
          <div className="text-muted-foreground rounded-lg border p-4 text-sm">
            <p className="font-medium text-foreground">Ship to</p>
            <p>{address.line1}</p>
            {address.line2 ? <p>{address.line2}</p> : null}
            <p>
              {address.city}
              {address.state ? `, ${address.state}` : ""} {address.postalCode}
            </p>
            <p>{address.country}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setStep("payment")}>Continue to payment</Button>
            <Button variant="outline" onClick={() => setStep("shipping")}>
              Edit address
            </Button>
          </div>
        </div>
      ) : null}

      {step === "payment" && checkout ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Payment</h2>
          <div className="border-border rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Stripe Elements placeholder</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Payment UI will be wired in a later phase. Confirming now creates your order in pending payment status.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => void handleConfirmOrder()} disabled={confirm.isPending}>
              {confirm.isPending ? "Placing order..." : "Place order"}
            </Button>
            <Button variant="outline" onClick={() => setStep("review")}>
              Back
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
