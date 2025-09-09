import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import StepWrapper from "./StepWrapper";
import {
  createAgent,
  getRetellVoices,
  validateWebsite,
  listSiteMap,
  updateAgentWidgetDomain,
} from "@/Services/auth";
import axios from "axios";
import { getAgentPrompt } from "@/lib/getAgentPrompt";
import { getKnowledgeBaseName } from "@/lib/getKnowledgeBaseName";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import getTimezoneFromState from "@/lib/getTimezone";

interface FormData {
  business?: any;
  agent?: {
    name: string;
    language: string;
    agentLanguage: string;
    gender: string;
    voice: string;
    avatar: string;
    role: string;
    selectedVoice?: any;
  };
}

interface AgentCreationStepProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const avatars = {
  Male: [
    { img: "/images/Male-01.png" },
    { img: "/images/Male-02.png" },
    { img: "/images/Male-03.png" },
    { img: "/images/Male-04.png" },
    { img: "/images/Male-05.png" },
  ],
  Female: [
    { img: "/images/Female-01.png" },
    { img: "/images/Female-02.png" },
    { img: "/images/Female-03.png" },
    { img: "/images/Female-04.png" },
    { img: "/images/Female-05.png" },
    { img: "/images/Female-06.png" },
  ],
};

const roles = [
  { title: "General Receptionist", description: "A general receptionist will pick calls, provide information on your services and products, take appointments and guide callers." },
  { title: "LEAD Qualifier", description: "A LEAD Qualifier handles inbound sales queries and helps identify potential leads for your business." },
];

 const languages = [
        /* English family */
        {
            name: "English (US)",
            locale: "en-US",
            flag: "/images/en-US.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (India)",
            locale: "en-IN",
            flag: "/images/en-IN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (UK)",
            locale: "en-GB",
            flag: "/images/en-GB.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (Australia)",
            locale: "en-AU",
            flag: "/images/en-AU.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (New Zealand)",
            locale: "en-NZ",
            flag: "/images/en-NZ.png",
            percentage: "—",
            stats: "—",
        },

        /* Germanic & Nordic */
        {
            name: "German",
            locale: "de-DE",
            flag: "/images/de-DE.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Dutch",
            locale: "nl-NL",
            flag: "/images/nl-NL.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Danish",
            locale: "da-DK",
            flag: "/images/da-DK.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Finnish",
            locale: "fi-FI",
            flag: "/images/fi-FI.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Norwegian",
            locale: "no-NO",
            flag: "/images/no-NO.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Swedish",
            locale: "sv-SE",
            flag: "/images/sv-SE.png",
            percentage: "—",
            stats: "—",
        },

        /* Romance */
        {
            name: "Spanish (Spain)",
            locale: "es-ES",
            flag: "/images/es-ES.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Spanish (LatAm)",
            locale: "es-419",
            flag: "/images/es-ES.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "French (France)",
            locale: "fr-FR",
            flag: "/images/fr-FR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "French (Canada)",
            locale: "fr-CA",
            flag: "/images/fr-CA.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Italian",
            locale: "it-IT",
            flag: "/images/it-IT.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Portuguese (Portugal)",
            locale: "pt-PT",
            flag: "/images/pt-PT.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Portuguese (Brazil)",
            locale: "pt-BR",
            flag: "/images/pt-BR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Catalan",
            locale: "ca-ES",
            flag: "/images/ca-ES.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Romanian",
            locale: "ro-RO",
            flag: "/images/ro-RO.png",
            percentage: "—",
            stats: "—",
        },

        /* Slavic & Baltic */
        {
            name: "Polish",
            locale: "pl-PL",
            flag: "/images/pl-PL.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Russian",
            locale: "ru-RU",
            flag: "/images/ru-RU.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Bulgarian",
            locale: "bg-BG",
            flag: "/images/bg-BG.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Slovak",
            locale: "sk-SK",
            flag: "/images/sk-SK.png",
            percentage: "—",
            stats: "—",
        },

        /* Hellenic & Uralic */
        {
            name: "Greek",
            locale: "el-GR",
            flag: "/images/el-GR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Hungarian",
            locale: "hu-HU",
            flag: "/images/hu-HU.png",
            percentage: "—",
            stats: "—",
        },

        /* Asian */
        {
            name: "Hindi",
            locale: "hi-IN",
            flag: "/images/hi-IN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Japanese",
            locale: "ja-JP",
            flag: "/images/ja-JP.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Korean",
            locale: "ko-KR",
            flag: "/images/ko-KR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Chinese (Mandarin)",
            locale: "zh-CN",
            flag: "/images/zh-CN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Vietnamese",
            locale: "vi-VN",
            flag: "/images/vi-VN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Indonesian",
            locale: "id-ID",
            flag: "/images/id-ID.png",
            percentage: "—",
            stats: "—",
        },

        /* Turkic */
        {
            name: "Turkish",
            locale: "tr-TR",
            flag: "/images/tr-TR.png",
            percentage: "—",
            stats: "—",
        },

        /* Universal / Mixed set */
        // {
        //     name: "Multilingual",
        //     locale: "multi",
        //     flag: "/images/multi.png",
        //     percentage: "—",
        //     stats: "—",
        // },
    ];

const AgentCreationStep: React.FC<AgentCreationStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [formData, setFormData] = useState<FormData["agent"]>(
    data.agent || { name: "", language: "", agentLanguage: "", gender: "", voice: "", avatar: "", role: "" }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [retellVoices, setRetellVoices] = useState<{ voice_id: string; voice_name: string; gender: string; accent?: string; provider: string; preview_audio_url: string }[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<any[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const audioRefs = useRef<any[]>([]);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoadingVoices(true);
    getRetellVoices()
      .then((data) => setRetellVoices(data))
      .catch((err) => {
        setVoiceError("Failed to load voices");
        console.error("Error fetching voices:", err);
      })
      .finally(() => setLoadingVoices(false));
  }, []);

  useEffect(() => {
    if (retellVoices && formData.gender) {
      const filtered = retellVoices.filter(
        (v) => v.provider === "elevenlabs" && v.gender?.toLowerCase() === formData.gender.toLowerCase()
      );
      setFilteredVoices(filtered);
    } else {
      setFilteredVoices([]);
    }
  }, [retellVoices, formData.gender]);

  const togglePlay = (idx: number) => {
    const thisAudio = audioRefs.current[idx];
    if (!thisAudio) return;

    if (playingIdx === idx) {
      thisAudio.pause();
      setPlayingIdx(null);
      return;
    }

    if (playingIdx !== null) {
      const prev = audioRefs.current[playingIdx];
      prev?.pause();
      prev.currentTime = 0;
    }

    thisAudio.play();
    setPlayingIdx(idx);
    thisAudio.onended = () => setPlayingIdx(null);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Agent name is required";
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.voice) newErrors.voice = "Voice is required";
    if (!formData.avatar) newErrors.avatar = "Avatar is required";
    if (!formData.role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  
    const validatePhoneNumber = (phone: string) => {
      const phoneNumberObj = parsePhoneNumberFromString(phone, selectedCountry);
      return phoneNumberObj && phoneNumberObj.isValid();
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
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedVoice = filteredVoices.find((voice) => voice.voice_id === formData.voice);
    onUpdate({ agent: { ...formData, selectedVoice } });
    onNext();
  };



   const handleSubmit = async () => {
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
          businessType,
          services,
          customBuisness,
          role,
        } = formData;
        console.log('formData',formData)
        console.log(voice, "voice");
        console.log(formData.name, "agentname");
        const getLeadTypeChoices = () => {
          const fixedChoices = [
            "Spam Caller",
            "Irrelvant Call",
            "Angry Old Customer",
          ];
  
          const cleanedServices = services
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
        const plan = "free";
        const languageAccToPlan = ["Scaler", "Growth", "Corporate"].includes(plan)
          ? "multi"
          : formData.language;
  
        const addressFields = JSON.parse(localStorage.getItem('addressComponents'));
        const currentState = addressFields?.state || "";
        console.log(currentState, "currentState");
        const timeZone = await getTimezoneFromState(currentState);
        console.log(timeZone, "timeZone");
        const currentTime = new Date().toLocaleString("en-US", {
          timeZone: timeZone.timezoneId,
        });
  
        const aboutBusinessForm =
          localStorage.getItem("businessonline") || formData.about || "";
        //  console.log(currentTime,"currentTime")
  
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
        const CallRecording = statesRequiringCallRecording.includes(currentState)
          ? true
          : false;
  
        const filledPrompt = getAgentPrompt({
          industryKey: businessType === "Other" ? customBuisness : businessType,
          roleTitle: selectedRole,
          agentName: form.agentName,
          agentGender: gender,
          business: {
            businessName: businessName || "Your Business",
            email: email || "",
            aboutBusiness: about || "", // this can remain for context
            address: address || "",
          },
          languageSelect: languageAccToPlan,
          businessType,
          aboutBusinessForm, // this will now work fine
          commaSeparatedServices: services?.join(", ") || "",
          agentNote: "",
          timeZone: timeZone?.timezoneId,
          currentTime,
          languageAccToPlan,
          plan,
          CallRecording,
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
          agentName: { key: "AGENT NAME", value: form?.agentName || "" },
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
  
        console.log("generatePrompt", filledPrompt2);
        console.log(promptVariablesList);
  
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
  
          // begin_message: `Hi I’m ${promptVars.agentName}, calling from ${promptVars.business.businessName}. How may I help you?`,
          default_dynamic_variables: {
            customer_name: "John Doe",
            timeZone: timeZone,
            business_Phone: `${form.phone}` || "",
            business_email: `${form.email}` || "",
            timeZone: timeZone?.timezoneId,
          },
          //   states: [
          //     {
          //       name: "information_collection",
          //       state_prompt: "## Task\nGreet the user and ask how you can help.",
          //       script: `
          //   if (wait_for_user_input) {
          //     speak("How can I assist you today?");
          //     wait_for_user_input();
          //   }
          // `,
          //       edges: [],
          //     },
          //   ],
        };
        const knowledgeBaseId = localStorage.getItem("knowledgeBaseId");
  
        agentConfig.knowledge_base_ids = [knowledgeBaseId];
  
        const llmRes = await axios.post(
          `${URL}/api/agent/createAdmin/llm`,
          agentConfig,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(llmRes);
        const llmId = llmRes.data.data.llm_id;
        console.log(llmId);
  
        const finalAgentData = {
          response_engine: { type: "retell-llm", llm_id: llmId },
          voice_id: voice,
          // language,
          agent_name: knowledgebaseName || "Virtual Assistant",
          language:
            languages.find((l) => l.name === languageAccToPlan)?.locale ||
            "multi",
          post_call_analysis_model: "gpt-4o-mini",
          responsiveness: 1,
          enable_backchannel: true,
          interruption_sensitivity: 0.91,
          normalize_for_speech: true,
          backchannel_frequency: 0.7,
          backchannel_words: [
            "Got it",
            "Yeah",
            "Uh-huh",
            "Understand",
            "Ok",
            "hmmm",
          ],
          post_call_analysis_data: [
            {
              type: "enum",
              name: "lead_type",
              description: "Feedback given by the customer about the call.",
              choices: getLeadTypeChoices(),
            },
            {
              type: "string",
              name: "name",
              description: "Extract the user's name from the conversation",
              examples: [
                "Ajay Sood",
                "John Wick",
                "Adam Zampa",
                "Jane Doe",
                "Nitish Kumar",
                "Ravi Shukla",
              ],
            },
            {
              type: "string",
              name: "email",
              description: "Extract the user's email from the conversation",
              examples: [
                "john.doe@example.com",
                "nitish@company.in",
                "12@gmail.com",
              ],
            },
            {
              type: "string",
              name: "reason",
              description:
                "The reason the user is calling or their inquiry. If provided in Hindi, translate to English. Summarize if it's long.",
              examples: [
                "Schedule an appointment",
                "Ask about services",
                "Request for accounting help",
              ],
            },
            {
              type: "string",
              name: "address",
              description:
                "The user's address or business location. If spoken in Hindi, translate to English. Format it for use in CRM or contact forms.",
              examples: [
                "123 Main St, Delhi",
                "42 Wallaby Way, Sydney",
                "1490 Aandhar Eleven",
              ],
            },
            {
              type: "number",
              name: "phone_number",
              description:
                "The user's phone number in numeric format. If digits are spoken in words (e.g., 'seven eight seven six one two'), convert them to digits (e.g., '787612'). Ensure it's a valid number when possible.",
            },
          ],
          end_call_after_silence_ms: 30000,
          normalize_for_speech: true,
          webhook_url: `${process.env.NEXT_PUBLIC_API_URL}/agent/updateAgentCall_And_Mins_WebHook`,
        };
        console.log(finalAgentData);
  
        const agentRes = await axios.post(
          "https://api.retellai.com/create-agent",
          finalAgentData,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
            },
          }
        );
  
        const agentId = agentRes.data.agent_id;
  
        try {
          const businessUrlToSend = aboutBusinessForm?.businessUrl || "";
          if (businessUrlToSend) {
            await updateAgentWidgetDomain(agentId, businessUrlToSend);
          } else {
            console.warn("No business URL available to update widget domain");
          }
        } catch (e) {
          console.error("updateAgentWidgetDomain failed:", e);
        }
  
        const dbPayload = {
          userId: form.userId || localStorage.getItem("AgentForUserId") || "",
          agent_id: agentId,
          llmId,
          avatar,
          agentVoice: voice,
          knowledgeBaseId: localStorage.getItem("knowledgeBaseId"),
          agentAccent: form.selectedVoice?.voice_accent || "American",
          agentRole: selectedRole,
          agentName:
            form.agentName ||
            form.selectedVoice?.voice_name ||
            "Virtual Assistant",
          agentLanguageCode:
            languages.find((l) => l.name === languageAccToPlan)?.locale ||
            "multi",
          agentLanguage: agentLanguage,
          dynamicPromptTemplate: filledPrompt,
          rawPromptTemplate: filledPrompt2,
          promptVariablesList: JSON.stringify(promptVariablesList),
          agentGender: gender,
          agentCode: localStorage.getItem("agentCode"),
          agentPlan: "free",
          agentStatus: true,
          businessId: localStorage.getItem("BusinessId"),
          additionalNote: "",
          responsiveness: 1,
          enable_backchannel: true,
          CallRecording: CallRecording,
          interruption_sensitivity: 0.7,
          backchannel_frequency: 0.7,
          backchannel_words: [
            "Got it",
            "Yeah",
            "Uh-huh",
            "Understand",
            "Ok",
            "hmmm",
          ],
          post_call_analysis_data: [
            {
              type: "enum",
              name: "lead_type",
              description: "Feedback given by the customer about the call.",
              choices: getLeadTypeChoices(),
            },
            {
              type: "string",
              name: "name",
              description: "Extract the user's name from the conversation",
              examples: [
                "Ajay Sood",
                "John Wick",
                "Adam Zampa",
                "Jane Doe",
                "Nitish Kumar",
                "Ravi Shukla",
              ],
            },
            {
              type: "string",
              name: "email",
              description: "Extract the user's email from the conversation",
              examples: [
                "john.doe@example.com",
                "nitish@company.in",
                "12@gmail.com",
              ],
            },
            {
              type: "string",
              name: "reason",
              description:
                "The reason the user is calling or their inquiry. If provided in Hindi, translate to English. Summarize if it's long.",
              examples: [
                "Schedule an appointment",
                "Ask about services",
                "Request for accounting help",
              ],
            },
            {
              type: "string",
              name: "address",
              description:
                "The user's address or business location. If spoken in Hindi, translate to English. Format it for use in CRM or contact forms.",
              examples: [
                "123 Main St, Delhi",
                "42 Wallaby Way, Sydney",
                "1490 Aandhar Eleven",
              ],
            },
            {
              type: "number",
              name: "phone_number",
              description:
                "The user's phone number in numeric format. If digits are spoken in words (e.g., 'seven eight seven six one two'), convert them to digits (e.g., '787612'). Ensure it's a valid number when possible.",
            },
          ],
        };
  
        const saveRes = await createAgent(dbPayload);
        if (saveRes.status === 200 || saveRes.status === 201) {
          alert("Agent created successfully!");
          localStorage.removeItem("businessType");
          localStorage.removeItem("BusinessId");
          localStorage.removeItem("isVerified");
          localStorage.removeItem("knowledgeBaseId");
          localStorage.removeItem("knowledgebaseName");
          localStorage.removeItem("selectedSitemapUrls");
          localStorage.removeItem("sitemapUrls");
          sessionStorage.removeItem("placeDetailsExtract");
          sessionStorage.removeItem("businessUrl");
          localStorage.removeItem("");
          onClose();
        } else {
          throw new Error("Agent creation failed.");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Agent creation failed. Please check console for details.");
      }
    };
  return (
    <StepWrapper step={3} totalSteps={4} title="Agent Creation" description="Configure the agent for the business.">
      <form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name <span className="text-red-500">*</span></Label>
            <Input
              id="agentName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter agent name"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
            <Select
              value={formData.language}
              onValueChange={(v) => {
                const lang = languages.find((l) => l.locale === v);
                setFormData({ ...formData, language: v, agentLanguage: lang?.name || v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.locale} value={lang.locale}>
                    <span className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w20/${lang.locale.split("-")[1]?.toLowerCase() || "us"}.png`}
                        alt="flag"
                        className="w-5 h-5"
                        onError={(e)=>{
                         const target = e.target as HTMLImageElement;
                          if (lang.locale == "es-419") {
                            target.src = "https://flagcdn.com/w80/es.png"; // Fallback
                          } 
                        }}
                      />
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && <p className="text-sm text-red-600">{errors.language}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => setFormData({ ...formData, gender: v, avatar: "", voice: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="voice">Voice <span className="text-red-500">*</span></Label>
            {loadingVoices ? (
              <p className="text-sm text-gray-500">Loading voices...</p>
            ) : voiceError ? (
              <p className="text-sm text-red-600">{voiceError}</p>
            ) : filteredVoices.length === 0 ? (
              <p className="text-sm text-gray-500">No voices found for selected gender</p>
            ) : (
              <Select
                value={formData.voice}
                onValueChange={(v) => {
                  setFormData({ ...formData, voice: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose voice" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {filteredVoices.map((voice, index) => (
                    <SelectItem key={index} value={voice.voice_id} className="py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{voice.voice_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{voice.accent ? `${voice.accent} Accent` : voice.provider}</p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay(index);
                          }}
                        >
                          {playingIdx === index ? (
                            <Pause className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                        <audio ref={(el) => (audioRefs.current[index] = el)} style={{ display: "none" }}>
                          <source src={voice.preview_audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.voice && <p className="text-sm text-red-600">{errors.voice}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar <span className="text-red-500">*</span></Label>
            {formData.gender ? (
              <Select
                value={formData.avatar}
                onValueChange={(v) => setFormData({ ...formData, avatar: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose avatar" />
                </SelectTrigger>
                <SelectContent>
                  {avatars[formData.gender]?.map((av, index) => (
                    <SelectItem key={index} value={av.img}>
                      <span className="flex items-center gap-2">
                        <img src={av.img} alt={`Avatar ${index + 1}`} className="w-6 h-6 rounded-full" />
                        Avatar {index + 1}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">Select gender to choose avatar</p>
            )}
            {errors.avatar && <p className="text-sm text-red-600">{errors.avatar}</p>}
          </div>
          <div className="space-y-2">
            <Label>Agent Role <span className="text-red-500">*</span></Label>
            {roles.map((role, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="agentRole"
                  value={role.title}
                  checked={formData.role === role.title}
                  onChange={() => setFormData({ ...formData, role: role.title })}
                />
                <div>
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            ))}
            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>
            Next: Payment
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
};

export default AgentCreationStep;