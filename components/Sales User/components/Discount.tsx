import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";

interface FormData {
  payment?: {
    plan: string;
    amount: number;
    discount?: number;
  };
}

interface DiscountFormProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onSubmit: (data: FormData) => void;
  onPrevious: () => void;
  onNext?: () => void; // 👈 allow page to control step forward
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  data,
  onUpdate,
  onSubmit,
  onPrevious,
  onNext,
}) => {
  const [discount, setDiscount] = useState<number>(data.payment?.discount || 0);
  const [error, setError] = useState<string>("");
 const URL = process.env.NEXT_PUBLIC_API_URL;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (discount <= 0 || discount > 100) {
      setError("Discount must be between 1 and 100%");
      return;
    }

    setError("");

    // Update form data with discount
    const updatedPayment = {
      ...data.payment,
      discount,
    };

    onUpdate({ payment: updatedPayment });
    onNext?.();

    
  };

  


  const createCoupen = async()=>{
    // let res = await axios.post(``)
  }

  return (
    <StepWrapper
      step={5}
      totalSteps={6}
      title="Apply Discount"
      description="Enter a percentage discount to apply."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md">
        <Label className="font-semibold">Discount Percentage (%)</Label>
        <input
          type="number"
          min={1}
          max={100}
          step={0.1}
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value))}
          className="border p-2 rounded w-full"
          placeholder="Enter discount percent"
        />

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
