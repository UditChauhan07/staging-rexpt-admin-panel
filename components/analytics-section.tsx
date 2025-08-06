"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalytics } from "../Services/auth";
import Swal from "sweetalert2";
import { FadeLoader } from "react-spinners";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function AnalyticsSection() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    paidUsers: 0,
    freeUsers: 0,
    totalAgents: 0,
    ouragents: 0,
    totalsubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          paidUsers: data.paidUsers || 0,
          freeUsers: data.freeUsers || 0,
          totalAgents: data.totalAgents || 0,
          ouragents: data.ouragents || 0,
          totalsubscriptions: data.totalsubscriptions || 0,
        });
      } catch (err: any) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ["#34D399", "#6366F1"]; // free, paid

  const pieData = [
    { name: "Free Users", value: analytics.freeUsers },
    { name: "Paid Users", value: analytics.paidUsers },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="animate-in slide-in-from-left-5 duration-700">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xl text-gray-600 mt-2">
          Overview of your platform's key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <MetricCard
          title="Total Users"
          color="purple"
          value={analytics.totalUsers}
          loading={loading}
        />
        {/* Paid Users */}
        <MetricCard
          title="Paid Users"
          color="blue"
          value={analytics.paidUsers}
          loading={loading}
        />
        {/* Free Users */}
        <MetricCard
          title="Free Users"
          color="green"
          value={analytics.freeUsers}
          loading={loading}
        />
        {/* Total Agents */}
        <MetricCard
          title="Total Agents (Retell)"
          color="cyan"
          value={analytics.totalAgents}
          loading={loading}
        />
        {/* Our Agents */}
        <MetricCard
          title="Our DB Agents"
          color="pink"
          value={analytics.ouragents}
          loading={loading}
        />
        {/* Subscriptions */}
        <MetricCard
          title="Total Subscriptions"
          color="orange"
          value={analytics.totalsubscriptions}
          loading={loading}
        />
      </div>

      {/* Pie Chart */}
      {!loading && (
        <div className="mt-8">
          <Card className="p-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">
                Free vs Paid Users
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Card component
function MetricCard({
  title,
  value,
  loading,
  color = "gray",
}: {
  title: string;
  value: number;
  loading: boolean;
  color?: string;
}) {
  const borderColor = `border-l-${color}-500`;
  const textColor = `text-${color}-600`;

  return (
    <Card className={`border-l-4 ${borderColor} hover:shadow-lg hover:scale-105 transition-all duration-300`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-xl font-medium ${textColor} text-center`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 flex justify-center items-center h-12">
          {loading ? (
            <FadeLoader height={10} width={3} color="#6524EB" speedMultiplier={1.5} />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
}
