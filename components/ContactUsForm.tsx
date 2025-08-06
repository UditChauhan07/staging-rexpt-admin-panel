"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, SortAsc, SortDesc } from "lucide-react"
import { FadeLoader } from "react-spinners"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ContactMessage {
  id: number
  FullName: string
  Email: string
  PhoneNumber: string
  Subject: string
  Message: string
  createdAt: string
  Status:string
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const messagesPerPage = 10

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getAllEnquiries`)
        const data = await res.json()
        if (data.success) {
          setMessages(data.data)
        }
      } catch (error) {
        console.error("Error fetching contact messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const filteredMessages = messages
  .filter((msg) => {
    const matchesSearch =
      msg.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.Message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || msg.Status === statusFilter

    return matchesSearch && matchesStatus
  })
  .sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

    const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Enquiry-status-update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await res.json()

      if (result.success) {
        setMessages((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, Status: newStatus } : q
          )
        )
      } else {
        console.error("API did not return success:", result.message || result)
      }
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }


  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage)
  const startIndex = (currentPage - 1) * messagesPerPage
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + messagesPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Us Queries</h1>
          <p className="text-gray-600 mt-2">Review contact form submissions</p>
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
              <CardTitle>All Messages</CardTitle>
              <div className="flex gap-3 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                >
                  {sortOrder === "asc" ? (
                    <><SortAsc className="mr-1 h-4 w-4" /> Oldest First</>
                  ) : (
                    <><SortDesc className="mr-1 h-4 w-4" /> Newest First</>
                  )}
                </Button>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="Filter by status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="Resolved">Resolved</SelectItem>
    <SelectItem value="Not Resolved">Not Resolved</SelectItem>
  </SelectContent>
</Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-4 text-left font-semibold">Name</th>
                    <th className="py-2 px-4 text-left font-semibold">Email</th>
                    <th className="py-2 px-4 text-left font-semibold">Phone</th>
                    <th className="py-2 px-4 text-left font-semibold">Subject</th>
                    <th className="py-2 px-4 text-left font-semibold">Message</th>
                    <th className="py-2 px-4 text-left font-semibold">Date</th>
                    <th className="py-2 px-4 text-left font-semibold">Action</th>
                 
                  </tr>
                </thead>
                <tbody>
                  {paginatedMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-500">
                        No Queries found.
                      </td>
                    </tr>
                  ) : (
                    paginatedMessages.map((msg) => (
                      <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-4">{msg.FullName}</td>
                        <td className="py-2 px-4">{msg.Email}</td>
                        <td className="py-2 px-4">{msg.PhoneNumber}</td>
                        <td className="py-2 px-4">{msg.Subject}</td>
                      <td
  className="py-2 px-4 max-w-[300px] truncate"
  title={msg.Message}
>
  {msg.Message.length > 25
    ? msg.Message.slice(0, 25) + "..."
    : msg.Message}
</td>

                        <td className="py-2 px-4">{new Date(msg.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-4">
                          <Select
                            value={msg.Status || "Not Resolved"}
                            onValueChange={(value) => handleStatusChange(msg.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Not Resolved">Not Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + messagesPerPage, filteredMessages.length)} of {filteredMessages.length} messages
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
  )
}
