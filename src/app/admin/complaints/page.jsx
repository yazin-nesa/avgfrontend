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
import { ComplaintDialog } from "@/components/complaints/complaint-dialog"
import { fetcher, formatDate } from "@/lib/utils"

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500"
    case "in_progress":
      return "bg-blue-500"
    case "resolved":
      return "bg-green-500"
    case "rejected":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", searchTerm, page],
    queryFn: () =>
      fetcher(
        `complaints?search=${searchTerm}&page=${page}&limit=${limit}`
      ),
  })

  const complaints = data?.complaints || []
  const totalPages = Math.ceil((data?.total || 0) / limit)

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-muted-foreground">
            Manage and track all complaints
          </p>
        </div>
        <ComplaintDialog>
          <Button>File Complaint</Button>
        </ComplaintDialog>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search complaints..."
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
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Filed By</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint._id}>
                  <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {complaint.title}
                  </TableCell>
                  <TableCell>
                    {complaint.user.firstName} {complaint.user.lastName}
                  </TableCell>
                  <TableCell>{complaint.branch.name}</TableCell>
                  <TableCell className="capitalize">
                    {complaint.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        complaint.priority === "high"
                          ? "bg-red-500"
                          : complaint.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }
                    >
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(
                        complaint.status
                      )} text-white capitalize`}
                    >
                      {complaint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ComplaintDialog complaintId={complaint._id}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </ComplaintDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {complaints.length} of {data?.total || 0} complaints
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