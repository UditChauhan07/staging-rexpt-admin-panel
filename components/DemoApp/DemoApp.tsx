"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";



export default function DemoApp() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  useEffect(() => {
      if (!userId) return;
    const generateSession = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/demoApp/generate-demoSessionId?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent('Admin')}`,
          {
            headers: {
              "Content-Type": "application/json",
             Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const { encryptedPayload, signature } = res.data;

        if (!encryptedPayload || !signature) {
          setError("Session generation failed");
          setLoading(false);
          return;
        }

        // Client-side redirect
        const signupUrl = `${process.env.NEXT_PUBLIC_DEMO_APP_URL}?sessionId=${encodeURIComponent(
          encryptedPayload
        )}&signature=${encodeURIComponent(signature)}`;

        // router.push(signupUrl);
        window.open(signupUrl, "_blank");
        window.location.reload();
      } catch (err) {
        console.error(err);
        setError("Failed to fetch demo session");
      } finally {
        setLoading(false);
      }
    };

    generateSession();
  }, [ router,userId]);
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-700 animate-pulse">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );

  return null; // Redirect ho jayega, ye render nahi hoga
}
