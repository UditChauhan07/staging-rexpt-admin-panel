import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";
import Swal from "sweetalert2";

type Interval = "month" | "year";

interface ProductPrice {
  id: string;
  currency: string;
  unit_amount: number;
  interval: Interval;
  metadata?: string;
  currency_options?: any[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  amount: number;
  prices: ProductPrice[];
}

interface FormData {
  payment?: {
    plan: string;
    amount: number;
    discount?: number;
    interval?: string;
    duration?: string;
    raw?: {
      product: Product;
      price?: ProductPrice;
      derived: {
        amountUsd: number;
        amountCents: number;
        currency: string;
        interval: "month" | "year";
        mins?: number;
      };
    };
  };
}

interface PaymentStepProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onSubmit: (data: FormData) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  data,
  onUpdate,
  onSubmit,
  onNext,
  onPrevious,
}) => {
  const [activeTab, setActiveTab] = useState<"free" | "paid">("paid");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(data.payment?.plan || "");
  const [billingInterval, setBillingInterval] = useState<Interval>(
    (data.payment?.raw?.derived?.interval as Interval) || "month"
  );
  const [customMinutes, setCustomMinutes] = useState<number>(
    data.payment?.raw?.derived?.mins ?? 20
  );
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState<number>(data.payment?.discount || 0);
  const [interval, setInterval] = useState<string>(data.payment?.interval || "once");
  const [generateDisabled, setGenerateDisabled] = useState(false);
  const URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/products/admin`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const mappedProducts: Product[] = res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        amount: p.amount || 0,
        prices: (p.prices || []).map((pr: any) => ({
          id: pr.id,
          currency: pr.currency,
          unit_amount: pr.unit_amount,
          interval: pr.interval,
          metadata: pr.metadata,
          currency_options: pr.currency_options,
        })),
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const priceForInterval = (product: Product, interval: Interval) =>
    product.prices.find((p) => p.interval === interval) || null;

  const isCustomPlan = (name?: string) =>
    (name || "").trim().toLowerCase() === "custom plan";

  const formatUSD = (cents?: number) =>
    typeof cents === "number"
      ? `$${(cents / 100).toLocaleString("en-US")}`
      : "-";

  const generateRandomCode = (length: number = 10): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
        interval,
      });

      localStorage.setItem("coupen", res?.data?.promoCode?.id);
      localStorage.setItem("discount", discount.toString());
      return true;
    } catch (error) {
      console.error("Failed to create coupon:", error);
      return false;
    }
  };

  const handleGenerateCoupon = async () => {
    if (discount < 0 || discount > 100) {
      Swal.fire("Invalid Discount", "Discount must be between 0% and 100%", "error");
      return;
    }
    setGenerateDisabled(true);
    const success = await createCoupen();
    if (success) {
      Swal.fire("Coupon Created!", "Discount coupon was generated successfully.", "success");
    } else {
      Swal.fire("Error", "Failed to generate coupon, please try again.", "error");
      setGenerateDisabled(false);
    }
  };

  const handlePlanSelect = () => {
    if (!selectedPlan) {
      alert("Please select a product plan");
      return;
    }
    const selectedProduct = products.find((p) => p.id === selectedPlan);
    if (!selectedProduct) {
      alert("Selected product not found");
      return;
    }
    const custom = isCustomPlan(selectedProduct.name);
    const selPrice = priceForInterval(selectedProduct, billingInterval);
    if (!selPrice) {
      alert(`No ${billingInterval} price available for this plan`);
      return;
    }
    const amountUsd = selPrice.unit_amount / 100;
    const mins = custom
      ? customMinutes
      : selPrice?.metadata
      ? Number(selPrice.metadata)
      : undefined;

    onUpdate({
      payment: {
        plan: selectedProduct.id,
        amount: amountUsd,
        discount,
        interval,
        raw: {
          product: selectedProduct,
          price: selPrice,
          derived: {
            amountUsd,
            amountCents: selPrice.unit_amount,
            currency: "USD",
            interval: billingInterval,
            mins,
          },
        },
      },
    });
  };

  return (
    <StepWrapper
      step={4}
      totalSteps={6}
      title="Select a Product Plan"
      description="Choose the plan, apply discount, and billing interval."
    >
      {/* Tabs */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 rounded-t ${
            activeTab === "free" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("free")}
        >
          Free
        </button>
        <button
          className={`flex-1 py-2 rounded-t ${
            activeTab === "paid" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("paid")}
        >
          Paid
        </button>
      </div>

      {activeTab === "free" ? (
        <div className="text-gray-500 p-4 border rounded">Free plan logic coming soon...</div>
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center mt-10">
              <ClimbingBoxLoader />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePlanSelect();
                onNext();
              }}
              className="space-y-6"
            >
              {/* Billing interval */}
              <div className="flex items-center gap-3">
                <Label className="font-medium">Billing Interval:</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={billingInterval === "month" ? "default" : "outline"}
                    onClick={() => setBillingInterval("month")}
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={billingInterval === "year" ? "default" : "outline"}
                    onClick={() => setBillingInterval("year")}
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              {products.map((product) => {
                const custom = isCustomPlan(product.name);
                const selPrice = custom ? null : priceForInterval(product, billingInterval);
                const selected = selectedPlan === product.id;
                const baseAmount = selPrice ? selPrice.unit_amount / 100 : 0;
                const payableAmount = baseAmount - (baseAmount * discount) / 100;

                return (
                  <div
                    key={product.id}
                    className={`flex flex-col p-4 border rounded-lg ${
                      selected ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer flex-1">
                      <input
                        type="radio"
                        name="product"
                        value={product.id}
                        checked={selected}
                        onChange={() => setSelectedPlan(product.id)}
                        className="mt-1"
                      />
                      <div className="w-full">
                        <Label className="font-semibold">{product.name}</Label>
                        <p className="text-sm text-gray-600">{product.description}</p>

                        {!custom && selPrice && selected && (
                          <div className="flex items-center gap-4 mt-4">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              value={discount}
                              onChange={(e) => setDiscount(parseFloat(e.target.value))}
                              className="border p-2 rounded w-24"
                              placeholder="Discount %"
                            />
                            <select
                              value={interval}
                              onChange={(e) => setInterval(e.target.value)}
                              className="border p-2 rounded"
                            >
                              <option value="once">Once</option>
                              <option value="forever">Forever</option>
                            </select>

                            <span className="font-semibold">
                              Payable: ${payableAmount.toFixed(2)}
                            </span>

                            <Button
                              type="button"
                              onClick={handleGenerateCoupon}
                              disabled={generateDisabled}
                            >
                              Generate Coupon
                            </Button>
                          </div>
                        )}
                      </div>
                    </label>

                    {!custom && selPrice && (
                      <div className="ml-4 text-right min-w-[120px]">
                        <div className="text-lg font-semibold">
                          {formatUSD(selPrice?.unit_amount)} <span className="text-sm">USD</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          /{billingInterval === "month" ? "mo" : "yr"}
                        </div>
                        {selPrice?.metadata && (
                          <div className="text-xs text-gray-500 mt-1">
                            Included minutes: {selPrice.metadata}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between">
                <Button type="button" onClick={onPrevious}>
                  Previous
                </Button>
                <Button type="submit" disabled={!generateDisabled}>
                  Next
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </StepWrapper>
  );
};

export default PaymentStep;
