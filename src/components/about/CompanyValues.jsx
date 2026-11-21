
"use client";

import { motion } from "framer-motion";
import {
  FlaskConical,
  Handshake,
  MessageSquareText,
} from "lucide-react";

const values = [
  {
    icon: FlaskConical,
    title: "Product Knowledge",
    description:
      "Information about industrial acids, alkalis and other chemicals.",
  },
  {
    icon: Handshake,
    title: "Business Relationships",
    description:
      "Building connections through clear communication and enquiries.",
  },
  {
    icon: MessageSquareText,
    title: "Customer Communication",
    description:
      "Helping customers connect with our team about their requirements.",
  },
];

export default function CompanyValues() {
  return (
    <section className="bg-[#0D1729] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Our Approach
          </p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            What We Focus On
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-8"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Icon size={30} />
                </div>

                <h3 className="text-xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
