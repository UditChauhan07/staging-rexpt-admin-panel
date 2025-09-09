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

import React, { useState, useEffect } from "react";
import UserCreationStep from "./components/UserCreationStep";
import BusinessDetailsStep from "./components/BusinessDetailsStep";
import AgentCreationStep from "./components/AgentCreationStep";
import PaymentStep from "./components/PaymentStep";
import axios from "axios";

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

  // Save step and form data to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("currentStep", step.toString());
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [step, formData]);

  const handleUpdate = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (data: FormData) => {
    try {
      console.log("Final Form Data:", data);
      // Clear local storage after successful submission
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
      alert("Onboarding completed!");
      setStep(1); // Reset to first step
      setFormData({}); // Clear form data
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to complete onboarding. Please try again.");
    }
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
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default AdminUserOnboardingWizard;