"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { fetcher, formatDate } from "@/lib/utils"
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function ComplaintDialog({ complaintId, children }) {
  const { control, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "low",
      status: "open",
      branchId: "",
      vehicleId: "",
      serviceId: "",
      assignedTo: "",
      dueDate: "",
    },
  })
  const isEdit = !!complaintId
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Watch vehicleId for dependent service list
  const vehicleId = watch("vehicleId")

  const { data: complaintResponse, isLoading: isLoadingComplaint } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => fetcher(`complaints/${complaintId}`),
    enabled: !!complaintId && open,
  })

  // Extract the actual complaint data from the response
  const complaint = complaintResponse?.data

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => fetcher("branches"),
    enabled: open
  })

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetcher("users"),
    enabled: open
  })

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => fetcher("vehicles"),
    enabled: open
  })

  const { data: services } = useQuery({
    queryKey: isEdit ? ["services-edit"] : ["services", vehicleId],
    queryFn: () =>
      isEdit
        ? fetcher("services") // fetch all services when editing
        : vehicleId
          ? fetcher(`services?vehicle=${vehicleId}`)
          : null,
    enabled: open && (isEdit || !!vehicleId),
  })

  // Populate form when complaint data is loaded
  useEffect(() => {
    if (complaint && complaintId) {
      console.log("Populating form with complaint data:", complaint);

      // Set values one by one to ensure they're properly set
      setValue("title", complaint.title || "");
      setValue("description", complaint.description || "");
      setValue("category", complaint.category || "");
      setValue("priority", complaint.priority || "low");
      setValue("status", complaint.status || "open");
      setValue("branchId", complaint.branch?._id || complaint.branch || "");
      setValue("vehicleId", complaint.vehicle?._id || complaint.vehicle || "");
      setValue("serviceId", complaint.service?._id || complaint.service || "");
      setValue("assignedTo", complaint.assignedTo?._id || complaint.assignedTo || "");

      // Format date properly if it exists
      if (complaint.dueDate) {
        setValue("dueDate", complaint.dueDate.slice(0, 10));
      } else {
        setValue("dueDate", "");
      }
    } else if (!complaintId) {
      // Reset form when opening for new complaint
      reset({
        title: "",
        description: "",
        category: "",
        priority: "low",
        status: "open",
        branchId: "",
        vehicleId: "",
        serviceId: "",
        assignedTo: "",
        dueDate: "",
      });
    }
  }, [complaint, complaintId, setValue, reset, open]);

  const mutation = useMutation({
    mutationFn: (data) =>
      complaintId
        ? fetcher(`complaints/${complaintId}`, { method: "PUT", body: JSON.stringify(data) })
        : fetcher("complaints", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["complaints"])
      if (complaintId) queryClient.invalidateQueries(["complaint", complaintId])
      toast({ title: "Success", description: `Complaint ${complaintId ? "updated" : "filed"} successfully` })
      reset()
      setOpen(false)
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Something went wrong" })
    },
  })

  const onSubmit = (data) => {
    // Transform form data to API format if needed
    const formattedData = {
      ...data,
      // Only include non-empty fields to avoid ObjectId casting errors
      branch: data.branchId || undefined,
      vehicle: data.vehicleId || undefined,
      service: data.serviceId || undefined,
      assignedTo: data.assignedTo || undefined,
      // Remove the ID fields that were just for the form
      branchId: undefined,
      vehicleId: undefined,
      serviceId: undefined
    }

    // Remove empty fields that could cause MongoDB casting errors
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === "") {
        formattedData[key] = undefined;
      }
    });

    mutation.mutate(formattedData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{complaintId ? "Complaint Details" : "File Complaint"}</DialogTitle>
          <DialogDescription>{complaintId ? "View and update complaint details" : "Submit a new complaint"}</DialogDescription>
        </DialogHeader>
        {isLoadingComplaint && complaintId ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <Input id="title" {...field} disabled={false} />
                )}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <Textarea id="description" {...field} disabled={false} />
                )}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={false} // Allow editing category
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {["service_quality", "customer_service", "pricing", "delay", "parts", "other"].map(category => (
                          <SelectItem key={category} value={category}>{category.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {["low", "medium", "high", "urgent"].map(priority => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch</Label>
                <Controller
                  name="branchId"
                  control={control}
                  rules={{ required: "Branch is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={false} // Allow editing branch
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches?.data?.map(branch => (
                          <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.branchId && <p className="text-sm text-red-500">{errors.branchId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["open", "in_progress", "resolved", "closed"].map(status => (
                          <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Controller
                  name="assignedTo"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.data?.map(user => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="dueDate" type="date" {...field} />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Controller
                  name="vehicleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (!complaintId) {
                          setValue("serviceId", ""); // Reset service when vehicle changes (only for new complaints)
                        }
                      }}
                      value={field.value}
                      disabled={false} // Allow editing vehicle even when updating
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.data?.map(vehicle => (
                          <SelectItem key={vehicle._id} value={vehicle._id}>
                            {vehicle.registrationNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Service</Label>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!vehicleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.data?.flatMap(service =>
                          service.serviceItems.map(item => (
                            <SelectItem
                              key={item.serviceType?._id}
                              value={item.serviceType?._id}
                            >
                              {item.serviceType?.name} - {item.createdAt}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {complaintId && complaint?.resolution?.description && (
              <div className="space-y-2">
                <Label>Resolution</Label>
                <p className="text-sm text-muted-foreground">{complaint.resolution.description}</p>
                {complaint.resolution.feedback && (
                  <>
                    <Label>Feedback</Label>
                    <p className="text-sm">Rating: {complaint.resolution.feedback.rating}</p>
                    <p className="text-sm">{complaint.resolution.feedback.comment}</p>
                  </>
                )}
              </div>
            )}

            {complaint?.escalated?.status && (
              <div className="space-y-2">
                <Label>Escalation Details</Label>
                <p className="text-sm text-red-500">Reason: {complaint.escalated.reason}</p>
                <p className="text-sm text-muted-foreground">Date: {formatDate(complaint.escalated.date)}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <Input id="attachments" type="file" multiple disabled={!!complaintId} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {complaintId ? "Update Complaint" : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}