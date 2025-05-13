"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api" // Import the apiClient instead of fetcher

export function AddStaffDialog({ children }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [serviceCapabilities, setServiceCapabilities] = useState([])

  // Use apiClient for fetching branches
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.get("branches"),
    enabled: open,
  })
  
  const { data: designation, isLoading: designationLoading } = useQuery({
    queryKey: ["designation"],
    queryFn: () => apiClient.get("designation"),
    enabled: open,
  })
  
  // Fetch service types
  const { data: serviceTypes, isLoading: serviceTypesLoading } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: () => apiClient.get("service-types"),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: "staff",
      status: "active",
      primaryServiceCategory: "administration",
    },
  })

  // Watch form values
  const selectedRole = watch("role")
  const selectedBranch = watch("branch")
  const selectedPrimaryServiceCategory = watch("primaryServiceCategory")

  // Add service capability to local state
  const handleAddCapability = (serviceTypeId) => {
    if (!serviceTypeId) return
    
    // Find service type details
    const serviceType = serviceTypes?.data?.find(st => st._id === serviceTypeId)
    if (!serviceType) return
    
    // Create a temporary ID for the capability in our local state
    const tempId = `temp_${Date.now()}_${serviceTypeId}`
    
    // Add to local state
    setServiceCapabilities([
      ...serviceCapabilities,
      {
        _id: tempId,
        serviceType: serviceType,
        skillLevel: 1,
        certified: false
      }
    ])
  }

  // Remove service capability from local state
  const handleDeleteCapability = (capabilityId) => {
    setServiceCapabilities(
      serviceCapabilities.filter(cap => cap._id !== capabilityId)
    )
  }

  // Get available service types (not already added)
  const getAvailableServiceTypes = () => {
    const currentServiceTypeIds = serviceCapabilities.map(
      cap => cap.serviceType?._id || cap.serviceType
    )
    
    return (serviceTypes?.data || []).filter(
      st => !currentServiceTypeIds.includes(st._id) && !currentServiceTypeIds.includes(st._id?.toString())
    )
  }

  const mutation = useMutation({
    mutationFn: (data) => {
      // Use apiClient.post instead of fetcher
      return apiClient.post("users", data)
    },
    onSuccess: (response) => {
      // If there are service capabilities to add and we have a user ID from the response
      const userId = response?.data?._id
      
      if (userId && serviceCapabilities.length > 0) {
        // Add service capabilities one by one
        Promise.all(
          serviceCapabilities.map(capability => 
            apiClient.post(`users/${userId}/service-capabilities`, {
              serviceType: capability.serviceType._id,
              skillLevel: capability.skillLevel,
              certified: capability.certified
            })
          )
        ).then(() => {
          queryClient.invalidateQueries(["staff"])
          toast({
            title: "Success",
            description: "Staff member and capabilities added successfully",
          })
        }).catch(error => {
          console.error("Error adding service capabilities:", error)
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Staff member added but some capabilities failed to add",
          })
        })
      } else {
        queryClient.invalidateQueries(["staff"])
        toast({
          title: "Success",
          description: "Staff member added successfully",
        })
      }
      
      setOpen(false)
      reset()
      setServiceCapabilities([])
    },
    onError: (error) => {
      console.error("Error adding staff:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add staff member",
      })
    },
  })

  const onSubmit = (data) => {
    // Add additional fields required by the backend
    const enhancedData = {
      ...data,
      status: data.status || "active", // Set default status
    }
    
    console.log("Submitting form data:", enhancedData) // Debug log
    mutation.mutate(enhancedData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              onValueChange={(value) => setValue("role", value)}
              defaultValue="staff"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="primaryServiceCategory">Primary Service Category</Label>
            <Select
              onValueChange={(value) => setValue("primaryServiceCategory", value)}
              defaultValue="administration"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary service category" />
              </SelectTrigger>
              <SelectContent>
              {designationLoading ? (
                  <SelectItem value="loading" disabled>Loading designations...</SelectItem>
                ) : designation?.data?.length > 0 ? (
                  designation.data.map((des) => (
                    <SelectItem key={des._id} value={des._id}>
                      {des.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-designations" disabled>
                    No designations available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select 
              onValueChange={(value) => setValue("branch", value)}
              value={selectedBranch}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branchesLoading ? (
                  <SelectItem value="loading" disabled>Loading branches...</SelectItem>
                ) : branches?.data?.length > 0 ? (
                  branches.data.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-branches" disabled>
                    No branches available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {!selectedBranch && (
              <p className="text-sm text-amber-500">
                Please select a branch
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="(123) 456-7890"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={watch("status") === "active"}
              onCheckedChange={(checked) => setValue("status", checked ? "active" : "inactive")}
            />
            <Label htmlFor="status">Active</Label>
          </div>
          
          {/* Service Capabilities Section */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Service Capabilities</Label>
              {!serviceTypesLoading && getAvailableServiceTypes().length > 0 && (
                <Select
                  onValueChange={handleAddCapability}
                >
                  <SelectTrigger className="w-auto">
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Add Capability</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableServiceTypes().map((serviceType) => (
                      <SelectItem key={serviceType._id} value={serviceType._id}>
                        {serviceType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              {serviceTypesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : serviceCapabilities.length === 0 ? (
                <p className="text-sm text-gray-500">No service capabilities assigned</p>
              ) : (
                <div className="border rounded-md divide-y">
                  {serviceCapabilities.map((capability) => {
                    const serviceTypeName = capability.serviceType?.name;
                    
                    return (
                      <div 
                        key={capability._id} 
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{serviceTypeName}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Skill Level: {capability.skillLevel}/5</span>
                            <span>Certified: {capability.certified ? "Yes" : "No"}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCapability(capability._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
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
              disabled={
                mutation.isLoading || 
                isSubmitting || 
                !selectedBranch
              }
            >
              {(mutation.isLoading || isSubmitting) && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Add Staff
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}