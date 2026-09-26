"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { btnGhost, btnPrimary, cardClass, inputClass } from "@/components/ui";
import type {
  Category,
  CategoryListResponse,
  MeResponse,
  Product,
  ProductListResponse,
  UpdateRolePayload,
  User,
} from "@/lib/types";

interface ProductForm {
  name: string;
  price: string;
  category: string;
  stock: string;
  description: string;
}

const emptyForm: ProductForm = {
  name: "",
  price: "",
  category: "",
  stock: "",
  description: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [productForm, setProductForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const me = await api<MeResponse>("/me");
        if (me.user.role !== "admin") {
          router.replace("/profile");
          return;
        }
        await Promise.all([
          loadProducts(),
          loadUsers(),
          api<CategoryListResponse>("/categories").then((data) =>
            setCategories(data.categories ?? [])
          ),
        ]);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/");
        } else {
          setError("Admin panelni yuklab bo'lmadi.");
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  async function loadProducts() {
    const data = await api<ProductListResponse>("/products");
    setProducts(data.products ?? []);
  }

  async function loadUsers() {
    const data = await api<User[]>("/users");
    setUsers(data ?? []);
  }

  function showMsg(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function updateForm(field: keyof ProductForm, value: string) {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setProductForm(emptyForm);
    setEditingId(null);
  }

  function editProduct(product: Product) {
    setEditingId(product.id ?? product._id ?? null);
    setProductForm({
      name: product.name,
      price: String(product.price),
      category: product.category ?? "",
      stock: product.stock != null ? String(product.stock) : "",
      description: product.description ?? "",
    });
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(productForm.price);
    if (!productForm.name.trim() || Number.isNaN(price)) {
      showMsg("err", "Nomi va narxi kiritilishi shart");
      return;
    }

    setSaving(true);
    try {
      const body = JSON.stringify({
        name: productForm.name.trim(),
        price,
        category: productForm.category.trim() || undefined,
        stock:
          productForm.stock.trim() === ""
            ? undefined
            : parseInt(productForm.stock, 10),
        description: productForm.description.trim() || undefined,
      });

      if (editingId) {
        const data = await api<{ message: string }>(
          `/products/${editingId}`,
          { method: "PUT", body }
        );
        showMsg("ok", data.message);
      } else {
        const data = await api<{ message: string }>("/products", {
          method: "POST",
          body,
        });
        showMsg("ok", data.message);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      showMsg(
        "err",
        err instanceof ApiError ? err.message : "Server bilan bog'lanib bo'lmadi"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm(`Mahsulotni o'chirishni tasdiqlaysizmi? (#${id})`))
      return;
    try {
      const data = await api<{ message: string }>(`/products/${id}`, {
        method: "DELETE",
      });
      showMsg("ok", data.message);
      await loadProducts();
    } catch (err) {
      showMsg(
        "err",
        err instanceof ApiError ? err.message : "Server bilan bog'lanib bo'lmadi"
      );
    }
  }

  async function setRole(user: User) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    try {
      const data = await api<{ message: string }>(
        `/users/${user.id ?? user._id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: nextRole } satisfies UpdateRolePayload),
        }
      );
      showMsg("ok", data.message);
      await loadUsers();
    } catch (err) {
      showMsg(
        "err",
        err instanceof ApiError ? err.message : "Server bilan bog'lanib bo'lmadi"
      );
    }
  }

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center text-slate-400">
          Tekshirilmoqda...
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              Admin
            </p>
            <h1 className="font-display text-3xl font-bold text-white">
              Boshqaruv paneli
            </h1>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-lg text-sky-300">
              📦
            </div>
            <div>
              <p className="text-xs text-slate-500">Mahsulotlar</p>
              <p className="font-display text-xl font-bold text-white">
                {products.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-lg text-violet-300">
              👥
            </div>
            <div>
              <p className="text-xs text-slate-500">Userlar</p>
              <p className="font-display text-xl font-bold text-white">
                {users.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-lg text-emerald-300">
              🗂
            </div>
            <div>
              <p className="text-xs text-slate-500">Kategoriyalar</p>
              <p className="font-display text-xl font-bold text-white">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        {msg && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className={`${cardClass} h-fit p-6`}>
            <h2 className="font-display mb-4 text-lg font-bold text-white">
              {editingId ? `Mahsulotni tahrirlash (#${editingId})` : "Yangi mahsulot"}
            </h2>
            <form onSubmit={saveProduct} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-400">
                  Nomi *
                </span>
                <input
                  className={inputClass}
                  value={productForm.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="iPhone 15 Pro"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-400">
                  Narxi ($) *
                </span>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="1499"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                <span className="mb-1.5 block text-sm text-slate-400">
                  Kategoriya
                </span>
                <select
                  className={`${inputClass} appearance-none`}
                  value={productForm.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                >
                  <option value="" className="bg-slate-900">
                    — Tanlang —
                  </option>
                  {categories.map((c) => (
                    <option
                      key={c.id ?? c._id}
                      value={c.name}
                      className="bg-slate-900"
                    >
                      {c.icon ? `${c.icon} ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-400">
                    Ombor soni
                  </span>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => updateForm("stock", e.target.value)}
                    placeholder="10"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-400">
                  Tavsif
                </span>
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  value={productForm.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Qisqa tavsif..."
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={`${btnPrimary} flex-1`}
                >
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={btnGhost}
                >
                  Tozalash
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className={`${cardClass} p-6`}>
              <h2 className="font-display mb-4 text-lg font-bold text-white">
                Userlar ({users.length})
              </h2>
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <div
                    key={u.id ?? u._id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-200">
                        {u.fullName || u.username}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        @{u.username}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          u.role === "admin"
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-indigo-400/15 text-indigo-300"
                        }`}
                      >
                        {u.role}
                      </span>
                      <button
                        onClick={() => setRole(u)}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          u.role === "admin"
                            ? "border border-white/10 text-slate-300 hover:bg-white/5"
                            : "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
                        }`}
                      >
                        {u.role === "admin" ? "User qilish" : "Admin qilish"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardClass} p-6`}>
              <h2 className="font-display mb-4 text-lg font-bold text-white">
                Mahsulotlar ({products.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-4">Nomi</th>
                      <th className="py-2 pr-4">Kategoriya</th>
                      <th className="py-2 pr-4">Narx</th>
                      <th className="py-2 pr-4">Ombor</th>
                      <th className="py-2 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                      <tr key={p.id ?? p._id}>
                        <td className="py-3 pr-4 font-medium text-slate-200">
                          {p.name}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">
                          {p.category ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-emerald-400">
                          ${p.price}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">{p.stock ?? 0}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => editProduct(p)}
                              className="whitespace-nowrap rounded-lg bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/25"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id ?? p._id ?? "")}
                              className="whitespace-nowrap rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/25"
                            >
                              O'chirish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}