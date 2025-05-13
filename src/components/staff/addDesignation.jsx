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
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api" // Import the apiClient instead of fetcher

export function AddDesignation({ children }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({})



  const mutation = useMutation({
    mutationFn: (data) => {
      
      return apiClient.post("designation", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["designation"])
      toast({
        title: "Success",
        description: "Designation added successfully",
      })
      setOpen(false)
      reset()
    },
    onError: (error) => {
      console.error("Error adding designation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add designation",
      })
    },
  })

  const onSubmit = (data) => {

    const enhancedData = {
      ...data,
    }
    
    console.log("Submitting form data:", enhancedData) // Debug log
    mutation.mutate(enhancedData)
  }

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add designation</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add designation</DialogTitle>
            <DialogDescription>Add a new designation to the system.</DialogDescription>
          </DialogHeader>
  
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" {...register("name", { required: "Name is required" })} className="col-span-3" />
                {errors.name && (
                  <p className="text-red-500 text-sm col-span-4">{errors.name.message}</p>
                )}
              </div>
            </div>
  
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || mutation.isLoading}>
                {isSubmitting || mutation.isLoading ? "Adding..." : "Add designation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );  
}