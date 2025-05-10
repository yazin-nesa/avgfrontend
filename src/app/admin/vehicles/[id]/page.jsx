"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceHistory } from "@/components/vehicles/service-history"
import { fetcher, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceDialog } from "@/components/vehicles/service-dialog"
import { VehicleUpdateDialog } from "@/components/vehicles/UpdateVehicleInfo"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"

// Helper function outside component to prevent re-creation on every render
const getStatusBadge = (status) => {
  if (!status) return null;
  
  const statusColors = {
    active: "bg-green-500",
    in_service: "bg-blue-500",
    inactive: "bg-gray-500",
    completed: "bg-purple-500"
  }
  
  return (
    <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

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

  // Get the vehicle data safely
  const vehicleData = vehicle?.data || {}

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {vehicleData.make || "Unknown"} {vehicleData.model || ""}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg text-muted-foreground">{vehicleData.registrationNumber || "Unknown"}</span>
            {getStatusBadge(vehicleData.status)}
          </div>
        </div>
        <div className="flex gap-2">
          <VehicleUpdateDialog vehicle={vehicleData}>
            <Button variant="outline" size="lg">
              <Edit className="mr-2 h-4 w-4" />
              Edit Vehicle
            </Button>
          </VehicleUpdateDialog>
          <ServiceDialog vehicleId={vehicleId}>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </ServiceDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registration Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleData.registrationNumber || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last Updated: {vehicleData.updatedAt ? formatDate(vehicleData.updatedAt) : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Make & Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleData.make || "Unknown"} {vehicleData.model || ""}
            </div>
            <p className="text-xs text-muted-foreground">
              Year: {vehicleData.year || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleData.owner?.name || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Contact: {vehicleData.owner?.phone || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleData.status ? vehicleData.status.replace('_', ' ') : "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Branch: {vehicleData.branch?.name || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Service History</TabsTrigger>
          <TabsTrigger value="details">Vehicle Details</TabsTrigger>
          <TabsTrigger value="owner">Owner Information</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <ServiceHistory vehicleId={vehicleId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-muted-foreground">VIN</dt>
                    <dd>{vehicleData.vin || "N/A"}</dd>
                    <dt className="text-muted-foreground">Color</dt>
                    <dd>{vehicleData.color || "N/A"}</dd>
                    <dt className="text-muted-foreground">Engine</dt>
                    <dd>{vehicleData.engineNumber || "N/A"}</dd>
                    <dt className="text-muted-foreground">Mileage</dt>
                    <dd>{vehicleData.mileage ? `${vehicleData.mileage} km` : "N/A"}</dd>
                    <dt className="text-muted-foreground">Fuel Type</dt>
                    <dd>{vehicleData.fuelType || "N/A"}</dd>
                    <dt className="text-muted-foreground">Transmission</dt>
                    <dd>{vehicleData.transmission || "N/A"}</dd>
                    <dt className="text-muted-foreground">Vehicle Type</dt>
                    <dd className="capitalize">{vehicleData.type || "N/A"}</dd>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Information</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-muted-foreground">Last Service</dt>
                    <dd>{vehicleData.lastService ? formatDate(vehicleData.lastService) : "N/A"}</dd>
                    <dt className="text-muted-foreground">Next Service Due</dt>
                    <dd>{vehicleData.nextServiceDue ? formatDate(vehicleData.nextServiceDue) : "N/A"}</dd>
                    <dt className="text-muted-foreground">Service Interval</dt>
                    <dd>{vehicleData.serviceInterval ? `${vehicleData.serviceInterval} km` : "N/A"}</dd>
                    <dt className="text-muted-foreground">Purchase Date</dt>
                    <dd>{vehicleData.purchaseDate ? formatDate(vehicleData.purchaseDate) : "N/A"}</dd>
                    <dt className="text-muted-foreground">Insurance Provider</dt>
                    <dd>{vehicleData.insuranceInfo?.provider || "N/A"}</dd>
                    <dt className="text-muted-foreground">Policy Number</dt>
                    <dd>{vehicleData.insuranceInfo?.policyNumber || "N/A"}</dd>
                    <dt className="text-muted-foreground">Insurance Expiry</dt>
                    <dd>{vehicleData.insuranceInfo?.expiryDate ? formatDate(vehicleData.insuranceInfo.expiryDate) : "N/A"}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="owner" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Owner Details</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd>{vehicleData.owner?.name || "N/A"}</dd>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{vehicleData.owner?.email || "N/A"}</dd>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{vehicleData.owner?.phone || "N/A"}</dd>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Address Information</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-muted-foreground">Street</dt>
                    <dd>{vehicleData.owner?.address?.street || "N/A"}</dd>
                    <dt className="text-muted-foreground">City</dt>
                    <dd>{vehicleData.owner?.address?.city || "N/A"}</dd>
                    <dt className="text-muted-foreground">State</dt>
                    <dd>{vehicleData.owner?.address?.state || "N/A"}</dd>
                    <dt className="text-muted-foreground">ZIP Code</dt>
                    <dd>{vehicleData.owner?.address?.zipCode || "N/A"}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}