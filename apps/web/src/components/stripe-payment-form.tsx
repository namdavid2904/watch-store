"use client";

import { PaymentElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { Button } from "@watch-store/ui";
import { useMemo, useState } from "react";
import { getStripe } from "@/lib/stripe";

type StripePaymentFormProps = {
  clientSecret: string;
  orderId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

const stripeAppearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#1c1917",
    colorBackground: "#faf8f5",
    colorText: "#1c1917",
    colorDanger: "#b45309",
    fontFamily: "DM Sans, system-ui, sans-serif",
    borderRadius: "6px",
  },
};

function PaymentFormInner({ orderId, onSuccess, onError }: Omit<StripePaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    const returnUrl = `${window.location.origin}/checkout/confirmation/${orderId}`;
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: returnUrl,
      },
    });
    setSubmitting(false);

    if (error) {
      onError(error.message ?? "Payment failed");
      return;
    }

    onSuccess();
  }

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <PaymentElement />
      <Button className="w-full" type="submit" disabled={!stripe || submitting} size="lg">
        {submitting ? "Processing payment..." : "Complete payment"}
      </Button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, orderId, onSuccess, onError }: StripePaymentFormProps) {
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: stripeAppearance,
    }),
    [clientSecret]
  );

  return (
    <Elements stripe={getStripe()} options={options}>
      <PaymentFormInner onError={onError} onSuccess={onSuccess} orderId={orderId} />
    </Elements>
  );
}
