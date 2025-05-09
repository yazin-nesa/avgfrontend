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
import { fetcher, formatDate } from "@/lib/utils"

export function ComplaintDialog({
  complaintId,
  children,
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: complaint, isLoading: isLoadingComplaint } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => fetcher(`complaints/${complaintId}`),
    enabled: !!complaintId && open,
  })

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => fetcher("branches"),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "low",
      branchId: "",
      status: "pending",
    },
  })

  const mutation = useMutation({
    mutationFn: (data) =>
      complaintId
        ? fetcher(`complaints/${complaintId}`, {
            method: "PUT",
            body: JSON.stringify(data),
          })
        : fetcher("complaints", {
            method: "POST",
            body: JSON.stringify(data),
          }),
    onSuccess: () => {
      queryClient.invalidateQueries(["complaints"])
      if (complaintId) {
        queryClient.invalidateQueries(["complaint", complaintId])
      }
      toast({
        title: "Success",
        description: `Complaint ${
          complaintId ? "updated" : "filed"
        } successfully`,
      })
      reset()
      setOpen(false)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
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
          <DialogTitle>
            {complaintId ? "Complaint Details" : "File Complaint"}
          </DialogTitle>
          <DialogDescription>
            {complaintId
              ? "View and update complaint details"
              : "Submit a new complaint"}
          </DialogDescription>
        </DialogHeader>
        {isLoadingComplaint ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                defaultValue={complaint?.title}
                {...register("title", { required: "Title is required" })}
                disabled={!!complaintId}
              />
              {errors.title && (
                <p className="text-sm text-red-500">
                  {errors.title.message }
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={complaint?.description}
                {...register("description", {
                  required: "Description is required",
                })}
                disabled={!!complaintId}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message }
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                  defaultValue={complaint?.category}
                  disabled={!!complaintId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="facility">Facility</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  onValueChange={(value) => setValue("priority", value)}
                  defaultValue={complaint?.priority || "low"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchId">Branch</Label>
                <Select
                  onValueChange={(value) => setValue("branchId", value)}
                  defaultValue={complaint?.branch?._id}
                  disabled={!!complaintId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.branches?.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {complaintId && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => setValue("status", value)}
                    defaultValue={complaint?.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {complaintId && (
              <div className="space-y-2">
                <Label>Filed On</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(complaint?.createdAt)}
                </p>
                {complaint?.resolvedAt && (
                  <>
                    <Label>Resolved On</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(complaint?.resolvedAt)}
                    </p>
                  </>
                )}
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
              <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {complaintId ? "Update Status" : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 