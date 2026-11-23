
"use client";

import { useMemo, useState } from "react";
import { motion } from "@/components/ui/Motion";
import {
  Building2,
  Search,
  Landmark,
  Factory,
} from "lucide-react";
import { clients, clientCategories } from "@/data/clients";

export default function ClientsGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = client.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        category === "All" || client.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <section
      id="clients-list"
      className="bg-[#0B1120] px-5 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Government Sector
            </p>

            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              Organizations We{" "}
              <span className="text-blue-400">
                Have Served
              </span>
            </h2>

            <p className="mt-5 max-w-2xl leading-8 text-slate-400">
              Organizations included in the company's supplied
              government-sector service history.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-[#111C30] px-5 py-4">
            <Building2 size={25} className="text-blue-400" />
            <div>
              <p className="text-2xl font-black text-white">
                {clients.length}
              </p>
              <p className="text-xs text-slate-400">
                Listed Organizations
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-7 flex items-center gap-3 rounded-xl border border-white/10 bg-[#111C30] px-5 py-4 focus-within:border-blue-500/50">
          <Search size={20} className="shrink-0 text-blue-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search organizations..."
            aria-label="Search organizations"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Category Filters */}
        <div className="mb-10 flex flex-wrap gap-3">
          {clientCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                category === item
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-white/10 bg-[#111C30] text-slate-300 hover:border-blue-500/40 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Clients Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client, index) => (
              <motion.article
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: (index % 6) * 0.05,
                }}
                className="group flex min-h-48 flex-col justify-between rounded-2xl border border-white/10 bg-[#111C30] p-7 transition-colors hover:border-blue-500/40 hover:bg-[#15243B]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Landmark
                      size={26}
                      className="text-blue-400"
                    />
                  </div>

                  <Factory
                    size={20}
                    className="text-slate-600 transition group-hover:text-blue-400"
                  />
                </div>

                <div className="mt-7">
                  <h3 className="text-lg font-bold leading-7 text-white">
                    {client.name}
                  </h3>

                  <p className="mt-3 text-sm font-medium text-blue-400">
                    {client.category}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#111C30] px-6 py-16 text-center">
            <Search
              size={35}
              className="mx-auto text-slate-500"
            />

            <h3 className="mt-5 text-xl font-bold text-white">
              No organizations found
            </h3>

            <p className="mt-3 text-slate-400">
              Try a different search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              Clear Filters
            </button>
          </div>
        )}

        <p className="mt-9 text-center text-xs leading-6 text-slate-500">
          Organization names are provided for reference to
          the company's stated supply history. Their inclusion
          does not imply endorsement or a current contract.
        </p>
      </div>
    </section>
  );
}
