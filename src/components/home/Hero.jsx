
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Factory,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden bg-[#08111F]">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,17,31,0.97) 0%, rgba(8,17,31,0.85) 45%, rgba(8,17,31,0.35) 100%), url('/images/chemical-hero.jpg')",
        }}
      />

      {/* Decorative lighting */}
      <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-96 w-96 rounded-full bg-blue-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="mx-auto w-full max-w-7xl px-5 py-24 lg:px-8">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300"
          >
            <Factory size={16} />
            Industrial Chemical Solutions
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-4xl text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            Powering Industries
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              With Chemical Solutions
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            Welcome to Sudha Chemical Company. Explore our range of
            industrial chemicals and connect with our team for
            product information, availability and business enquiries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/20"
            >
              Explore Products <ArrowRight size={18} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-blue-400/50 hover:bg-white/10"
            >
              Request Quote <ArrowUpRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 flex flex-wrap gap-6 border-t border-white/10 pt-7 text-sm text-slate-300"
          >
            <span className="flex items-center gap-2">
              <MapPin size={18} className="text-blue-400" />
              Gwalior, Madhya Pradesh
            </span>

            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              Industrial Chemical Supply
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
