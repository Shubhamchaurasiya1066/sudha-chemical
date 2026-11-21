
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { teamMembers } from "@/data/team";

function TeamCard({ member, index }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
      }}
      className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111C30] shadow-lg transition-colors duration-300 hover:border-blue-500/50"
    >
      {/* Staff Photo */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#17233A]">
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound
              size={55}
              className="text-slate-500"
            />
          </div>
        ) : (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 20vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Staff Details */}
      <div className="px-3 py-5 text-center">
        <h3 className="text-sm font-bold leading-6 text-white sm:text-base">
          {member.name}
        </h3>

        {member.designation && (
          <p className="mt-2 text-xs text-blue-400">
            {member.designation}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default function TeamSection() {
  return (
    <section className="overflow-hidden bg-[#0B1120] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* Section Heading */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
            Our People
          </p>

          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Meet Our{" "}
            <span className="text-blue-400">
              Team
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            The people behind Sudha Chemical Company.
          </p>
        </div>

        {/* Responsive Team Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {teamMembers.map((member, index) => (
            <TeamCard
              key={member.id}
              member={member}
              index={index}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
