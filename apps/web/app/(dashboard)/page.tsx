import { Suspense } from "react"
import { currentUser } from "@clerk/nextjs/server"
import { ArrowUpRight, BarChart3, Building2, TrendingUp, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { getAuthenticatedClient } from "@/lib/api-client"

async function DashboardContent() {
  const [user, client] = await Promise.all([
    currentUser(),
    getAuthenticatedClient(),
  ])

  const { data: account } = await client.GET("/accounts/me")

  const firstName = user?.firstName ?? user?.username ?? "there"
  const accountKind = (account as { kind?: string } | undefined)?.kind

  return (
    <>
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        {accountKind && (
          <Badge variant="secondary" className="capitalize">
            {accountKind === "BUSINESS" ? (
              <Building2 className="mr-1.5 size-3.5" />
            ) : (
              <Users className="mr-1.5 size-3.5" />
            )}
            {accountKind.charAt(0) + accountKind.slice(1).toLowerCase()} account
          </Badge>
        )}
      </div>

      <Separator />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$0.00"
          description="No transactions yet"
          icon={BarChart3}
          trend={null}
        />
        <StatCard
          title="Active Users"
          value="1"
          description="Just you for now"
          icon={Users}
          trend={null}
        />
        <StatCard
          title="Growth"
          value="—"
          description="Start tracking to see trends"
          icon={TrendingUp}
          trend={null}
        />
        <StatCard
          title="Insights"
          value="—"
          description="More data needed"
          icon={ArrowUpRight}
          trend={null}
        />
      </div>

      {/* Content area */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState message="No activity yet. Get started by exploring the app." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to help you get up and running.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <QuickActionItem
              label="Complete your profile"
              description="Add more details to your account"
            />
            <QuickActionItem
              label="Explore features"
              description="Discover what movu can do for you"
            />
            <QuickActionItem
              label="Invite team members"
              description="Collaborate with others on your account"
            />
          </CardContent>
        </Card>
      </div>

      {/* Full-width overview card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            A summary of your account activity over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Charts and analytics will appear here once you have data.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend: number | null
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {trend !== null ? (
            <span
              className={
                trend >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
              }
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>
          ) : null}{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
    </div>
  )
}

function QuickActionItem({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <ArrowUpRight className="size-3.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
