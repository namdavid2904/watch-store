import { cn } from "@watch-store/ui";

type CheckoutStep = "shipping" | "review" | "payment";

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "shipping", label: "Shipping" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
];

export function CheckoutStepper({ currentStep }: { currentStep: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <ol className="grid grid-cols-3 gap-3">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step.id}
            className={cn(
              "rounded-lg border px-4 py-3 text-center transition",
              isCurrent && "border-accent bg-accent/10",
              isComplete && "border-border bg-secondary/60",
              !isCurrent && !isComplete && "border-border bg-background text-muted-foreground"
            )}
          >
            <p className="text-[10px] uppercase tracking-[0.25em]">Step {index + 1}</p>
            <p className={cn("mt-1 font-medium", isCurrent && "font-serif text-lg")}>{step.label}</p>
          </li>
        );
      })}
    </ol>
  );
}
