import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import StepWrapper from "./StepWrapper";

interface FormData {
  payment?: {
    plan: string;
    amount: number;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
}

interface PaymentStepProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onSubmit: (data: FormData) => void;
  onPrevious: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ data, onUpdate, onSubmit, onPrevious }) => {
  const [paymentData, setPaymentData] = useState<FormData["payment"]>(
    data.payment || { plan: "basic", amount: 10, cardNumber: "", expiry: "", cvv: "" }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!paymentData.cardNumber?.trim() || paymentData.cardNumber.length !== 16)
      newErrors.cardNumber = "Valid 16-digit card number is required";
    if (!paymentData.expiry?.trim() || !/^\d{2}\/\d{2}$/.test(paymentData.expiry))
      newErrors.expiry = "Valid expiry (MM/YY) is required";
    if (!paymentData.cvv?.trim() || paymentData.cvv.length !== 3)
      newErrors.cvv = "Valid 3-digit CVV is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onUpdate({ payment: paymentData });
    onSubmit({ ...data, payment: paymentData });
  };

  return (
    <StepWrapper step={4} totalSteps={4} title="Payment Details" description="Enter payment information to complete onboarding.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number <span className="text-red-500">*</span></Label>
            <Input
              id="cardNumber"
              value={paymentData.cardNumber}
              onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
              placeholder="Enter 16-digit card number"
            />
            {errors.cardNumber && <p className="text-sm text-red-600">{errors.cardNumber}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date <span className="text-red-500">*</span></Label>
            <Input
              id="expiry"
              value={paymentData.expiry}
              onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
              placeholder="MM/YY"
            />
            {errors.expiry && <p className="text-sm text-red-600">{errors.expiry}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV <span className="text-red-500">*</span></Label>
            <Input
              id="cvv"
              value={paymentData.cvv}
              onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
              placeholder="Enter 3-digit CVV"
            />
            {errors.cvv && <p className="text-sm text-red-600">{errors.cvv}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
            Complete Onboarding
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
};

export default PaymentStep;