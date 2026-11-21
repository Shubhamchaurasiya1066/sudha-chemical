
"use client";

import { useState } from "react";
import Image from "next/image";

const valuableClients = [
    {
        id: 1,
        name: "Indian Oil",
        image: "/images/clients/indian-oil.png",
    },
    {
        id: 2,
        name: "GAIL (India) Limited",
        image: "/images/clients/gail.png",
    },
    {
        id: 3,
        name: "National Fertilizers Limited",
        image: "/images/clients/national-fertilizers.png",
    },
    {
        id: 4,
        name: "CSPGCL",
        image: "/images/clients/cspgcl.png",
    },
    {
        id: 5,
        name: "Rajasthan Rajya Vidyut Utpadan Nigam Limited",
        image: "/images/clients/rajasthan-rajya-vidyut.png",
    },
    {
        id: 6,
        name: "MOIL Limited",
        image: "/images/clients/moil.png",
    },
    {
        id: 7,
        name: "UP Power Corporation",
        image: "/images/clients/up-power.png",
    },
    {
        id: 8,
        name: "NTPC Limited",
        image: "/images/clients/ntpc.png",
    },
];

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
                <span className="text-center text-sm font-bold text-slate-700">
                    {client.name}
                </span>
            )}
        </div>
    );
}

export default function ClientsLogoGrid() {
    return (
<section
  className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
  style={{ backgroundColor: "#0B1120" }}
>    
            <div className="relative mx-auto max-w-[1500px]">
                <h2 className="mb-14 text-center text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Valuable <span className="text-blue-400">Clients</span>
                </h2>

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
