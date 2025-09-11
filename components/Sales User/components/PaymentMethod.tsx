import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import axios from "axios";
import Swal from "sweetalert2";

interface FormData {
  payment?: {
    plan: string;
    amount: number;
    discount?: number;
    method?: "instant" | "defer";
    deferDays?: number;
    raw?: any;
    product?: { name?: string };
  };
  user?: { id?: string; email?: string; name?: string };
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const URL = process.env.NEXT_PUBLIC_API_URL;
  let agentId = localStorage.getItem("agent_id")
  console.log("agentId", agentId)


  const createCheckout = async () => {
    // const origin = window.location.origin;
    // console.log("origin",origin)
    // console.log("data",data)
    try {
      let userId = data?.user?.id
      let businessName = data.business?.name
      let agentName1 = localStorage.getItem("agentName")
      let agentCode1 = localStorage.getItem("agentCode")
      const res = await axios.post(`${URL}/api/create-checkout-session-admin`, {
        customerId: localStorage.getItem("customerId"),
        priceId: data?.payment?.raw?.price?.id ,
        promotionCode: localStorage.getItem("coupen"),
        userId: userId,

        // cancelUrl: "https://staging-rexpt-admin-panel.vercel.app/", // vercel
        // cancelUrl: "http://admin.rexpt.in/", // Live 
        // cancelUrl: "http://localhost:4000/", // local
        url: `https://app.rexpt.in/thankyou/update?agentId=${agentId}&userId=${userId}&isAdmin=true`,
        cancelUrl: "https://app.rexpt.in/cancel"
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

    if (!data?.user?.email) {
      return alert("User email not found");
    }

    setError("");
    setIsLoading(true);

    const updatedPayment = {
      ...data.payment,
      method: selectedMethod,
      deferDays: selectedMethod === "defer" ? deferDays : undefined,
    };

    onUpdate({ payment: updatedPayment });

    if (selectedMethod === "instant") {
      const agentId = localStorage.getItem("agent_id");
      const userId = data?.user?.id ||localStorage.getItem("AgentForUserId");
      let businessName = data?.business?.name
      let agentName1 = localStorage.getItem("agentName")
      let agentCode1 = localStorage.getItem("agentCode")

      try {
        let checkoutUrl = "";

        if (data?.payment?.plan === "prod_SueeevC1qiAArq") {
          const res = await axios.post(`${URL}/api/tier/checkout-admin`, {
            customerId: localStorage.getItem("customerId"),
            presetUnits: data?.payment?.raw?.derived?.mins,
            minUnits: 0,
            maxUnits: 1000,
            // successUrl: `http://localhost:3001/thankyou/update?agentId=${agentId}&userId=${userId}`,
            // cancelUrl:
            //   "http://localhost/phpmyadmin/index.php?route=/sql&pos=0&db=rexpt&table=endusers",
            userId,
            priceId: data?.payment?.raw?.price?.id,
            promoCode: localStorage.getItem("coupen"),
            successUrl: `https://app.rexpt.in/thankyou/update?agentId=${agentId}&userId=${userId}&isAdmin=true&agentName=${agentName1}&agentCode=${agentCode1}&businessName=${businessName}`,
            // successUrl: `http://localhost:3000/thankyou/update?agentId=${agentId}&userId=${userId}&isAdmin=true&agentName=${agentName1}&agentCode=${agentCode1}&businessName=${businessName}`,
            cancelUrl:
              "https://app.rexpt.in/cancel",

          });

          checkoutUrl = res?.data?.url;
        } else {
          const res = await axios.post(`${URL}/api/create-checkout-session-admin`, {
            customerId: localStorage.getItem("customerId"),
            priceId: data?.payment?.raw?.price?.id,
            promotionCode: localStorage.getItem("coupen"),
            userId,
            // url: `http://localhost:3000/thankyou/update?agentId=${agentId}&userId=${userId}&isAdmin=true&agentName=${agentName1}&agentCode=${agentCode1}&businessName=${businessName}`,
            url: `https://app.rexpt.in/thankyou/update?agentId=${agentId}&userId=${userId}&isAdmin=true&agentName=${agentName1}&agentCode=${agentCode1}&businessName=${businessName}`,

            cancelUrl:
              "https://app.rexpt.in/cancel",
          });

          checkoutUrl = res?.data?.url || res?.data?.checkoutUrl;
        }
let discount = localStorage.getItem("discount")
        if (checkoutUrl) {
          await axios.post(`${URL}/api/sendCheckoutMail`, {
            email: data.user.email,
            checkoutUrl,
            Name: data?.user?.name,
            Plan: data?.payment?.raw?.product?.name,
           Price: data?.payment?.amount * (1 - discount / 100) ,
            agent_name: localStorage.getItem("agentName"),
        
          });

          Swal.fire({
            icon: "success",
            title: "Email Sent",
            text: "Checkout URL has been sent successfully to your email.",
          });
        } else {
          throw new Error("Checkout URL missing in response");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to process checkout. Please try again.");
      }
    }

    if (selectedMethod === "defer") {
      alert("Coming Soon")
      return
    }

    setIsLoading(false);
    onSubmit({ ...data, payment: updatedPayment });
  };

  return (
    <StepWrapper
      step={5}
      totalSteps={6}
      title="Select Payment Method"
      description="Choose how you would like to pay."
    >
      <div className="flex flex-col items-center space-y-6 w-full max-w-lg mx-auto pt-0 p-4">
        {/* Payment Options */}
        <div className="flex w-full gap-6">
          <Button
            type="button"
            className={`flex-1 h-32 text-xl font-semibold ${selectedMethod === "instant" ? "ring-4 ring-blue-500" : ""
              }`}
            onClick={() => setSelectedMethod("instant")}
          >
            💳 Instant Payment
          </Button>

          {/* <Button
            type="button"
            variant="outline"
            className={`flex-1 h-32 text-xl font-semibold ${selectedMethod === "defer" ? "ring-4 ring-blue-500" : ""
              }`}
            onClick={() => setSelectedMethod("defer")}
          >
            ⏳ Defer Payment
          </Button> */}
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
          <Button type="button" onClick={onPrevious} disabled={isLoading}>
            Previous
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Sending..." : "Submit"}
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
};

export default PaymentMethod;
