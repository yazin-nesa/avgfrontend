"use client"

import { useState } from "react"
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
import { fetcher, formatDate, formatCurrency } from "@/lib/utils"

export function ServiceDialog({
  vehicleId,
  children,
}: {
  vehicleId: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetcher(`/api/v1/vehicles/${vehicleId}`),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceType: "",
      description: "",
      partsUsed: "",
      partsCost: 0,
      laborCost: 0,
      nextServiceDue: "",
      status: "pending",
    },
  })

  const totalCost = Number(watch("partsCost")) + Number(watch("laborCost"))

  const mutation = useMutation({
    mutationFn: (data) =>
      fetcher(`/api/v1/vehicles/${vehicleId}/services`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["vehicle", vehicleId])
      toast({
        title: "Success",
        description: "Service record added successfully",
      })
      reset()
      setOpen(false)
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    },
  })

  const onSubmit = (data: any) => {
    mutation.mutate({
      ...data,
      partsCost: Number(data.partsCost),
      laborCost: Number(data.laborCost),
      totalCost,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vehicle Service Record</DialogTitle>
          <DialogDescription>
            Add a new service record for vehicle{" "}
            {vehicle?.registrationNumber || "loading..."}
          </DialogDescription>
        </DialogHeader>
        {isLoadingVehicle ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  onValueChange={(value) => setValue("serviceType", value)}
                  {...register("serviceType", { required: "Service type is required" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="emergency">Emergency Service</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceType && (
                  <p className="text-sm text-red-500">
                    {errors.serviceType.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => setValue("status", value)}
                  defaultValue="pending"
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
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="partsUsed">Parts Used</Label>
              <Textarea
                id="partsUsed"
                {...register("partsUsed", {
                  required: "Parts used information is required",
                })}
              />
              {errors.partsUsed && (
                <p className="text-sm text-red-500">
                  {errors.partsUsed.message as string}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partsCost">Parts Cost (₹)</Label>
                <Input
                  id="partsCost"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("partsCost", {
                    required: "Parts cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                />
                {errors.partsCost && (
                  <p className="text-sm text-red-500">
                    {errors.partsCost.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost (₹)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("laborCost", {
                    required: "Labor cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                />
                {errors.laborCost && (
                  <p className="text-sm text-red-500">
                    {errors.laborCost.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <p className="text-lg font-semibold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextServiceDue">Next Service Due</Label>
              <Input
                id="nextServiceDue"
                type="date"
                {...register("nextServiceDue", {
                  required: "Next service due date is required",
                })}
              />
              {errors.nextServiceDue && (
                <p className="text-sm text-red-500">
                  {errors.nextServiceDue.message as string}
                </p>
              )}
            </div>
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
                Add Service Record
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 