
"use client";

import { useState } from "react";
import Image from "next/image";

// Automatically generate all 46 client images
// c1.png, c2.png, c3.png ... c46.png

const valuableClients = Array.from(
  { length: 46 },
  (_, index) => ({
    id: index + 1,
    name: `Client ${index + 1}`,
    image: `/images/clients/c${index + 1}.png`,
  })
);

// Individual Logo Card
function LogoCard({ client }) {
  const [error, setError] = useState(false);

  return (
    <div className="group flex aspect-[4/3] items-center justify-center overflow-hidden bg-white p-5 shadow-[0_12px_25px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(0,0,0,0.25)]">

      {!error ? (
        <div className="relative h-full w-full">
          <Image
            src={client.image}
            alt={`${client.name} logo`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="object-contain"
            onError={() => setError(true)}
          />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-center">
          <span className="text-sm font-bold text-slate-700">
            {client.name}
          </span>

          <span className="mt-2 text-xs text-slate-400">
            Image not found
          </span>
        </div>
      )}
    </div>
  );
}

// Main Clients Logo Grid
export default function ClientsLogoGrid() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#0B1120" }}
    >
      <div className="relative mx-auto max-w-[1500px]">

        {/* Heading */}
        <h2 className="mb-14 text-center text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Valuable{" "}
          <span className="text-blue-400">
            Clients
          </span>
        </h2>

        {/* All 46 Client Logos */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valuableClients.map((client) => (
            <LogoCard
              key={client.id}
              client={client}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
