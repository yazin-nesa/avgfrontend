'use client'
import React, { useEffect, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ServiceTypeDialog from "@/components/servicetype/ServiceTypeDialog";
import { fetcher } from "@/lib/utils";
import { useMutation, useQuery } from '@tanstack/react-query';  // Import React Query

const ServicetypesPage = () => {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  // Fetch service types using React Query
  const { data, refetch } = useQuery({
    queryKey: ['service-types', search],
    queryFn: () => fetcher(`service-types?search=${search}`),
    
  });
  const serviceTypes = data?.data;


  refetch();
  // Mutation for creating or updating service types
  const createServiceTypeMutation = useMutation({
    mutationFn: async (newServiceType) => {
      const response = await fetcher('service-types', {
        method: 'POST',
        body: JSON.stringify(newServiceType),
      });
      return response;
    },
    onSuccess: () => {
      refetch();  // Refresh service types list
      setOpen(false);  // Close dialog after submission
    },
  });

  const handleEdit = (serviceType) => {
    setSelectedServiceType(serviceType);
    setOpen(true); // Open the dialog for editing
  };

  const handleCreate = (newServiceType) => {
    createServiceTypeMutation.mutate(newServiceType);
  };

  useEffect(() => {
    // If search changes, refetch the data
    if (search !== "") {
      refetch();
      console.log("serive" , serviceTypes)
    }
   
  }, [search, refetch]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Service Types</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedServiceType(null)}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Service Type
            </Button>
          </DialogTrigger>
          <ServiceTypeDialog
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={handleCreate} // Submit handler for create
            initialData={selectedServiceType}
          />
        </Dialog>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search service types"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {serviceTypes?.map((serviceType) => (
          <Card
            key={serviceType._id}
            onClick={() => handleEdit(serviceType)}
            className="hover:shadow-lg cursor-pointer transition-shadow"
          >
            <CardContent className="p-4">
              <h3 className="text-lg font-medium">{serviceType.name}</h3>
              <p className="text-sm text-muted-foreground">{serviceType.description}</p>
              <p className="text-sm mt-1">Status: {serviceType.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicetypesPage;
