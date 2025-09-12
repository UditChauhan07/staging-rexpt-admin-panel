import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClimbingBoxLoader, FadeLoader } from "react-spinners";
import { ChevronRight, Loader2 } from "lucide-react";
import { debounce } from "lodash";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Swal from "sweetalert2";
import { check_email_Exsitence, check_Referral_Name_Exsitence, addUser } from "@/Services/auth";
import StepWrapper from "./StepWrapper";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  referalName?: string;
  password?: string;
  customerId : string
}

interface FormData {
  user?: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    referalName: string;
    password: string;
    customerId : string
  };
}

interface UserCreationStepProps {
  data: FormData;
  onUpdate: (updates: { user: FormData["user"] }) => void;
  onNext: () => void;
  editingUser?: User | null;
  fetchUsers: () => void;
}

const UserCreationStep: React.FC<UserCreationStepProps> = ({ data, onUpdate, onNext, editingUser, fetchUsers }) => {
  const [formData, setFormData] = useState<FormData["user"]>(
    data.user || { name: "", email: "", phone: "", role: "", referalName: "", password: "" , customerId : "" }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [referralStatus, setReferralStatus] = useState<"checking" | "available" | "taken" | null>(null);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [userCheck, setuserCheck] = useState({name:'',phone:''});

  const checkReferralAvailability = useCallback(
    debounce(async (referalName: string) => {
      if (!referalName?.trim() || referalName.length < 3) {
        setReferralStatus(null);
        return;
      }
      setReferralStatus("checking");
      try {
        const response = await check_Referral_Name_Exsitence(referalName);
        setReferralStatus(response.available ? "available" : "taken");
      } catch (error) {
        console.error("Error checking referral link:", error);
        setReferralStatus("taken");
      }
    }, 500),
    []
  );

  const validatePhone = (phone: string): boolean => {
    try {
      const parsed = parsePhoneNumberFromString("+" + phone);
      return parsed?.isValid() || false;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (showReferralInput && formData.referalName) {
      checkReferralAvailability(formData.referalName);
    } else {
      setReferralStatus(null);
    }
  }, [formData.referalName, showReferralInput, checkReferralAvailability]);

  useEffect(() => {
    if (data.user) {
      setFormData(data.user);
      console.log({data})
      setShowReferralInput(["2", "3"].includes(data.user.role));
    } else if (editingUser) {
      setFormData({
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        referalName: editingUser.referalName || "",
        password: "",
      });
      setShowReferralInput(["2", "3"].includes(editingUser.role));
    } else {
      setFormData({ name: "", email: "", phone: "", role: "", referalName: "", password: "" });
      setShowReferralInput(false);
    }
    setErrors({});
    setReferralStatus(null);
    setEmailExists(false);
  }, [data.user, editingUser]);

  useEffect(() => {
    const shouldShowReferral = ["2", "3"].includes(formData.role);
    setShowReferralInput(shouldShowReferral);
    if (!shouldShowReferral) {
      setFormData((prev) => ({ ...prev, referalName: "" }));
      setReferralStatus(null);
    }
  }, [formData.role]);

  const roleOptions = [
    { label: "User", value: "0" },
    { label: "PartnerPlus", value: "2" },
    { label: "Junior Partner", value: "3" },
    { label: "Affiliate", value: "4" },
  ];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim() || !/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Name is required and must only contain letters and spaces";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone?.trim() || !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number with country code";
    }
    if (showReferralInput) {
      if (!formData.referalName?.trim()) {
        newErrors.referalName = "Referral code is required";
      } else if (referralStatus === "taken") {
        newErrors.referalName = "Referral code is already taken";
      }
    }
    if (!editingUser && ["2", "3", "4"].includes(formData.role) && !formData.password?.trim() && !emailExists) {
      newErrors.password = "Password is required";
    } else if (formData.password && !emailExists) {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (!strongPasswordRegex.test(formData.password)) {
        newErrors.password = "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validate()) return false;

    setLoading(true);
    const payload: any = {
      email: formData.email?.trim(),
      ...(formData.name ? { name: formData.name.trim() } : {}),
      ...(formData.phone ? { phone: formData.phone.trim() } : {}),
      ...(formData.role ? { role: formData.role, isUserType: formData.role } : {}),
      ...(formData.referalName ? { referalName: formData.referalName.trim() } : {}),
      ...(formData.password ? { password: formData.password.trim() } : {}),
    };

    if (editingUser?.id) {
      payload.id = editingUser.id;
    } else {
      const referredBy = typeof window !== "undefined" ? localStorage.getItem("referralCode") : null;
      const referredId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (referredBy) payload.referredBy = referredBy;
      if (referredId) payload.referredId = referredId;
    }

    try {
      const response = await addUser(payload);
      if (response?.status === true) {

        const userId = response?.user?.userId || "";
        console.log({response})
        localStorage.setItem("customerId" ,response?.user?.customerId )
        if (typeof window !== "undefined") {
          localStorage.setItem("AgentForUserId", userId);
          localStorage.setItem("client_id", response?.user?.client_id || "");
        }
        const savedUser: FormData["user"] = {
          id: userId,
          name: formData.name || "",
          email: formData.email,
          phone: formData.phone || "",
          role: formData.role,
          referalName: formData.referalName || "",
          password: formData.password || "",
        };

        onUpdate({ user: savedUser });
        fetchUsers();

        Swal.fire({
          icon: "success",
          title: editingUser ? "User updated" : "User created",
          text: editingUser ? "User has been updated successfully!" : "User has been added successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to save user",
          text: response?.data.error || "Something went wrong.",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Save user error:", error);
      let errorMsg = "Something went wrong while saving the user.";
      if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (formData.email?.trim()) {
        const response = await check_email_Exsitence(formData.email);
        if (response.exists && !editingUser) {
          setEmailExists(true);
          setErrors((prev) => ({ ...prev, email: "User already exists.Create agent directly" }));
          if (typeof window !== "undefined") {
            localStorage.setItem("customerId" ,response?.user?.customerId )
            localStorage.setItem("AgentForUserId", response?.user?.userId );

          }
          const existingUser: FormData["user"] = {
            id: response.userId || "",
            name: formData.name || "",
            email: formData.email,
            phone: formData.phone || "",
            role: formData.role,
            referalName: formData.referalName || "",
            password: formData.password || "",
          };
          onUpdate({ user: existingUser });
          setLoading(false);
          onNext(); // Proceed to Business Details step
          return;
        }
      }
      const success = await handleSaveUser();
      if (success) {
        onNext();
      }
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email?.trim() || editingUser?.email === formData.email) return;
    try {
      const response = await check_email_Exsitence(formData.email);
      
      if (response.exists) {
        setEmailExists(true);
    
        setErrors((prev) => ({ ...prev, email: "User already exists.Create agent direct" }));
        setFormData({ ...formData, name: response?.user?.name ,phone: response?.user?.phone });
        setuserCheck({name:response?.user?.name,phone:response?.user?.phone})
        if (typeof window !== "undefined") {

          localStorage.setItem("AgentForUserId", response?.user?.userId );
          // localStorage.setItem("customerId", response.user.userId );

        }
      } else {
        setEmailExists(false);
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } catch (err) {
      console.error("Email check failed", err);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fullName = e.target.value;
    const firstName = fullName.split(" ")[0]?.toLowerCase().replace(/\s+/g, "-") || "";
    setErrors({ ...errors, name: "" });
    setFormData({ ...formData, name: fullName, phone: firstName });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({ ...errors, email: "" });
    setEmailExists(false);
    setFormData({ ...formData, email: e.target.value });
  };

  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
    setFormData({ ...formData, referalName: value });
    setErrors({ ...errors, referalName: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FadeLoader size={50} color="#6524EB" />
      </div>
    );
  }

  return (
    <StepWrapper step={1} totalSteps={6} title="User Creation" description="Create or edit a user account.">
      <form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
             <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Enter email"
              className={emailExists ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input id="name" value={formData.name}  readOnly={emailExists && !!userCheck.name} 
             onChange={handleNameChange} placeholder="Enter full name" />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
       
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
            <PhoneInput
             disabled={emailExists && !!userCheck.phone}
              country="in"
              value={formData.phone}
              onChange={(phone) => {
                setFormData({ ...formData, phone });
                setErrors({ ...errors, phone: "" });
              }}
              inputClass="!w-full !text-sm !rounded-md !border !border-gray-300 focus:!border-purple-500"
              containerClass="!w-full"
              inputProps={{ name: "phone", id: "phone", required: true }}
              specialLabel=""
             

            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
            <Select
              value={formData.role}
              onValueChange={(value) => {
                setErrors({ ...errors, role: "" });
                setFormData({ ...formData, role: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
          </div> */}
          {showReferralInput && (
            <div className="space-y-2">
              <Label htmlFor="referalName">Referral Code <span className="text-red-500">*</span></Label>
              <Input
                id="referalName"
                value={formData.referalName}
                onChange={handleReferralChange}
                placeholder="Enter referral code"
              />
              {referralStatus === "checking" && <p className="text-sm text-gray-600">Checking availability...</p>}
              {referralStatus === "available" && (
                <>
                  <p className="text-sm text-green-600">Referral Code is available</p>
                  <p className="text-sm text-gray-700">Link: <span className="font-semibold">https://refer.rxpt.us/{formData.referalName}</span></p>
                </>
              )}
              {referralStatus === "taken" && <p className="text-sm text-red-600">Referral Code is already taken</p>}
              {errors.referalName && <p className="text-sm text-red-600">{errors.referalName}</p>}
            </div>
          )}
          {["2", "3", "4"].includes(formData.role) && (
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setErrors({ ...errors, password: "" });
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  placeholder="Enter strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            Next: Business Details
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
};


export default UserCreationStep;

