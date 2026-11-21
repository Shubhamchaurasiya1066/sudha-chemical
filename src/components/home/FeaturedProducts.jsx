
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Factory,
  FlaskConical,
  Layers,
} from "lucide-react";
import { products } from "@/data/products";

const iconMap = {
  flask: FlaskConical,
  droplets: Droplets,
  layers: Layers,
  factory: Factory,
};

export default function FeaturedProducts() {
  return (
    <section className="bg-[#0D1729] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Our Product Portfolio
            </p>

            <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Featured <span className="text-blue-400">Chemicals</span>
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Explore our selection of industrial chemical products
              for a wide range of business applications.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-semibold text-blue-400 hover:text-blue-300"
          >
            View All Products <ArrowRight size={19} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const Icon = iconMap[product.icon] || FlaskConical;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition-colors hover:border-blue-500/40 hover:bg-white/[0.065]"
              >
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={31} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {product.category}
                </span>

                <h3 className="mt-3 text-xl font-bold text-white">
                  {product.name}
                </h3>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-400">
                  {product.description}
                </p>

                <Link
                  href={`/contact?product=${encodeURIComponent(product.name)}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-blue-400"
                >
                  Enquire Now <ArrowRight size={17} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
