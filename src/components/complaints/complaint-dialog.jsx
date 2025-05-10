"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { fetcher, formatDate } from "@/lib/utils"

export function ComplaintDialog({ complaintId, children }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: complaint, isLoading: isLoadingComplaint } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => fetcher(`complaints/${complaintId}`),
    enabled: !!complaintId && open,
  })

  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: () => fetcher("branches"), enabled: open })
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: () => fetcher("users"), enabled: open })
  const { data: vehicles } = useQuery({ queryKey: ["vehicles"], queryFn: () => fetcher("vehicles"), enabled: open })
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: () => fetcher("services"), enabled: open })

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
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

  useEffect(() => {
    if (complaint && complaintId) {
      const values = {
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        branchId: complaint.branch?._id,
        vehicleId: complaint.vehicle?._id,
        serviceId: complaint.service?._id,
        assignedTo: complaint.assignedTo?._id || "",
        dueDate: complaint.dueDate ? complaint.dueDate.slice(0, 10) : "",
      }
      reset(values)
    }
  }, [complaint])

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
      toast({ variant: "destructive", title: "Error", description: error.message })
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{complaintId ? "Complaint Details" : "File Complaint"}</DialogTitle>
          <DialogDescription>{complaintId ? "View and update complaint details" : "Submit a new complaint"}</DialogDescription>
        </DialogHeader>
        {isLoadingComplaint ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputBlock label="Title" id="title" register={register("title", { required: "Title is required" })} disabled={!!complaintId} defaultValue={complaint?.title} error={errors.title} />
            <TextareaBlock label="Description" id="description" register={register("description", { required: "Description is required" })} disabled={!!complaintId} defaultValue={complaint?.description} error={errors.description} />

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Category" options={["service_quality", "customer_service", "pricing", "delay", "parts", "other"]} onChange={(val) => setValue("category", val)} defaultValue={complaint?.category} disabled={!!complaintId} />
              <SelectField label="Priority" options={["low", "medium", "high", "urgent"]} onChange={(val) => setValue("priority", val)} defaultValue={complaint?.priority || "low"} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Branch" options={branches?.branches?.map(b => ({ value: b._id, label: b.name }))} onChange={(val) => setValue("branchId", val)} defaultValue={complaint?.branch?._id} disabled={!!complaintId} />
              <SelectField label="Status" options={["open", "in_progress", "resolved", "closed"]} onChange={(val) => setValue("status", val)} defaultValue={complaint?.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Assigned To" options={users?.users?.map(u => ({ value: u._id, label: u.name }))} onChange={(val) => setValue("assignedTo", val)} defaultValue={complaint?.assignedTo?._id} />
              <InputBlock label="Due Date" id="dueDate" type="date" register={register("dueDate")} defaultValue={complaint?.dueDate?.slice(0, 10)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Vehicle" options={vehicles?.map(v => ({ value: v._id, label: v.registrationNumber }))} onChange={(val) => setValue("vehicleId", val)} defaultValue={complaint?.vehicle?._id} />
              <SelectField label="Service" options={services?.map(s => ({ value: s._id, label: s.serviceType }))} onChange={(val) => setValue("serviceId", val)} defaultValue={complaint?.service?._id} />
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
              <Input id="attachments" type="file" multiple />
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

// Helper components

function InputBlock({ label, id, type = "text", register, defaultValue, error, disabled = false }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} defaultValue={defaultValue} {...register} disabled={disabled} />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}

function TextareaBlock({ label, id, register, defaultValue, error, disabled = false }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} defaultValue={defaultValue} {...register} disabled={disabled} />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}

function SelectField({ label, options, onChange, defaultValue, disabled = false }) {
  const formattedOptions = options?.map(opt => (typeof opt === "string" ? { value: opt, label: opt } : opt))
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select onValueChange={onChange} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {formattedOptions?.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
