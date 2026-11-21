
import Link from "next/link";
import {
  ArrowUpRight,
  FlaskConical,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Products", href: "/products" },
  { name: "Our Clients", href: "/clients" },
  { name: "Contact Us", href: "/contact" },
];

const products = [
  "Sulphuric Acid",
  "Caustic Soda Lye",
  "Hydrochloric Acid",
  "Caustic Soda Flakes",
  "Soda Ash",
  "Hydrogen Peroxide",
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080E1B] text-slate-300">
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <FlaskConical className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white">
                  SUDHA CHEMICAL
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-blue-400">
                  Company
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Sudha Chemical Company supplies industrial chemicals
              for diverse business requirements. Explore our
              product range and contact us for enquiries.
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-base font-bold text-white">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-base font-bold text-white">
              Our Products
            </h3>
            <ul className="space-y-4">
              {products.map((product) => (
                <li key={product}>
                  <Link
                    href="/products"
                    className="text-sm text-slate-400 transition hover:text-blue-400"
                  >
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-base font-bold text-white">
              Contact Information
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-400" />
                <p className="text-sm leading-6 text-slate-400">
                  Sukh Swaroop Sadan, Dana Oli,
                  Lashkar, Gwalior,
                  Madhya Pradesh, India
                </p>
              </div>

              <a
                href="tel:+917880006380"
                className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400"
              >
                <Phone className="h-5 w-5 text-blue-400" />
                +91 78800 06380
              </a>

              <a
                href="mailto:sales@sudhachemicalcompany.com"
                className="flex items-center gap-3 break-all text-sm text-slate-400 hover:text-blue-400"
              >
                <Mail className="h-5 w-5 shrink-0 text-blue-400" />
                sales@sudhachemicalcompany.com
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Send Enquiry <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © Sudha Chemical Company.
            All Rights Reserved.
          </p>
          <p>Industrial Chemicals & Business Solutions</p>
        </div>
      </div>
    </footer>
  );
}
