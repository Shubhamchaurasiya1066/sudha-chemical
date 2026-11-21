
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="bg-[#0D1729] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#173A75] via-[#10284E] to-[#0B1120] px-7 py-14 text-center sm:px-12 lg:py-20"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-[80px]" />

          <div className="relative">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Let's Connect
            </p>

            <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Looking for Industrial Chemical Products?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-8 text-slate-300">
              Share your requirements with Sudha Chemical Company.
              Our team can assist with product information
              and business enquiries.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-500"
              >
                Request a Quote <ArrowRight size={19} />
              </Link>

              <a
                href="mailto:sales@sudhachemicalcompany.com"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10"
              >
                <Mail size={19} /> Email Us
              </a>
            </div>

            <a
              href="tel:+917880006380"
              className="mt-8 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
              <Phone size={17} className="text-cyan-300" />
              +91 78800 06380
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
