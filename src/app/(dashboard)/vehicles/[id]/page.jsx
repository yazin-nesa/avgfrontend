"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceHistory } from "@/components/vehicles/service-history"
import { fetcher, formatDate } from "@/lib/utils"

export default function VehicleDetailsPage() {
  const params = useParams()
  const vehicleId = params.id

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetcher(`vehicles/${vehicleId}`),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registration Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.registrationNumber}
            </div>
            <p className="text-xs text-muted-foreground">
              Last Updated: {formatDate(vehicle.updatedAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Make & Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.make} {vehicle.model}
            </div>
            <p className="text-xs text-muted-foreground">
              Year: {vehicle.year}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.owner.name}
            </div>
            <p className="text-xs text-muted-foreground">
              Contact: {vehicle.owner.phone}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicle.branch.name}</div>
            <p className="text-xs text-muted-foreground">
              Location: {vehicle.branch.city}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <ServiceHistory vehicleId={vehicleId} />
        </CardContent>
      </Card>
    </div>
  )
} 