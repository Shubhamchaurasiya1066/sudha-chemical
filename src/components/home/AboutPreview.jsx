
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, FlaskConical, Users } from "lucide-react";

const highlights = [
  {
    icon: Building2,
    title: "Industrial Supply",
    desc: "Chemical products for diverse industrial requirements.",
  },
  {
    icon: FlaskConical,
    title: "Product Range",
    desc: "Acids, alkalis and other industrial chemical products.",
  },
  {
    icon: Users,
    title: "Business Enquiries",
    desc: "Connect with our team for product and supply information.",
  },
];

export default function AboutPreview() {
  return (
    <section className="bg-[#0B1120] px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex min-h-[390px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950 via-[#142641] to-[#0B1120] p-10">
            <div className="absolute inset-0 rounded-3xl bg-blue-500/5" />

            <div className="relative text-center">
              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/15">
                <Building2 className="h-12 w-12 text-blue-400" />
              </div>

              <p className="text-2xl font-extrabold text-white">
                SUDHA CHEMICAL COMPANY
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.22em] text-blue-300">
                Gwalior • Madhya Pradesh
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            About Our Company
          </p>

          <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Your Partner for
            <span className="block text-blue-400">
              Industrial Chemicals
            </span>
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-400">
            Sudha Chemical Company is based in Gwalior, Madhya Pradesh.
            Our product range includes industrial acids, alkalis and
            other chemicals used in different business applications.
          </p>

          <div className="mt-8 space-y-5">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/about"
            className="mt-9 inline-flex items-center gap-2 font-bold text-blue-400 transition hover:text-blue-300"
          >
            Discover Our Company <ArrowUpRight size={19} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
