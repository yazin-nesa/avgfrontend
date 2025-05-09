//src/app/(dashboard)/branches/page.js

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
import { Badge } from "@/components/ui/badge"
import { BranchDialog } from "@/components/branches/branch-dialog"
import { fetcher } from "@/lib/utils"

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["branches", searchTerm, page],
    queryFn: () =>
      fetcher(
        `branches?search=${searchTerm}&page=${page}&limit=${limit}`
      ),
  })

  const branches = data?.branches || []
  const totalPages = Math.ceil((data?.total || 0) / limit)

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-muted-foreground">
            Manage all AVGmotors branches
          </p>
        </div>
        <BranchDialog>
          <Button>Add Branch</Button>
        </BranchDialog>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search branches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Staff Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch._id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.city}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {branch.address}
                  </TableCell>
                  <TableCell>
                    {branch.manager
                      ? `${branch.manager.firstName} ${branch.manager.lastName}`
                      : "Not assigned"}
                  </TableCell>
                  <TableCell>{branch.staffCount || 0}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        branch.status === "active"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    >
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <BranchDialog branchId={branch._id}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </BranchDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {branches.length} of {data?.total || 0} branches
        </p>
        <div className="flex items-center gap-2">
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
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 