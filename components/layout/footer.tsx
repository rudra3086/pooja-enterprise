import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
  ],
  products: [
    { href: "/products#prod-1", label: "Tissue Napkin" },
    { href: "/products#prod-2", label: "Tissue Roll" },
    { href: "/products#prod-3", label: "Ultra Soft Tissue" },
    { href: "/products#prod-4", label: "Aluminium Foil" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-xl font-semibold">Pooja Enterprise</span>
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
              Your trusted B2B partner for premium tissue and packaging solutions. Quality products for businesses since 2010.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Products</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary-foreground/70" />
                <a
                  href="https://maps.app.goo.gl/d1ojvPpPkTxxM3sy6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground hover:underline"
                >
                  Plot No 2900/75, Shree Sardar Patel Industrial Estate (Old Indochem) GIDC Estate Ankleswar 393002, Gujarat, India
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary-foreground/70" />
                <a
                  href="tel:+919913938188"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  +91 9913938188
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary-foreground/70" />
                <a
                  href="mailto:pooja123enterprise@gmail.com"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  pooja123enterprise@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-center text-sm text-primary-foreground/60">
              &copy; {new Date().getFullYear()} Pooja Enterprise. All rights reserved.
            </p>
            <Link
              href="/admin/login"
              className="text-sm text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
