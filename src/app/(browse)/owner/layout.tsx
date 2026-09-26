import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { LayoutDashboard, PlusSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ToastProvider } from "@/components/ui/Toast";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/owner/dashboard");

  return (
    <ToastProvider>
      <main className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar nav */}
            <aside className="w-full lg:w-52 shrink-0">
              <nav aria-label="Owner navigation">
                <ul className="flex lg:flex-col gap-1">
                  <NavItem href="/owner/dashboard" icon={<LayoutDashboard size={16} />}>
                    Dashboard
                  </NavItem>
                  <NavItem href="/owner/post" icon={<PlusSquare size={16} />}>
                    Post a property
                  </NavItem>
                </ul>
              </nav>
            </aside>

            {/* Page content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand min-h-[44px]"
      >
        {icon}
        {children}
      </Link>
    </li>
  );
}
