// "use client";

// import React, { useState, useEffect } from "react";
// import UserCreationStep from "./components/UserCreationStep";
// import BusinessDetailsStep from "./components/BusinessDetailsStep";
// import AgentCreationStep from "./components/AgentCreationStep";
// import PaymentStep from "./components/PaymentStep";
// import axios from "axios";

// interface FormData {
//   user?: {
//     id: string;
//     name: string;
//     email: string;
//     phone: string;
//     role: string;
//     referalName: string;
//     password: string;
//   };
//   business?: {
//     id: string;
//     type: string;
//     subtype: string;
//     icon: string;
//     name: string;
//     size: string;
//     services: string[];
//     customServices: string[];
//     email: string;
//     address: string;
//     phone: string;
//     website: string;
//     googleBusiness: string;
//     about: string;
//     addressComponents: any[];
//   };
// }

// const AdminUserOnboardingWizard: React.FC = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState<FormData>({});
//   const [users, setUsers] = useState<FormData["user"][]>([]);
//   const [businesses, setBusinesses] = useState<FormData["business"][]>([]);
//   const [editingUser, setEditingUser] = useState<FormData["user"] | null>(null);
//   const [editingBusiness, setEditingBusiness] = useState<FormData["business"] | null>(null);

//   const handleUpdate = (updates: Partial<FormData>) => {
//     setFormData((prev) => ({ ...prev, ...updates }));
//   };

//   const handleNext = () => {
//     setStep((prev) => Math.min(prev + 1, 4));
//   };

//   const handlePrevious = () => {
//     setStep((prev) => Math.max(prev - 1, 1));
//   };

//   const handleSubmit = async (data: FormData) => {
//     console.log("Final Form Data:", data);
//     alert("Onboarding completed!");
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
//       setUsers(response.data || []);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const fetchBusinesses = async () => {
//     try {
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails`);
//       setBusinesses(response.data || []);
//     } catch (error) {
//       console.error("Error fetching businesses:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//     fetchBusinesses();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       {step === 1 && (
//         <UserCreationStep
//           data={formData}
//           onUpdate={handleUpdate}
//           onNext={handleNext}
//           editingUser={editingUser}
//           fetchUsers={fetchUsers}
//         />
//       )}
//       {step === 2 && (
//         <BusinessDetailsStep
//           data={formData}
//           onUpdate={handleUpdate}
//           onNext={handleNext}
//           onPrevious={handlePrevious}
//           editingBusiness={editingBusiness}
//           fetchBusinesses={fetchBusinesses}
//         />
//       )}
//       {step === 3 && (
//         <AgentCreationStep
//           data={formData}
//           onUpdate={handleUpdate}
//           onNext={handleNext}
//           onPrevious={handlePrevious}
//         />
//       )}
//       {step === 4 && (
//         <PaymentStep
//           data={formData}
//           onUpdate={handleUpdate}
//           onSubmit={handleSubmit}
//           onPrevious={handlePrevious}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminUserOnboardingWizard;
"use client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import React, { useState, useEffect } from "react";
import UserCreationStep from "./components/UserCreationStep";
import BusinessDetailsStep from "./components/BusinessDetailsStep";
import AgentCreationStep from "./components/AgentCreationStep";
import PaymentStep from "./components/PaymentStep";
import axios from "axios";
import AssignNumberStep from "./components/AssignNumberStep";
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
  agent?: {
    agentId?: string;
    llmId?: string;
    agentCode?: string;
    name: string;
    language: string;
    agentLanguage: string;
    gender: string;
    voice: string;
    avatar: string;
    role: string;
    selectedVoice?: any;
  };
  phone?: {
    countryCode: string;
    stateCode: string;
    city: string;
    selectedNumber: string;
  };
  payment?: {
    plan: string;
    amount: number;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
}

const AdminUserOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState<number>(() => {
    // Load step from local storage on mount
    const savedStep = localStorage.getItem("currentStep");
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [formData, setFormData] = useState<FormData>(() => {
    // Load form data from local storage on mount
    const savedData = localStorage.getItem("formData");
    return savedData ? JSON.parse(savedData) : {};
  });
  const [users, setUsers] = useState<FormData["user"][]>([]);
  const [businesses, setBusinesses] = useState<FormData["business"][]>([]);
  const [editingUser, setEditingUser] = useState<FormData["user"] | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<FormData["business"] | null>(null);

  const customerId = localStorage.getItem("customerId") || "";

  const URL = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  // Save step and form data to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("currentStep", step.toString());
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [step, formData]);

  const handleUpdate = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 7));
    console.log("📌 Current Form Data before moving to next step:", formData);

  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const agentCreationFinal = async (finalData: any) => {
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
    const deferDays =
      data?.payment?.method === "defer"
        ? Number((data as any)?.payment?.deferDays) || 0
        : 0;

    const finalData = {
      customer_id: customerId || "byAdmin",
      plan_details: {
        id: (data as any)?.payment?.raw?.price?.id || "price_static_001",
        name: (data as any)?.payment?.raw?.product?.name || "Starter",
        desc: (data as any)?.payment?.raw?.product?.description || "Basic plan",
        amount:
          (data as any)?.payment?.raw?.derived?.amountUsd ||
          (data as any)?.payment?.amount ||
          0,
        currency: (data as any)?.payment?.raw?.derived?.currency || "USD",
        interval: (data as any)?.payment?.raw?.derived?.interval || "month",
        created: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        mins: (data as any)?.payment?.raw?.derived?.mins || 0,
        original_plan_amount:
          (data as any)?.payment?.raw?.derived?.amountUsd || 0,
      },
      agent_id: localStorage.getItem("agent_id") || "NA",
      user_id: data?.user?.id || "user_static_id",
      defer_days: deferDays,
    };

    // console.log("finalData", finalData);
    console.log("Final Form Data:", data);

    try {
      let ok = false;

      try {
        ok = await agentCreationFinal(finalData);
      } catch (apiError) {
        console.error("❌ agentCreationFinal threw an error:", apiError);
        alert("Something went wrong while creating subscription.");
      }

      if (ok) {
        // alert(
        //   deferDays > 0
        //     ? `Onboarding completed! ✅ Subscription created with ${deferDays} defer day(s).`
        //     : "Onboarding completed! ✅ Subscription created."
        // );
      } else {
        // alert("⚠️ Onboarding finished, but subscription creation failed.");
      }
    } catch (err) {
      console.error("❌ Unexpected error in handleSubmit:", err);
      alert("Failed to complete onboarding.");
    } finally {
      // ✅ Always clear/reset, no matter success or failure
      console.log("Final Form Data:", data);
      localStorage.removeItem("currentStep");
      localStorage.removeItem("formData");
      localStorage.removeItem("BusinessId");
      localStorage.removeItem("agentCode");
      localStorage.removeItem("knowledgebaseName");
      localStorage.removeItem("knowledgeBaseId");
      localStorage.removeItem("businessType");
      localStorage.removeItem("businessUrl");
      localStorage.removeItem("isVerified");
      localStorage.removeItem("selectedSitemapUrls");
      localStorage.removeItem("sitemapUrls");
      localStorage.removeItem("addressComponents");
      localStorage.removeItem("agentName");
      localStorage.removeItem("agent_id");
      localStorage.removeItem("city");
      localStorage.removeItem("country_code");
      localStorage.removeItem("coupen");
      localStorage.removeItem("state");

      localStorage.removeItem("phoneNumber")

      localStorage.removeItem("businessType");
      localStorage.removeItem("customServices");
      localStorage.removeItem("businessServices");


      setStep(1);
      setFormData({});
    }
  };


  const fetchUsers = async () => {
    // try {
    //   const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
    //   setUsers(response.data || []);
    // } catch (error) {
    //   console.error("Error fetching users:", error);
    // }
  };

  const fetchBusinesses = async () => {
    // try {
    //   const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails`);
    //   setBusinesses(response.data || []);
    // } catch (error) {
    //   console.error("Error fetching businesses:", error);
    // }
  };

  useEffect(() => {
    // fetchUsers();
    // fetchBusinesses();
  }, []);

  const handleFreeAgent = () => {
    localStorage.removeItem("currentStep");
    localStorage.removeItem("formData");
    localStorage.removeItem("BusinessId");
    localStorage.removeItem("agentCode");
    localStorage.removeItem("knowledgebaseName");
    localStorage.removeItem("knowledgeBaseId");
    localStorage.removeItem("businessType");
    localStorage.removeItem("businessUrl");
    localStorage.removeItem("isVerified");
    localStorage.removeItem("selectedSitemapUrls");
    localStorage.removeItem("sitemapUrls");
    localStorage.removeItem("addressComponents");
    localStorage.removeItem("agentName");
    localStorage.removeItem("agent_id");
    localStorage.removeItem("city");
    localStorage.removeItem("country_code");
    localStorage.removeItem("coupen");
    localStorage.removeItem("state");
    localStorage.removeItem("phoneNumber")
    setStep(1);
    setFormData({});
  }

   const handleExit = () => {
    // Optionally, you can add logic here to redirect or reset the form
          localStorage.removeItem("currentStep");
      localStorage.removeItem("formData");
      localStorage.removeItem("BusinessId");
      localStorage.removeItem("agentCode");
      localStorage.removeItem("knowledgebaseName");
      localStorage.removeItem("knowledgeBaseId");
      localStorage.removeItem("businessType");
      localStorage.removeItem("businessUrl");
      localStorage.removeItem("isVerified");
      localStorage.removeItem("selectedSitemapUrls");
      localStorage.removeItem("sitemapUrls");
      localStorage.removeItem("addressComponents");
      localStorage.removeItem("agentName");
      localStorage.removeItem("agent_id");
      localStorage.removeItem("city");
      localStorage.removeItem("country_code");
      localStorage.removeItem("coupen");
      localStorage.removeItem("state");
      localStorage.removeItem("AgentForUserId");
      localStorage.removeItem("client_id");
      localStorage.removeItem("currentStep");
      localStorage.removeItem("isVerified");
      localStorage.removeItem("phoneNumber")
     setStep(1);
      setFormData({});
  };


  return (
     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
       { step != 1 &&
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Exit</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                <AlertDialogDescription>
                  Exiting will discard any unsaved progress in the onboarding process. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleExit}>Exit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
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
        <AssignNumberStep
          data={formData}
          onUpdate={handleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFreeAgent={handleFreeAgent}

        />
      )}
      {step === 5 && (
        <PaymentStep
          data={formData}
          onUpdate={handleUpdate}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}

      {/* {step === 6 && (
        <DiscountForm
          data={formData}
          onUpdate={handleUpdate}
          // onSubmit={handleSubmit}
          onNext={handleNext}
          onPrevious={handlePrevious}

        />
      )} */}
      {step === 6 && (
        <PaymentMethod
          data={formData}
          onUpdate={handleUpdate}
          onSubmit={handleSubmit}
          onPrevious={handlePrevious}

        />
      )}
       </div>
    </div>
  );
};

export default AdminUserOnboardingWizard;