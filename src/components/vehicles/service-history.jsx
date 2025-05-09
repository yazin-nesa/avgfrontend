"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceDialog } from "./service-dialog"
import { fetcher, formatDate, formatCurrency } from "@/lib/utils"

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500"
    case "in_progress":
      return "bg-blue-500"
    case "completed":
      return "bg-green-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function ServiceHistory({ vehicleId }: { vehicleId: string }) {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetcher(`/api/v1/vehicles/${vehicleId}`),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service History</h2>
          <p className="text-muted-foreground">
            Vehicle: {vehicle?.registrationNumber}
          </p>
        </div>
        <ServiceDialog vehicleId={vehicleId}>
          <Button>Add Service Record</Button>
        </ServiceDialog>
      </div>

      {vehicle?.serviceHistory?.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Service Records</h3>
            <p className="text-sm text-muted-foreground">
              Add a service record to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parts Used</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicle?.serviceHistory?.map((service: any) => (
                <TableRow key={service._id}>
                  <TableCell>{formatDate(service.createdAt)}</TableCell>
                  <TableCell className="capitalize">
                    {service.serviceType.replace("_", " ")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {service.description}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {service.partsUsed}
                  </TableCell>
                  <TableCell>{formatCurrency(service.totalCost)}</TableCell>
                  <TableCell>{formatDate(service.nextServiceDue)}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(
                        service.status
                      )} text-white capitalize`}
                    >
                      {service.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 