"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cardClass } from "@/components/ui";
import type { MeResponse, User } from "@/lib/types";

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    api<MeResponse>("/me")
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/");
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : "Server bilan bog'lanib bo'lmadi"
          );
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const initials = user
    ? (user.firstName?.[0] ?? user.username?.[0] ?? "?").toUpperCase()
    : "?";

  const rows: [string, string][] = user
    ? ([
        ["Username", user.username],
        ["To'liq ism", user.fullName ?? ""],
        ["Otasining ismi", user.middleName ?? ""],
        ["Tug'ilgan sana", formatDate(user.birthDate)],
        ["Yosh", user.age != null ? String(user.age) : ""],
        ["Jins", user.gender ?? ""],
        ["Davlat", user.country ?? ""],
        ["Viloyat / Shahar", user.region ?? ""],
        ["Tuman", user.district ?? ""],
        ["Manzil", user.address ?? ""],
        ["Telefon", user.phone ?? ""],
        ["Email", user.email ?? ""],
      ] as [string, string][]).filter(([, v]) => Boolean(v))
    : [];

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Hisob
          </p>
          <h1 className="font-display text-3xl font-bold text-white">Profil</h1>
        </div>

        {loading && <div className="text-slate-400">Yuklanmoqda...</div>}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {user && (
          <div className="space-y-6">
            <div
              className={`${cardClass} flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left`}
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-display text-3xl font-bold text-white shadow-lg shadow-indigo-500/25">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-bold text-white">
                  {user.fullName || user.username}
                </h2>
                <p className="text-slate-400">@{user.username}</p>
              </div>
              <div className="sm:ml-auto">
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    user.role === "admin"
                      ? "bg-amber-400/15 text-amber-300"
                      : "bg-indigo-400/15 text-indigo-300"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className={`${cardClass} divide-y divide-white/5`}>
              {rows.length === 0 && (
                <div className="p-6 text-sm text-slate-400">
                  Qo'shimcha ma'lumotlar kiritilmagan.
                </div>
              )}
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-6 px-6 py-4 text-sm"
                >
                  <span className="text-slate-400">{label}</span>
                  <span className="text-right font-medium text-slate-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}