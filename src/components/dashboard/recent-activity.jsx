"use client"

import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetcher } from "@/lib/utils"

export function RecentActivity() {
  const { data: activities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: () => fetcher("/api/v1/dashboard/activities"),
  })

  return (
    <div className="space-y-8">
      {activities?.map((activity: any) => (
        <div className="flex items-center" key={activity.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt="Avatar" />
            <AvatarFallback>
              {activity.user.firstName[0]}
              {activity.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.firstName} {activity.user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {new Date(activity.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
} 