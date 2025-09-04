"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
} from "lucide-react";
import {
  retrieveAllRegisteredUsers2,
  deleteAgent,
  deactivateAgent,
  fetchAgentDetailById,
} from "@/Services/auth";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";
import AddAgentModal from "./Agentdetial";
import { retrieveAllRegisteredUsers } from "@/Services/auth";
import { FadeLoader } from "react-spinners";
import EditAgentModal from "./EditAgent";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AgentBusinessRow {
  agentId: string;
  agentName: string;
  businessName: string;
  userName: string;
  userEmail: string;
  agentPlan: string;
  status?: number;
  businessId: string;
  agentCreatedBy: string;
  userId: string;
}

interface AgentBusinessListProps {
  onViewAgent: (
    agent: any,
    business: any,
    knowledge_base_texts: any,
    total_call: any
  ) => void;
}
export function AgentBusinessList({ onViewAgent }: AgentBusinessListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [agentData, setAgentData] = useState<AgentBusinessRow[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentBusinessRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [usersList, setuserList] = useState<User[]>([]);
  const [userDetails, setUserdetails] = useState<User[]>([]);
  const [selectedAgentInfo, setSelectedAgentInfo] = useState<{
    agentId: string;
    businessId: string;
    userId: string;
  } | null>(null);
  console.log(selectedAgentInfo, "selectAgentinfo");

  const [loading, setLoading] = useState(false);
  const [loaders, setLoaders] = useState(false);
  const [sortBy, setSortBy] = useState<keyof AgentBusinessRow | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [isEditAgentModalOpen, setEditAgentModal] = useState(false);
  const sortedAgents = [...agentData].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy] ?? "";
    const bValue = b[sortBy] ?? "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  console.log(selectedAgent, "selectedAgent");

  async function fetchUsers() {
    try {
      setLoaders(true);
      const apiUsers = await retrieveAllRegisteredUsers();
      if (!Array.isArray(apiUsers)) {
        console.error("API returned error:", apiUsers);
        return;
      }
      console.log(apiUsers, "response of agents");
      console.log(apiUsers.length, "dff");

      const mappedUsers: User[] = apiUsers.map((u: any, index: number) => ({
        id: u.userId ?? `USR${String(index + 1).padStart(3, "0")}`,
        name: u.name ?? "N/A",
        email: u.email ?? "No Email",
        phone: u.phone ?? "N/A",
      }));
      console.log(mappedUsers, "mappedUsers");
      setuserList(mappedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setLoaders(false);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchData = async () => {
    setLoaders(true);
    const res = await retrieveAllRegisteredUsers2();
    console.log(res.length, "response of agents");
    console.log(res, "resres");
    const flatList: AgentBusinessRow[] = [];
    console.log(agentData, "agentdata");

    res?.data?.forEach((user: any) => {
      user.businesses?.forEach((business: any) => {
        if (!business || !business.agents) return;

        business.agents.forEach((agent: any) => {
          if (!agent) return;
          flatList.push({
            businessId: business.businessId || business._id || "-",
            agentId: agent.agentId || agent.agent_id || "-",
            agentName: agent.agentName || "-",
            agentPlan: agent.agentPlan || "-",
            agentCreatedBy: agent.agentCreatedBy || "-",
            businessName: business.businessName || "-",
            userName: user.userName || "-",
            userEmail: user.userEmail || "-",
            status: agent.agentStatus ?? 1,
            userId: user?.userId || agent?.userId || "-",
          });
        });
      });
    });
    setAgentData(flatList);
    setLoaders(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const agentsPerPage = 10;
  const filteredAgents = sortedAgents.filter((row) => {
    const name = row.agentName || "";
    const business = row?.businessName || "";
    const user = row.userName || "";
    const email = row.userEmail || "";

    if (statusFilter !== "all" && String(row.status) !== statusFilter)
      return false;
    if (planFilter !== "all" && row.agentPlan !== planFilter) return false;

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);
  const startIndex = (currentPage - 1) * agentsPerPage;
  const paginatedAgents = filteredAgents.slice(
    startIndex,
    startIndex + agentsPerPage
  );

  const handleDeleteClick = (agent: AgentBusinessRow) => {
    setSelectedAgent(agent);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAgent) return;

    Swal.fire({
      title: "Deleting...",
      text: "Please wait while we delete the agent.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      setLoading(true);
      await deleteAgent(selectedAgent.agentId);
      setAgentData((prev) =>
        prev.filter((agent) => agent.agentId !== selectedAgent.agentId)
      );
      setLoading(false);
      Swal.close();
      await fetchData();
      await Swal.fire({
        icon: "success",
        title: "Agent deleted",
        text: `${selectedAgent.agentName} has been removed successfully.`,
        confirmButtonColor: "#5a1fc0",
      });
    } catch (err) {
      console.error("Failed to delete agent:", err);
      setLoading(false);
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Deletion failed",
        text: "Something went wrong while deleting the agent.",
        confirmButtonColor: "#e02424",
      });
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setSelectedAgent(null);
      setLoading(false);
    }
  };

  const handleDeactivateAgent = async (agent: AgentBusinessRow) => {
    if (!agent) return;

    const result = await Swal.fire({
      title: "Deactivate Agent?",
      text: `Are you sure you want to deactivate agent "${agent.agentName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Deactivating...",
        text: "Please wait while we deactivate the agent.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        setLoading(true);
        const response = await deactivateAgent(agent.agentId);
        Swal.close();
        await fetchData();
        if (response?.status === true) {
          setLoading(false);
          await Swal.fire({
            icon: "success",
            title: "Agent Deactivated",
            text: `${agent.agentName} has been successfully deactivated.`,
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          setLoading(false);
          await Swal.fire({
            icon: "error",
            title: "Failed",
            text: response?.msg || "Could not deactivate the agent.",
          });
        }
      } catch (err) {
        console.error("Error deactivating agent:", err);
        setLoading(false);
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while deactivating the agent.",
        });
      } finally {
        setShowConfirm(false);
        setSelectedAgent(null);
      }
    }
  };

  const handleAgentClick = async (row: AgentBusinessRow) => {
    try {
      //  setLoading(true)
      const { agentId, businessId } = row;
      console.log(row);
      const data = await fetchAgentDetailById({
        agentId,
        bussinesId: businessId,
      });
      console.log("dsdsdsdsdsdewrerrewrew", data);
      onViewAgent(
        data?.data?.agent,
        data?.data?.business,
        data?.data?.knowledge_base_texts
      );
      //  setLoading(false)
    } catch (err) {
      console.error("Error fetching agent details", err);
      setLoading(false);
    }
  };
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
  console.log(paginatedAgents);
  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Agent Business List
          </h1>
          <p className="text-gray-600 mt-2">
            Manage agents across all businesses
          </p>
        </div>
        <div>
          {" "}
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsAgentModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Agent
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Agents</CardTitle>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search agents or businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="border px-3 py-1 rounded-md text-sm"
              >
                <option value="all">All </option>
                {[...new Set(agentData.map((a) => a.agentPlan))].map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-3 py-1 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    User Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    User Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Business Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Agent Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Agent Id
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Agent Type
                  </th>
                  <th
                    onClick={() => {
                      setSortBy("status");
                      setSortDirection((prev) =>
                        sortBy === "status" && prev === "asc" ? "desc" : "asc"
                      );
                    }}
                    className="cursor-pointer text-left py-3 px-4 font-semibold text-gray-700"
                  >
                    Agent Status{" "}
                    {sortBy === "status" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => {
                      setSortBy("agentPlan");
                      setSortDirection((prev) =>
                        sortBy === "agentPlan" && prev === "asc"
                          ? "desc"
                          : "asc"
                      );
                    }}
                    className="cursor-pointer text-left py-3 px-4 font-semibold text-gray-700"
                  >
                    Plan{" "}
                    {sortBy === "agentPlan" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>

                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loaders ? (
                  <tr>
                    <td colSpan={8}>
                      <div
                        className="flex justify-center items-center py-6 "
                        style={{ marginTop: "25%", marginBottom: "50%" }}
                      >
                        <FadeLoader
                          height={10}
                          width={3}
                          color="#6524EB"
                          speedMultiplier={1.5}
                        />
                      </div>
                    </td>
                  </tr>
                ) : paginatedAgents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No agents found.
                    </td>
                  </tr>
                ) : (
                  paginatedAgents.map((row) => (
                    <tr
                      key={row.agentId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-600">
                        {row.userName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {row.userEmail}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {row.businessName}
                      </td>
                      <td className="py-3 px-4 font-medium">{row.agentName}</td>
                      <td className="py-3 px-4 font-medium">{row.agentId}</td>
                      <td className="py-3 px-4 font-medium">
                        {row.agentCreatedBy}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {row.status === 1 ? (
                          <span className="text-green-600 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {row.agentPlan}
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAgentClick(row)}
                          className="hover:bg-purple-50 hover:text-purple-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                      {/* <td  className="py-3 ">
  <Button
    size="sm"
    variant="outline"
    disabled={row.agentCreatedBy === "partner"}
    className={`hover:bg-purple-50 hover:text-purple-700 ${
      row.agentCreatedBy === "partner" ? "cursor-not-allowed opacity-50" : ""
    }`}
    onClick={() => {
      if (row.agentCreatedBy !== "partner") {
        setSelectedAgentInfo({
          agentId: row.agentId,
          businessId: row.businessId,
          userId:row.userId
        });
        setEditAgentModal(true);
      }
    }}
  >
    <Edit className="h-4 w-4" />
  </Button>
</td> */}

                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(row)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              {Math.min(startIndex + agentsPerPage, filteredAgents.length)} of{" "}
              {filteredAgents.length} agents
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditAgentModal
        isOpen={isEditAgentModalOpen}
        onClose={() => {
          setEditAgentModal(false);
          setUserSearch("");
        }}
        UserData={usersList}
        agentId={selectedAgentInfo?.agentId}
        businessId={selectedAgentInfo?.businessId}
        userId={selectedAgentInfo?.userId}
        onSubmit={(formData) => {
          console.log("Final Form Data:", formData);
          // 🚀 Call your backend API here

          setEditAgentModal(false); // close modal after submit
        }}
      />

      <AddAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => {
          setIsAgentModalOpen(false);
          setUserSearch("");
        }}
        allUsers={usersList}
        onSubmit={(formData) => {
          console.log("Final Form Data:", formData);

          setIsAgentModalOpen(false);
        }}
      />

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this agent:{" "}
            <strong>{selectedAgent?.agentName}</strong>?
          </p>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedAgent) return;
                setShowConfirm(false);
                handleDeactivateAgent(selectedAgent);
              }}
            >
              Deactivate
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
