"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearSession, getStoredUser } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const links = useMemo(() => {
    const items: { href: string; label: string }[] = [
      { href: "/products", label: "Mahsulotlar" },
      { href: "/profile", label: "Profil" },
    ];
    if (user?.role === "admin") {
      items.push({ href: "/admin", label: "Admin panel" });
    }
    return items;
  }, [user]);

  const initial = user
    ? (user.firstName?.[0] ?? user.username?.[0] ?? "?").toUpperCase()
    : null;

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/products"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          Nova<span className="text-indigo-400">Shop</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/products" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <div
              title={user.fullName || user.username}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
            >
              {initial}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="ml-1 whitespace-nowrap rounded-lg border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            Chiqish
          </button>
        </nav>
      </div>
    </header>
  );
}