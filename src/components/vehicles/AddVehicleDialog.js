'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Iconsdata } from '@/components/icons'
import { useToast } from '@/components/ui/use-toast'
import { fetcher } from '@/lib/utils'

const AddVehicleDialog = () => {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm()

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => fetcher(`branches`),
  })

  const mutation = useMutation({
    mutationFn: (data) =>
      fetcher(`vehicles`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles'])
      toast({
        title: 'Success',
        description: 'Vehicle added successfully',
      })
      setOpen(false)
      reset()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Iconsdata.plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter the vehicle details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              {...register('registrationNumber', {
                required: 'Registration number is required',
              })}
            />
            {errors.registrationNumber && (
              <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" {...register('make', { required: 'Make is required' })} />
              {errors.make && <p className="text-sm text-red-500">{errors.make.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model', { required: 'Model is required' })} />
              {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                {...register('year', {
                  required: 'Year is required',
                  min: { value: 1900, message: 'Year must be after 1900' },
                  max: {
                    value: new Date().getFullYear(),
                    message: 'Year cannot be in the future',
                  },
                })}
              />
              {errors.year && <p className="text-sm text-red-500">{errors.year.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Controller
                control={control}
                name="type"
                rules={{ required: 'Vehicle type is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['sedan', 'suv', 'hatchback', 'truck', 'van', 'motorcycle', 'other'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Controller
                control={control}
                name="fuelType"
                rules={{ required: 'Fuel type is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map((fuel) => (
                        <SelectItem key={fuel} value={fuel}>
                          {fuel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fuelType && (
                <p className="text-sm text-red-500">{errors.fuelType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input type="number" id="mileage" {...register('mileage')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chassisNumber">Chassis Number</Label>
              <Input id="chassisNumber" {...register('chassisNumber')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engineNumber">Engine Number</Label>
              <Input id="engineNumber" {...register('engineNumber')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" {...register('color')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
            <Input id="insuranceExpiry" type="date" {...register('insuranceExpiry')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Controller
              control={control}
              name="branch"
              rules={{ required: 'Branch is required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.data?.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.branch && <p className="text-sm text-red-500">{errors.branch.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" {...register('owner.name', { required: 'Owner name is required' })} />
            {errors.owner?.name && <p className="text-sm text-red-500">{errors.owner.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input id="ownerPhone" {...register('owner.phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input id="ownerEmail" type="email" {...register('owner.email')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading && (
                <Iconsdata.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Vehicle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddVehicleDialog
