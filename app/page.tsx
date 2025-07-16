"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginPage } from "../components/login-page"
import AdminDashboard from "../admin-dashboard"
import { adminLogin } from "../Services/auth"
import Swal from "sweetalert2"
import { decodeToken, isAdmin } from "../utils/authUtils"


export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 🔍 Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      if(!isAdmin(token)) {
        Swal.fire("Access Denied", "You do not have permission to access this page.", "error")
      }else{
        setIsLoggedIn(true)
      }
    }
    setLoading(false)

  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await adminLogin(email, password)

      // Show success
      Swal.fire("Success", "Login successful!", "success")

      // Save token
      localStorage.setItem("token", result.token)
      localStorage.setItem("referalcode",result.referralCode)
      localStorage.setItem("userId",result.userId)
      // Update login state
      setUser({ email })
      setIsLoggedIn(true)
    } catch (error: any) {
      Swal.fire("Login Failed", error.message, "error")
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed", 
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    })

    if (result.isConfirmed) {
      localStorage.removeItem("token")
      localStorage.clear()
      setUser(null)
      setIsLoggedIn(false)
      Swal.fire("Logged out", "You have been successfully logged out.", "success")
    }
  }

  // Show nothing while checking auth status
  if (loading) {
    return null // or a spinner if you'd like
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Show dashboard if logged in
  return <AdminDashboard onLogout={handleLogout} />
}
