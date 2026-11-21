
"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Factory,
  Landmark,
  MapPin,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import {
  companyInfo,
  governmentClients,
} from "@/data/company";

export default function CompanyDetails() {
  return (
    <>
      {/* What Do We Stand For */}
      <section className="bg-[#0D1729] px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              About Our Business
            </p>

            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              What Do We <span className="text-blue-400">Stand For?</span>
            </h2>

            <p className="mt-7 max-w-4xl text-lg leading-9 text-slate-400">
              {companyInfo.governmentSector}
              {" "}The company supplies industrial chemicals for
              a variety of business applications and sectors.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companyInfo.industries.map((industry, index) => (
              <motion.div
                key={industry}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111C30] p-6 transition hover:border-blue-500/40"
              >
                <Factory className="shrink-0 text-blue-400" size={25} />
                <span className="font-semibold text-white">
                  {industry}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="bg-[#0B1120] px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Our Presence
            </p>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              Our Office <span className="text-blue-400">Network</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-500/30 bg-[#111C30] p-8">
              <Building2 size={32} className="text-blue-400" />
              <p className="mt-7 text-sm text-blue-400">Head Office</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Gwalior
              </h3>
              <p className="mt-3 text-slate-400">Madhya Pradesh</p>
            </div>

            {companyInfo.branchOffices.map((city) => (
              <div
                key={city}
                className="rounded-2xl border border-white/10 bg-[#111C30] p-8"
              >
                <MapPin size={32} className="text-blue-400" />
                <p className="mt-7 text-sm text-blue-400">
                  Branch Office
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {city}
                </h3>
                <p className="mt-3 text-slate-400">Madhya Pradesh</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-7">
            <h3 className="font-bold text-white">
              Proposed Expansion
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              The company has previously identified{" "}
              {companyInfo.proposedOffices.join(", ")} as
              potential locations for future offices.
              These are proposed locations, not confirmed branches.
            </p>
          </div>
        </div>
      </section>

      {/* Government Sector */}
      <section className="bg-[#0D1729] px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Government Sector
            </p>

            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              Our Service to the{" "}
              <span className="text-blue-400">
                Government Sector
              </span>
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              The following organizations are listed in
              Sudha Chemical Company's supplied service history.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {governmentClients.map((client, index) => (
              <motion.div
                key={client}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 6) * 0.05 }}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111C30] p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Landmark size={21} className="text-blue-400" />
                </div>

                <span className="text-sm font-semibold leading-6 text-slate-200">
                  {client}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
