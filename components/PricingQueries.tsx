"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc } from "lucide-react"
import { FadeLoader } from "react-spinners"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PricingEnquiry {
  id: number
  FirstName: string
  LastName: string
  CellPhoneNumber: string
  WorkEmail: string
  Company: string
  createdAt: string
  Status?: string 
}

export default function PricingQueries() {
  const [queries, setQueries] = useState<PricingEnquiry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [monthFilter, setMonthFilter] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState("")
  const queriesPerPage = 10

  useEffect(() => {
    const fetchQueries = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-pricing-enquiry`)
        const data = await res.json()
        if (data.success) {
          const enrichedData = data.data.map((q: PricingEnquiry) => ({
            ...q,
          }))
          setQueries(enrichedData)
        }
      } catch (error) {
        console.error("Error fetching pricing enquiries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQueries()
  }, [])

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-pricing-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await res.json()

      if (result.success) {
        setQueries((prev) =>
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

  const filteredQueries = queries
  .filter((q) => {
    const matchesSearch =
      q.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.WorkEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.Company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMonth = monthFilter
      ? new Date(q.createdAt).getMonth() + 1 === parseInt(monthFilter)
      : true

    const matchesStatus = statusFilter ? q.Status === statusFilter : true

    return matchesSearch && matchesMonth && matchesStatus
  })
  .sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })


  const totalPages = Math.ceil(filteredQueries.length / queriesPerPage)
  const startIndex = (currentPage - 1) * queriesPerPage
  const paginatedQueries = filteredQueries.slice(startIndex, startIndex + queriesPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Enquiries</h1>
          <p className="text-gray-600 mt-2">Manage all incoming pricing queries</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FadeLoader size={60} color="#6524EB" speedMultiplier={1.5} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <CardTitle>All Enquiries</CardTitle>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search enquiries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
            
                {/* <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="text-sm border rounded px-3 py-1"
                >
                  <option value="">All Months</option>
                  {[...Array(12)].map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {format(new Date(2025, idx, 1), "MMMM")}
                    </option>
                  ))}
                </select> */}
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
                    <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="text-sm border rounded px-3 py-1"
>
  <option value="">All </option>
  <option value="Resolved">Resolved</option>
  <option value="Not Resolved">Not Resolved</option>
</select>
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
                    <th className="py-2 px-4 text-left font-semibold">Company</th>
                    <th className="py-2 px-4 text-left font-semibold">Date</th>
                    <th className="py-2 px-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQueries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-500">
                        No enquiries found.
                      </td>
                    </tr>
                  ) : (
                    paginatedQueries.map((q) => (
                      <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-4">{q.FirstName} {q.LastName}</td>
                        <td className="py-2 px-4">{q.WorkEmail}</td>
                        <td className="py-2 px-4">{q.CellPhoneNumber}</td>
                        <td className="py-2 px-4">{q.Company}</td>
                        <td className="py-2 px-4">{new Date(q.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-4">
                          <Select
                            value={q.Status || "Not Resolved"}
                            onValueChange={(value) => handleStatusChange(q.id, value)}
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
                Showing {startIndex + 1} to {Math.min(startIndex + queriesPerPage, filteredQueries.length)} of {filteredQueries.length} enquiries
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