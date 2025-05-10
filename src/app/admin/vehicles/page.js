'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Iconsdata } from '@/components/icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { fetcher, formatDate } from '@/lib/utils'
import AddVehicleDialog from '@/components/vehicles/AddVehicleDialog'
import { useRouter } from 'next/navigation';

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const router = useRouter();
  const userData = JSON.parse(localStorage.getItem('user'));
  const userRole = userData?.role;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vehicles', search, page],
    queryFn: () => fetcher(`vehicles?page=${page}&registrationNumber=${search}&limit=${pageSize}`),
    keepPreviousData: true, // Keeps previous data while new data is loading
  })

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
        <div className="flex items-center space-x-2">
          <AddVehicleDialog>
            <Button>
              <Iconsdata.plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </AddVehicleDialog>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search by registration number..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration No.</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Next Service Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading vehicle data...
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data?.length > 0 ? (
              data.data.map((vehicle) => (
                <TableRow key={vehicle._id}>
                  <TableCell>{vehicle.registrationNumber}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.owner?.name}</TableCell>
                  <TableCell>{vehicle.branch?.name}</TableCell>
                  <TableCell>{formatDate(vehicle.nextServiceDue)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/${userRole}/vehicles/${vehicle._id}`)}
                    >
                      View Details
                      <Iconsdata.arrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.data?.hasMore || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
