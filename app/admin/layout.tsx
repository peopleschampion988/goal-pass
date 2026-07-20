import type { Metadata } from "next";

// Staff-only area — keep it out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
