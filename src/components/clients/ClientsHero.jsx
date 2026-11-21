
"use client";

import { motion } from "framer-motion";
import { Building2, ArrowDownRight } from "lucide-react";

export default function ClientsHero() {
  return (
    <section className="relative overflow-hidden bg-[#080F1F] px-5 pb-24 pt-36 lg:px-8 lg:pb-28 lg:pt-44">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-600/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-blue-300">
            <Building2 size={18} />
            Our Business Relationships
          </div>

          <h1 className="text-5xl font-black leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Our <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Clients</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-9 text-slate-300">
            Explore the organizations listed in Sudha Chemical
            Company's government-sector supply history,
            across power, energy, fertilizers and other industries.
          </p>

          <a
            href="#clients-list"
            className="mt-9 inline-flex items-center gap-3 rounded-xl border border-blue-400/30 bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Explore Organizations
            <ArrowDownRight size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
