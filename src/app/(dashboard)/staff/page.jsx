//src/app/(dashboard)/staff/page.js

"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserPlus } from "lucide-react"
import { AddStaffDialog } from "@/components/staff/add-staff-dialog"
import { StaffDetailsDialog } from "@/components/staff/staff-details-dialog"
import { fetcher } from "@/lib/utils"

export default function StaffPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading } = useQuery({
    queryKey: ["staff", search, page],
    queryFn: () =>
      fetcher(`users?search=${search}&page=${page}&limit=${pageSize}`),
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
        <div className="flex items-center space-x-2">
          <AddStaffDialog>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </AddStaffDialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search staff..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users?.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>{user.branch?.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <StaffDetailsDialog userId={user._id}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </StaffDetailsDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 