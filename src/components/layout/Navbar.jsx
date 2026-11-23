
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "@/components/ui/Motion";
import {
  ArrowUpRight,
  ChevronDown,
  FlaskConical,
  Menu,
  X,
} from "lucide-react";

const links = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "Our Clients", href: "/clients" },
  { name: "Contact", href: "/contact" },
  

];

const productLinks = [
  { name: "Sulphuric Acid", href: "/products/sulphuric-acid" },
  { name: "Caustic Soda Lye", href: "/products/caustic-soda-lye" },
  { name: "Hydrochloric Acid", href: "/products/hydrochloric-acid" },
  { name: "Soda Ash", href: "/products/soda-ash" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 20);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled || mobileOpen
          ? "border-b border-white/10 bg-[#0B1120]/95 shadow-xl backdrop-blur-xl"
          : "border-b border-white/5 bg-[#0B1120]/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>

          <div>
            <span className="block text-lg font-extrabold tracking-tight text-white sm:text-xl">
              SUDHA <span className="text-blue-400">CHEMICAL</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Company
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            if (link.name === "Products") {
              return (
                <div
                  key={link.name}
                  className="group relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <Link
                    href={link.href}
                    onFocus={() => setProductsOpen(true)}
                    className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                      active ? "text-blue-400" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Products <ChevronDown className="h-4 w-4" />
                  </Link>

                  {productsOpen && (
                    <div
                      className="absolute left-0 top-full w-64 pt-5"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setProductsOpen(false);
                      }}
                    >
                      <div className="rounded-2xl border border-white/10 bg-[#111C30] p-2 shadow-2xl">
                        {productLinks.map((product) => (
                          <Link
                            key={product.href}
                            href={product.href}
                            className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            {product.name}
                          </Link>
                        ))}
                        <Link
                          href="/products"
                          className="block border-t border-white/10 px-4 py-3 text-sm font-semibold text-blue-400"
                        >
                          View All Products
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  active ? "text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Request Quote <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-xl border border-white/10 p-3 text-white lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#0B1120] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    pathname === link.href
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-3 rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white"
              >
                Request Quote
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
