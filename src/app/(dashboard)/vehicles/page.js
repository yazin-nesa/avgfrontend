//src/app/(dashboard)/vehicles/page.js
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Iconsdata } from '@/components/icons'
import { Table } from '@/components/ui/table'

import { fetcher, formatDate } from '@/lib/utils'
import { AddVehicleDialog } from '@/components/vehicles/AddVehicleDialog'

const columns = [
  {
    accessorKey: 'registrationNumber',
    header: 'Registration No.',
  },
  {
    accessorKey: 'make',
    header: 'Make',
  },
  {
    accessorKey: 'model',
    header: 'Model',
  },
  {
    accessorKey: 'owner.name',
    header: 'Owner',
  },
  {
    accessorKey: 'branch.name',
    header: 'Branch',
  },
  {
    accessorKey: 'nextServiceDue',
    header: 'Next Service Due',
    cell: ({ row }) => formatDate(row.original.nextServiceDue),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        onClick={() => router.push(`/vehicles/${row.original._id}`)}
      >
        View Details
        <Iconsdata.arrowRight className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
]

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', search, page],
    queryFn: () =>
      fetcher(`${process.env.NEXT_PUBLIC_API_URL}/vehicles?page=${page}&registrationNumber=${search}`),
  })

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage vehicle records and service history
          </p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by registration number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table
        columns={columns}
        data={data?.data?.docs || []}
        isLoading={isLoading}
        pagination={{
          pageCount: data?.data?.totalPages || 1,
          page,
          setPage,
        }}
      />
    </div>
  )
} 