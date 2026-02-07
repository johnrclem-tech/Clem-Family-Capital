import type { ComponentType } from 'react'

import {
  ActivityIcon,
  BellIcon,
  ChevronRightIcon,
  CircleQuestionMarkIcon,
  FacebookIcon,
  InstagramIcon,
  LanguagesIcon,
  LayoutDashboardIcon,
  LayoutPanelLeftIcon,
  LinkedinIcon,
  ListChecksIcon,
  ListTodoIcon,
  MoreVerticalIcon,
  PackageIcon,
  PackagePlusIcon,
  PizzaIcon,
  ReceiptTextIcon,
  SearchIcon,
  SettingsIcon,
  SquarePercentIcon,
  StarIcon,
  TwitterIcon,
  UsersIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

import LogoSvg from '@/assets/svg/logo'
import SearchDialog from '@/components/shadcn-studio/blocks/dialog-search'
import LanguageDropdown from '@/components/shadcn-studio/blocks/dropdown-language'
import ActivityDialog from '@/components/shadcn-studio/blocks/dialog-activity'
import NotificationDropdown from '@/components/shadcn-studio/blocks/dropdown-notification'
import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile'

type MenuSubItem = {
  label: string
  href: string
  badge?: string
}

type MenuItem = {
  icon: ComponentType
  label: string
} & (
  | {
      href: string
      badge?: string
      items?: never
    }
  | { href?: never; badge?: never; items: MenuSubItem[] }
)

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboardIcon,
    label: 'Dashboard',
    href: '#'
  },
  {
    icon: PackagePlusIcon,
    label: 'New Order',
    href: '#'
  },
  {
    icon: PackageIcon,
    label: 'Inventory',
    href: '#'
  },
  {
    icon: SquarePercentIcon,
    label: 'Discount',
    href: '#',
    badge: '2'
  },
  {
    icon: LayoutPanelLeftIcon,
    label: 'Ordering Table',
    href: '#'
  },
  {
    icon: UsersIcon,
    label: 'Customers',
    items: [
      { label: 'Customer List', href: '#' },
      { label: 'Customer Groups', href: '#' }
    ]
  },
  {
    icon: ListTodoIcon,
    label: 'Order List',
    href: '#'
  },
  {
    icon: SettingsIcon,
    label: 'Staff Management',
    href: '#'
  }
]

const usefulPagesItems: MenuItem[] = [
  {
    icon: CircleQuestionMarkIcon,
    label: 'Help Center',
    href: '#'
  },
  {
    icon: ListChecksIcon,
    label: 'Products',
    items: [
      { label: 'All Products', href: '#' },
      { label: 'Categories', href: '#', badge: '6' },
      { label: 'Add Product', href: '#' }
    ]
  },
  {
    icon: UsersIcon,
    label: 'Customer Management',
    href: '#'
  },
  {
    icon: ReceiptTextIcon,
    label: 'Billing & Payment',
    href: '#'
  },
  {
    icon: StarIcon,
    label: 'Feedback & Reviews',
    href: '#'
  }
]

const SidebarGroupedMenuItems = ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  return (
    <SidebarGroup className='pr-4 pl-0'>
      {groupLabel && <SidebarGroupLabel className='px-4'>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map(item =>
            item.items ? (
              <Collapsible className='group/collapsible' key={item.label}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label} className='rounded-l-0 rounded-r-full px-4'>
                      <item.icon />
                      <span>{item.label}</span>
                      <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className='ml-5.5'>
                      {item.items.map(subItem => (
                        <SidebarMenuSubItem key={subItem.label}>
                          <SidebarMenuSubButton className='justify-between' asChild>
                            <a href={subItem.href}>
                              {subItem.label}
                              {subItem.badge && (
                                <span className='bg-primary/10 flex h-5 min-w-5 items-center justify-center rounded-full text-xs'>
                                  {subItem.badge}
                                </span>
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label} className='rounded-l-0 rounded-r-full px-4' asChild>
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge className='bg-primary/10 right-4 rounded-full'>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const ApplicationShell = () => {
  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <Sidebar collapsible='icon'>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg' className='gap-2.5 !bg-transparent [&>svg]:size-8' asChild>
                  <a href='#'>
                    <LogoSvg className='[&_rect]:fill-sidebar [&_rect:first-child]:fill-primary' />
                    <span className='text-xl font-semibold'>Food Point</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroupedMenuItems data={menuItems} />
            <SidebarGroupedMenuItems data={usefulPagesItems} groupLabel='Useful Pages' />
          </SidebarContent>
          <SidebarFooter className='[[data-state=collapsed]_&]:hidden'>
            <div className='relative flex flex-col gap-4 overflow-hidden rounded-md border p-4'>
              <svg
                width='157'
                height='136'
                viewBox='0 0 157 136'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='absolute top-0 left-0 blur-xl'
              >
                <g opacity='0.5' filter='url(#filter0_f_16461_129124)'>
                  <circle cx='56.5' cy='41' r='60' fill='var(--primary)' fillOpacity='0.4' />
                </g>
                <defs>
                  <filter
                    id='filter0_f_16461_129124'
                    x='-43.5'
                    y='-59'
                    width='200'
                    height='200'
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                  >
                    <feFlood floodOpacity='0' result='BackgroundImageFix' />
                    <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                    <feGaussianBlur stdDeviation='20' result='effect1_foregroundBlur_16461_129124' />
                  </filter>
                </defs>
              </svg>
              <div className='z-1 flex justify-between gap-4'>
                <Avatar className='rounded-sm shadow-lg'>
                  <AvatarFallback className='bg-sidebar rounded-sm'>
                    <PizzaIcon className='size-4' />
                  </AvatarFallback>
                </Avatar>
                <MoreVerticalIcon />
              </div>
              <div className='z-1 flex items-center justify-between gap-4'>
                <div className='whitespace-nowrap'>
                  <p className='mb-2 text-sm'>Today&apos;s order</p>
                  <p className='text-xl font-semibold'>234</p>
                </div>
                <div className='*:data-[slot=avatar]:ring-background flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
                  <Avatar>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' alt='John Doe' />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png' alt='Fanny Hansen' />
                    <AvatarFallback>FH</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png' alt='Todd Payne' />
                    <AvatarFallback>TP</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage
                      src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png'
                      alt='Cecilia Manning'
                    />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className='flex flex-1 flex-col'>
          <header className='bg-card sticky top-0 z-50 border-b'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:!size-5' />
                <Separator orientation='vertical' className='hidden !h-4 sm:block' />
                <SearchDialog
                  trigger={
                    <>
                      <Button variant='ghost' className='hidden !bg-transparent px-1 py-0 font-normal sm:block'>
                        <div className='text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex'>
                          <SearchIcon />
                          <span>Type to search...</span>
                        </div>
                      </Button>
                      <Button variant='ghost' size='icon' className='sm:hidden'>
                        <SearchIcon />
                        <span className='sr-only'>Search</span>
                      </Button>
                    </>
                  }
                />
              </div>
              <div className='flex items-center gap-1.5'>
                <LanguageDropdown
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <LanguagesIcon />
                    </Button>
                  }
                />
                <ActivityDialog
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <ActivityIcon />
                    </Button>
                  }
                />
                <NotificationDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='relative'>
                      <BellIcon />
                      <span className='bg-destructive absolute top-2 right-2.5 size-2 rounded-full' />
                    </Button>
                  }
                />
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' className='h-full p-0 font-normal sm:pr-1'>
                      <Avatar className='size-9.5 rounded-md'>
                        <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className='hidden flex-col items-start gap-0.5 sm:flex md:max-lg:hidden'>
                        <span className='text-sm font-medium'>John Doe</span>
                        <span className='text-muted-foreground text-xs'>Admin</span>
                      </div>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
            <Card className='h-250 shadow-none'>
              <CardContent className='h-full'>
                <div className='h-full rounded-md border bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_1px,var(--card)_2px,var(--card)_15px)]' />
              </CardContent>
            </Card>
          </main>
          <footer>
            <div className='text-muted-foreground mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
              <p className='text-sm text-balance max-sm:text-center'>
                {`©${new Date().getFullYear()}`}{' '}
                <a href='#' className='text-primary'>
                  shadcn/studio
                </a>
                , Made for better web design
              </p>
              <div className='flex items-center gap-5'>
                <a href='#'>
                  <FacebookIcon className='size-4' />
                </a>
                <a href='#'>
                  <InstagramIcon className='size-4' />
                </a>
                <a href='#'>
                  <LinkedinIcon className='size-4' />
                </a>
                <a href='#'>
                  <TwitterIcon className='size-4' />
                </a>
              </div>
            </div>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default ApplicationShell
