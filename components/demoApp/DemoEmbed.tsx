"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui or similar Button component
import Swal from "sweetalert2";

export default function DemoEmbed() {
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch demo token from backend
  const startDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/demo-login"); // Replace with your backend URL
      setDemoToken(response.data.token);
    } catch (err: any) {
      Swal.fire("Error", "Failed to start demo mode", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-purple-600 text-white text-center py-3 fixed top-0 left-0 w-full z-10 shadow-md">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
          AI Receptionist App Demo
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-12 px-2 sm:px-4 md:px-8 lg:px-16 w-full max-w-7xl mx-auto">
        {/* <div className="flex justify-center mb-4">
          <Button
            onClick={startDemo}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base"
          >
            {loading ? "Starting Demo..." : "Start Demo"}
          </Button>
        </div> */}

        {/* {demoToken && ( */}
          <div className="w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] shadow-lg rounded-lg overflow-hidden">
            <iframe
              src={`https://rexptin.vercel.app/?demoToken=${demoToken}`} // Replace with your React app URL
              title="AI Receptionist App"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        {/* )} */}
      </main>
    </div>
  );
}