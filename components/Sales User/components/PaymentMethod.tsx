import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";

interface FormData {
  payment?: {
    plan: string;
    amount: number;
    discount?: number;
    method?: "instant" | "defer";
    deferDays?: number;
  };
}

interface PaymentMethodProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onSubmit: (data: FormData) => void;
  onPrevious: () => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  data,
  onUpdate,
  onSubmit,
  onPrevious,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<"instant" | "defer" | null>(
    data.payment?.method ?? null
  );
  const [deferDays, setDeferDays] = useState<number>(data.payment?.deferDays || 0);
  const [error, setError] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (selectedMethod === "defer" && (!deferDays || deferDays <= 0)) {
      setError("Please enter valid defer days.");
      return;
    }

    setError("");

    const updatedPayment = {
      ...data.payment,
      method: selectedMethod,
      deferDays: selectedMethod === "defer" ? deferDays : undefined,
    };

    onUpdate({ payment: updatedPayment });
    onSubmit({ ...data, payment: updatedPayment });
  };

  return (
    <StepWrapper
      step={6}
      totalSteps={6}
      title="Select Payment Method"
      description="Choose how you would like to pay."
    >
      <div className="flex flex-col items-center space-y-6 w-full max-w-lg mx-auto pt-0 p-4">
        {/* Options */}
        <div className="flex w-full gap-6">
          <Button
            type="button"
            className={`flex-1 h-32 text-xl font-semibold ${
              selectedMethod === "instant" ? "ring-4 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedMethod("instant")}
          >
            💳 Instant Payment
          </Button>

          <Button
            type="button"
            variant="outline"
            className={`flex-1 h-32 text-xl font-semibold ${
              selectedMethod === "defer" ? "ring-4 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedMethod("defer")}
          >
            ⏳ Defer Payment
          </Button>
        </div>

        {/* Extra field for defer */}
        {selectedMethod === "defer" && (
          <div className="w-full space-y-2">
            <Label>Enter number of days to defer</Label>
            <input
              type="number"
              min={1}
              value={deferDays}
              onChange={(e) => setDeferDays(Number(e.target.value))}
              className="border p-2 rounded w-full"
              placeholder="e.g. 7"
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex justify-between w-full mt-6">
          <Button type="button"  onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
};

export default PaymentMethod;
