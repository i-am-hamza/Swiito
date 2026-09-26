"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Building2,
  Users,
  Phone,
  FileText,
  Settings,
  FileSearch,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/browser";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  badge?: number;
}

const BASE_NAV: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/approvals", icon: CheckSquare, label: "Approvals" },
  { href: "/admin/properties", icon: Building2, label: "Properties" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/leads", icon: Phone, label: "Leads" },
  { href: "/admin/content", icon: FileText, label: "Content" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/audit", icon: FileSearch, label: "Audit log" },
];

interface SidebarContentProps {
  nav: NavItem[];
  pathname: string;
  userName: string;
  onSignOut: () => void;
  onNav?: () => void;
}

function SidebarContent({ nav, pathname, userName, onSignOut, onNav }: SidebarContentProps) {
  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <span className="font-display font-bold text-lg text-fg">Swiito Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNav}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-brand min-h-[40px]",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-fg-muted hover:text-fg hover:bg-surface-2"
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-xs font-bold leading-none">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-2 py-3 border-t border-[var(--border)]">
        <div className="px-3 py-1.5 text-xs text-fg-muted truncate">{userName}</div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand min-h-[40px]"
        >
          <LogOut size={16} className="shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

interface AdminShellProps {
  children: React.ReactNode;
  pendingCount: number;
  userName: string;
}

export function AdminShell({ children, pendingCount, userName }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const nav = BASE_NAV.map((item) =>
    item.href === "/admin/approvals" ? { ...item, badge: pendingCount } : item
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  const breadcrumb = (() => {
    const segments = pathname.split("/").filter(Boolean);
    const parts: { label: string; href: string }[] = [];
    let path = "";
    for (const seg of segments) {
      path += `/${seg}`;
      const navItem = nav.find((n) => n.href === path);
      if (navItem) {
        parts.push({ label: navItem.label, href: path });
      } else if (seg !== "admin") {
        parts.push({ label: seg, href: path });
      }
    }
    return parts.slice(1);
  })();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col bg-surface border-r border-[var(--border)]">
        <SidebarContent
          nav={nav}
          pathname={pathname}
          userName={userName}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-[220px] bg-surface border-r border-[var(--border)] flex flex-col">
            <SidebarContent
              nav={nav}
              pathname={pathname}
              userName={userName}
              onSignOut={handleSignOut}
              onNav={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-[var(--border)] bg-surface lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-sm text-fg">Swiito Admin</span>
        </header>

        {/* Breadcrumb (desktop) */}
        {breadcrumb.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 px-6 py-2 text-xs text-fg-muted border-b border-[var(--border)]">
            <Link href="/admin" className="hover:text-fg transition-brand">
              Dashboard
            </Link>
            {breadcrumb.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1">
                <ChevronRight size={12} />
                {i === breadcrumb.length - 1 ? (
                  <span className="text-fg capitalize">{b.label.replace(/-/g, " ")}</span>
                ) : (
                  <Link href={b.href} className="hover:text-fg transition-brand capitalize">
                    {b.label.replace(/-/g, " ")}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
