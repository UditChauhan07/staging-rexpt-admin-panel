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
import getTimezoneFromState from "@/lib/getTimezone";
import { getAgentPrompt } from "@/lib/getAgentPrompt";
import { appointmentBooking, getBusinessSpecificFields } from "@/lib/postCallAnalysis";
import { updateAgent } from "@/Services/auth";
import extractAddressFields from "@/lib/extractAddressFields";
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
  paymentType?: {
    planType: string;
  };
  onbranding?: {
    onbranding: string;
  }
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
  const branding = formData?.onBranding?.onbranding
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
      localStorage.removeItem("role");
      localStorage.removeItem("businessType");
      localStorage.removeItem("customServices");
      localStorage.removeItem("businessServices");
      localStorage.removeItem("planType");
      localStorage.removeItem("phoneFormData");
      localStorage.removeItem("agentDetails");
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

  const handlePaymentStatus = () => {
    if (formData?.paymentType?.planType == "free") {
      setStep(6);
    }
    else {
      setStep(5);
    }
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
    localStorage.removeItem("planType");
    localStorage.removeItem("phoneFormData");
    localStorage.removeItem("agentDetails");
    localStorage.removeItem("role");

    setStep(1);
    setFormData({});
  };

  const handleNavigation = () => {
    setStep(6);
  }
  //extractAddressFields
  const savedDataAgentAndBusinessDetails = JSON.parse(
    localStorage.getItem("formData") || "{}"
  );
  localStorage.setItem("planType", formData.planType)
  const extractedDetails = {
    // From agent
    language: savedDataAgentAndBusinessDetails?.agent?.language || "",
    gender: savedDataAgentAndBusinessDetails?.agent?.gender || "",
    voice: savedDataAgentAndBusinessDetails?.agent?.voice || "",
    agentName: savedDataAgentAndBusinessDetails?.agent?.name || "",
    avatar: savedDataAgentAndBusinessDetails?.agent?.avatar || "",
    agentLanguage: savedDataAgentAndBusinessDetails?.agent?.agentLanguage || "",
    role: savedDataAgentAndBusinessDetails?.agent?.role || "",

    // From user
    userId: savedDataAgentAndBusinessDetails?.user?.id || "",

    // From business
    businessName: savedDataAgentAndBusinessDetails?.business?.name || "",
    address: savedDataAgentAndBusinessDetails?.business?.address || "",
    email: savedDataAgentAndBusinessDetails?.business?.email || "",
    about: savedDataAgentAndBusinessDetails?.business?.about || "",
    businessType: savedDataAgentAndBusinessDetails?.business?.type || "",
    services: savedDataAgentAndBusinessDetails?.business?.services || [],
    customBusiness:
      savedDataAgentAndBusinessDetails?.business?.customServices || [],
  };
  function extractPromptVariables(template, dataObject) {
    const matches = [...template.matchAll(/{{(.*?)}}/g)];
    const uniqueVars = new Set(matches.map((m) => m[1].trim()));

    // Flatten dataObject to a key-value map
    const flatData = {};

    function flatten(obj) {
      for (const key in obj) {
        const val = obj[key];
        if (
          typeof val === "object" &&
          val !== null &&
          "key" in val &&
          "value" in val
        ) {
          flatData[val.key.trim()] = val.value;
        } else if (typeof val === "object" && val !== null) {
          flatten(val); // Recursively flatten nested objects
        }
      }
    }

    flatten(dataObject);

    return Array.from(uniqueVars).map((variable) => ({
      name: variable,
      value: flatData[variable] ?? null,
      status: true,
    }));
  }
  const handleAgentUpdate = async () => {
    console.log("I am UPDATED")
    try {
      const {
        language,
        gender,
        voice,
        agentName,
        avatar,
        userId,
        agentLanguage,
        businessName,
        address,
        email,
        about,
        // businessType,
        services,
        customBuisness,
        role,
      } = formData;
       const formData1 = JSON.parse(localStorage.getItem("agentDetails"));
       console.log(formData1,"formData1formData1")
      const businessType = localStorage.getItem("businessType");
      const form = extractedDetails;
      const selectedRole = form.role || "General Receptionist";
      const addressFields = JSON.parse(
        localStorage.getItem("addressComponents")
      );
      const bssinessDetails = extractAddressFields(
        addressFields?.addressComponents
      );
      const services1 = addressFields?.services;

      const getLeadTypeChoices = () => {
        const fixedChoices = [
          "Spam Caller",
          "Irrelvant Call",
          "Angry Old Customer",
        ];
        const cleanedServices = services1
          .map((service) => service?.trim()) // remove extra whitespace
          .filter((service) => service && service?.toLowerCase() !== "other")
          .map((service) => {
            const normalized = service?.replace(/\s+/g, " ")?.trim();
            return `Customer for ${normalized}`;
          });
        const combinedChoices = Array.from(
          new Set([...fixedChoices, ...cleanedServices])
        );
        return combinedChoices;
      };
      // return
      const plan = formData?.paymentType?.planType;
      const languageAccToPlan = ["Scaler", "Growth", "Corporate", "paid"].includes(plan)
        ? "multi"
        : formData1.agentLanguage;
      const currentState = bssinessDetails?.state || "";
      const timeZoneGet = await getTimezoneFromState(currentState);
      const timeZone = timeZoneGet?.timezoneId || "Asia/Calcutta";
      const aboutBusinessForm =
        localStorage.getItem("businessonline") || formData.about || "";
      const currentTime = "";
      const statesRequiringCallRecording = [
        "Washington",
        "Vermont",
        "Pennsylvania",
        "Oregon",
        "New Hampshire",
        "Nevada",
        "Montana",
        "Michigan",
        "Massachusetts",
        "Maryland",
        "Illinois",
        "Florida",
        "Delaware",
        "Connecticut",
        "California",
      ];
      const initialCallRecording = statesRequiringCallRecording.includes(
        currentState
      )
        ? true
        : false;

      const filledPrompt =await getAgentPrompt({
        industryKey: businessType === "Other" ? customBuisness : businessType,
        roleTitle: localStorage.getItem("role"),
        agentName: formData1.name,
        agentGender: formData1.gender,
        business: {
          businessName: form.businessName || "Your Business",
          email: form.email || "",
          aboutBusiness: form.about || "", // this can remain for context
          address: form.address || "",
        },
        languageSelect: languageAccToPlan,
        businessType,
        aboutBusinessForm, // this will now work fine
        commaSeparatedServices: services1?.join(", ") || "",
        agentNote: "",
        timeZone: timeZone,
        currentTime,
        languageAccToPlan,
        plan,
        initialCallRecording,
        branding
      });
      const filledPrompt2 = getAgentPrompt({
        industryKey: businessType === "Other" ? customBuisness : businessType,
        roleTitle: selectedRole,
        agentName: "{{AGENT NAME}}",
        agentGender: "{{AGENT GENDER}}",
        business: {
          businessName: "{{BUSINESS NAME}}",
          email: "{{BUSINESS EMAIL ID}}",
          aboutBusiness: "{{MORE ABOUT YOUR BUSINESS}}",
          address: "{{BUSINESS ADDRESS}}",
        },
        languageSelect: "{{LANGUAGE}}",
        businessType: "{{BUSINESSTYPE}}",
        aboutBusinessForm: {
          businessUrl: "{{BUSINESS WEBSITE URL}}", // give unique name
          about: "{{MORE ABOUT YOUR BUSINESS}}", // can reuse or separate
        },
        commaSeparatedServices: "{{SERVICES}}",
        agentNote: "{{AGENTNOTE}}",
        timeZone: "{{TIMEZONE}}",
      });
      const promptVariablesList = extractPromptVariables(filledPrompt2, {
        industryKey: businessType === "Other" ? customBuisness : businessType,
        roleTitle: sessionStorage.getItem("agentRole"),
        agentName: { key: "AGENT NAME", value: formData?.agentName || "" },
        agentGender: { key: "AGENT GENDER", value: gender || "" },
        business: {
          businessName: {
            key: "BUSINESS NAME",
            value: form.businessName || "",
          },
          email: { key: "BUSINESS EMAIL ID", value: form.email || "" },
          aboutBusiness: {
            key: "MORE ABOUT YOUR BUSINESS",
            value: form.aboutBusiness || "",
          },
          address: { key: "BUSINESS ADDRESS", value: form.address || "" },
        },
        languageSelect: { key: "LANGUAGE", value: agentLanguage || "" },
        businessType: { key: "BUSINESSTYPE", value: businessType || "" },
        commaSeparatedServices: {
          key: "SERVICES",
          value: services?.join(", ") || "",
        },
        timeZone: {
          key: "TIMEZONE",
          value: timeZone || "",
        },
        aboutBusinessForm: {
          businessUrl: {
            key: "BUSINESS WEBSITE URL",
            value: form.businessUrl || "",
          },
        },
        currentTime: {
          key: "current_time_[timezone]",
          value: currentTime || "",
        },
        agentNote: {
          key: "AGENTNOTE",
          value: form.agentNote || "",
        },
      });
      ///LLM CREATION PROCESSS
      const agentConfig = {
        version: 0,
        model: "gemini-2.0-flash",
        model_temperature: 0,
        model_high_priority: true,
        tool_call_strict_mode: true,
        general_prompt: filledPrompt,
        general_tools: [
          {
            type: "end_call",
            name: "end_call",
            description: "End the call with user.",
          },
          {
            type: "extract_dynamic_variable",
            name: "extract_user_details",
            description:
              "Extract the user's details like name, email, phone number, address, and reason for calling from the conversation",
            variables: [
              {
                type: "string",
                name: "email",
                description:
                  "Extract the user's email address from the conversation",
              },
              {
                type: "number",
                name: "phone",
                description:
                  "Extract the user's phone number from the conversation",
              },
              {
                type: "string",
                name: "address",
                description: "Extract the user's address from the conversation",
              },
              {
                type: "string",
                name: "reason",
                description:
                  "Extract the user's reason for calling from the conversation",
              },
              {
                type: "string",
                name: "name",
                description: "Extract the user's name from the conversation\"",
              },
            ],
          },
        ],
        states: [
          {
            name: "information_collection",
            state_prompt: `Greet the user with the begin_message and assist with their query.
      
                                     If the user sounds dissatisfied (angry, frustrated, upset) or uses negative words (like "bad service", "unhappy", "terrible","waste of time"),
                                     ask them: "I'm sorry to hear that. Could you please tell me about your concern?"
                                     Analyze their response. 
                                     
                                      If the concern contains **spam, irrelevant or abusive content**
                                      (e.g., random questions, profanity, jokes), say:
                                      "I’m here to assist with service-related concerns. Could you please share your issue regarding our service?"
                                      and stay in this state.
      
                                      If the concern is **service-related** or **business** (e.g., staff, delay, poor support),
                                      transition to dissatisfaction_confirmation.
      
                                      If the user asks for an appointment (e.g., "appointment", "book", "schedule"),
                                      transition to appointment_booking.
      
                                      If the user is silent or unclear, say: "Sorry, I didn’t catch that. Could you please repeat?"
                                      If the user wants to end the call transition to end_call_state`,
            edges: [
              {
                destination_state_name: "dissatisfaction_confirmation",
                description: "User sounds angry or expresses dissatisfaction.",
              },
            ],
          },

          {
            name: "appointment_booking",
            state_prompt:
              "## Task\nYou will now help the user book an appointment.",
          },

          // 🌟 State: Dissatisfaction Confirmation
          {
            name: "dissatisfaction_confirmation",
            state_prompt: `
                                  Say: "I'm sorry you're not satisfied. Would you like me to connect you to a team member? Please say yes or no."
                                  Wait for their response.
      
                                  If the user says yes, transition to call_transfer.
                                  If the user says no, transition to end_call_state.
                                  If the response is unclear, repeat the question once.
                              `,
            edges: [
              {
                destination_state_name: "call_transfer",
                description: "User agreed to speak to team member.",
              },
              {
                destination_state_name: "end_call_state",
                description: "User declined to speak to team member.",
              },
            ],
            tools: [],
          },

          {
            name: "call_transfer",
            state_prompt: `
                                  Connecting you to a team member now. Please hold.
                              `,
            tools: [
              {
                type: "transfer_call",
                name: "transfer_to_team",
                description: "Transfer the call to the team member.",
                transfer_destination: {
                  type: "predefined",
                  number: "{{business_Phone}}",
                },
                transfer_option: {
                  type: "cold_transfer",
                  public_handoff_option: {
                    message: "Please hold while I transfer your call.",
                  },
                },
                speak_during_execution: true,
                speak_after_execution: true,
                failure_message:
                  "Sorry, I couldn't transfer your call. Please contact us at {{business_email}} or call {{business_Phone}} directly.",
              },
            ],
            edges: [],
          },
          {
            name: "end_call_state",
            state_prompt: `
                                  Politely end the call by saying: "Thank you for calling. Have a great day!"
                              `,
            tools: [
              {
                type: "end_call",
                name: "end_call1",
                description: "End the call with the user.",
              },
            ],
            edges: [],
          },
        ],
        starting_state: "information_collection",
        default_dynamic_variables: {
          customer_name: "John Doe",
          timeZone: timeZone,
          business_Phone: `${formData?.business?.internationalPhoneNumber} || ${formData?.business?.phone} ` || "",
          business_email: `${form.email}` || "",
        },
      };
      const knowledgeBaseId = localStorage.getItem("knowledgeBaseId");
      agentConfig.knowledge_base_ids = [knowledgeBaseId];
      const llm_id = localStorage.getItem("llm_id")
      ///LLM CREATION API
      const llmResponse = await axios.patch(
        `https://api.retellai.com/update-retell-llm/${llm_id} `,
        agentConfig,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
            "Content-Type": "application/json",
          },
        }
      );
      //update agent in DB
      //   try {
      //     const response = await updateAgent(agentId, agentData);
      //     if (response.status === 200 || response.status === 201) {
      //       setPopupType("success");
      //       setPopupMessage("Agent Updated successfully!");
      //       setShowPopup(true);
      //     }
      //   } catch (error) {

      //   }
      // } catch (err) {
      //   console.error("Agent Updation failed:", err);

      // }


    } catch (err) {
      console.error("Error:", err);
      alert("Agent creation failed. Please check console for details.");
    }
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {step != 1 &&
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
          <PaymentStep
            data={formData}
            onUpdate={handleUpdate}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onAgentPaymentStatus={handlePaymentStatus}
            onUpdateAgent={handleAgentUpdate}
          />
        )}
        {step === 5 && (
          <PaymentMethod
            data={formData}
            onUpdate={handleUpdate}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            onNavigation={handleNavigation}

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
          <AssignNumberStep
            data={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onExit={handleExit}

          />
        )}
      </div>
    </div>
  );
};

export default AdminUserOnboardingWizard;