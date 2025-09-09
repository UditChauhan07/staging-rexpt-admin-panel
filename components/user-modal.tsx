"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { FadeLoader } from "react-spinners"
import { debounce } from "lodash"
import { check_email_Exsitence, check_Referral_Name_Exsitence } from "@/Services/auth"
import 'react-phone-input-2/lib/style.css'
import PhoneInput from 'react-phone-input-2'
import { isValidPhoneNumber, parsePhoneNumber,parsePhoneNumberFromString } from 'libphonenumber-js'


interface User {
  id: string
  name: string
  email: string
  phone: string
  role: number
  referalName?: string
  password?: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: Omit<User, "id">) => void
  user?: User | null
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "", referalName: "", password: "" })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setloading] = useState(false)
  const [referralStatus, setReferralStatus] = useState<"checking" | "available" | "taken" | null>(null)
  const [showReferralInput, setShowReferralInput] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailExists, setEmailExists] = useState(false)


  const checkReferralAvailability = useCallback(
    debounce(async (referalName: string) => {
      if (!referalName?.trim() || referalName.length < 3 || (user && user.referalName === referalName)) {
        setReferralStatus(null)
        return
      }

      setReferralStatus("checking")
      try {
        const response = await check_Referral_Name_Exsitence(referalName)
        console.log("Referral check response:", response)
        setReferralStatus(response.available ? "available" : "taken")
      } catch (error) {
        console.error("Error checking referral link:", error)
        setReferralStatus("taken")
      }
    }, 500),
    [user]
  )

  const validatePhone = (phone: string): boolean => {
  try {
    const parsed = parsePhoneNumberFromString("+"+phone)
    return parsed.isValid()
  } catch (e) {
    return false
  }
}
  useEffect(() => {
    if (showReferralInput && formData.referalName) {
      checkReferralAvailability(formData.referalName)
    } else {
      setReferralStatus(null)
    }
  }, [formData.referalName, showReferralInput, checkReferralAvailability])

  useEffect(() => {
    if (user) {
            console.log('user2',user)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role:user.isUserType || user.role || "",
        referalName: user.referalName || user.name.toLowerCase().replace(/\s+/g, "-") || "",
        password: user.password || "",
      })
      setShowReferralInput(user.referalName ? true : ["2", "3"].includes(user.role))
    } else {
      setFormData({ name: "", email: "", phone: "", role: "", referalName: "",password: "" })
      setShowReferralInput(false)
    }
    setErrors({})
    setReferralStatus(null)
  }, [user, isOpen])

  useEffect(() => {
    if (!user || (user && user.role !== formData.role)) {
      const shouldShowReferral = ["2", "3"].includes(formData.role)

      setShowReferralInput(["2", "3"].includes(formData.role))

      if (!shouldShowReferral) {
        setFormData((prev) => ({ ...prev, referalName: "" }))
        setReferralStatus(null)
      }
    }

  }, [formData.role, user])

  useEffect(() => {
    if (user) {
      console.log('user',user)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role:user.isUserType || user.role || "",
        referalName: user.referalName || user.name.toLowerCase().replace(/\s+/g, "-") || "",
        password: ""
      })

    } else {
      setFormData({ name: "", email: "", phone: "", role: "", referalName: "",password: "" })
    }
    setErrors({})
  }, [user, isOpen])
  const roleOptions = [
    { label: "User", value: "0" },
    // { label: "SuperAdmin", value: "1" },
    { label: "PartnerPlus", value: "2" },
    { label: "Junior Partner", value: "3" },
  
  ]

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
  if (!formData.phone || !validatePhone(formData.phone)) {
  newErrors.phone = "Please enter a valid phone number with country code."
}
    // ✅ Email (always required)
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // 🟡 Name (optional but must be valid if present)
    if (!formData.name?.trim() && !/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Name is required and Name must only contain letters and spaces"
    }

    // 🟡 Phone (optional but must be valid if present)
    if (formData.phone?.trim() && !/^\d{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 7 to 15 digits"
    }

    if (showReferralInput) {
      if (!formData.referalName?.trim()) {
        newErrors.referalName = "Referral code is required"
      } else if (referralStatus === "taken") {
        newErrors.referalName = "Referral code is already taken"
      }
    }
    if (!formData.role) {
      newErrors.role = "Role is required"
    }
    if (!(formData.role==="0") && !formData.password?.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password) {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

      if (!strongPasswordRegex.test(formData.password)) {
        newErrors.password =
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()
    if (!validate()) return
    
    console.log('formData', formData)
    // return
    onSave(formData)
  }

  if (!isOpen) return null
  if (loading) {
    console.log("reachedHere");
    return (
      <div
        style={{
          position: "fixed", // ✅ overlay entire screen
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.5)", // ✅ 50% white transparent
          zIndex: 9999, // ✅ ensure it's on top
        }}
      >
        <FadeLoader size={90} color="#6524EB" speedMultiplier={2} />
      </div>
    );
  }
console.log('sasasa',formData)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{user ? "Edit User" : "Add New User"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (optional, validate only if filled) */}
          <div>
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              // onChange={(e) => {setErrors({ ...errors, name: "" });setFormData({ ...formData, name: e.target.value ,referalName: e.target.value.toLowerCase().replace(/\s+/g, "")})}}
              onChange={(e) => {
                const fullName = e.target.value;

                // Get first name (before space)
                const firstName = fullName.split(" ")[0];

                // Capitalize first character of first name
                const formattedName = firstName?.toLowerCase();

                setErrors({ ...errors, name: "" });
                setFormData({
                  ...formData,
                  name: fullName, // Keep full name as entered
                  referalName: formattedName
                });
              }}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Email (required) */}
          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) => {
  setErrors({ ...errors, email: "" });
  setEmailExists(false); // 🔁 Clear on change
  setFormData({ ...formData, email: e.target.value })
}}

       onBlur={async () => {
  if (!formData.email?.trim()) return;

  try {
    const response = await check_email_Exsitence(formData.email);
    if (response.exists && (!user || user.email !== formData.email)) {
      setEmailExists(true);
      setErrors((prev) => ({
        ...prev,
        email: "Email already exists",
      }));
    }
  } catch (err) {
    console.error("Email check failed", err);
  }
}}


            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Phone (optional, validate only if filled) */}
         <div>
  <Label htmlFor="contactNumber">Contact Number</Label>
  <PhoneInput
    country={'in'} // default country
    value={formData.phone}
    onChange={(phone) => {
  setFormData({ ...formData, phone });
  setErrors({ ...errors, phone: "" });
}}

    inputClass="!w-full  !text-sm !rounded !border !border-gray-300"
    containerClass="!w-full"
    inputProps={{
      name: 'phone',
      required: true,
      id: 'contactNumber',
    }}
    specialLabel={''}
  />
  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
</div>

          <div>
            <Label htmlFor="role">
              Role <span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => {setErrors({ ...errors, role: "" });setFormData({ ...formData, role: e.target.value })}}
              className="w-full px-3 py-2 mt-1 border rounded-md text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Select Role</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
          </div>


          {showReferralInput && (
            <div>
              <Label htmlFor="referalName">Referral Code <span className="text-red-500">*</span></Label>
              <Input
                id="referalName"
                value={formData.referalName}
                // onChange={(e) => {setFormData({ ...formData, referalName: e.target.value.toLowerCase().replace(/\s+/g, "") });setErrors({ ...errors, referalName: "" });}}
                placeholder="Enter referral Code"
                onChange={(e) => {
                  const fullName = e.target.value;

                  // Get first name (before space)
                  const firstName = fullName.split(" ")[0];

                  // Capitalize first letter of first name
                  const formattedName =
                    firstName?.toLowerCase();

                  setFormData({
                    ...formData,
                    referalName: formattedName, // Set capitalized first name
                  });

                  setErrors({ ...errors, referalName: "" });
                }}
              />
              {referralStatus === "checking" && !errors.referalName && (
                <p className="text-sm text-gray-600 mt-1">Checking availability...</p>
              )}
              {referralStatus === "available" && !errors.referalName && (<>
                <p className="text-sm text-green-600 mt-1">Referral Code is available</p>
                <p className="text-sm mt-2">Referral Link :<b>https://refer.rxpt.us/{formData.referalName}</b></p>
              </>
              )}
              {referralStatus === "taken" && !errors.referalName && (
                <p className="text-sm text-red-600 mt-1">Referral Code is already taken</p>
              )}
              {errors.referalName && (
                <p className="text-sm text-red-600 mt-1">{errors.referalName}</p>
              )}
            </div>
          )}
          {/* Password Field */}
         {(formData.role === "2" || formData.role === "3"||formData.role === "4") ? (
  <div>
    <Label htmlFor="password">
      Password {!user && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(e) => {
            setErrors({ ...errors, password: "" });
          setFormData({ ...formData, password: e.target.value });
        }}
        placeholder={user ? "Leave blank to keep current password" : "Enter password"}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-2 flex items-center text-gray-500 text-sm"
      >
        {showPassword ? "Hide" : "View"}
      </button>
    </div>
    {errors.password && (
      <p className="text-sm text-red-600 mt-1">{errors.password}</p>
    )}
  </div>
) : null}


          <div className="flex gap-3 pt-4">
            <Button
  type="submit"
  className="flex-1 bg-purple-600 hover:bg-purple-700"
  disabled={emailExists}
>
  {user ? "Update User" : "Create User"}
</Button>

            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
