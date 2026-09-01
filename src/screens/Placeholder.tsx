import type { ReactNode } from 'react';
import { Hammer } from 'lucide-react';
import { AppBar } from '@/components/layout/AppBar';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/misc';

/** Temporary screen body used before a screen's dedicated build lands. */
export function Placeholder({
  title,
  back,
  note,
  icon,
}: {
  title: string;
  back?: boolean;
  note?: string;
  icon?: ReactNode;
}) {
  return (
    <>
      <AppBar title={title} back={back} />
      <Screen>
        <EmptyState
          icon={icon ?? <Hammer className="size-7" />}
          title={title}
          hint={note ?? 'Crafting this screen to AAA…'}
        />
      </Screen>
    </>
  );
}
