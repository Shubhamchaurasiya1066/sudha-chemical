
import { motion } from "@/components/ui/Motion";
import {
  Factory,
  FlaskConical,
  MapPinned,
  MessageSquareText,
} from "lucide-react";

const highlights = [
  {
    icon: FlaskConical,
    title: "Industrial Chemicals",
    desc: "A product portfolio covering acids, alkalis and other chemicals.",
  },
  {
    icon: Factory,
    title: "Business Applications",
    desc: "Chemical products for different industrial processing needs.",
  },
  {
    icon: MapPinned,
    title: "Gwalior Based",
    desc: "Located in Gwalior, Madhya Pradesh, India.",
  },
  {
    icon: MessageSquareText,
    title: "Product Enquiries",
    desc: "Contact our team for product information and quotations.",
  },
];

export default function BusinessHighlights() {
  return (
    <section className="bg-[#0B1120] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Business Highlights
          </p>

          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Explore Our <span className="text-blue-400">Capabilities</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Icon size={30} />
                </div>

                <h3 className="text-lg font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
