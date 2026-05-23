"use client";

import { PaymentElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@watch-store/ui";
import { useState } from "react";
import { getStripe } from "@/lib/stripe";

type StripePaymentFormProps = {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function PaymentFormInner({ onSuccess, onError }: Omit<StripePaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setSubmitting(false);

    if (error) {
      onError(error.message ?? "Payment failed");
      return;
    }

    onSuccess();
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || submitting}>
        {submitting ? "Processing payment..." : "Pay now"}
      </Button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, onSuccess, onError }: StripePaymentFormProps) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <PaymentFormInner onError={onError} onSuccess={onSuccess} />
    </Elements>
  );
}
