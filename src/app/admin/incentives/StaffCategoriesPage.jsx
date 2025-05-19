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
import { fetcher } from "@/lib/utils"
import { DollarSignIcon, UsersIcon, BriefcaseIcon } from "lucide-react"
import { StaffCategoryDialog } from "@/components/staff-categories/staff-category-dialog"

export default function StaffCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["staff-categories", searchTerm, page],
    queryFn: () =>
      fetcher(
        `incentivepolicies/staff-categories?search=${searchTerm}&page=${page}&limit=${limit}`
      ),
  })

  const categories = data?.data || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Categories</h1>
          <p className="text-muted-foreground">
            Manage staff categories and their incentive rates
          </p>
        </div>
        <StaffCategoryDialog>
          <Button>Add Category</Button>
        </StaffCategoryDialog>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search categories..."
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
                <TableHead>Base Salary</TableHead>
                <TableHead>Incentive Rate</TableHead>
                <TableHead>Experience Required</TableHead>
                <TableHead>Service Capabilities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No staff categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.description || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSignIcon className="h-4 w-4 mr-1 text-green-600" />
                        <span>{category.baseSalary.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span>{category.baseIncentiveRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1 text-blue-600" />
                        <span>{category.minimumExperience} months</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span>
                          {category.serviceCapabilityRequirements?.length || 0} required
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={category.active ? "bg-green-500" : "bg-red-500"}>
                        {category.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StaffCategoryDialog categoryId={category._id}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </StaffCategoryDialog>
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
          Showing {categories.length} of {total} categories
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