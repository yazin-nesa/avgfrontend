'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Iconsdata } from '@/components/icons'
import { fetcher, formatDate, formatCurrency } from '@/lib/utils'
import { AddServiceDialog } from './add-service-dialog'

export function VehicleDetailsDialog({ vehicleId }) {
  const [open, setOpen] = useState(false)

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () =>
      fetcher(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`),
    enabled: !!vehicleId && open,
  })

  if (!vehicleId) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Iconsdata.eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogDescription>
            View vehicle information and service history
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Iconsdata.spinner className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="service">Service History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Registration Number</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.registrationNumber}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Make & Model</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Year</h4>
                  <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                </div>
                <div>
                  <h4 className="font-medium">Branch</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.branch.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Owner</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.owner.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Next Service Due</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.nextServiceDue
                      ? formatDate(vehicle.nextServiceDue)
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="service" className="space-y-4">
              <div className="flex justify-end">
                <AddServiceDialog vehicleId={vehicleId} />
              </div>
              {vehicle.serviceHistory?.length > 0 ? (
                <div className="space-y-4">
                  {vehicle.serviceHistory.map((service) => (
                    <div
                      key={service._id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Service on {formatDate(service.date)}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            service.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : service.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Parts Cost:</span>{' '}
                          {formatCurrency(service.partsCost)}
                        </div>
                        <div>
                          <span className="font-medium">Labor Cost:</span>{' '}
                          {formatCurrency(service.laborCost)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Total Cost:</span>{' '}
                        {formatCurrency(service.totalCost)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No service history available
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
} 