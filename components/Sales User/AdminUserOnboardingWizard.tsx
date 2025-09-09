"use client";

import React, { useState, useEffect } from "react";
import UserCreationStep from "./components/UserCreationStep";
import BusinessDetailsStep from "./components/BusinessDetailsStep";
import AgentCreationStep from "./components/AgentCreationStep";
import PaymentStep from "./components/PaymentStep";
import axios from "axios";
import DiscountForm from "./components/Discount";
import PaymentMethod from "./components/PaymentMethod";

interface FormData {
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    referalName: string;
    password: string;
  };
  business?: {
    id: string;
    type: string;
    subtype: string;
    icon: string;
    name: string;
    size: string;
    services: string[];
    customServices: string[];
    email: string;
    address: string;
    phone: string;
    website: string;
    googleBusiness: string;
    about: string;
    addressComponents: any[];
  };
  payment?: {
    plan: string;
    amount: number;
    discount?: number;
    method?: "instant" | "defer";
  };
}

const AdminUserOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [users, setUsers] = useState<FormData["user"][]>([]);
  const [businesses, setBusinesses] = useState<FormData["business"][]>([]);
  const [editingUser, setEditingUser] = useState<FormData["user"] | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<FormData["business"] | null>(null);

  const customerId = localStorage.getItem("customerId") || "";

  const URL = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  const handleUpdate = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const agentCreationFinal = async (finalData: any) => {
    // const finalData = {
    //   customer_id: "cus_T1OnUkWZ3qEyyO",   // ✅ fill with real values
    //   plan_details: {
    //     id: "price_starter_001",
    //     name: "Starter",
    //     desc: "Basic monthly plan",
    //     amount: 29.99,
    //     currency: "USD",
    //     interval: "month",
    //     created: new Date().toISOString(),
    //     end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    //     mins: 600,
    //     original_plan_amount: 29.99,
    //   },
    //   agent_id: "agent_232733fa6fbf8f6942e4f15508",
    //   user_id: "user_12345",
    //   defer_days: 7, // example: 7 days defer
    // };
    try {
      const res = await axios.post(
        `${URL}/api/admin-static-defer-payment`,
        finalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // check if API returned success:true
      if (res.data && res.data.success) {
        console.log("✅ Subscription created");

        // you can also access res.data.id or res.data.data.subscription_id
        return true; // signal success
      } else {
        console.warn("⚠️ Subscription creation failed:", res.data);
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to create agent", error);
      return false;
    }
  };


  const handleSubmit = async (data: FormData) => {
    console.log("Final Form Data:", data);
    const finalData = {
      customer_id: customerId || "byAdmin", // from user step
      plan_details: {
        id: data.payment?.raw?.price?.id || "price_static_001",
        name: data.payment?.raw?.product?.name || "Starter",
        desc: data.payment?.raw?.product?.description || "Basic plan",
        amount: data.payment?.raw?.derived?.amountUsd || data.payment?.amount || 0,
        currency: data.payment?.raw?.derived?.currency || "USD",
        interval: data.payment?.raw?.derived?.interval || "month",
        created: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        mins: data.payment?.raw?.derived?.mins || 0,
        original_plan_amount: data.payment?.raw?.derived?.amountUsd || 0,
      },
      agent_id: data.agent?.id || "agent_static_id",
      user_id: data.user?.id || "user_static_id",
      defer_days: data.payment?.method === "defer" ? 7 : 0, // fallback
    };
    console.log("finalData", finalData)
    alert("Onboarding completed!");
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails`);
      setBusinesses(response.data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBusinesses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {step === 1 && (
        <UserCreationStep
          data={formData}
          onUpdate={handleUpdate}
          onNext={handleNext}
          editingUser={editingUser}
          fetchUsers={fetchUsers}
        />
      )}
      {step === 2 && (
        <BusinessDetailsStep
          data={formData}
          onUpdate={handleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
          editingBusiness={editingBusiness}
          fetchBusinesses={fetchBusinesses}
        />
      )}
      {step === 3 && (
        <AgentCreationStep
          data={formData}
          onUpdate={handleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
      {step === 4 && (
        <PaymentStep
          data={formData}
          onUpdate={handleUpdate}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
      {step === 5 && (
        <DiscountForm
          data={formData}
          onUpdate={handleUpdate}
          // onSubmit={handleSubmit}
          onNext={handleNext}
          onPrevious={handlePrevious}

        />
      )}
      {step === 6 && (
        <PaymentMethod
          data={formData}
          onUpdate={handleUpdate}
          onSubmit={handleSubmit}
          onPrevious={handlePrevious}

        />
      )}
    </div>
  );
};

export default AdminUserOnboardingWizard;