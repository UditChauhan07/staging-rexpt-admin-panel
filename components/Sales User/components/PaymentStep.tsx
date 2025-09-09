import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";

interface Product {
  id: string;
  name: string;
  description: string;
  amount: number; // Add amount to track price if available
}

interface FormData {
  payment?: {
    plan: string;
    amount: number;
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
  const [loading, setLoading] = useState(false);

  const URL = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assume res.data is an array of products with amount field
      const mappedProducts = res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        amount: p.amount || 0, // Assuming API returns amount field
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      return alert("Please select a product plan");
    }

    // Find selected product details
    const selectedProduct = products.find((p) => p.id === selectedPlan);

    onUpdate({
      payment: {
        plan: selectedPlan,
        amount: selectedProduct ? selectedProduct.amount : 0,
      },
    });

    onNext();
  };

  return (
    <StepWrapper
      step={4}
      totalSteps={6}
      title="Select a Product Plan"
      description="Choose the plan that suits your needs."
    >
      {loading ? (
        <ClimbingBoxLoader />
      ) : (
        <form onSubmit={handleNext} className="space-y-6">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-3 my-2">
              <input
                type="radio"
                name="product"
                value={product.id}
                checked={selectedPlan === product.id}
                onChange={() => setSelectedPlan(product.id)}
              />
              <div>
                <Label className="font-semibold">{product.name}</Label>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-sm text-gray-800 font-medium">
                  Price: ${product.amount}
                </p>
              </div>
            </div>
          ))}

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
