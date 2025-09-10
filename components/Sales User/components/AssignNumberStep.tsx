"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import StepWrapper from "./StepWrapper";
import * as Dialog from "@radix-ui/react-dialog";
import Swal from "sweetalert2";
import axios from "axios";
import 'react-phone-input-2/lib/style.css'
import PhoneInput from 'react-phone-input-2'
import { createNumberOrder, fetchAvailablePhoneNumberByCountry, importPhoneToAgentFromAdmin, updateAgent } from "@/Services/auth";
import { User, Building2 } from "lucide-react";
import { checkDomainOfScale } from "recharts/types/util/ChartUtils";

interface FormData {
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
  business?: {
    businessName: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
  };
  phone?: {
    countryCode: string;
    stateCode: string;
    city: string;
    selectedNumber: string;
  };
}

interface AssignNumberStepProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const languages = [
  {
    name: "English (US)",
    locale: "en-US",
    countryCode: "US",
    countryName: "United States",
    flag: "/images/en-US.png",
  },
  {
    name: "French (Canada)",
    locale: "fr-CA",
    countryCode: "CA",
    countryName: "Canada",
    flag: "/images/fr-CA.png",
  },
];
const AssignNumberStep: React.FC<AssignNumberStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [phoneData, setPhoneData] = useState<FormData["phone"]>({
    countryCode: data.business?.countryCode || localStorage.getItem("phoneFormData") ? JSON.parse(localStorage.getItem("phoneFormData")!).countryCode : "US",
    stateCode: data.business?.stateCode || localStorage.getItem("phoneFormData") ? JSON.parse(localStorage.getItem("phoneFormData")!).stateCode : "",
    city: data.business?.city || localStorage.getItem("phoneFormData") ? JSON.parse(localStorage.getItem("phoneFormData")!).city : "",
    selectedNumber: localStorage.getItem("phoneFormData") ? JSON.parse(localStorage.getItem("phoneFormData")!).selectedNumber : "",
  });
  const [stateNameFull, setStateNameFull] = useState(data.business?.state || localStorage.getItem("phoneFormData") ? JSON.parse(localStorage.getItem("phoneFormData")!).state || "" : "");
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCustomPhone, setIsCustomPhone] = useState(false);
  const [customPhoneInput, setCustomPhoneInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const stateInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestVersion = useRef(0);
  const token = localStorage.getItem("token") || "";
  const [googlePlacesLoaded, setGooglePlacesLoaded] = useState(false);
  const details = JSON.parse(localStorage.getItem("formData"))
  const businessName = details?.business?.name
  const agentName = localStorage.getItem("agentName")
  const state = localStorage.getItem("state")
  const agentId = localStorage.getItem("agent_id");
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
  const [customNoBtnLoading,setCustomNoBtnLoading]=useState(false)
  useEffect(() => {
    const savedPhone = localStorage.getItem("phoneNumber");
    if (savedPhone) {
      setHasPhoneNumber(true);
    } else {
      setHasPhoneNumber(false);
    }
  }, []);
  useEffect(() => {
    if (window.google?.maps?.places) {
      setGooglePlacesLoaded(true);
    } else {
      console.warn("Google Maps Places API not loaded.");
      Swal.fire({
        icon: "warning",
        title: "Google Places API Issue",
        text: "Google Places API is not loaded. Please enter state and city manually.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("phoneFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setPhoneData(parsedData);
      setStateNameFull(parsedData.state || data.business?.state || "");
    } else if (data.business) {
      setPhoneData({
        countryCode: data.business.countryCode || "US",
        stateCode: data.business.stateCode || "",
        city: data.business.city || "",
        selectedNumber: "",
      });
      setStateNameFull(state || "");
    }

    if (phoneData.countryCode && phoneData.stateCode && token && !isCustomPhone) {
      fetchNumbersWithFallback();
    } else {
      setInitialLoading(false);
      if (!data.business?.countryCode || !data.business?.stateCode) {
        // Swal.fire({
        //   icon: "warning",
        //   title: "Missing Business Details",
        //   text: "Business details (country or state) are missing. Please enter them manually.",
        //   timer: 3000,
        //   showConfirmButton: false,
        // });
      }
    }
  }, [data.business, isCustomPhone]);

  useEffect(() => {
    localStorage.setItem("phoneFormData", JSON.stringify({ ...phoneData, state: state }));
  }, [phoneData, state]);

  useEffect(() => {
    const initAutocomplete = (el: HTMLInputElement | null, setValue: (value: string) => void, types: string) => {
      if (!el || !window.google?.maps?.places) return;
      const ac = new window.google.maps.places.Autocomplete(el, {
        types: [types],
        fields: ["address_components"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        (place.address_components || []).forEach((c) => {
          if (types === "(regions)" && c.types.includes("administrative_area_level_1")) {
            setPhoneData((prev) => ({ ...prev, stateCode: c.short_name }));
            setStateNameFull(c.long_name);
            setErrors((prev) => ({ ...prev, stateCode: "" }));
          } else if (types === "(regions)" && c.types.includes("locality")) {
            setPhoneData((prev) => ({ ...prev, city: c.long_name }));
            setErrors((prev) => ({ ...prev, city: "" }));
          }
        });
      });
    };
    if (googlePlacesLoaded && !isCustomPhone) {
      initAutocomplete(stateInputRef.current, (value) => setPhoneData((prev) => ({ ...prev, stateCode: value })), "(regions)");
      initAutocomplete(cityInputRef.current, (value) => setPhoneData((prev) => ({ ...prev, city: value })), "(regions)");
    }
  }, [googlePlacesLoaded, isCustomPhone]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (phoneData.countryCode && phoneData.stateCode && token && !isCustomPhone) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchNumbersWithFallback();
      }, 600);
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [phoneData.city, phoneData.stateCode, phoneData.countryCode, isCustomPhone]);

  useEffect(() => {
    const validCountryCodes = languages.map((lang) => lang.countryCode);
    if (!validCountryCodes.includes(phoneData.countryCode)) {
      setPhoneData((prev) => ({ ...prev, countryCode: "US", stateCode: "", city: "", selectedNumber: "" }));
      setStateNameFull("");
      setAvailableNumbers([]);
      setErrors((prev) => ({ ...prev, countryCode: "Country is required" }));
    }
  }, [phoneData]);

  const fetchNumbersWithFallback = async () => {
    const currentVersion = ++requestVersion.current;
    setLoading(true);
    try {
      const res = await fetchAvailablePhoneNumberByCountry(token, phoneData.countryCode, phoneData.city, phoneData.stateCode);
      if (requestVersion.current !== currentVersion) return;
      if (res?.success && res?.data?.length > 0) {
        setAvailableNumbers(res.data.map((item: any) => item.phone_number));
      } else {
        const fallbackRes = await fetchAvailablePhoneNumberByCountry(token, phoneData.countryCode, "", phoneData.stateCode);

        if (requestVersion.current !== currentVersion) return;
        if (fallbackRes?.success && fallbackRes?.data?.length > 0) {
          setPhoneData((prev) => ({ ...prev, city: "" }));
          setAvailableNumbers(fallbackRes.data.map((item: any) => item.phone_number));
        } else {
          setAvailableNumbers([]);
          Swal.fire({
            icon: "error",
            title: "No Numbers Found",
            text: "No numbers found for the selected location. Please try a different country or state.",
            confirmButtonText: "OK",
          });
        }
      }
    } catch (err: any) {
      console.error("Error fetching numbers:", err);
      if (requestVersion.current === currentVersion) {
        setAvailableNumbers([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || err.message || "Failed to fetch available numbers. Please try again.",
          showCancelButton: true,
          confirmButtonText: "Retry",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            fetchNumbersWithFallback();
          }
        });
      }
    } finally {
      if (requestVersion.current === currentVersion) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRotating(true);
    try {
      const getRandomDigit = () => Math.floor(Math.random() * 9 + 1).toString();
      const startsWith = getRandomDigit();
      const endsWith = getRandomDigit();
      const res = await fetchAvailablePhoneNumberByCountry(token, phoneData.countryCode, phoneData.city, phoneData.stateCode, startsWith, endsWith);
      if (res?.success && res?.data?.length > 0) {
        setAvailableNumbers(res.data.map((item: any) => item.phone_number));
      } else {
        const fallbackRes = await fetchAvailablePhoneNumberByCountry(token, phoneData.countryCode, "", phoneData.stateCode);
        if (fallbackRes?.success && fallbackRes?.data?.length > 0) {
          setAvailableNumbers(fallbackRes.data.map((item: any) => item.phone_number));
        } else {
          setAvailableNumbers([]);
          // Swal.fire({
          //   icon: "error",
          //   title: "No Numbers Found",
          //   text: "No numbers found. Please try a different location or refresh again.",
          //   confirmButtonText: "OK",
          // });
        }
      }
    } catch (error: any) {
      console.error("Error in handleRefresh:", error);
      setAvailableNumbers([]);
      // Swal.fire({
      //   icon: "error",
      //   title: "Error",
      //   text: error.response?.data?.error || error.message || "Failed to refresh numbers. Please try again.",
      //   confirmButtonText: "Retry",
      // });
    } finally {
      setIsRotating(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!phoneData.countryCode) newErrors.countryCode = "Country is required";
    if (!isCustomPhone && !phoneData.stateCode) newErrors.stateCode = "State is required";
    if (!phoneData.selectedNumber) newErrors.selectedNumber = "Please select or enter a phone number";
    if (isCustomPhone && !customPhoneInput.match(/^\+?\d{10,15}$/)) {
      newErrors.customPhone = "Please enter a valid phone number (10-15 digits)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumberClick = (num: string) => {
    setPhoneData((prev) => ({ ...prev, selectedNumber: num }));
    setModalOpen(true);
    setErrors((prev) => ({ ...prev, selectedNumber: "" }));
  };

  const handleCustomPhoneSubmit = async () => {

    setCustomNoBtnLoading(true)
    const response = await importPhoneToAgentFromAdmin(token, customPhoneInput, agentId, agentId)
    if (response) {
      setHasPhoneNumber(true)
      localStorage.setItem("phoneNumber", customPhoneInput);
      Swal.fire({
        icon: "success",
        title: "Number Assigned",
        text: "Phone number assigned successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      setCustomNoBtnLoading(false)
    }
    else {
       setCustomNoBtnLoading(false)
      Swal.fire({
        icon: "error",
        title: "Wrong Number",
        text: "The phone number could not be assigned. Please check and try again.",
      });
    }

  };

  const handleBuyNumber = async () => {
    if (!validate()) {
      setModalOpen(false);
      return;
    }
    setLoading(true);
    try {

      if (!agentId) {
        throw new Error("Agent ID is missing");
      }
      // const a = await createNumberOrder(token, phoneData.selectedNumber, agentId);
      // await updateAgent(agentId, { voip_numbers: [phoneData.selectedNumber] });
      // onUpdate({ phone: phoneData });
      localStorage.setItem("phoneFormData", JSON.stringify({ ...phoneData, state: stateNameFull }));
      setModalOpen(false);
      setCustomPhoneInput("");
      Swal.fire({
        icon: "success",
        title: "Number Assigned",
        text: "Phone number assigned successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      setHasPhoneNumber(true)
      localStorage.setItem("phoneNumber", phoneData.selectedNumber);
      onUpdate({ phone: phoneData });
      onNext();
    } catch (error: any) {
      console.error("Error assigning number:", error);
      let errorMsg = "Failed to assign number.";
      if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNumbers = availableNumbers.filter((num) => num.includes(search.trim()));
  useEffect(() => {
    if (phoneData.countryCode) {
      fetchNumbersWithFallback();
    }
  }, [])
  return (
    <StepWrapper step={4} totalSteps={5} title="Assign Phone Number" description="Select a phone number for your agent or enter a custom number.">
      {initialLoading && !isCustomPhone ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6"  >

          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={() => {
                setIsCustomPhone(!isCustomPhone);
                setPhoneData((prev) => ({ ...prev, selectedNumber: "" }));
                setCustomPhoneInput("");
                setErrors({});
                setAvailableNumbers([]);
              }}
              className="mb-4"
            >
              {isCustomPhone ? "Select from Available Numbers" : "Use Custom Phone Number"}
            </Button>
          </div>
          <div className={`space-y-4 ${hasPhoneNumber ? "opacity-50 pointer-events-none" : ""}`}>
            {isCustomPhone ? (
              <div className={`space-y-4 ${hasPhoneNumber ? "opacity-50 pointer-events-none" : ""}`}>

                <div className="space-y-2">
                  <Label htmlFor="customPhone">Enter Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="customPhone"
                    value={customPhoneInput}
                    onChange={(e) => {
                      setCustomPhoneInput(e.target.value);
                      setErrors((prev) => ({ ...prev, customPhone: "" }));
                    }}
                    placeholder="Enter phone number (e.g., +1234567890)"
                    className="w-full"
                  />
                  {!/^\+\d{1,15}$/.test(customPhoneInput) && customPhoneInput && (
                    <p className="text-sm text-red-600">
                      ⚠ Please enter a valid number starting with + and country code.
                    </p>
                  )}
                  {errors.customPhone && <p className="text-sm text-red-600">{errors.customPhone}</p>}
                </div>
                <Button
                  onClick={handleCustomPhoneSubmit}
                  disabled={
                    loading || hasPhoneNumber ||
                    !customPhoneInput ||
                    !/^\+\d{1,15}$/.test(customPhoneInput) // ✅ validation yahan
                  }
                  className={`bg-purple-600 hover:bg-purple-700 ${loading ||
                    !customPhoneInput ||
                    !/^\+\d{1,15}$/.test(customPhoneInput)
                    ? "cursor-not-allowed opacity-50"
                    : ""
                    }`}
                >
                  Add Number
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country <span className="text-red-500">*</span></Label>
                  <Select
                    value={phoneData.countryCode}
                    onValueChange={(v) => {
                      setPhoneData((prev) => ({ ...prev, countryCode: v, stateCode: "", city: "", selectedNumber: "" }));
                      setStateNameFull("");
                      setAvailableNumbers([]);
                      setErrors((prev) => ({ ...prev, countryCode: "", selectedNumber: "" }));
                      if (v) fetchNumbersWithFallback();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.countryCode} value={lang.countryCode}>
                          <span className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/w20/${lang.locale.split("-")[1]?.toLowerCase()}.png`}
                              alt={lang.countryName}
                              className="w-5 h-5"
                            />
                            {lang.countryName}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.countryCode && <p className="text-sm text-red-600">{errors.countryCode}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="state">State/Province <span className="text-red-500">*</span></Label>
                    <Input
                      id="state"
                      ref={stateInputRef}
                      value={stateNameFull}
                      onChange={(e) => {
                        setStateNameFull(e.target.value);
                        setErrors((prev) => ({ ...prev, stateCode: "" }));
                        if (!googlePlacesLoaded) {
                          setPhoneData((prev) => ({ ...prev, stateCode: e.target.value }));
                        }
                      }}
                      placeholder="Enter state"
                      onBlur={() => phoneData.countryCode && phoneData.stateCode && fetchNumbersWithFallback()}
                    />
                    {errors.stateCode && <p className="text-sm text-red-600">{errors.stateCode}</p>}
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      ref={cityInputRef}
                      value={phoneData.city}
                      onChange={(e) => {
                        setPhoneData((prev) => ({ ...prev, city: e.target.value }));
                        setErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      placeholder="Enter city"
                      onBlur={() => phoneData.countryCode && phoneData.stateCode && fetchNumbersWithFallback()}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search">Search Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search phone number"
                    />
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isRotating || loading || !phoneData.countryCode || !phoneData.stateCode}
                      className={isRotating ? "animate-spin" : ""}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Available Numbers <span className="text-red-500">*</span></Label>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : filteredNumbers.length > 0 ? (
                      filteredNumbers.map((num) => (
                        <div
                          key={num}
                          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${phoneData.selectedNumber === num ? "bg-purple-100" : ""}`}
                          onClick={() => handleNumberClick(num)}
                        >
                          <input
                            type="radio"
                            name="phoneNumber"
                            value={num}
                            checked={phoneData.selectedNumber === num}
                            onChange={() => handleNumberClick(num)}
                            className="cursor-pointer"
                          />
                          <span>{num}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No numbers available. Try refreshing or changing location.</p>
                    )}
                  </div>
                  {errors.selectedNumber && <p className="text-sm text-red-600">{errors.selectedNumber}</p>}
                </div>
              </div>
            )}
          </div>
          <Dialog.Root open={isModalOpen} onOpenChange={setModalOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="sm:max-w-[425px] bg-white p-6 rounded-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Dialog.Title className="text-xl font-bold">Confirm Phone Number</Dialog.Title>
                <Dialog.Description className="text-gray-600 mb-4">
                  You have chosen to assign <strong>{phoneData.selectedNumber}</strong> to your:
                </Dialog.Description>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />

                    <span>

                      <strong>Agent Name:</strong> {agentName || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    <span>
                      <strong>Business:</strong> {businessName || "Unknown"}
                    </span>
                  </div>

                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBuyNumber}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning...
                      </span>
                    ) : (
                      "Assign to agent"
                    )}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
            {agentId ? "" : <Button type="button" variant="outline" onClick={onPrevious} className="w-full sm:w-auto">
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>}
            {/* {!isCustomPhone && ( */}
            {hasPhoneNumber ? <Button
              type="button"
              disabled={!hasPhoneNumber}
              className={`w-full sm:w-auto bg-purple-600 hover:bg-purple-700 ${!hasPhoneNumber
                ? "cursor-not-allowed opacity-50"
                : ""
                }`}
            >
              Next: Payment <ChevronRight className="w-4 h-4 ml-2" />
            </Button> : ""}
            {/* )} */}
          </div>
        </div>
      )}
    </StepWrapper>
  );
};

export default AssignNumberStep;

