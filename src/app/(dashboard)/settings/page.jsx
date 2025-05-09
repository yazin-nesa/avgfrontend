"use client"

import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { fetcher } from "@/lib/utils"

export default function SettingsPage() {
  const { toast } = useToast()

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetcher("/api/v1/settings"),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: settings?.companyName || "",
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      enableEmailNotifications: settings?.enableEmailNotifications || false,
      enableSMSNotifications: settings?.enableSMSNotifications || false,
      serviceReminderDays: settings?.serviceReminderDays || 7,
      defaultServiceInterval: settings?.defaultServiceInterval || 90,
    },
  })

  const mutation = useMutation({
    mutationFn: (data) =>
      fetcher("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
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
    mutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="service">Service Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    defaultValue={settings?.companyName}
                    {...register("companyName", {
                      required: "Company name is required",
                    })}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500">
                      {errors.companyName.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={settings?.email}
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
                      {errors.email.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    defaultValue={settings?.phone}
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue={settings?.address}
                    {...register("address", {
                      required: "Address is required",
                    })}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">
                      {errors.address.message as string}
                    </p>
                  )}
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailNotifications"
                    defaultChecked={settings?.enableEmailNotifications}
                    {...register("enableEmailNotifications")}
                  />
                  <Label htmlFor="enableEmailNotifications">
                    Enable Email Notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSMSNotifications"
                    defaultChecked={settings?.enableSMSNotifications}
                    {...register("enableSMSNotifications")}
                  />
                  <Label htmlFor="enableSMSNotifications">
                    Enable SMS Notifications
                  </Label>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Service Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="serviceReminderDays">
                    Service Reminder Days
                  </Label>
                  <Input
                    id="serviceReminderDays"
                    type="number"
                    defaultValue={settings?.serviceReminderDays}
                    {...register("serviceReminderDays", {
                      required: "Service reminder days is required",
                      min: { value: 1, message: "Must be at least 1 day" },
                    })}
                  />
                  {errors.serviceReminderDays && (
                    <p className="text-sm text-red-500">
                      {errors.serviceReminderDays.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultServiceInterval">
                    Default Service Interval (days)
                  </Label>
                  <Input
                    id="defaultServiceInterval"
                    type="number"
                    defaultValue={settings?.defaultServiceInterval}
                    {...register("defaultServiceInterval", {
                      required: "Default service interval is required",
                      min: { value: 1, message: "Must be at least 1 day" },
                    })}
                  />
                  {errors.defaultServiceInterval && (
                    <p className="text-sm text-red-500">
                      {errors.defaultServiceInterval.message as string}
                    </p>
                  )}
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 