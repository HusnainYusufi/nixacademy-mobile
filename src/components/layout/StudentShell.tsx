import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

/** The student experience: a routed screen above a persistent tab bar. */
export function StudentShell() {
  return (
    <div className="relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
