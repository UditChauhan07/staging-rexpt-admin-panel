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

  // Helper function to generate random 10-character string
  const generateRandomCode = (length: number = 10): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  };

  const createCoupen = async () => {
    const code = generateRandomCode(10);
    const customerId = localStorage.getItem("customerId") || "";

    try {
      const res = await axios.post(`${URL}/api/create-coupen`, {
        customerId,
        promotionCode: code,
        discountPercent: discount,
      });

      console.log("Coupon Created:", res.data);
    } catch (error) {
      console.error("Failed to create coupon:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (discount <= 0 || discount > 100) {
      setError("Discount must be between 1 and 100%");
      return;
    }

    setError("");

    const updatedPayment = {
      ...data.payment,
      discount,
    };

    onUpdate({ payment: updatedPayment });
// <<<<<<< dev_Shorya
//     onNext?.();

    
//   };

  


  const createCoupen = async()=>{
    // let res = await axios.post(``)
  }
// =======

//     // Create the coupon first
//     await createCoupen();

//     // Proceed with next step or final submit
//     onSubmit({ ...data, payment: updatedPayment });
//   };
// >>>>>>> dev_gaurav_sales 

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
