"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarIcon, Plus, Trash2, User, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetcher, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

export function ServiceDialog({ vehicleId, children }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetcher(`vehicles/${vehicleId}`),
    enabled: open,
  })

  // Modified query to fetch all technicians (staff with active status)
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetcher(`users?role=staff&status=active`),
    enabled: open,
  })

  const { data: serviceTypes, isLoading: isLoadingServiceTypes } = useQuery({
    queryKey: ["service-types"],
    queryFn: () => fetcher(`service-types`),
    enabled: open,
  })

  const serviceTypesData = serviceTypes?.data;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      estimatedCompletionDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"), // tomorrow
      mileageAtService: 0,
      serviceItems: [
        {
          serviceType: "",
          description: "",
          technicians: [],
          laborHours: 0,
          laborCost: 0,
          parts: [{ name: "", quantity: 1, unitCost: 0 }],
          status: "pending",
        },
      ],
      paymentStatus: "pending",
    },
  })

  const { fields: serviceItemFields, append: appendServiceItem, remove: removeServiceItem } = useFieldArray({
    control,
    name: "serviceItems",
  })

  // Function to add parts to a specific service item
  const addPart = (serviceItemIndex) => {
    const serviceItems = watch("serviceItems");
    const updatedParts = [...serviceItems[serviceItemIndex].parts, { name: "", quantity: 1, unitCost: 0 }];
    setValue(`serviceItems.${serviceItemIndex}.parts`, updatedParts);
  };

  // Function to remove parts from a specific service item
  const removePart = (serviceItemIndex, partIndex) => {
    const serviceItems = watch("serviceItems");
    const updatedParts = serviceItems[serviceItemIndex].parts.filter((_, i) => i !== partIndex);
    setValue(`serviceItems.${serviceItemIndex}.parts`, updatedParts);
  };

  // Calculate total cost for parts in a specific service
  const calculatePartsTotalCost = (serviceItemIndex) => {
    const serviceItems = watch("serviceItems");
    if (!serviceItems[serviceItemIndex]?.parts) return 0;
    
    return serviceItems[serviceItemIndex].parts.reduce((total, part) => {
      return total + (Number(part.quantity) * Number(part.unitCost) || 0);
    }, 0);
  };

  // Calculate labor cost for a specific service
  const calculateLaborCost = (serviceItemIndex) => {
    const serviceItems = watch("serviceItems");
    return Number(serviceItems[serviceItemIndex]?.laborCost) || 0;
  };

  // Calculate total service cost for a specific service item
  const calculateServiceItemTotalCost = (serviceItemIndex) => {
    return calculatePartsTotalCost(serviceItemIndex) + calculateLaborCost(serviceItemIndex);
  };

  // Calculate overall total for all services
  const calculateTotalCost = () => {
    const serviceItems = watch("serviceItems");
    return serviceItems.reduce((total, _, index) => {
      return total + calculateServiceItemTotalCost(index);
    }, 0);
  };

  // Improved function to get eligible technicians based on service type
  const getEligibleTechnicians = (serviceTypeId) => {
    if (!technicians?.data || !serviceTypeId) {
      return [];
    }

    // Filter technicians who have the capability for this service type
    return technicians.data.filter(tech => 
      tech.serviceCapabilities && 
      tech.serviceCapabilities.some(capability => 
        capability.serviceType && 
        capability.serviceType._id === serviceTypeId
      )
    );
  };
  
  // Function to find skill level for a technician and service type
  const getTechnicianSkillLevel = (technician, serviceTypeId) => {
    if (!technician.serviceCapabilities) return 0;
    
    const capability = technician.serviceCapabilities.find(
      cap => cap.serviceType && cap.serviceType._id === serviceTypeId
    );
    
    return capability ? capability.skillLevel : 0;
  };

  // Watch service type changes to update eligible technicians
  const watchServiceTypes = watch("serviceItems");

  const mutation = useMutation({
    mutationFn: (data) =>
      fetcher(`services`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["vehicle", vehicleId]);
      toast({
        title: "Success",
        description: "Service record added successfully",
      });
      reset();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add service record",
      });
    },
  })

  const onSubmit = (data) => {
    // Transform service types from frontend format to backend format
    const transformedData = {
      ...data,
      vehicle: vehicleId,
      branch: vehicle?.data?.branch?._id,
      // Calculate the total cost
      totalCost: calculateTotalCost(),
      // Transform serviceItems to the format expected by the backend
      serviceItems: data.serviceItems.map(serviceItem => ({
        serviceType: serviceItem.serviceType,
        description: serviceItem.description,
        technicians: serviceItem.technicians.map(techId => ({
          technician: techId,
          creditPoints: 0,
          creditsAssigned: false
        })),
        laborHours: Number(serviceItem.laborHours),
        laborCost: Number(serviceItem.laborCost),
        parts: serviceItem.parts.map(part => ({
          name: part.name,
          quantity: Number(part.quantity),
          unitCost: Number(part.unitCost),
          totalCost: Number(part.quantity) * Number(part.unitCost)
        })),
        status: serviceItem.status
      })),
    };
    
    mutation.mutate(transformedData);
  };

  const getServiceTypeLabel = (serviceTypeId) => {
    if (!serviceTypesData?.length) return "Select service type";
    const foundType = serviceTypesData.find(type => type._id === serviceTypeId);
    return foundType ? foundType.name : "Select service type";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Add Vehicle Service</DialogTitle>
          <DialogDescription>
            Create a new service record for vehicle{" "}
            {vehicle?.data?.registrationNumber || "loading..."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingVehicle || isLoadingTechnicians || isLoadingServiceTypes ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate", { required: "Start date is required" })}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCompletionDate">Estimated Completion</Label>
                  <div className="relative">
                    <Input
                      id="estimatedCompletionDate"
                      type="date"
                      {...register("estimatedCompletionDate", {
                        required: "Estimated completion date is required",
                      })}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.estimatedCompletionDate && (
                    <p className="text-sm text-red-500">{errors.estimatedCompletionDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileageAtService">Current Mileage</Label>
                <Input
                  id="mileageAtService"
                  type="number"
                  {...register("mileageAtService", {
                    required: "Current mileage is required",
                    min: { value: 0, message: "Mileage must be positive" }
                  })}
                />
                {errors.mileageAtService && (
                  <p className="text-sm text-red-500">{errors.mileageAtService.message}</p>
                )}
              </div>

              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-semibold">Service Items</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => appendServiceItem({
                      serviceType: "",
                      description: "",
                      technicians: [],
                      laborHours: 0,
                      laborCost: 0,
                      parts: [{ name: "", quantity: 1, unitCost: 0 }],
                      status: "pending",
                    })}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Service Item
                  </Button>
                </div>

                <Accordion type="multiple" defaultValue={["0"]} className="w-full">
                  {serviceItemFields.map((field, serviceItemIndex) => {
                    const currentServiceTypeId = watch(`serviceItems.${serviceItemIndex}.serviceType`);
                    const eligibleTechnicians = getEligibleTechnicians(currentServiceTypeId);
                    
                    return (
                      <AccordionItem key={field.id} value={serviceItemIndex.toString()}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="truncate max-w-[200px] md:max-w-[300px]">
                              {getServiceTypeLabel(currentServiceTypeId) || `Service Item ${serviceItemIndex + 1}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {formatCurrency(calculateServiceItemTotalCost(serviceItemIndex))}
                              </Badge>
                              {serviceItemFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeServiceItem(serviceItemIndex);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Card>
                            <CardContent className="pt-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`serviceItems.${serviceItemIndex}.serviceType`}>Service Type</Label>
                                  <Controller
                                    control={control}
                                    name={`serviceItems.${serviceItemIndex}.serviceType`}
                                    rules={{ required: "Service type is required" }}
                                    render={({ field }) => (
                                      <Select 
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          // Clear technicians selection when service type changes
                                          setValue(`serviceItems.${serviceItemIndex}.technicians`, []);
                                        }} 
                                        value={field.value}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {serviceTypesData?.map((type) => (
                                            <SelectItem key={type._id} value={type._id}>
                                              {type.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                  {errors?.serviceItems?.[serviceItemIndex]?.serviceType && (
                                    <p className="text-sm text-red-500">
                                      {errors.serviceItems[serviceItemIndex].serviceType.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`serviceItems.${serviceItemIndex}.status`}>Status</Label>
                                  <Controller
                                    control={control}
                                    name={`serviceItems.${serviceItemIndex}.status`}
                                    render={({ field }) => (
                                      <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="in_progress">In Progress</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`serviceItems.${serviceItemIndex}.description`}>Description</Label>
                                <Textarea
                                  id={`serviceItems.${serviceItemIndex}.description`}
                                  {...register(`serviceItems.${serviceItemIndex}.description`, { 
                                    required: "Description is required" 
                                  })}
                                />
                                {errors?.serviceItems?.[serviceItemIndex]?.description && (
                                  <p className="text-sm text-red-500">
                                    {errors.serviceItems[serviceItemIndex].description.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`serviceItems.${serviceItemIndex}.technicians`}>
                                    Assigned Technicians
                                  </Label>
                                  {!currentServiceTypeId && (
                                    <div className="flex items-center text-amber-500 text-sm">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Select a service type first
                                    </div>
                                  )}
                                </div>
                                {currentServiceTypeId && (
                                  <>
                                    {eligibleTechnicians.length > 0 ? (
                                      <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                                        <Controller
                                          control={control}
                                          name={`serviceItems.${serviceItemIndex}.technicians`}
                                          render={({ field }) => (
                                            <div className="space-y-2">
                                              {eligibleTechnicians.map((tech) => (
                                                <div key={tech._id} className="flex items-center">
                                                  <input
                                                    type="checkbox"
                                                    id={`tech-${serviceItemIndex}-${tech._id}`}
                                                    className="mr-2 h-4 w-4"
                                                    value={tech._id}
                                                    checked={field.value.includes(tech._id)}
                                                    onChange={(e) => {
                                                      const checked = e.target.checked;
                                                      const updatedTechs = checked
                                                        ? [...field.value, tech._id]
                                                        : field.value.filter(id => id !== tech._id);
                                                      field.onChange(updatedTechs);
                                                    }}
                                                  />
                                                  <Label htmlFor={`tech-${serviceItemIndex}-${tech._id}`} className="flex items-center cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    {tech.firstName} {tech.lastName}
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                      Skill: {getTechnicianSkillLevel(tech, currentServiceTypeId)}
                                                    </Badge>
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        />
                                      </div>
                                    ) : (
                                      <div className="text-red-500 text-sm flex items-center p-2 border rounded-md">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        No technicians available with this service capability
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`serviceItems.${serviceItemIndex}.laborHours`}>Labor Hours</Label>
                                  <Input
                                    id={`serviceItems.${serviceItemIndex}.laborHours`}
                                    type="number"
                                    step="0.5"
                                    {...register(`serviceItems.${serviceItemIndex}.laborHours`, { 
                                      required: "Labor hours are required",
                                      min: { value: 0, message: "Hours must be positive" } 
                                    })}
                                  />
                                  {errors?.serviceItems?.[serviceItemIndex]?.laborHours && (
                                    <p className="text-sm text-red-500">
                                      {errors.serviceItems[serviceItemIndex].laborHours.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`serviceItems.${serviceItemIndex}.laborCost`}>Labor Cost (₹)</Label>
                                  <Input
                                    id={`serviceItems.${serviceItemIndex}.laborCost`}
                                    type="number"
                                    {...register(`serviceItems.${serviceItemIndex}.laborCost`, { 
                                      required: "Labor cost is required",
                                      min: { value: 0, message: "Cost must be positive" } 
                                    })}
                                  />
                                  {errors?.serviceItems?.[serviceItemIndex]?.laborCost && (
                                    <p className="text-sm text-red-500">
                                      {errors.serviceItems[serviceItemIndex].laborCost.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label>Parts</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addPart(serviceItemIndex)}
                                  >
                                    <Plus className="mr-1 h-4 w-4" /> Add Part
                                  </Button>
                                </div>
                                
                                <div className="space-y-4">
                                  {watch(`serviceItems.${serviceItemIndex}.parts`)?.map((part, partIndex) => (
                                    <div key={partIndex} className="grid grid-cols-6 md:grid-cols-12 gap-2 items-end">
                                      <div className="space-y-2 col-span-3 md:col-span-6">
                                        <Label htmlFor={`serviceItems.${serviceItemIndex}.parts.${partIndex}.name`}>
                                          Part Name
                                        </Label>
                                        <Input
                                          id={`serviceItems.${serviceItemIndex}.parts.${partIndex}.name`}
                                          {...register(`serviceItems.${serviceItemIndex}.parts.${partIndex}.name`, { 
                                            required: "Part name is required" 
                                          })}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2 col-span-1 md:col-span-2">
                                        <Label htmlFor={`serviceItems.${serviceItemIndex}.parts.${partIndex}.quantity`}>
                                          Qty
                                        </Label>
                                        <Input
                                          id={`serviceItems.${serviceItemIndex}.parts.${partIndex}.quantity`}
                                          type="number"
                                          min="1"
                                          {...register(`serviceItems.${serviceItemIndex}.parts.${partIndex}.quantity`, { 
                                            required: "Quantity is required",
                                            min: { value: 1, message: "Minimum is 1" }
                                          })}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2 col-span-2 md:col-span-3 relative">
                                        <Label htmlFor={`serviceItems.${serviceItemIndex}.parts.${partIndex}.unitCost`}>
                                          Cost (₹)
                                        </Label>
                                        <div className="flex items-center">
                                          <Input
                                            id={`serviceItems.${serviceItemIndex}.parts.${partIndex}.unitCost`}
                                            type="number"
                                            min="0"
                                            {...register(`serviceItems.${serviceItemIndex}.parts.${partIndex}.unitCost`, { 
                                              required: "Cost is required",
                                              min: { value: 0, message: "Min is 0" }
                                            })}
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="col-span-full md:col-span-1 flex justify-end">
                                        {watch(`serviceItems.${serviceItemIndex}.parts`).length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 md:mt-6"
                                            onClick={() => removePart(serviceItemIndex, partIndex)}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex justify-end mt-2">
                                  <div className="text-right">
                                    <div className="text-sm text-muted-foreground">
                                      Parts Total: {formatCurrency(calculatePartsTotalCost(serviceItemIndex))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Labor Cost: {formatCurrency(calculateLaborCost(serviceItemIndex))}
                                    </div>
                                    <div className="font-medium">
                                      Service Total: {formatCurrency(calculateServiceItemTotalCost(serviceItemIndex))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Controller
                    control={control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        className="w-40 mt-1"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="text-right bg-slate-50 p-3 rounded-md border w-full md:w-auto">
                  <div className="text-sm text-muted-foreground mb-1">Overall Total</div>
                  <div className="text-2xl font-bold">{formatCurrency(calculateTotalCost())}</div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isLoading}>
                  {mutation.isLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                  Create Service Record
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}