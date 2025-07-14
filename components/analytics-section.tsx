"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalytics } from "../Services/auth";
import Swal from "sweetalert2";
import { FadeLoader } from "react-spinners";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function AnalyticsSection() {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalAgents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          totalAgents: data.totalAgents || 0,
        });
      } catch (err: any) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = [
    { name: "Users", value: analytics.totalUsers },
    { name: "Agents", value: analytics.totalAgents },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="animate-in slide-in-from-left-5 duration-700">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-xl text-gray-600 mt-2">Overview of your platform's key metrics</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
        {/* Users */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-purple-600 text-center">Total Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 flex justify-center items-center h-12">
              {loading ? (
                <FadeLoader height={10} width={3} color="#6524EB" speedMultiplier={1.5} />
              ) : (
                analytics.totalUsers
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agents */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-blue-600 text-center">Total Agent Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 flex justify-center items-center h-12">
              {loading ? (
                <FadeLoader height={10} width={3} color="#6524EB" speedMultiplier={1.5} />
              ) : (
                analytics.totalAgents
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <br/>
      <br/>
      <br/>
      <br/>


      {/* Bar Chart */}
      {!loading && (
        <div className="mt-8">
          <Card className="p-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Users vs Agents (Visual)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
  data={chartData}
  layout="vertical"
  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis dataKey="name" type="category" />
  <Tooltip />
  <Bar dataKey="value" fill="#6524EB
" radius={[10, 10, 0, 0]} />
</BarChart>

              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
