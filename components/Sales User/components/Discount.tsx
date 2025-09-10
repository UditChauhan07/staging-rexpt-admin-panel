import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import axios from "axios";

interface FormData {
  payment?: {
    plan: string;
    amount: number;
    discount?: number;
    interval?: string;
    duration?: string;
  };
}

interface DiscountFormProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onSubmit: (data: FormData) => void;
  onPrevious: () => void;
  onNext?: () => void;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  data,
  onUpdate,
  onSubmit,
  onPrevious,
  onNext,
}) => {
  const [discount, setDiscount] = useState<number>(data.payment?.discount || 0);
  const [interval, setInterval] = useState<string>(data.payment?.interval || "once");
  const [error, setError] = useState<string>("");
  const URL = process.env.NEXT_PUBLIC_API_URL;

  const generateRandomCode = (length: number = 10): string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  };

  const createCoupen = async (): Promise<boolean> => {
    const code = generateRandomCode(10);
    const customerId = localStorage.getItem("customerId") || "";

    try {
      const res = await axios.post(`${URL}/api/create-coupen`, {
        customerId,
        promotionCode: code,
        discountPercent: discount,
        interval,  // Send interval (once or forever)
      });

      localStorage.setItem("coupen", res?.data?.promoCode?.id);
      return true;
    } catch (error) {
      console.error("Failed to create coupon:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (discount <= 0 || discount >= 100) {
      setError("Discount must be between 1 and 99%");
      return;
    }

    if (!interval) {
      setError("Please select an interval");
      return;
    }

    setError("");

    const updatedPayment = {
      ...data.payment,
      discount,
      interval,
    };

    onUpdate({ payment: updatedPayment });

    const couponCreated = await createCoupen();

    if (couponCreated) {
      onNext?.();
    } else {
      setError("Failed to create coupon, please try again.");
    }
  };

  return (
    <StepWrapper
      step={6}
      totalSteps={7}
      title="Apply Discount"
      description="Enter discount percentage and select interval."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md">
        <Label className="font-semibold">Discount Percentage (%)</Label>
        <input
          type="number"
          min={1}
          max={99}
          step={0.1}
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value))}
          className="border p-2 rounded w-full"
          placeholder="Enter discount percent"
          required
        />

        <Label className="font-semibold">Interval</Label>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="border p-2 rounded w-full"
          required
        >
          <option value="once">Once</option>
          <option value="forever">Forever</option>
        </select>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-between">
          <Button type="button" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </StepWrapper>
  );
};

export default DiscountForm;
