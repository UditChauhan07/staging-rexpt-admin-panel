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
  onAgentPaymentStatus: () => void;
  onSuccess: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  data,
  onUpdate,
  onSubmit,
  onNext,
  onPrevious,
  onAgentPaymentStatus,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<"free" | "paid">("paid");
  console.log(activeTab)
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(data.payment?.plan || "");
  const [branding, setBranding] = useState()
  const [billingInterval, setBillingInterval] = useState<Interval>(
    (data.payment?.raw?.derived?.interval as Interval) || "month"
  );
  const [customMinutes, setCustomMinutes] = useState<number>(data.payment?.raw?.derived?.mins ?? 20);
  const [discount, setDiscount] = useState<number>(data.payment?.discount || 0);
  const [interval, setInterval] = useState<string>(data.payment?.interval || "once");
  const [generateDisabled, setGenerateDisabled] = useState(false);
  const [isCouponGenerated, setIsCouponGenerated] = useState(false);
  const URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const agentId = localStorage.getItem("agent_id");
  const [formData, setFormData] = useState({
    freeMinutes: "",
    planType: "free",
  });
  const [loading, setLoading] = useState(false);

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
    if (discount <= 0 || discount > 100) {
      Swal.fire("Invalid Discount", "Discount must be between 0 and 100%", "error");
      return;
    }
    setGenerateDisabled(true);
    const success = await createCoupen();
    if (success) {
      Swal.fire("Coupon Created!", "Discount coupon was generated successfully.", "success");
      setIsCouponGenerated(true);
    } else {
      Swal.fire("Error", "Failed to generate coupon, please try again.", "error");
      setGenerateDisabled(false);
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);

    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }

    setDiscount(value);
    if (value === 0) {
      setIsCouponGenerated(false);
      setGenerateDisabled(true);
    } else {
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

  const handleSubmit = async () => {
    if (formData.planType === "free" && formData.freeMinutes) {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to update free minutes to ${formData.freeMinutes}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6D28D9",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, update it!",
      });

      if (result.isConfirmed) {
        try {
          setLoading(true);
          const res = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/api/agent/updateSalesUserAgentMinutes`,
            {
              agentId,
              mins: Number(formData.freeMinutes),
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Free minutes updated successfully ",
            confirmButtonColor: "#6D28D9",
          });
          onAgentPaymentStatus()
          onSuccess()
        } catch (error) {
          console.error("Error while adding free minutes", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong ❌",
            confirmButtonColor: "#EF4444",
          });
        } finally {
          setLoading(false);
        }
      }
    }
  };
  useEffect(() => {

    onUpdate({
      paymentType: {
        planType: activeTab
      },
    });
  }, [activeTab])
  return (
    <StepWrapper
      step={4}
      totalSteps={6}
      title="Select a Product Plan"
      description="Choose the plan, apply discount, and billing interval."
    >
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 rounded-t ${activeTab === "free" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("free")}
        >
          Free
        </button>
        <button
          className={`flex-1 py-2 rounded-t ${activeTab === "paid" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("paid")}
        >
          Paid
        </button>
      </div>

      {activeTab === "free" ? (
        <div className="mt-4 rounded-2xl border p-4 shadow-sm">
          <label className="block mb-2 font-medium text-gray-800">
            Free Minutes <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={formData.freeMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                freeMinutes: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-300 px-3 py-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 outline-none transition"
            placeholder="Enter number of free minutes"
          />
          <br /><br />
          {/* <div className="flex items-center justify-between p-4 border rounded-2xl shadow-sm">
            <label
              htmlFor="callRecordingToggle"
              className="font-medium text-gray-800"
            >
              Rexpt Branding
            </label>

            <button
              type="button"
              onClick={() => setBranding(!branding)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${branding ? "bg-purple-600" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${branding ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div> */}
          <button
            onClick={handleSubmit}
            disabled={!formData.freeMinutes || loading}
            className={`mt-4 w-full rounded-xl px-4 py-2 font-medium text-white transition ${!formData.freeMinutes || loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            {loading ? "Saving..." : "Save Free Minutes"}
          </button>
        </div>
      ) : loading ? (
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
                className={`flex flex-col p-4 border rounded-lg ${selected ? "ring-2 ring-blue-500" : ""
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
                          onChange={handleDiscountChange}
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
                          disabled={discount <= 0 || isCouponGenerated}
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
            <Button type="submit" disabled={discount > 0 && !isCouponGenerated}>
              Next
            </Button>
          </div>
        </form>
      )}
    </StepWrapper>
  );
};

export default PaymentStep;
