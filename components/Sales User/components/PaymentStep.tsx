import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";

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
    raw?: {
      product: Product;
      price?: ProductPrice; // optional when custom plan
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(data.payment?.plan || "");
  const [billingInterval, setBillingInterval] = useState<Interval>(
    (data.payment?.raw?.derived?.interval as Interval) || "month"
  );
  const [customMinutes, setCustomMinutes] = useState<number>(
    data.payment?.raw?.derived?.mins ?? 20
  );
  const [loading, setLoading] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priceForInterval = (product: Product, interval: Interval) =>
    product.prices.find((p) => p.interval === interval) || null;

  const isCustomPlan = (name?: string) =>
    (name || "").trim().toLowerCase() === "custom plan";

  const formatUSD = (cents?: number) =>
    typeof cents === "number" ? `$${(cents / 100).toLocaleString("en-US")}` : "-";

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

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
    // console.log("custom",selectedProduct)

    // if (custom) {
    //   // For Custom Plan: no price, just minutes from slider
    //   onUpdate({
    //     payment: {
    //       plan: selectedProduct.id,
    //       amount: 0, // let backend compute pricing later if needed
    //       raw: {
    //         product: selectedProduct,
    //         price: undefined,
    //         derived: {
    //           amountUsd: 0,
    //           amountCents: 0,
    //           currency: "USD",
    //           interval: billingInterval,
    //           mins: customMinutes, // <-- slider minutes
    //         },
    //       },
    //     },
    //   });
    // } else {
    //   // For normal plans: use Stripe price for the selected interval
    //   const selPrice = priceForInterval(selectedProduct, billingInterval);
    //   if (!selPrice) {
    //     alert(`No ${billingInterval} price available for this plan`);
    //     return;
    //   }

    //   const amountUsd = selPrice.unit_amount / 100;
    //   const mins = selPrice.metadata ? Number(selPrice.metadata) : undefined;

    //   onUpdate({
    //     payment: {
    //       plan: selectedProduct.id,
    //       amount: amountUsd, // in USD
    //       raw: {
    //         product: selectedProduct,
    //         price: selPrice,
    //         derived: {
    //           amountUsd,
    //           amountCents: selPrice.unit_amount,
    //           currency: "USD",
    //           interval: billingInterval,
    //           mins: Number.isFinite(mins) ? mins : undefined,
    //         },
    //       },
    //     },
    //   });
    // }

    const selPrice = priceForInterval(selectedProduct, billingInterval);
    if (!selPrice) {
      alert(`No ${billingInterval} price available for this plan`);
      return;
    }

    const amountUsd = selPrice.unit_amount / 100;
    // const mins = selPrice.metadata ? Number(selPrice.metadata) : undefined;
    const mins = custom
      ? customMinutes
      : selPrice?.metadata
        ? Number(selPrice.metadata)
        : undefined;

    onUpdate({
      payment: {
        plan: selectedProduct.id,
        amount: amountUsd, // in USD
        raw: {
          product: selectedProduct,
          price: selPrice,
          derived: {
            amountUsd,
            amountCents: selPrice.unit_amount,
            currency: "USD",
            interval: billingInterval,
            mins
          },
        },
      },
    });

    onNext();
  };

  return (
    <StepWrapper
      step={4}
      totalSteps={6}
      title="Select a Product Plan"
      description="Choose the plan and billing interval that suits your needs."
    >
      {loading ? (
        <ClimbingBoxLoader />
      ) : (
        <form onSubmit={handleNext} className="space-y-6">
          {/* Top toggle: Month / Year */}
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

          {/* Plans list */}
          {products.map((product) => {
            const custom = isCustomPlan(product.name);
            const selPrice = custom ? null : priceForInterval(product, billingInterval);
            const selected = selectedPlan === product.id;

            return (
              <div
                key={product.id}
                className={`flex items-start justify-between p-4 border rounded-lg ${selected ? "ring-2 ring-blue-500" : ""
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

                    {/* Custom plan slider */}
                    {selected && custom && (
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex-1">
                          <Label className="font-medium">
                            Minutes: {customMinutes}
                          </Label>
                          <input
                            type="range"
                            min={20}
                            max={1000}
                            step={1}
                            value={customMinutes}
                            onChange={(e) =>
                              setCustomMinutes(Number(e.target.value) || 0)
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Right side for custom: show minutes */}
                        <div className="text-right min-w-[120px]">
                          <div className="text-lg font-semibold">
                            {customMinutes} <span className="text-sm">mins</span>
                          </div>
                          <div className="text-xs text-gray-500">custom</div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Right side: price in USD for normal plans */}
                {!custom && (
                  <div className="ml-4 text-right min-w-[120px]">
                    <div className="text-lg font-semibold">
                      {formatUSD(selPrice?.unit_amount)}{" "}
                      <span className="text-sm">USD</span>
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
            <Button type="submit">Next</Button>
          </div>
        </form>
      )}
    </StepWrapper>
  );
};

export default PaymentStep;
