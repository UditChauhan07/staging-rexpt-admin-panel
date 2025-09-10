import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";

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

  console.log(data?.payment?.raw?.price?.id)
  const [selectedMethod, setSelectedMethod] = useState<"instant" | "defer" | null>(
    data.payment?.method ?? null
  );
  const [deferDays, setDeferDays] = useState<number>(data.payment?.deferDays || 0);
  const [error, setError] = useState<string>("");

  const URL = process.env.NEXT_PUBLIC_API_URL;

  const createCheckout = async () => {
    try {
      const res = await axios.post(`${URL}/api/create-checkout-session-admin`, {
        customerId: localStorage.getItem("customerId"),
        priceId: data?.payment?.raw?.price?.id,
        promotionCode: localStorage.getItem("coupen"),
        userId: localStorage.getItem("userId"),
        url: "http://localhost:3001/thankyou/update?agentId=agent_f2228a557e38e4a249de98f021&userId=RXX3SY1757416196",
        cancelUrl: "http://localhost/phpmyadmin/index.php?route=/sql&pos=0&db=rexpt&table=endusers",
      });

      console.log("Checkout session created:", res.data);
    } catch (err) {
      console.error("Failed to create checkout session:", err);
      throw new Error("Checkout session creation failed");
    }
  };

  const handleSubmit = async () => {
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

    // If Instant Payment, call checkout API before proceeding
    if (selectedMethod === "instant") {
      try {
        await createCheckout();
      } catch (error) {
        return alert("Failed to create checkout session. Please try again.");
      }
    }

    onUpdate({ payment: updatedPayment });
    onSubmit({ ...data, payment: updatedPayment });
  };

  return (
    <StepWrapper
      step={7}
      totalSteps={7}
      title="Select Payment Method"
      description="Choose how you would like to pay."
    >
      <div className="flex flex-col items-center space-y-6 w-full max-w-lg mx-auto pt-0 p-4">
        {/* Payment Options */}
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

        {/* Defer Days Input */}
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

        {/* Action Buttons */}
        <div className="flex justify-between w-full mt-6">
          <Button type="button" onClick={onPrevious}>
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
