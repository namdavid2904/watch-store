"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from "@watch-store/ui";
import { useAuth } from "@/components/auth-provider";
import { CheckoutStepper } from "@/components/checkout-stepper";
import { StripePaymentForm } from "@/components/stripe-payment-form";
import { useCheckout } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/catalog";

type Step = "shipping" | "review" | "payment";

type ConfirmedOrder = {
  orderId: string;
  clientSecret: string;
};

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
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/checkout");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
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

      if (!result.paymentClientSecret) {
        throw new Error("Payment could not be initialized");
      }

      setConfirmedOrder({
        orderId: result.orderId,
        clientSecret: result.paymentClientSecret,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to confirm checkout");
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3 border-b pb-6">
        <Badge variant="accent">Secure checkout</Badge>
        <h1 className="font-serif text-4xl font-semibold">Complete your acquisition</h1>
        <p className="text-muted-foreground max-w-2xl">
          Your timepiece is reserved while you complete shipping and payment. All transactions are processed securely via Stripe.
        </p>
      </div>

      <CheckoutStepper currentStep={step} />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Checkout issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {step === "shipping" ? (
            <Card>
              <CardHeader>
                <CardTitle>Shipping address</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleContinueToReview();
                  }}
                >
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
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" disabled={initiate.isPending}>
                      {initiate.isPending ? "Reserving inventory..." : "Continue to review"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/cart">Back to cart</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {step === "review" && checkout ? (
            <Card>
              <CardHeader>
                <CardTitle>Review order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground rounded-lg border bg-secondary/40 p-4 text-sm leading-relaxed">
                  <p className="text-foreground font-medium">Ship to</p>
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>
                    {address.city}
                    {address.state ? `, ${address.state}` : ""} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setStep("payment")}>Continue to payment</Button>
                  <Button variant="outline" onClick={() => setStep("shipping")}>
                    Edit address
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === "payment" && checkout ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {confirmedOrder ? (
                  <div className="space-y-4 rounded-lg border bg-secondary/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm">Secure payment via Stripe</p>
                      <Badge variant="outline">Test Mode</Badge>
                    </div>
                    <StripePaymentForm
                      clientSecret={confirmedOrder.clientSecret}
                      orderId={confirmedOrder.orderId}
                      onError={(message) => setError(message)}
                      onSuccess={() => router.push(`/checkout/confirmation/${confirmedOrder.orderId}`)}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Confirm your order to reserve inventory, then complete payment. Use test card <span className="font-mono">4242 4242 4242 4242</span> in Stripe Test Mode.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => void handleConfirmOrder()} disabled={confirm.isPending}>
                        {confirm.isPending ? "Creating order..." : "Confirm order"}
                      </Button>
                      <Button variant="outline" onClick={() => setStep("review")}>
                        Back
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkout ? (
                <>
                  <div className="space-y-3 text-sm">
                    {checkout.items.map((item) => (
                      <div key={item.productId} className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground">
                          {item.productName} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-border flex items-center justify-between border-t pt-4">
                    <span className="font-medium uppercase tracking-[0.15em]">Total</span>
                    <span className="font-serif text-2xl">{formatPrice(checkout.totalAmount)}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Order details appear after shipping step.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
