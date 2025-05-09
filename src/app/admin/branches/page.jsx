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
import { PhoneIcon, MailIcon, MapPinIcon } from "lucide-react"

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

  const branches = data?.branches || data?.data || []
  const total = data?.total || data?.count || 0
  const totalPages = Math.ceil(total / limit)

  const getBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600"
      case "inactive":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "maintenance":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

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
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No branches found
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch._id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{branch.address?.city || ""}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {branch.address ? 
                            `${branch.address.street}, ${branch.address.state} ${branch.address.zipCode}` : 
                            "Address not available"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {branch.phone || "N/A"}
                        </div>
                        <div className="flex items-center text-sm">
                          <MailIcon className="h-3 w-3 mr-1" />
                          {branch.email || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {branch.manager
                        ? `${branch.manager.firstName} ${branch.manager.lastName}`
                        : "Not assigned"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">Vehicles: {branch.capacity?.vehicles || 0}</p>
                        <p className="text-sm">Staff: {branch.capacity?.staff || 0}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(branch.status)}>
                        {branch.status || "unknown"}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {branches.length} of {total} branches
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
            disabled={page >= totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}