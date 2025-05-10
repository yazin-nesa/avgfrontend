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
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-yellow-500"
    case "in_progress":
      return "bg-blue-500"
    case "resolved":
      return "bg-green-500"
    case "closed":
      return "bg-gray-500"
    default:
      return "bg-gray-400"
  }
}

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "bg-red-600"
    case "high":
      return "bg-red-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-blue-500"
    default:
      return "bg-blue-500"
  }
}

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState("all")
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", searchTerm, page, filter],
    queryFn: () =>
      fetcher(
        `complaints?search=${searchTerm}&page=${page}&limit=${limit}&status=${filter}`
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
          <Button>File New Complaint</Button>
        </ComplaintDialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={filter === "open" ? "default" : "outline"} 
            onClick={() => setFilter("open")}
            size="sm"
          >
            Open
          </Button>
          <Button 
            variant={filter === "in_progress" ? "default" : "outline"} 
            onClick={() => setFilter("in_progress")}
            size="sm"
          >
            In Progress
          </Button>
          <Button 
            variant={filter === "resolved" ? "default" : "outline"} 
            onClick={() => setFilter("resolved")}
            size="sm"
          >
            Resolved
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">No complaints found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Filed</TableHead>
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
                    {complaint.filedBy?.firstName} {complaint.filedBy?.lastName}
                  </TableCell>
                  <TableCell>{complaint.branch?.name}</TableCell>
                  <TableCell className="capitalize">
                    {complaint.category?.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getPriorityColor(complaint.priority)}
                    >
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(
                        complaint.status
                      )} capitalize`}
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