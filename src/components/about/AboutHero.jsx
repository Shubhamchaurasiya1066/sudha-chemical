
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#08111F] px-5 py-24 lg:px-8">
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-blue-400">
            Home
          </Link>
          <ChevronRight size={15} />
          <span className="text-blue-400">About Us</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <span className="text-sm font-bold uppercase tracking-[0.22em] text-blue-400">
            Our Company
          </span>

          <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
            A Legacy in
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Industrial Chemicals
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Discover the story of Sudha Chemical Company,
            established in Gwalior in 1978, and explore
            our journey in the industrial chemical business.
          </p>

          <Link
            href="/contact"
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-500"
          >
            Connect With Us <ArrowRight size={19} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
