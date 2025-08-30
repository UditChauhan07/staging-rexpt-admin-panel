"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { FadeLoader } from "react-spinners";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ✅ New interface for Agent Schedule
interface AgentSchedule {
  userId: string;
  agent_id: string;
  agentName: string;
  businessName: string;
  businessType: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export default function HelpusQueries() {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const schedulesPerPage = 10;

  // ✅ Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/getagentschedule`
        );
        const data = await res.json();
        console.log(data, " <-- API Response");
        if (data.data) {
          setSchedules(data.data);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const filteredSchedules = schedules
    .filter((sch) => {
      const matchesSearch =
        sch.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sch.notes?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime()
        : new Date(b.scheduledDate).getTime() -
            new Date(a.scheduledDate).getTime();
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
          <h1 className="text-3xl font-bold text-gray-900">Agent Schedules</h1>
          <p className="text-gray-600 mt-2">Review all scheduled meetings</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FadeLoader size={60} color="#6524EB" speedMultiplier={1.5} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle>All Schedules</CardTitle>
              <div className="flex gap-3 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                >
                  {sortOrder === "asc" ? (
                    <>
                      <SortAsc className="mr-1 h-4 w-4" /> Oldest First
                    </>
                  ) : (
                    <>
                      <SortDesc className="mr-1 h-4 w-4" /> Newest First
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
                      Agent Name
                    </th>
                    <th className="py-2 px-4 text-left font-semibold">
                      Agent ID
                    </th>
                    <th className="py-2 px-4 text-left font-semibold">
                      Business Name
                    </th>
                    <th className="py-2 px-4 text-left font-semibold">
                      Business Type
                    </th>
                    <th className="py-2 px-4 text-left font-semibold">
                      Scheduled Date
                    </th>
                    <th className="py-2 px-4 text-left font-semibold">
                      Scheduled Time
                    </th>
                    <th className="py-2 px-4 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSchedules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-500"
                      >
                        No schedules found.
                      </td>
                    </tr>
                  ) : (
                    paginatedSchedules.map((sch, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-4">{sch.agentName}</td>
                        <td className="py-2 px-4">{sch.agent_id}</td>
                        <td className="py-2 px-4">{sch.businessName}</td>
                        <td className="py-2 px-4">{sch.businessType}</td>
                        <td className="py-2 px-4">
                          {new Date(sch.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4">{sch.scheduledTime}</td>
                        <td className="py-2 px-4">{sch.notes || "-"}</td>
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
                of {filteredSchedules.length} schedules
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
    </div>
  );
}
