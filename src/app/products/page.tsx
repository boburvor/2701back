"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { cardClass, inputClass } from "@/components/ui";
import type {
  Category,
  CategoryListResponse,
  Product,
  ProductListResponse,
} from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function stockBadge(stock?: number) {
    if (!stock || stock <= 0) {
      return { label: "Zaxirada yo'q", cls: "bg-red-500/10 text-red-400" };
    }
    if (stock < 10) {
      return { label: `Kam qoldi (${stock})`, cls: "bg-amber-500/10 text-amber-300" };
    }
    return { label: `Mavjud (${stock})`, cls: "bg-emerald-500/10 text-emerald-400" };
  }

  useEffect(() => {
    api<CategoryListResponse>("/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (category.trim()) params.set("category", category.trim());
        const data = await api<ProductListResponse>(
          `/products?${params.toString()}`
        );
        if (active) {
          setProducts(data.products ?? []);
          setError(null);
        }
      } catch (e) {
        if (active)
          setError("Mahsulotlarni yuklab bo'lmadi. Server ishga tushganini tekshiring.");
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, category]);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Katalog
          </p>
          <h1 className="font-display text-3xl font-bold text-white">
            Mahsulotlar
          </h1>
          <p className="text-slate-400">
            {loading
              ? "Yuklanmoqda..."
              : `${products.length} ta mahsulot topildi`}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom bo'yicha qidirish..."
              className={`${inputClass} bg-slate-900/40 pl-10`}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:justify-end">
            <button
              onClick={() => setCategory("")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                category === ""
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "border border-white/10 bg-slate-900/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              Hammasi
            </button>
            {categories.map((c) => (
              <button
                key={c.id ?? c._id}
                onClick={() =>
                  setCategory((prev) =>
                    prev === c.name ? "" : c.name
                  )
                }
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === c.name
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "border border-white/10 bg-slate-900/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="mr-1">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className={`${cardClass} p-12 text-center text-slate-400`}>
            Mahsulot topilmadi
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id ?? p._id}
              className={`${cardClass} group relative flex flex-col overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-indigo-500/10`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
                  {p.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                {p.category && (
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                    {p.category}
                  </span>
                )}
              </div>

              <h2 className="font-display text-lg font-semibold text-white">
                {p.name}
              </h2>
              {p.description && (
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-400">
                  {p.description}
                </p>
              )}

              <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/5 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Narx</p>
                  <p className="text-xl font-bold text-emerald-400">
                    ${p.price.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Ombor</p>
                  <span
                    className={`mt-0.5 inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${stockBadge(p.stock).cls}`}
                  >
                    {stockBadge(p.stock).label}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}