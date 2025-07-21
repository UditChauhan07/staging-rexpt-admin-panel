"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeLoader } from "react-spinners"

interface SimpleUser {
  id: string
  name: string
  dateOfJoining: string // ISO date string
  earning: number
}

export default function EarningsTable() {
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchUsers() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/users/earnings") // 🔧 change endpoint as needed
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as any[]
      const mapped: SimpleUser[] = data.map((u, i) => ({
        id: u.id ?? `U${i + 1}`,
        name: u.name,
        dateOfJoining: u.dateOfJoining,
        earning: u.earning ?? 0,
      }))
      setUsers(mapped)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FadeLoader size={60} color="#6524EB" speedMultiplier={2} />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">⚠️ {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="py-2 px-4">User ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Date Joined</th>
                <th className="py-2 px-4">Total Earning</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono">{u.id}</td>
                  <td className="py-2 px-4">{u.name}</td>
                  <td className="py-2 px-4">{new Date(u.dateOfJoining).toLocaleDateString()}</td>
                  <td className="py-2 px-4 font-semibold text-green-600">₹{u.earning.toLocaleString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
