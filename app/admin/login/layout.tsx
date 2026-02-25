import type { ReactNode } from "react";

// Empty layout to exclude login page from admin layout
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
