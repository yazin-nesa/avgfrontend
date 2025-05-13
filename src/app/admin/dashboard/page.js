"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Car,
    Users,
    Building2,
    AlertCircle,
    Wrench,
    DollarSign,
    BarChart3,
    TrendingUp,
} from "lucide-react"
import { StatsCard } from "@/components/admin/dashboard/stats-card"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetcher } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton" // Import the Skeleton component

// Define a simple loading skeleton for StatsCard
function StatsCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    )
}

// Define a simple loading skeleton for Cards with content lists
function CardListSkeleton({ items = 3 }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-1/3" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: items }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4 mt-1" />
                        </div>
                        <Skeleton className="h-4 w-1/6" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
    const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
        queryKey: ["dashboard-summary"],
        queryFn: () => fetcher("admin/analytics/dashboard-summary"),
    })

    const { data: branchPerformance, isLoading: isBranchLoading } = useQuery({
        queryKey: ["branch-performance"],
        queryFn: () => fetcher("admin/analytics/branch-performance"),
    })

    const { data: serviceAnalytics, isLoading: isServiceLoading } = useQuery({
        queryKey: ["service-analytics"],
        queryFn: () => fetcher("admin/analytics/service-analytics"),
    })

    const { data: staffPerformance, isLoading: isStaffLoading } = useQuery({
        queryKey: ["staff-performance"],
        queryFn: () => fetcher("admin/analytics/staff-performance"),
    })

    const summary = summaryData?.data || {}
    const branches = branchPerformance?.data || []
    const services = serviceAnalytics?.data || {}
    const staff = staffPerformance?.data || {}

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your dashboard overview.</p>
            </div>

            {/* Key Metrics with Loading */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isSummaryLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Total Vehicles"
                            value={summary?.vehicleStats?.total || 0}
                            description={`${summary?.vehicleStats?.active || 0} active vehicles`}
                            icon={Car}
                        />
                        <StatsCard
                            title="Total Services"
                            value={summary?.serviceStats?.total || 0}
                            description={`${summary?.serviceStats?.completionRate || 0}% completion rate`}
                            icon={Wrench}
                        />
                        <StatsCard
                            title="Active Branches"
                            value={summary?.branchStats?.active || 0}
                            description={`Out of ${summary?.branchStats?.total || 0} total branches`}
                            icon={Building2}
                        />
                        <StatsCard
                            title="Total Revenue"
                            value={`$${(summary?.financialStats?.totalRevenue || 0).toLocaleString()}`}
                            description="Total earnings from services"
                            icon={DollarSign}
                        />
                    </>
                )}
            </div>

            {/* Service Status with Loading */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isSummaryLoading ? (
                    <CardListSkeleton items={3} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Status</CardTitle>
                            <CardDescription>Current service distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">Pending</p>
                                        <p className="text-sm font-medium">{summary?.serviceStats?.pending || 0}</p>
                                    </div>
                                    <Progress value={(summary?.serviceStats?.pending / summary?.serviceStats?.total) * 100 || 0} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">In Progress</p>
                                        <p className="text-sm font-medium">{summary?.serviceStats?.inProgress || 0}</p>
                                    </div>
                                    <Progress value={(summary?.serviceStats?.inProgress / summary?.serviceStats?.total) * 100 || 0} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">Completed</p>
                                        <p className="text-sm font-medium">{summary?.serviceStats?.completed || 0}</p>
                                    </div>
                                    <Progress value={(summary?.serviceStats?.completed / summary?.serviceStats?.total) * 100 || 0} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Top Performing Branches with Loading */}
                {isBranchLoading ? (
                    <CardListSkeleton items={5} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Branches</CardTitle>
                            <CardDescription>By service completion rate</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {branches?.slice(0, 5).map((branch) => (
                                <div key={branch._id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{branch.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {branch.stats.services.completionRate}%
                                        </p>
                                    </div>
                                    <Progress value={parseFloat(branch.stats.services.completionRate)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Staff Performance with Loading */}
                {isStaffLoading ? (
                    <CardListSkeleton items={5} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Performance</CardTitle>
                            <CardDescription>Top performing staff members</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {staff?.staffPerformance?.slice(0, 5).map((member) => (
                                <div key={member._id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {member.period.serviceItems.completed} services completed
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {member.period.serviceItems.completionRate}%
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent Activity with Loading */}
            <div className="grid gap-4 md:grid-cols-2">
                {isSummaryLoading ? (
                    <>
                        <CardListSkeleton items={3} />
                        <CardListSkeleton items={3} />
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Services</CardTitle>
                                <CardDescription>Latest service activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {summary?.recentActivity?.services?.map((service) => (
                                        <div key={service._id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {service.vehicle?.make} {service.vehicle?.model}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {service.branch?.name}
                                                </p>
                                            </div>
                                            <div className="text-sm">{service.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Complaints</CardTitle>
                                <CardDescription>Latest customer complaints</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {summary?.recentActivity?.complaints?.map((complaint) => (
                                        <div key={complaint._id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{complaint.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {complaint.filedBy?.firstName} {complaint.filedBy?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-sm">{complaint.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}