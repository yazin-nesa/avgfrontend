'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Iconsdata } from '@/components/icons'

const roleBasedNavItems = {
  admin: [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'chart',
    },
    {
      title: 'Branches',
      href: '/admin/branches',
      icon: 'branch',
    },
    {
      title: 'Staff Management',
      href: '/admin/staff',
      icon: 'staff',
    },
    {
      title: 'Vehicle Services',
      href: '/admin/vehicles',
      icon: 'vehicle',
    },
    {
      title: 'Incentives',
      href: '/admin/incentives',
      icon: 'chart',
    },
    {
      title: 'Complaints',
      href: '/admin/complaints',
      icon: 'complaint',
    },
  ],
  hr: [
    {
      title: 'Dashboard',
      href: '/hr/dashboard',
      icon: 'chart',
    },
    {
      title: 'Staff Management',
      href: '/hr/staff',
      icon: 'staff',
    },
    {
      title: 'Incentives',
      href: '/hr/incentives',
      icon: 'chart',
    },
    {
      title: 'Performance',
      href: '/hr/performance',
      icon: 'chart',
    },
    {
      title: 'Complaints',
      href: '/hr/complaints',
      icon: 'complaint',
    },
  ],
  workManager: [
    {
      title: 'Dashboard',
      href: '/manager/dashboard',
      icon: 'chart',
    },
    {
      title: 'Vehicle Services',
      href: '/manager/vehicles',
      icon: 'vehicle',
    },
    {
      title: 'Staff Performance',
      href: '/manager/performance',
      icon: 'chart',
    },
    {
      title: 'Service Reports',
      href: '/manager/reports',
      icon: 'chart',
    },
  ],
  staff: [
    {
      title: 'Dashboard',
      href: '/staff/dashboard',
      icon: 'chart',
    },
    {
      title: 'My Services',
      href: '/staff/services',
      icon: 'vehicle',
    },
    {
      title: 'My Performance',
      href: '/staff/performance',
      icon: 'chart',
    },
    {
      title: 'My Incentives',
      href: '/staff/incentives',
      icon: 'chart',
    },
  ],
}

export function Sidebar({ user }) {
  const pathname = usePathname()
  const navItems = roleBasedNavItems[user?.role] || []

  const renderIcon = (iconName) => {
    const IconComponent = Iconsdata[iconName]
    return IconComponent ? <IconComponent className="mr-2 h-4 w-4" /> : null
  }

  return (
    <div className="hidden border-r bg-background lg:block lg:w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            {Iconsdata.logo && <Iconsdata.logo className="h-6 w-6" />}
            <span className="font-bold">{process.env.NEXT_PUBLIC_COMPANY_NAME}</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'transparent'
                )}
              >
                {renderIcon(item.icon)}
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            {Iconsdata.user && <Iconsdata.user className="h-4 w-4" />}
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}