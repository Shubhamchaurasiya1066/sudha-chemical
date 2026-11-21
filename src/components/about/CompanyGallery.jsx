
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { companyGallery } from "@/data/company";

function GalleryCard({ item }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [item.image]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111C30]">
      {error ? (
        <div className="flex h-full items-center justify-center">
          <ImageIcon
            size={42}
            className="text-slate-500"
          />
        </div>
      ) : (
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

export default function CompanyGallery() {
  const total = companyGallery.length;

  // Original photos ke 3 sets:
  // [photos] [photos] [photos]
  // Middle set se start karke seamless loop banega.
  const slides = [
    ...companyGallery,
    ...companyGallery,
    ...companyGallery,
  ];

  const trackRef = useRef(null);
  const positionRef = useRef(total);
  const movingRef = useRef(false);
  const [position, setPosition] = useState(total);
  const [visibleCount, setVisibleCount] = useState(3);
  const [animate, setAnimate] = useState(false);

  // Responsive visible photos
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();

    window.addEventListener("resize", updateVisibleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  // Track ko selected slide tak move karo
  const moveTo = (nextPosition) => {
    if (movingRef.current || total <= 1) return;

    movingRef.current = true;
    setAnimate(true);
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const nextSlide = () => {
    moveTo(positionRef.current + 1);
  };

  const prevSlide = () => {
    moveTo(positionRef.current - 1);
  };

  // Infinite loop reset after transition
  const handleTransitionEnd = () => {
    movingRef.current = false;

    const current = positionRef.current;

    if (current >= total * 2) {
      const reset = current - total;

      setAnimate(false);
      positionRef.current = reset;
      setPosition(reset);
    } else if (current < total) {
      const reset = current + total;

      setAnimate(false);
      positionRef.current = reset;
      setPosition(reset);
    }
  };

  // Gap = 20px (Tailwind gap-5)
  const gap = 20;

  const translate = `calc(-${position} * ((100% - ${
    (visibleCount - 1) * gap
  }px) / ${visibleCount} + ${gap}px))`;

  if (total === 0) return null;

  return (
    <section className="bg-[#0B1120] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Our Gallery
          </p>

          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            Company{" "}
            <span className="text-blue-400">
              Gallery
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Explore photographs from Sudha Chemical Company.
          </p>
        </div>

        {/* Slider + Outside Arrows */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* Left Arrow */}
          <button
            type="button"
            onClick={prevSlide}
            disabled={total <= 1}
            aria-label="Previous gallery photo"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-[#17233A] text-white shadow-lg transition hover:border-blue-400 hover:bg-blue-600 disabled:opacity-40 sm:h-12 sm:w-12"
          >
            <ChevronLeft size={25} />
          </button>

          {/* Visible Image Area */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              ref={trackRef}
              onTransitionEnd={handleTransitionEnd}
              className="flex gap-5"
              style={{
                transform: `translateX(${translate})`,
                transition: animate
                  ? "transform 450ms ease-in-out"
                  : "none",
                willChange: "transform",
              }}
            >
              {slides.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="min-w-0 shrink-0"
                  style={{
                    width: `calc((100% - ${
                      (visibleCount - 1) * gap
                    }px) / ${visibleCount})`,
                  }}
                >
                  <GalleryCard item={item} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={nextSlide}
            disabled={total <= 1}
            aria-label="Next gallery photo"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-[#17233A] text-white shadow-lg transition hover:border-blue-400 hover:bg-blue-600 disabled:opacity-40 sm:h-12 sm:w-12"
          >
            <ChevronRight size={25} />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="mt-7 text-center">
          <p className="text-sm text-slate-400">
            {((position % total) + total) % total + 1}
            {" / "}
            {total}
          </p>
        </div>

      </div>
    </section>
  );
}
