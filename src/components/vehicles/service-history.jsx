"use client"

import { useState } from "react"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserIcon, ToolIcon, ClipboardListIcon } from "lucide-react"

const getStatusColor = (status) => {
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

export function ServiceHistory({ vehicleId }) {
  const { data: services, isLoading } = useQuery({
    queryKey: ["vehicle-services", vehicleId],
    queryFn: () => fetcher(`services?vehicle=${vehicleId}`),
  })

  const { data: vehicle } = useQuery({
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

  const servicesList = services?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service History</h2>
          <p className="text-muted-foreground">
            Vehicle: {vehicle?.registrationNumber || vehicle?.data?.registrationNumber}
          </p>
        </div>
        <ServiceDialog vehicleId={vehicleId}>
          <Button>Add Service Record</Button>
        </ServiceDialog>
      </div>

      {servicesList.length === 0 ? (
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
                <TableHead>Start Date</TableHead>
                <TableHead>Est. Completion</TableHead>
                <TableHead>Service Types</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicesList.map((service) => (
                <TableRow key={service._id}>
                  <TableCell>{formatDate(service.startDate)}</TableCell>
                  <TableCell>{formatDate(service.estimatedCompletionDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {service.serviceItems?.map((item, index) => (
                        <Badge key={index} variant="outline">
                          {/* Check if serviceType is populated or just an ID */}
                          {item.serviceType?.name || "Service"}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{service.mileageAtService} km</TableCell>
                  <TableCell>{formatCurrency(service.totalCost)}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(service.status)} capitalize text-white`}
                    >
                      {service.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
                        <SheetHeader>
                          <SheetTitle>Service Record Details</SheetTitle>
                          <SheetDescription>
                            Service record from {formatDate(service.startDate)}
                          </SheetDescription>
                        </SheetHeader>
                        
                        <Accordion type="single" collapsible className="mt-6">
                          {service.serviceItems.map((serviceItem, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                              <AccordionTrigger className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getStatusColor(serviceItem.status)} capitalize text-white`}>
                                    {serviceItem.status}
                                  </Badge>
                                  <span className="capitalize">{serviceItem.serviceType?.name || "Service Item"}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2 pb-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                    <p>{serviceItem.description}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Technicians</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {serviceItem.technicians.map((tech, idx) => (
                                        <div key={idx} className="flex items-center gap-1 border rounded-full px-3 py-1 text-sm">
                                          <UserIcon size={14} />
                                          <span>{tech.technician?.firstName || "Technician"} {tech.technician?.lastName || ""}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Labor</h4>
                                    <p>{serviceItem.laborHours} hours (₹{serviceItem.laborCost})</p>
                                  </div>
                                  
                                  {serviceItem.parts && serviceItem.parts.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">Parts</h4>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Part</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Total</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {serviceItem.parts.map((part, pidx) => (
                                            <TableRow key={pidx}>
                                              <TableCell>{part.name}</TableCell>
                                              <TableCell>{part.quantity}</TableCell>
                                              <TableCell>{formatCurrency(part.unitCost)}</TableCell>
                                              <TableCell>{formatCurrency(part.totalCost)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                      Service Cost
                                    </h4>
                                    <p className="text-lg font-semibold">
                                      {formatCurrency(
                                        serviceItem.laborCost + 
                                        (serviceItem.parts?.reduce((sum, part) => sum + part.totalCost, 0) || 0)
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                        
                        <div className="mt-6 space-y-4">
                          <div className="flex justify-between border-t pt-4">
                            <h4 className="text-base font-semibold">Total Service Cost</h4>
                            <p className="text-lg font-bold">{formatCurrency(service.totalCost)}</p>
                          </div>
                          
                          {service.notes && service.notes.length > 0 && (
                            <div>
                              <h4 className="text-base font-semibold">Notes</h4>
                              {service.notes.map((note, idx) => (
                                <div key={idx} className="mt-2 border-l-2 border-muted pl-4">
                                  <p className="text-sm">{note.content}</p>
                                  <p className="text-xs text-muted-foreground">
                                    By {note.createdBy?.firstName || ""} {note.createdBy?.lastName || ""} on{" "}
                                    {formatDate(note.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <SheetFooter className="mt-6">
                          <SheetClose asChild>
                            <Button>Close</Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
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