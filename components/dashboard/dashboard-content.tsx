import {
  TicketCheckIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  BookMarkedIcon,
  MailIcon,
  MailOpenIcon,
  MousePointerClickIcon,
  BellRingIcon,
  TriangleAlertIcon,
  CircleOffIcon
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

import StatisticsCard, { type StatisticsCardProps } from '@/components/shadcn-studio/blocks/statistics-card-03'
import StatisticsCardWithSvg from '@/components/shadcn-studio/blocks/statistics-card-04'
import TotalEarningCard from '@/components/shadcn-studio/blocks/chart-total-earning'
import TotalIncomeCard from '@/components/shadcn-studio/blocks/chart-total-income'
import ForBusinessSharkCard from '@/components/shadcn-studio/blocks/widget-for-business-shark'
import VehiclesConditionCard from '@/components/shadcn-studio/blocks/widget-vehicles-condition'
import MonthlyCampaignCard from '@/components/shadcn-studio/blocks/widget-monthly-campaign'
import UserDatatable, { type Item } from '@/components/shadcn-studio/blocks/datatable-user'

import CustomersCardSvg from '@/assets/svg/customers-card-svg'

// Statistics card data
const StatisticsCardData: StatisticsCardProps[] = [
  {
    icon: <TicketCheckIcon />,
    title: 'Total Sales',
    value: '$13.4k',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-1/10 text-chart-1'
  },
  {
    icon: <ShoppingCartIcon />,
    title: 'Total Orders',
    value: '155K',
    trend: 'up',
    changePercentage: '+22%',
    badgeContent: 'Last 4 months',
    iconClassName: 'bg-chart-2/10 text-chart-2'
  },
  {
    icon: <DollarSignIcon />,
    title: 'Total Profit',
    value: '$89.34k',
    trend: 'down',
    changePercentage: '-16%',
    badgeContent: 'Last One year',
    iconClassName: 'bg-chart-3/10 text-chart-3'
  },
  {
    icon: <BookMarkedIcon />,
    title: 'Bookmarks',
    value: '$1,200',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-4/10 text-chart-4'
  }
]

// Campaigns data
const campaignData = [
  {
    icon: MailIcon,
    title: 'Emails',
    value: '14,250',
    percentage: '0.3%',
    avatarClassName: 'bg-chart-1/10 text-chart-1'
  },
  {
    icon: MailOpenIcon,
    title: 'Opened',
    value: '4,523',
    percentage: '3.1%',
    avatarClassName: 'bg-chart-2/10 text-chart-2'
  },
  {
    icon: MousePointerClickIcon,
    title: 'Clicked',
    value: '1,250',
    percentage: '1.3%',
    avatarClassName: 'bg-chart-4/10 text-chart-4'
  },
  {
    icon: BellRingIcon,
    title: 'Subscribed',
    value: '750',
    percentage: '9.8%',
    avatarClassName: 'bg-chart-3/10 text-chart-3'
  },
  {
    icon: TriangleAlertIcon,
    title: 'Errors',
    value: '20',
    percentage: '1.5%',
    avatarClassName: 'bg-chart-5/10 text-chart-5'
  },
  {
    icon: CircleOffIcon,
    title: 'Unsubscribed',
    value: '86',
    percentage: '0.6%'
  }
]

// Vehicle condition data
const vehicleConditionData = [
  {
    condition: 'Excellent',
    details: '12% increase',
    progressValue: 55,
    changePercentage: '+25%',
    progressClassName: 'stroke-chart-1'
  },
  {
    condition: 'Good',
    details: '24 vehicles',
    progressValue: 20,
    changePercentage: '+30%',
    progressClassName: 'stroke-chart-2'
  },
  {
    condition: 'Average',
    details: '182 Tasks',
    progressValue: 12,
    changePercentage: '-15%',
    progressClassName: 'stroke-chart-3'
  },
  {
    condition: 'Bad',
    details: '9 vehicles',
    progressValue: 7,
    changePercentage: '+35%',
    progressClassName: 'stroke-chart-4'
  },
  {
    condition: 'Not Working',
    details: '3 vehicles',
    progressValue: 4,
    changePercentage: '-2%',
    progressClassName: 'stroke-chart-5'
  },
  {
    condition: 'Scraped',
    details: '2 vehicles',
    progressValue: 2,
    changePercentage: '+1%'
  }
]

// User data for datatable
const userData: Item[] = [
  {
    id: '1',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    fallback: 'JA',
    user: 'Jack Alfredo',
    email: 'jack.alfredo@shadcnstudio.com',
    role: 'maintainer',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '2',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    fallback: 'SM',
    user: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.com',
    role: 'admin',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '3',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    fallback: 'RC',
    user: 'Robert Chen',
    email: 'robert.chen@startup.io',
    role: 'editor',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'pending'
  },
  {
    id: '4',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png',
    fallback: 'EW',
    user: 'Emily Wilson',
    email: 'emily.wilson@freelance.com',
    role: 'author',
    plan: 'basic',
    billing: 'manual-cash',
    status: 'inactive'
  },
  {
    id: '5',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
    fallback: 'DG',
    user: 'David Garcia',
    email: 'david.garcia@agency.net',
    role: 'subscriber',
    plan: 'company',
    billing: 'auto-debit',
    status: 'active'
  },
  {
    id: '6',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png',
    fallback: 'LT',
    user: 'Lisa Thompson',
    email: 'lisa.thompson@design.co',
    role: 'editor',
    plan: 'team',
    billing: 'manual-paypal',
    status: 'active'
  },
  {
    id: '7',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png',
    fallback: 'MA',
    user: 'Michael Anderson',
    email: 'michael.anderson@tech.com',
    role: 'maintainer',
    plan: 'enterprise',
    billing: 'auto-debit',
    status: 'pending'
  },
  {
    id: '8',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png',
    fallback: 'JR',
    user: 'Jessica Rodriguez',
    email: 'jessica.rodriguez@startup.com',
    role: 'author',
    plan: 'basic',
    billing: 'manual-cash',
    status: 'active'
  },
  {
    id: '9',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png',
    fallback: 'CB',
    user: 'Christopher Brown',
    email: 'chris.brown@corporate.org',
    role: 'admin',
    plan: 'company',
    billing: 'auto-debit',
    status: 'inactive'
  },
  {
    id: '10',
    avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-10.png',
    fallback: 'AD',
    user: 'Amanda Davis',
    email: 'amanda.davis@marketing.io',
    role: 'subscriber',
    plan: 'basic',
    billing: 'manual-paypal',
    status: 'active'
  }
]

export default function DashboardContent() {
  return (
    <TooltipProvider>
      <div className='w-full h-full overflow-y-auto p-6'>
        <div className='mx-auto size-full max-w-7xl space-y-6'>
        {/* Statistics Cards Row */}
        <div className='grid grid-cols-2 gap-6 xl:grid-cols-4'>
          {StatisticsCardData.map((card, index) => (
            <StatisticsCard
              key={index}
              icon={card.icon}
              title={card.title}
              value={card.value}
              trend={card.trend}
              changePercentage={card.changePercentage}
              badgeContent={card.badgeContent}
              className='shadow-none'
              iconClassName={card.iconClassName}
            />
          ))}
        </div>

        {/* Customers Card */}
        <StatisticsCardWithSvg
          title='Customers'
          badgeContent='Daily customers'
          value='42.4k'
          changePercentage={9.2}
          svg={<CustomersCardSvg />}
          className='shadow-none'
        />

        {/* Total Income Card */}
        <TotalIncomeCard className='shadow-none' />

        {/* Three Column Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <MonthlyCampaignCard
            title='Monthly campaign state'
            subTitle='7.58k Social Visitors'
            campaignData={campaignData}
            className='justify-between shadow-none'
          />

          <TotalEarningCard className='justify-between shadow-none [&>[data-slot=card-content]]:space-y-6' />

          <ForBusinessSharkCard className='shadow-none' />
        </div>

        {/* Vehicles Condition Card */}
        <VehiclesConditionCard
          title='Vehicles Condition'
          vehicleConditionData={vehicleConditionData}
          className='justify-between gap-6 shadow-none'
        />

        {/* User Datatable */}
        <Card className='shadow-none py-0'>
          <UserDatatable data={userData} />
        </Card>
      </div>
    </div>
    </TooltipProvider>
  )
}
