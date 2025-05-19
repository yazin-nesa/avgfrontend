"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, X, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "../ui/use-toast"
import { cn, fetcher } from "@/lib/utils"

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  formulaDefinition: z.string().min(1, "Formula is required"),
  active: z.boolean().default(true),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional().nullable(),
  // Changed from optional to default empty array to avoid validation issues
  applicableCategories: z.array(z.string()).default([]),
  variables: z.array(
    z.object({
      name: z.string().min(1, "Variable name is required"),
      description: z.string().optional(),
      defaultValue: z.number().default(0),
    })
  ).optional(),
  thresholds: z.array(
    z.object({
      metricName: z.string().min(1, "Metric name is required"),
      threshold: z.number().min(0, "Threshold must be a positive number"),
      bonusAmount: z.number().min(0, "Bonus amount must be a positive number"),
    })
  ).optional(),
  serviceTypeMultipliers: z.array(
    z.object({
      serviceType: z.string().min(1, "Service type is required"),
      multiplier: z.number().min(0, "Multiplier must be a positive number"),
    })
  ).optional(),
});
// Field help text component
const FieldHelpText = ({ text }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center ml-1 text-muted-foreground cursor-help">
            <HelpCircle size={14} />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[350px]">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function IncentivePolicyDialog({ children, policyId }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get staff categories for selection
  const { data: staffCategories = [] } = useQuery({
    queryKey: ["staff-categories"],
    queryFn: () => fetcher("incentivepolicies/staff-categories").then(res => res.data),
    enabled: open,
  })

  // Get service types for selection
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["service-types"],
    queryFn: () => fetcher("service-types").then(res => res.data),
    enabled: open,
  })

  // Get policy data if editing existing
  const { data: policyData, isLoading: isPolicyLoading } = useQuery({
    queryKey: ["incentive-policy", policyId],
    queryFn: () => fetcher(`incentivepolicies/policies/${policyId}`).then(res => res.data),
    enabled: !!policyId && open,
  })
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      formulaDefinition: "",
      active: true,
      effectiveFrom: new Date(),
      effectiveTo: null,
      // Initialize with empty array instead of undefined
      applicableCategories: [],
      variables: [
        { name: "", description: "", defaultValue: 0 }
      ],
      thresholds: [
        { metricName: "", threshold: 0, bonusAmount: 0 }
      ],
      serviceTypeMultipliers: [
        { serviceType: "", multiplier: 1.0 }
      ]
    }
  });
  
  // Update form when editing existing policy
  useEffect(() => {
    if (policyData) {
      form.reset({
        name: policyData.name,
        description: policyData.description || "",
        formulaDefinition: policyData.formulaDefinition,
        active: policyData.active,
        effectiveFrom: policyData.effectiveFrom ? new Date(policyData.effectiveFrom) : new Date(),
        effectiveTo: policyData.effectiveTo ? new Date(policyData.effectiveTo) : null,
        // Ensure it's always an array
        applicableCategories: Array.isArray(policyData.applicableCategories) 
          ? policyData.applicableCategories.map(cat => cat._id) 
          : [],
        variables: policyData.variables?.length 
          ? policyData.variables 
          : [{ name: "", description: "", defaultValue: 0 }],
        thresholds: policyData.thresholds?.length 
          ? policyData.thresholds 
          : [{ metricName: "", threshold: 0, bonusAmount: 0 }],
        serviceTypeMultipliers: policyData.serviceTypeMultipliers?.length
          ? policyData.serviceTypeMultipliers.map(stm => ({
            serviceType: stm.serviceType._id,
            multiplier: stm.multiplier
          }))
          : [{ serviceType: "", multiplier: 1.0 }]
      });
    }
  }, [policyData, form]);
  // Create or update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      if (policyId) {
        return fetcher(`incentivepolicies/policies/${policyId}`, {
          method: "PUT",
          body: JSON.stringify(data)
        }).then(res => {
          if (!res.ok) throw new Error("Failed to update policy")
          return res
        })
      } else {
        return fetcher("incentivepolicies/policies", {
          method: "POST",
          body: JSON.stringify(data)
        }).then(res => {
          if (!res.ok) throw new Error("Failed to create policy")
          return res
        })
      }
    },
    onSuccess: () => {
      toast({
        title: `Policy ${policyId ? "updated" : "created"} successfully`,
        description: `The incentive policy has been ${policyId ? "updated" : "created"}.`,
      })
      queryClient.invalidateQueries(["incentive-policies"])
      setOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  function onSubmit(data) {
    // Clean up empty arrays
    const formData = {
      ...data,
      // Ensure applicableCategories is always an array
      applicableCategories: Array.isArray(data.applicableCategories) ? data.applicableCategories : [],
      variables: data.variables?.filter(v => v.name) || [],
      thresholds: data.thresholds?.filter(t => t.metricName) || [],
      serviceTypeMultipliers: data.serviceTypeMultipliers?.filter(stm => stm.serviceType) || []
    };
    mutation.mutate(formData);
  }

  // Helper functions for dynamic fields
  const addVariable = () => {
    const variables = form.getValues("variables") || []
    form.setValue("variables", [...variables, { name: "", description: "", defaultValue: 0 }])
  }

  const removeVariable = (index) => {
    const variables = form.getValues("variables") || []
    form.setValue("variables", variables.filter((_, i) => i !== index))
  }

  const addThreshold = () => {
    const thresholds = form.getValues("thresholds") || []
    form.setValue("thresholds", [...thresholds, { metricName: "", threshold: 0, bonusAmount: 0 }])
  }

  const removeThreshold = (index) => {
    const thresholds = form.getValues("thresholds") || []
    form.setValue("thresholds", thresholds.filter((_, i) => i !== index))
  }

  const addServiceTypeMultiplier = () => {
    const multipliers = form.getValues("serviceTypeMultipliers") || []
    form.setValue("serviceTypeMultipliers", [...multipliers, { serviceType: "", multiplier: 1.0 }])
  }

  const removeServiceTypeMultiplier = (index) => {
    const multipliers = form.getValues("serviceTypeMultipliers") || []
    form.setValue("serviceTypeMultipliers", multipliers.filter((_, i) => i !== index))
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setOpen(false)
    setTimeout(() => {
      setActiveTab("basic")
      if (!policyId) {
        form.reset()
      }
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {policyId ? "Edit" : "Create"} Incentive Policy
          </DialogTitle>
          <DialogDescription>
            {policyId
              ? "Update the incentive policy details below."
              : "Configure a new incentive calculation policy for staff members."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="formula">Formula</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Policy Name
                        <FieldHelpText text="A unique name to identify this incentive policy" />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Q2 2025 Specialist Bonus Structure" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a clear, descriptive name that identifies the purpose of this policy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description
                        <FieldHelpText text="A detailed explanation of how this incentive policy works" />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., This policy calculates incentives for specialists based on total credit points earned, target achievement, and service type multipliers..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the policy's purpose, how it works, and when it should be applied .
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="effectiveFrom"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Effective From
                          <FieldHelpText text="The date when this policy becomes active" />
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          This policy will be applicable from this date onwards
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="effectiveTo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Effective To
                          <FieldHelpText text="Optional end date for the policy - leave empty for no end date" />
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>No end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || null}
                              onSelect={field.onChange}
                              initialFocus
                              fromDate={form.getValues("effectiveFrom")}
                            />
                            <div className="p-3 border-t border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange(null)}
                              >
                                Clear Date
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Set an expiration date or leave empty if the policy has no end date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                          <FieldHelpText text="Toggle to activate or deactivate the policy" />
                        </FormLabel>
                        <FormDescription>
                          Inactive policies won't be used for incentive calculations even if within effective dates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Formula Tab */}
              <TabsContent value="formula" className="space-y-4">
                <Alert className="bg-green-950 mb-4">
                  <AlertDescription>
                    <p className="font-medium">Formula Reference:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                      <li><code className="font-bold text-white px-1 rounded">totalCreditPoints</code> - Total credit points earned by staff</li>
                      <li><code className="font-bold text-white px-1 rounded">targetAchievement</code> - Percentage of target achieved (0-100)</li>
                      <li><code className="font-bold text-white px-1 rounded">completedServices</code> - Number of services completed</li>
                      <li><code className="font-bold text-white px-1 rounded">baseIncentiveRate</code> - Base rate for the staff category</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="formulaDefinition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Incentive Formula
                        <FieldHelpText text="Mathematical expression that calculates the incentive amount" />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., baseAmount + (totalCreditPoints * multiplier) + (targetAchievement * bonusRate)"
                          className="font-mono min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Use mathematical operators (+, -, *, /) and variable names that will be replaced with actual values
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Variables
                      <FieldHelpText text="Custom variables that can be used in your formula" />
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariable}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variable
                    </Button>
                  </div>

                  {form.watch("variables")?.map((_, index) => (
                    <div key={`variable-${index}`} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`variables.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Name
                                {index === 0 && <FieldHelpText text="Used in formula as-is (no spaces)" />}
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., baseAmount" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`variables.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Description
                                {index === 0 && <FieldHelpText text="Explains what this variable represents" />}
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Base incentive amount" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`variables.${index}.defaultValue`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Default
                                {index === 0 && <FieldHelpText text="Initial value" />}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 pt-9">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeVariable(index)}
                          disabled={form.watch("variables")?.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <FormDescription>
                    Define variables used in your formula above. Use meaningful names without spaces.
                  </FormDescription>
                </div>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicableCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Applicable Staff Categories
                        <FieldHelpText text="Staff categories that this policy applies to" />
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {staffCategories.map((category) => {
                          // Check if this category is in the selected array
                          const isSelected = field.value?.includes(category._id);

                          return (
                            <div
                              key={category._id}
                              className={cn(
                                "border rounded-md p-3 cursor-pointer hover:border-primary",
                                isSelected && "border-primary bg-primary/5"
                              )}
                              onClick={() => {
                                // Ensure field.value is always an array
                                const currentValue = Array.isArray(field.value) ? [...field.value] : [];

                                // Toggle the selection status of this specific category
                                if (isSelected) {
                                  // If selected, remove it
                                  field.onChange(currentValue.filter(id => id !== category._id));
                                } else {
                                  // If not selected, add it
                                  field.onChange([...currentValue, category._id]);
                                }
                              }}
                            >
                              <div className="font-medium">{category.name}</div>
                              {category.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {category.description}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {staffCategories.length === 0 && (
                          <div className="col-span-2 p-4 border rounded-md text-center text-muted-foreground">
                            No staff categories found
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        Click to select or deselect categories. A policy can apply to multiple staff categories.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Service Type Multipliers
                      <FieldHelpText text="Adjust incentives based on service types" />
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addServiceTypeMultiplier}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Multiplier
                    </Button>
                  </div>

                  {form.watch("serviceTypeMultipliers")?.map((_, index) => (
                    <div key={`serviceType-${index}`} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-8">
                        <FormField
                          control={form.control}
                          name={`serviceTypeMultipliers.${index}.serviceType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Service Type
                                {index === 0 && <FieldHelpText text="Service category to apply a multiplier to" />}
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {serviceTypes.map((type) => (
                                    <SelectItem key={type._id} value={type._id}>
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`serviceTypeMultipliers.${index}.multiplier`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Multiplier
                                {index === 0 && <FieldHelpText text="Factor to multiply incentive by (1.0 = no change)" />}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  placeholder="1.0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 pt-9">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeServiceTypeMultiplier(index)}
                          disabled={form.watch("serviceTypeMultipliers")?.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <FormDescription>
                    Multipliers adjust incentives up or down based on service type (e.g., 1.5 = 50% bonus for premium services)
                  </FormDescription>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Performance Thresholds
                      <FieldHelpText text="Add bonus amounts when metrics exceed certain thresholds" />
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addThreshold}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Threshold
                    </Button>
                  </div>

                  {form.watch("thresholds")?.map((_, index) => (
                    <div key={`threshold-${index}`} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`thresholds.${index}.metricName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Metric Name
                                {index === 0 && <FieldHelpText text="Performance metric to track (e.g., targetAchievement)" />}
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., targetAchievement" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`thresholds.${index}.threshold`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Threshold
                                {index === 0 && <FieldHelpText text="Value that must be exceeded to earn bonus" />}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="90"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`thresholds.${index}.bonusAmount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : undefined}>
                                Bonus Amount
                                {index === 0 && <FieldHelpText text="Amount added when threshold is exceeded" />}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="500"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 pt-9">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeThreshold(index)}
                          disabled={form.watch("thresholds")?.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <FormDescription>
                    Add bonuses when performance metrics exceed certain thresholds (e.g., 500 bonus when targetAchievement gt 90%)
                  </FormDescription>
                </div>

                <Alert className="mt-6">
                  <AlertTitle>Advanced Configuration</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">This policy uses the following configuration:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Variables: {form.watch("variables")?.filter(v => v.name).length || 0}</li>
                      <li>Thresholds: {form.watch("thresholds")?.filter(t => t.metricName).length || 0}</li>
                      <li>Service Type Multipliers: {form.watch("serviceTypeMultipliers")?.filter(stm => stm.serviceType).length || 0}</li>
                      <li>Applicable Categories: {form.watch("applicableCategories")?.length || 0}</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? "Saving..." : (policyId ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}