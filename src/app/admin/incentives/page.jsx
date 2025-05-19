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
import IncentivePolicyDialog from "@/components/incentives/IncentivePolicyDialog"
import { fetcher } from "@/lib/utils"
import { AlertCircle, Book, CheckCircle } from "lucide-react"

export default function IncentivePoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["incentive-policies", searchTerm, page],
    queryFn: () =>
      fetcher(
        `incentivepolicies/policies?search=${searchTerm}&page=${page}&limit=${limit}`
      ),
  })

  const policies = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / limit)

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getBadgeColor = (active) => {
    return active
      ? "bg-green-500 hover:bg-green-600"
      : "bg-gray-500 hover:bg-gray-600"
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incentive Policies</h1>
          <p className="text-muted-foreground">
            Manage calculation policies for staff incentives
          </p>
        </div>
        <IncentivePolicyDialog>
          <Button>Add Policy</Button>
        </IncentivePolicyDialog>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search policies..."
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
                <TableHead>Formula</TableHead>
                <TableHead>Applicable Categories</TableHead>
                <TableHead>Effective Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No incentive policies found
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{policy.name}</span>
                        {policy.description && (
                          <span className="text-sm text-muted-foreground">
                            {policy.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Book className="h-4 w-4" />
                        <code className="bg-gray-800 p-1 rounded text-sm">
                          {policy.formulaDefinition.length > 40
                            ? `${policy.formulaDefinition.substring(0, 40)}...`
                            : policy.formulaDefinition}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {policy.applicableCategories?.map((category) => (
                          <Badge
                            key={category._id}
                            variant="outline"
                            className="bg-blue-50"
                          >
                            {category.name}
                          </Badge>
                        ))}
                        {!policy.applicableCategories?.length && "None"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">From:</span>{" "}
                          {formatDate(policy.effectiveFrom)}
                        </p>
                        <p>
                          <span className="font-medium">To:</span>{" "}
                          {formatDate(policy.effectiveTo) || "No end date"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(policy.active)}>
                        {policy.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <IncentivePolicyDialog policyId={policy._id}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </IncentivePolicyDialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Button>
                      </div>
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
          Showing {policies.length} of {total} policies
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