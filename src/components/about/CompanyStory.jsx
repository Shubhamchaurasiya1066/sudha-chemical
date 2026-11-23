
import { motion } from "@/components/ui/Motion";
import { Building2, CalendarDays, MapPin } from "lucide-react";

const facts = [
  { icon: CalendarDays, title: "1978", label: "Established" },
  { icon: MapPin, title: "Gwalior", label: "Madhya Pradesh" },
  { icon: Building2, title: "Industrial", label: "Chemical Business" },
];

export default function CompanyStory() {
  return (
    <section className="bg-[#0B1120] px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Our Journey
          </p>

          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            Our Story
            <span className="block text-blue-400">
              Since 1978
            </span>
          </h2>

          <p className="mt-7 leading-8 text-slate-400">
            Sudha Chemical Company was established in 1978
            in Gwalior, Madhya Pradesh, by Sh. Bal Chand Jain.
            Beginning as a small-scale business, the company
            entered the industrial chemical sector.
          </p>

          <p className="mt-5 leading-8 text-slate-400">
            Our product portfolio includes chloro-alkali
            chemicals, industrial acids and other chemical
            products for various industrial applications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {facts.map((fact, index) => {
            const Icon = fact.icon;

            return (
              <div
                key={fact.title}
                className={`rounded-2xl border border-white/10 bg-[#111C30] p-8 ${
                  index === 2 ? "sm:col-span-2" : ""
                }`}
              >
                <Icon className="mb-6 text-blue-400" size={30} />
                <h3 className="text-3xl font-black text-white">
                  {fact.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {fact.label}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
