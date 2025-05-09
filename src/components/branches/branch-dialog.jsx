"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { useToast } from "@/components/ui/use-toast"
import { fetcher } from "@/lib/utils"

export function BranchDialog({ branchId, children }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch branch data when editing
  const { data: branchData, isLoading: isLoadingBranch } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => fetcher(`branches/${branchId}`),
    enabled: !!branchId && open,
  })

  // Extract branch data correctly
  const branch = branchData?.data || branchData

  // Fetch manager options
  const { data: managerData } = useQuery({
    queryKey: ["managers"],
    queryFn: () => fetcher("users?role=manager"),
    enabled: open,
  })

  // Extract managers array correctly
  const managers = managerData?.data || managerData?.users || []
  console.log("managers data :", managers)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
      },
      phone: "",
      email: "",
      manager: "",
      status: "active",
      capacity: {
        vehicles: 0,
        staff: 0
      }
    },
  })

  // Set form values when branch data is loaded for editing
  useEffect(() => {
    if (branch && branchId) {
      setValue("name", branch.name || "");
      setValue("address.street", branch.address?.street || "");
      setValue("address.city", branch.address?.city || "");
      setValue("address.state", branch.address?.state || "");
      setValue("address.zipCode", branch.address?.zipCode || "");
      setValue("phone", branch.phone || "");
      setValue("email", branch.email || "");
      setValue("manager", branch.manager?._id || "");
      setValue("status", branch.status || "active");
      setValue("capacity.vehicles", branch.capacity?.vehicles || 0);
      setValue("capacity.staff", branch.capacity?.staff || 0);
    }
  }, [branch, branchId, setValue]);

  // Create or update branch
  const mutation = useMutation({
    mutationFn: (data) =>
      branchId
        ? fetcher(`branches/${branchId}`, {
            method: "PUT",
            body: JSON.stringify(data),
          })
        : fetcher("branches", {
            method: "POST",
            body: JSON.stringify(data),
          }),
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"])
      if (branchId) {
        queryClient.invalidateQueries(["branch", branchId])
      }
      toast({
        title: "Success",
        description: `Branch ${branchId ? "updated" : "created"} successfully`,
      })
      reset()
      setOpen(false)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save branch",
      })
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{branchId ? "Edit" : "Add"} Branch</DialogTitle>
          <DialogDescription>
            {branchId
              ? "Update branch information"
              : "Add a new branch to the system"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingBranch ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Branch Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Branch name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="street" className="text-xs">Street</Label>
                  <Input
                    id="street"
                    {...register("address.street", { required: "Street is required" })}
                  />
                  {errors.address?.street && (
                    <p className="text-sm text-red-500">{errors.address.street.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input
                    id="city"
                    {...register("address.city", { required: "City is required" })}
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-red-500">{errors.address.city.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="state" className="text-xs">State</Label>
                    <Input
                      id="state"
                      {...register("address.state", { required: "State is required" })}
                    />
                    {errors.address?.state && (
                      <p className="text-sm text-red-500">{errors.address.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode" className="text-xs">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register("address.zipCode", { required: "ZIP code is required" })}
                    />
                    {errors.address?.zipCode && (
                      <p className="text-sm text-red-500">{errors.address.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone", { required: "Phone is required" })}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email"
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="vehicles">Vehicle Capacity</Label>
                <Input
                  id="vehicles"
                  type="number"
                  {...register("capacity.vehicles", { 
                    required: "Vehicle capacity is required",
                    valueAsNumber: true
                  })}
                />
                {errors.capacity?.vehicles && (
                  <p className="text-sm text-red-500">{errors.capacity.vehicles.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Capacity</Label>
                <Input
                  id="staff"
                  type="number"
                  {...register("capacity.staff", { 
                    required: "Staff capacity is required",
                    valueAsNumber: true
                  })}
                />
                {errors.capacity?.staff && (
                  <p className="text-sm text-red-500">{errors.capacity.staff.message}</p>
                )}
              </div>
            </div>

            {/* Manager */}
            <div className="space-y-2">
              <Label htmlFor="manager">Branch Manager</Label>
              <Select
                onValueChange={(value) => setValue("manager", value)}
                defaultValue={branch?.manager?._id || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Leave empty to set as unassigned</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue("status", value)}
                defaultValue={branch?.status || "active"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {branchId ? "Update" : "Add"} Branch
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}