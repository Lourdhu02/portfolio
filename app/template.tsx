import { ViewTransition } from 'react'

// Templates remount on every navigation, so this boundary gets an exit on the old route and an
// enter on the new one. The keyframes live in globals.css under "Page transitions".
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  )
}
