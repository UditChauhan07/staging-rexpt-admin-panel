"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { UserModal } from "./user-modal"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { retrieveAllRegisteredUsers, deleteUser } from "@/Services/auth"
import Swal from "sweetalert2"
import { addUser } from "@/Services/auth"

interface User {
  id: string
  name: string
  email: string
  // role: string
  status: "Active" | "Inactive" | "Suspended"
  // lastLogin: string
  registrationDate: string
  phone: string
  createdAt:string
}

interface UserManagementProps {
  onViewUser: (user: User) => void
}

export function UserManagement({ onViewUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const usersPerPage = 20

 
     async function fetchUsers() {
      try {
        const apiUsers = await retrieveAllRegisteredUsers()
        if (!Array.isArray(apiUsers)) {
          console.error("API returned error:", apiUsers)
          return
        }

        console.log(apiUsers.length, "dff")

        const mappedUsers: User[] = apiUsers.map((u: any, index: number) => ({
          id: u.userId ?? `USR${String(index + 1).padStart(3, "0")}`,
          name: u.name ?? "N/A",
          email: u.email ?? "No Email",
          // role: u.userType ?? "User",
          // status: "Active",
          // lastLogin: "-",
          registrationDate: u.createdAt ?? null, 
          phone: u.phone ?? "N/A",
          referredBy:u.referredBy??"N/A",
        }))
        console.log(mappedUsers, "mappedUsers")
        setUsers(mappedUsers)
      } catch (error) {
        console.error("Failed to fetch users", error)
      }
    }
 useEffect(() => {
    fetchUsers()
  }, [])
  // Filter and paginate
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  // Handlers unchanged
  const handleAddUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
    confirmDelete(user)
  }

  const confirmDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${user.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteUser(user.id);
        if (res && res.status === true) {
          setUsers((prev) => prev.filter((u) => u.id !== user.id));

          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'User has been deleted.',
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Failed to delete user.',
          });
        }
      } catch (error) {
        console.error(error);
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Error occurred while deleting user.',
        });
      }
    }
  };



const handleSaveUser = async (userData: Omit<User, "id">) => {
  const referredBy=localStorage.getItem("referalcode")
const referredId =localStorage.getItem("userId")
  const name = userData.name?.trim();
  const phone = userData.phone?.trim();
  const email = userData.email?.trim();

  // Build payload conditionally
  const finalPayload: any = {
    email, // always required
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
    ...(referredId ? { referredId } : {}),
    ...(referredBy ? { referredBy } : {})
  };

  // If editing, add ID
  if (editingUser?.id) {
    finalPayload.id = editingUser.id;
  }

  try {
    const response = await addUser(finalPayload);

    if (response?.status === true || response?.success === true) {
      const userId = finalPayload.id || response?.data?.userId || `USR${String(users.length + 1).padStart(3, "0")}`;
fetchUsers();
      const savedUser: User = {
        id: userId ||"",
        name: name || "",       // fallback to empty string for UI only
        email,
        phone: phone || "",
      };

      if (editingUser) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? savedUser : u)));

        Swal.fire({
          icon: 'success',
          title: 'User updated',
          text: 'User has been updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setUsers([...users, savedUser]);

        Swal.fire({
          icon: 'success',
          title: 'User created',
          text: 'User has been added successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to save user',
        text: response?.msg || 'Something went wrong.'
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong while saving the user.'
    });
  }

  setIsModalOpen(false);
  setEditingUser(null);
};

  // const getStatusBadge = (status: User["status"]) => {
  //   const variants = {
  //     Active: "bg-green-100 text-green-800",
  //     Inactive: "bg-gray-100 text-gray-800",
  //     Suspended: "bg-red-100 text-red-800",
  //   }
  //   return <Badge className={variants[status]}>{status}</Badge>
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all platform users</p>
        </div>
        <Button onClick={handleAddUser} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Referred By</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{user.id}</td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                      <td className="py-3 px-4 text-gray-600">{user.referredBy}</td>
                     
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />

      {/* <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deletingUser?.name}? This action cannot be undone.`}
      /> */}
    </div>
  )
}
