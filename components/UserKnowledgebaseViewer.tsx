"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FadeLoader } from "react-spinners";

export default function UserKnowledgebaseViewer() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [knowledgebases, setKnowledgebases] = useState([]);
  const [selectedKbIds, setSelectedKbIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setloading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/endusers/getAllKnowledgeBaseUser`
        );
        const kbData = res.data.data || [];

        const groupedByUser = {};

        for (const item of kbData) {
          const user = item.user;
          const agentDetails = item.agentDetails || {};

          if (!user?.userId) continue;

          if (!groupedByUser[user.userId]) {
            groupedByUser[user.userId] = {
              userId: user.userId,
              name: user.name,
              email: user.email,
              agents: [],
            };
          }

          groupedByUser[user.userId].agents.push({
            knowledgeBaseId: agentDetails.knowledgeBaseId,
            agentName: agentDetails.agentName,
          });
        }

        const usersArr = Object.values(groupedByUser);
        setUsers(usersArr);
        setFilteredUsers(usersArr);
      } catch (error) {
        console.error("Error fetching all knowledgeBaseUser:", error);
      }
      setloading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.userId.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, users]);

  const handleView = (user) => {
    setSelectedUser(user);
    setKnowledgebases(user.agents || []);
    setSelectedKbIds([]);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedKbIds.length === 0) return;

    const selectedKbInfo = knowledgebases
      .filter((kb) => selectedKbIds.includes(kb.knowledgeBaseId))
      .map((kb) => `<b>${kb.agentName}</b>: ${kb.knowledgeBaseId}`)
      .join("<br>");

    const confirm = await Swal.fire({
      title: "Confirm Deletion",
      html: `
        <p>You're about to delete the following <b>${selectedKbIds.length}</b> knowledgebases:</p>
        <div class="text-left mt-2">${selectedKbInfo}</div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "z-[9999]",
      },
    });

    if (!confirm.isConfirmed) return;

    const failedDeletes = [];
    setloading(true);

    try {
      await Promise.all(
        selectedKbIds.map(async (id) => {
          try {
            await axios.delete(
              `https://api.retellai.com/delete-knowledge-base/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
                },
              }
            );
          } catch (error) {
            if (error?.response?.data?.message !== "Not Found") {
              failedDeletes.push(id);
            }
          }
        })
      );

      if (failedDeletes.length > 0) {
        Swal.fire(
          "Partial Success",
          `Some KBs could not be deleted: ${failedDeletes.join(", ")}`,
          "warning"
        );
      } else {
        Swal.fire("Deleted", "Selected knowledgebases deleted successfully.", "success");
      }

      const updatedAgents = knowledgebases.filter(
        (kb) => !selectedKbIds.includes(kb.knowledgeBaseId)
      );
      setKnowledgebases(updatedAgents);
      setSelectedKbIds([]);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong during deletion.", "error");
    }

    setloading(false);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Users with Agents</h2>
    <p className="text-gray-600 mt-2">Manage and monitor Knowledge Bases of each user</p>

      <Input
        placeholder="Search by userId, name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md mb-4"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <FadeLoader color="#3b82f6" />
        </div>
      ) : (
        <table className="w-full border-collapse border text-sm shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">User ID</th>
              <th className="p-3 border text-left">Name</th>
              <th className="p-3 border text-left">Email</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.userId} className="hover:bg-gray-50">
                <td className="p-3 border">{u.userId}</td>
                <td className="p-3 border capitalize">{u.name}</td>
                <td className="p-3 border">{u.email}</td>
                <td className="p-3 border text-center">
                  <Button size="sm" onClick={() => handleView(u)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Agents for <span className="text-blue-600">{selectedUser?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto max-h-[400px] mt-3 border rounded">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={
                        knowledgebases.length > 0 &&
                        selectedKbIds.length === knowledgebases.length
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedKbIds(
                          checked ? knowledgebases.map((kb) => kb.knowledgeBaseId) : []
                        );
                      }}
                    />
                  </th>
                  <th className="p-2 border text-left">Agent Name</th>
                  <th className="p-2 border text-left">Knowledgebase ID</th>
                </tr>
              </thead>
              <tbody>
                {knowledgebases.map((kb) => (
                  <tr key={kb.knowledgeBaseId} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedKbIds.includes(kb.knowledgeBaseId)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedKbIds((prev) =>
                            checked
                              ? [...prev, kb.knowledgeBaseId]
                              : prev.filter((id) => id !== kb.knowledgeBaseId)
                          );
                        }}
                      />
                    </td>
                    <td className="p-2 border">{kb.agentName}</td>
                    <td className="p-2 border">{kb.knowledgeBaseId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="mt-4">
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={selectedKbIds.length === 0}
              onClick={handleDelete}
            >
              Delete Selected Knowledgebases
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
