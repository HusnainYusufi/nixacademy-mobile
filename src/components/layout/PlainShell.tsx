import { Outlet } from 'react-router-dom';

/** Height-bounded shell for full-screen routes (no tab bar): course detail,
 *  checkout, player. Gives the sticky AppBar + scrollable Screen a frame. */
export function PlainShell() {
  return (
    <div className="relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-background">
      <Outlet />
    </div>
  );
}
