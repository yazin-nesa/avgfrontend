"use client"

import React, { useState, useEffect } from "react"
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
import { fetcher } from "@/lib/utils"

export function StaffDetailsDialog({
  userId,
  children,
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEditing = !!userId

  // Fetch user data when editing
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetcher(`users/${userId}`),
    enabled: !!userId && open,
  })

  // Extract user data from response
  const user = userData?.data || userData

  // Fetch branches
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => fetcher("branches"),
    enabled: open,
  })

  // Fetch service types
  const { data: serviceTypesData, isLoading: isLoadingServiceTypes } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: () => fetcher("service-types"),
    enabled: open,
  })

  // Extract branches and service types from responses
  const branches = branchesData?.data || branchesData || []
  const serviceTypes = serviceTypesData?.data || serviceTypesData || []

  // State for service capabilities
  const [serviceCapabilities, setServiceCapabilities] = useState([])
  const [primaryServiceCategory, setPrimaryServiceCategory] = useState("administration")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
      branch: "",
      status: "active",
      phone: "",
      primaryServiceCategory: "administration",
    }
  })

  // Watch the role value
  const selectedRole = watch("role")

  // Set form values when user data is loaded for editing
  useEffect(() => {
    if (user && userId && open) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "staff",
        branch: user.branch?._id || "",
        status: user.status || (user.isActive ? "active" : "inactive"),
        phone: user.phone || "",
        primaryServiceCategory: user.primaryServiceCategory || "administration",
      })
      
      // Set service capabilities
      setServiceCapabilities(user.serviceCapabilities || [])
      setPrimaryServiceCategory(user.primaryServiceCategory || "administration")
    } else if (!userId && open) {
      // Reset to default values when creating new staff
      reset({
        firstName: "",
        lastName: "",
        email: "",
        role: "staff",
        branch: "",
        status: "active",
        phone: "",
        primaryServiceCategory: "administration",
      })
      setServiceCapabilities([])
      setPrimaryServiceCategory("administration")
    }
  }, [user, userId, open, reset])

  // Create or update user
  const mutation = useMutation({
    mutationFn: (data) =>
      userId
        ? fetcher(`users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(data),
          })
        : fetcher("users", {
            method: "POST",
            body: JSON.stringify(data),
          }),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"])
      if (userId) {
        queryClient.invalidateQueries(["user", userId])
      }
      toast({
        title: "Success",
        description: `Staff member ${userId ? "updated" : "created"} successfully`,
      })
      setOpen(false)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${userId ? "update" : "create"} staff member`,
      })
    },
  })

  // Add service capability mutation
  const addCapabilityMutation = useMutation({
    mutationFn: (data) =>
      fetcher(`users/${userId}/service-capabilities`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["user", userId])
      toast({
        title: "Success",
        description: "Service capability added successfully",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add service capability",
      })
    },
  })

  // Delete service capability mutation
  const deleteCapabilityMutation = useMutation({
    mutationFn: (capabilityId) =>
      fetcher(`users/${userId}/service-capabilities/${capabilityId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["user", userId])
      toast({
        title: "Success",
        description: "Service capability removed successfully",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove service capability",
      })
    },
  })

  const onSubmit = (data) => {
    // Prepare the data for submission
    const submissionData = {
      ...data,
      status: data.status || "active",
      primaryServiceCategory: primaryServiceCategory,
    }
    
    console.log("Submitting data:", submissionData)
    mutation.mutate(submissionData)
  }

  // Add new service capability
  const handleAddCapability = (serviceTypeId) => {
    if (!serviceTypeId || !userId) return
    
    addCapabilityMutation.mutate({
      serviceType: serviceTypeId,
      skillLevel: 1,
      certified: false
    })
  }

  // Remove service capability
  const handleDeleteCapability = (capabilityId) => {
    if (!capabilityId || !userId) return
    
    deleteCapabilityMutation.mutate(capabilityId)
  }

  // Find service type name by ID
  const getServiceTypeName = (serviceTypeId) => {
    const serviceType = serviceTypes.find(
      (st) => st._id === serviceTypeId || st._id === serviceTypeId?.toString()
    )
    return serviceType ? serviceType.name : "Unknown Service"
  }

  // Get available service types (not already added)
  const getAvailableServiceTypes = () => {
    const currentServiceTypeIds = serviceCapabilities.map(
      (cap) => cap.serviceType?._id || cap.serviceType
    )
    
    return serviceTypes.filter(
      (st) => !currentServiceTypeIds.includes(st._id) && !currentServiceTypeIds.includes(st._id?.toString())
    )
  }

  const isLoading = isLoadingUser || isLoadingBranches || isLoadingServiceTypes

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{userId ? "Edit" : "Add"} Staff Member</DialogTitle>
          <DialogDescription>
            {userId 
              ? "Update staff member information" 
              : "Add a new staff member to the system"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
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
            {!userId && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: !userId ? "Password is required" : false,
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
            )}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="(123) 456-7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => setValue("role", value)}
                defaultValue={user?.role || "staff"}
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
              <Label htmlFor="branch">Branch</Label>
              <Select
                onValueChange={(value) => setValue("branch", value)}
                defaultValue={user?.branch?._id || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                {branches?.length > 0 ? (
                  branches.map((branch) => (
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
              {!watch("branch") && (
                <p className="text-sm text-amber-500">
                  Please select a branch
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primaryServiceCategory">Primary Service Category</Label>
              <Select
                onValueChange={(value) => setPrimaryServiceCategory(value)}
                defaultValue={primaryServiceCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary service category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine_maintenance">Routine Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="body_work">Body Work</SelectItem>
                  <SelectItem value="washing">Washing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={watch("status") === "active"}
                onCheckedChange={(checked) => setValue("status", checked ? "active" : "inactive")}
              />
              <Label htmlFor="status">Active</Label>
            </div>
            
            {userId && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Service Capabilities</Label>
                  {getAvailableServiceTypes().length > 0 && (
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
                  {serviceCapabilities.length === 0 ? (
                    <p className="text-sm text-gray-500">No service capabilities assigned</p>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {serviceCapabilities.map((capability) => {
                        const serviceTypeName = capability.serviceType?.name || 
                          getServiceTypeName(capability.serviceType);
                        
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
                              disabled={deleteCapabilityMutation.isLoading}
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
            )}
            
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
                  !watch("branch")
                }
              >
                {mutation.isLoading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {userId ? "Update" : "Add"} Staff Member
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}