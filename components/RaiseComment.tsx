"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { FadeLoader } from "react-spinners";

// Interface
interface Schedule {
  id: string;
  userId?: string; // Optional for users
  agentId?: string; // Optional for agents
  email: string;
  comment: string;
  Status: string;
}

export default function RaiseComment() {
  const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
  const [agentSchedules, setAgentSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"users" | "agents">("users");

  const schedulesPerPage = 10;

  // Fetch data based on active tab
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const endpoint =
          activeTab === "users"
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/endusers/getallrequest`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/getallagentraiserequest`;

        const res = await fetch(endpoint);
        const data = await res.json();
        console.log(data, ` <-- ${activeTab} API Response`);

        if (data.data) {
          if (activeTab === "users") {
            setUserSchedules(data.data);
          } else {
            setAgentSchedules(data.data);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} schedules:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [activeTab]);

  // Reset pagination and search when switching tabs
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setSortOrder("desc");
  }, [activeTab]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const endpoint =
        activeTab === "users"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/endusers/updateraiseRequest/${id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/updateagentRequest/${id}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      console.log("Update response:", result);

      if (res.ok) {
        const updateFunction =
          activeTab === "users" ? setUserSchedules : setAgentSchedules;

        updateFunction((prev) =>
          prev.map((sch) =>
            (activeTab === "users" ? sch.userId : sch.agentId) === id
              ? { ...sch, Status: newStatus }
              : sch
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Determine which schedules to display based on active tab
  const schedules = activeTab === "users" ? userSchedules : agentSchedules;

  const filteredSchedules = schedules
    .filter((sch) => {
      const idField = activeTab === "users" ? sch.userId : sch.agentId;
      const matchesSearch =
        String(sch.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(idField || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(sch.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(sch.comment || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return String(a.id).localeCompare(String(b.id));
      } else {
        return String(b.id).localeCompare(String(a.id));
      }
    });

  const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);
  const startIndex = (currentPage - 1) * schedulesPerPage;
  const paginatedSchedules = filteredSchedules.slice(
    startIndex,
    startIndex + schedulesPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeTab === "users" ? "User Comments" : "Agent Comments"}
          </h1>
          <p className="text-gray-600 mt-2">
            Review all submitted {activeTab === "users" ? "user" : "agent"}{" "}
            comments
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "users" | "agents")}
      >
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FadeLoader size={60} color="#6524EB" speedMultiplier={1.5} />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <CardTitle>
                    All {activeTab === "users" ? "User" : "Agent"} Comments
                  </CardTitle>
                  <div className="flex gap-3 items-center">
                    {/* Search */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Sort */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      {sortOrder === "asc" ? (
                        <>
                          <SortAsc className="mr-1 h-4 w-4" /> Ascending
                        </>
                      ) : (
                        <>
                          <SortDesc className="mr-1 h-4 w-4" /> Descending
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-4 text-left font-semibold">
                          ID
                        </th>
                        <th className="py-2 px-4 text-left font-semibold">
                          {activeTab === "users" ? "User ID" : "Agent ID"}
                        </th>
                        <th className="py-2 px-4 text-left font-semibold">
                          Email
                        </th>
                        <th className="py-2 px-4 text-left font-semibold">
                          Comment
                        </th>
                        <th className="py-2 px-4 text-left font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSchedules.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-gray-500"
                          >
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        paginatedSchedules.map((sch, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 px-4">{sch.id}</td>
                            <td className="py-2 px-4">
                              {activeTab === "users" ? sch.userId : sch.agentId}
                            </td>
                            <td className="py-2 px-4">{sch.email}</td>
                            <td className="py-2 px-4">{sch.comment}</td>
                            <td className="py-2 px-4">
                              <select
                                value={sch.Status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    (activeTab === "users"
                                      ? sch.userId
                                      : sch.agentId) || "",
                                    e.target.value
                                  )
                                }
                                className="border rounded p-1 text-sm"
                              >
                                <option value="Resolved">Resolved</option>
                                <option value="Not Resolved">
                                  Not Resolved
                                </option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + schedulesPerPage,
                      filteredSchedules.length
                    )}{" "}
                    of {filteredSchedules.length} comments
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                      {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
