"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { getToken, setSession, setStoredUser } from "@/lib/auth";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/lib/types";
import { btnPrimary, cardClass, Field } from "@/components/ui";

type Mode = "login" | "register";

const emptyRegister: RegisterPayload = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  phone: "",
  birthDate: "",
  gender: "",
  country: "",
  region: "",
  district: "",
  address: "",
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [login, setLogin] = useState<LoginPayload>({
    username: "ali_uz",
    password: "test1234",
  });
  const [register, setRegister] = useState<RegisterPayload>(emptyRegister);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) {
      router.replace("/products");
    }
  }, [router]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setSuccess(null);
  }

  function updateRegister(field: keyof RegisterPayload, value: string) {
    setRegister((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await api<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify(login),
      });
      setSession(data.accessToken, data.refreshToken, data.user);
      router.push("/products");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Server bilan bog'lanib bo'lmadi"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const regData = await api<RegisterResponse>("/register", {
        method: "POST",
        body: JSON.stringify(register),
      });

      setStoredUser(regData.user);

      const loginData = await api<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({
          username: register.username,
          password: register.password,
        }),
      });

      setSession(loginData.accessToken, loginData.refreshToken, loginData.user);
      setSuccess("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      setTimeout(() => router.push("/products"), 800);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Server bilan bog'lanib bo'lmadi"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

      <div className={`${cardClass} relative w-full max-w-5xl overflow-hidden`}>
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 md:flex">
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-white">
                Nova<span className="text-indigo-200">Shop</span>
              </p>
              <h1 className="font-display mt-10 text-4xl font-bold leading-tight text-white">
                Onlayn do'koningiz
                <br />
                uchun yagona hisob.
              </h1>
              <p className="mt-4 max-w-sm text-indigo-100/90">
                Ro'yxatdan o'ting, mahsulotlarni kuzating va barcha xarid
                tarixingizni bitta joyda saqlang.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-indigo-100">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Xavfsiz
                JWT autentifikatsiya
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Admin
                panel va rol boshqaruvi
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Zamonaviy
                va tez yuklanuvchi UI
              </li>
            </ul>
          </aside>

          <div className="p-6 sm:p-10">
            <div className="mb-6 flex rounded-xl border border-white/10 bg-slate-900/70 p-1">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    mode === m
                      ? "bg-indigo-500 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                </button>
              ))}
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">
                  Xush kelibsiz!
                </h2>
                <Field
                  label="Username"
                  value={login.username}
                  onChange={(e) =>
                    setLogin((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="ali_uz"
                  autoComplete="username"
                />
                <Field
                  label="Parol"
                  type="password"
                  value={login.password}
                  onChange={(e) =>
                    setLogin((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {error && (
                  <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={btnPrimary}
                >
                  {loading ? "Kirilmoqda..." : "Kirish"}
                </button>
                <p className="text-xs text-slate-500">
                  Test admin: <code className="text-slate-400">ali_uz</code> /{" "}
                  <code className="text-slate-400">test1234</code>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">
                  Hisob yaratish
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Username *"
                    value={register.username}
                    onChange={(e) => updateRegister("username", e.target.value)}
                    placeholder="vali_uz"
                  />
                  <Field
                    label="Parol *"
                    type="password"
                    value={register.password}
                    onChange={(e) =>
                      updateRegister("password", e.target.value)
                    }
                    placeholder="••••••••"
                  />
                  <Field
                    label="Ism *"
                    value={register.firstName}
                    onChange={(e) =>
                      updateRegister("firstName", e.target.value)
                    }
                    placeholder="Vali"
                  />
                  <Field
                    label="Familiya *"
                    value={register.lastName}
                    onChange={(e) =>
                      updateRegister("lastName", e.target.value)
                    }
                    placeholder="Aliyev"
                  />
                  <Field
                    label="Otasining ismi"
                    value={register.middleName ?? ""}
                    onChange={(e) =>
                      updateRegister("middleName", e.target.value)
                    }
                    placeholder="Anvar o'g'li"
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={register.email ?? ""}
                    onChange={(e) => updateRegister("email", e.target.value)}
                    placeholder="vali@example.com"
                  />
                  <Field
                    label="Telefon"
                    value={register.phone ?? ""}
                    onChange={(e) => updateRegister("phone", e.target.value)}
                    placeholder="+998 90 000 00 00"
                  />
                  <Field
                    label="Tug'ilgan sana"
                    type="date"
                    value={register.birthDate ?? ""}
                    onChange={(e) =>
                      updateRegister("birthDate", e.target.value)
                    }
                  />
                  <Field
                    label="Jins"
                    value={register.gender ?? ""}
                    onChange={(e) => updateRegister("gender", e.target.value)}
                    placeholder="Erkak / Ayol"
                  />
                  <Field
                    label="Davlat"
                    value={register.country ?? ""}
                    onChange={(e) => updateRegister("country", e.target.value)}
                    placeholder="O'zbekiston"
                  />
                  <Field
                    label="Viloyat / Shahar"
                    value={register.region ?? ""}
                    onChange={(e) => updateRegister("region", e.target.value)}
                    placeholder="Toshkent shahri"
                  />
                  <Field
                    label="Tuman"
                    value={register.district ?? ""}
                    onChange={(e) =>
                      updateRegister("district", e.target.value)
                    }
                    placeholder="Chilonzor tumani"
                  />
                </div>
                <Field
                  label="Manzil"
                  value={register.address ?? ""}
                  onChange={(e) => updateRegister("address", e.target.value)}
                  placeholder="Ko'cha, uy raqami"
                />
                {(error || success) && (
                  <p
                    className={`rounded-lg px-3 py-2 text-sm ${
                      success
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {success || error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={btnPrimary}
                >
                  {loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}