"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Building2, DoorOpen,
  LogOut, ChevronRight, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps { isAdmin: boolean; deptName: string; }

export default function Sidebar({ isAdmin, deptName }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  ];
  const userLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/rooms", label: "Rooms", icon: DoorOpen },
  ];
  const mainLinks = isAdmin ? adminLinks : userLinks;
  const settingsHref = isAdmin ? "/admin/settings" : "/dashboard/settings";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid hsl(222, 14%, 18%)" }}>
        <div className="w-9 h-9 flex items-center justify-center bg-white rounded-lg flex-shrink-0 p-1">
          <img src="/logo.png" alt="NIT KKR" width={28} height={28} className="object-contain" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">NIT Kurukshetra</p>
          <p className="text-xs" style={{ color: "hsl(215, 14%, 50%)" }}>Classrooms Scheduler</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(222, 14%, 18%)" }}>
        <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-center"
          style={{
            background: "hsl(217, 80%, 50%, 0.1)",
            color: "hsl(217, 80%, 70%)",
            border: "1px solid hsl(217, 80%, 50%, 0.2)"
          }}>
          {isAdmin ? "Administrator" : (deptName || "Department")}
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {mainLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : "hover:text-white transition-colors"
              )}
              style={active
                ? { background: "hsl(217, 80%, 50%, 0.2)", color: "hsl(217, 80%, 72%)" }
                : { color: "hsl(215, 14%, 55%)" }
              }>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="px-3 pb-4 space-y-0.5" style={{ borderTop: "1px solid hsl(222, 14%, 18%)", paddingTop: "12px" }}>
        <Link href={settingsHref} onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            isActive(settingsHref) ? "text-white" : "hover:text-white"
          )}
          style={isActive(settingsHref)
            ? { background: "hsl(217, 80%, 50%, 0.2)", color: "hsl(217, 80%, 72%)" }
            : { color: "hsl(215, 14%, 55%)" }
          }>
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">Settings</span>
        </Link>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all hover:text-red-400"
          style={{ color: "hsl(215, 14%, 55%)" }}>
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="hidden lg:fixed lg:flex flex-col w-64 h-dvh flex-shrink-0 sidebar-bg left-0 top-0 z-30"
        style={{ borderRight: "1px solid hsl(222, 14%, 18%)" }}>
        <NavContent />
      </aside>

      {/* ── Mobile: pull-tab at left border center ────────── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center rounded-r-xl w-5 h-16 transition-colors"
          style={{
            background: "hsl(217, 80%, 50%)",
            boxShadow: "2px 0 8px rgba(0,0,0,0.4)"
          }}>
          <ChevronRight className="h-3.5 w-3.5 text-white" />
        </button>
      )}

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)} />

          {/* Drawer */}
          <aside className="relative w-64 min-h-screen flex flex-col animate-slide-in-left sidebar-bg"
            style={{ borderRight: "1px solid hsl(222, 14%, 18%)" }}>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
