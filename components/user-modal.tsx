"use client"

import type React from "react"
import { useState, useEffect ,useCallback} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { FadeLoader  } from "react-spinners"
import { debounce } from "lodash"
import { check_Referral_Name_Exsitence } from "@/Services/auth"

interface User {
  id: string
  name: string
  email: string
  phone: string
   role: string 
   referalName?: string // Added referalName
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: Omit<User, "id">) => void
  user?: User | null
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "" ,referalName: "" })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
const [loading,setloading]=useState(false)
const [referralStatus, setReferralStatus] = useState<"checking" | "available" | "taken" | null>(null)
const [showReferralInput, setShowReferralInput] = useState(false)

  const checkReferralAvailability = useCallback(
    debounce(async (referalName: string) => {
      if (!referalName.trim() || (user && user.referalName === referalName)) {
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

    useEffect(() => {
    if (showReferralInput && formData.referalName) {
      checkReferralAvailability(formData.referalName)
    } else {
      setReferralStatus(null)
    }
  }, [formData.referalName, showReferralInput, checkReferralAvailability])

useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      referalName: user.referalName || user.name.toLowerCase().replace(/\s+/g, "-") || ""
    })
    setShowReferralInput(user.referalName ? true : ["2", "3"].includes(user.role))
  } else {
    setFormData({ name: "", email: "", phone: "", role: "", referalName: "" })
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
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role:user.role||"",
        referalName: user.referalName || user.name.toLowerCase().replace(/\s+/g, "-") || ""
      })

    } else {
      setFormData({ name: "", email: "", phone: "" , role: "" ,referalName:""})
    }
    setErrors({})
  }, [user, isOpen])
  const roleOptions = [
  { label: "User", value: "0" },
  // { label: "SuperAdmin", value: "1" },
  { label: "PartnerPlus", value: "2" },
  { label: "Junior Partner", value: "3" },
  { label: "Affiliate", value: "4" },
]

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    // ✅ Email (always required)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // 🟡 Name (optional but must be valid if present)
    if (!formData.name.trim() && !/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Name is required and Name must only contain letters and spaces"
    }

    // 🟡 Phone (optional but must be valid if present)
    if (formData.phone.trim() && !/^\d{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 7 to 15 digits"
    }

if (showReferralInput) {
    if (!formData.referalName.trim()) {
      newErrors.referalName = "Referral code is required"
    } else if (referralStatus === "taken") {
      newErrors.referalName = "Referral code is already taken"
    } else if (!/^[A-Z0-9-]+$/.test(formData.referalName)) {
      newErrors.referalName = "Referral code can only contain uppercase letters, numbers, and hyphens"
    }
  }
if (!formData.role) {
  newErrors.role = "Role is required"
}
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    
    e.preventDefault()
    if (!validate()) return
    console.log('formData',formData)
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value ,referalName: e.target.value.toUpperCase().replace(/\s+/g, "-")})}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Email (required) */}
          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Phone (optional, validate only if filled) */}
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
    onChange={(e) => {setFormData({ ...formData, referalName: e.target.value.toUpperCase().replace(/\s+/g, "-") });setErrors({ ...errors, referalName: "" });}}
    placeholder="Enter referral Code"
  />
  {referralStatus === "checking" && !errors.referalName && (
    <p className="text-sm text-gray-600 mt-1">Checking availability...</p>
  )}
  {referralStatus === "available"  && !errors.referalName && (<>
    <p className="text-sm text-green-600 mt-1">Referral Code is available</p>
    <p className="text-sm mt-2">Referral Link :<b>https://app.rexpt.in/{formData.referalName}</b></p>
    </>
  )}
  {referralStatus === "taken"  && !errors.referalName && (
    <p className="text-sm text-red-600 mt-1">Referral Code is already taken</p>
  )}
  {errors.referalName && (
    <p className="text-sm text-red-600 mt-1">{errors.referalName}</p>
  )}
      </div>
        )}


          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
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
