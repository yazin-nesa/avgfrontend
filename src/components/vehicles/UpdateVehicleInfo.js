"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { fetcher } from "@/lib/utils"

// Helper function to flatten vehicle data for form
const flattenVehicleData = (vehicle) => {
  if (!vehicle) return {}
  console.log("data : ", vehicle)
  return {
    ...vehicle,
    "owner.name": vehicle.owner?.name || "",
    "owner.phone": vehicle.owner?.phone || "",
    "owner.email": vehicle.owner?.email || "",
    "owner.address.street": vehicle.owner?.address?.street || "",
    "owner.address.city": vehicle.owner?.address?.city || "",
    "owner.address.state": vehicle.owner?.address?.state || "",
    "owner.address.zipCode": vehicle.owner?.address?.zipCode || "",
    "insuranceInfo.provider": vehicle.insuranceInfo?.provider || "",
    "insuranceInfo.policyNumber": vehicle.insuranceInfo?.policyNumber || "",
    "insuranceInfo.expiryDate": vehicle.insuranceInfo?.expiryDate 
      ? new Date(vehicle.insuranceInfo.expiryDate).toISOString().split('T')[0]
      : "",
  }
}

export function VehicleUpdateDialog({ vehicle, children }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const {toast} = useToast()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: flattenVehicleData(vehicle),
  })
  
  // Update mutation
  const updateVehicle = useMutation({
    mutationFn: async (data) => {
      // Properly format the data from string to appropriate object structure
      const formattedData = {
        registrationNumber: data.registrationNumber,
        make: data.make,
        model: data.model,
        year: data.year,
        type: data.type,
        color: data.color,
        vin: data.vin,
        mileage: data.mileage,
        status: data.status,
        owner: {
          name: data["owner.name"],
          phone: data["owner.phone"],
          email: data["owner.email"],
          address: {
            street: data["owner.address.street"],
            city: data["owner.address.city"],
            state: data["owner.address.state"],
            zipCode: data["owner.address.zipCode"],
          }
        },
        insuranceInfo: {
          provider: data["insuranceInfo.provider"],
          policyNumber: data["insuranceInfo.policyNumber"],
          expiryDate: data["insuranceInfo.expiryDate"] ? new Date(data["insuranceInfo.expiryDate"]) : null
        }
      }
      
      // Ensure branch is included if it's required
      if (vehicle.branch) {
        formattedData.branch = vehicle.branch;
      }
      
      console.log("Sending data:", formattedData);
      
      return fetcher(`vehicles/${vehicle._id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["vehicle", vehicle._id])
      toast({
        title: "Vehicle updated",
        description: "Vehicle information has been updated successfully.",
      })
      setOpen(false)
      router.refresh()
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update vehicle",
      })
    },
  })
  
  // Form submit handler
  function onSubmit(data) {
    console.log("Form data:", data);
    updateVehicle.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Update Vehicle Information</DialogTitle>
          <DialogDescription>
            Make changes to the vehicle details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="owner">Owner Details</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>
            
            {/* Basic Vehicle Information */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    {...register("registrationNumber", {
                      required: "Registration number is required",
                      minLength: { value: 2, message: "Registration number must be at least 2 characters" }
                    })}
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="in_service">In Service</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    {...register("make", { required: "Make is required" })}
                  />
                  {errors.make && (
                    <p className="text-sm text-red-500">{errors.make.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    {...register("model", { required: "Model is required" })}
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500">{errors.model.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    {...register("year", {
                      required: "Year is required",
                      min: { value: 1900, message: "Year must be at least 1900" },
                      max: {
                        value: new Date().getFullYear() + 1,
                        message: "Year cannot be in the future",
                      },
                    })}
                  />
                  {errors.year && (
                    <p className="text-sm text-red-500">{errors.year.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Controller
                    control={control}
                    name="type"
                    rules={{ required: "Vehicle type is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register("color")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    {...register("mileage", {
                      min: { value: 0, message: "Mileage cannot be negative" }
                    })}
                  />
                  {errors.mileage && (
                    <p className="text-sm text-red-500">{errors.mileage.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  {...register("vin")}
                />
              </div>
            </TabsContent>
            
            {/* Owner Information */}
            <TabsContent value="owner" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner.name">Owner Name</Label>
                  <Input
                    id="owner.name"
                    {...register("owner.name", { required: "Owner name is required" })}
                  />
                  {errors["owner.name"] && (
                    <p className="text-sm text-red-500">{errors["owner.name"].message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner.phone">Phone Number</Label>
                  <Input
                    id="owner.phone"
                    {...register("owner.phone", { required: "Phone number is required" })}
                  />
                  {errors["owner.phone"] && (
                    <p className="text-sm text-red-500">{errors["owner.phone"].message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner.email">Email</Label>
                <Input
                  id="owner.email"
                  type="email"
                  {...register("owner.email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                {errors["owner.email"] && (
                  <p className="text-sm text-red-500">{errors["owner.email"].message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner.address.street">Street Address</Label>
                <Input
                  id="owner.address.street"
                  {...register("owner.address.street")}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner.address.city">City</Label>
                  <Input
                    id="owner.address.city"
                    {...register("owner.address.city")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner.address.state">State</Label>
                  <Input
                    id="owner.address.state"
                    {...register("owner.address.state")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner.address.zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="owner.address.zipCode"
                    {...register("owner.address.zipCode")}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Additional Information */}
            <TabsContent value="additional" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceInfo.provider">Insurance Provider</Label>
                  <Input
                    id="insuranceInfo.provider"
                    {...register("insuranceInfo.provider")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="insuranceInfo.policyNumber">Policy Number</Label>
                  <Input
                    id="insuranceInfo.policyNumber"
                    {...register("insuranceInfo.policyNumber")}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceInfo.expiryDate">Insurance Expiry Date</Label>
                <Input
                  id="insuranceInfo.expiryDate"
                  type="date"
                  {...register("insuranceInfo.expiryDate")}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateVehicle.isLoading}
            >
              {updateVehicle.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}