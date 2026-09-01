import { BadgeCheck } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
import { Avatar, Badge, Skeleton } from '@/components/ui/misc';

/**
 * Identity hero: large avatar, name/email, workspace, and a subtle gold member
 * badge, over a soft gold wash + grain. Shows a matching skeleton while the
 * profile request is in flight so there is zero layout shift.
 */
export function ProfileHeader({
  loading,
  name,
  email,
  workspace,
  memberLabel,
}: {
  loading: boolean;
  name: string;
  email?: string;
  workspace?: string;
  memberLabel: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* gold wash + film grain for depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent" />
      <div className="grain absolute inset-0 opacity-60" aria-hidden />

      <CardBody className="relative flex items-center gap-4 p-5">
        {loading ? (
          <>
            <Skeleton className="size-16 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </>
        ) : (
          <>
            <Avatar
              name={name}
              className="size-16 text-lg shadow-glow ring-2 ring-primary/30"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-extrabold leading-tight">{name}</h2>
              {email && (
                <p dir="ltr" className="mt-0.5 truncate text-end text-sm text-muted-foreground">
                  {email}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge tone="gold">
                  <BadgeCheck className="size-3" />
                  {memberLabel}
                </Badge>
                {workspace && (
                  <span className="truncate text-xs font-semibold text-muted-foreground">
                    {workspace}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
