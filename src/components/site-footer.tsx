import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e3d7c5] bg-[#f5eddf]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c8ad] bg-[#eee2cc] font-display text-sm font-semibold text-[#52685b]">
              R
            </span>
            <span className="font-display text-base font-semibold tracking-[-0.025em] text-zinc-100 sm:text-lg">
              {site.name.split(" ")[0]}
              <span className="font-normal text-zinc-500"> {site.name.split(" ").slice(1).join(" ")}</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            {site.description}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd0bc] text-zinc-500 transition-colors hover:border-[#b8a27e] hover:text-[#52685b]"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            <a
              href={site.youtube}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd0bc] text-zinc-500 transition-colors hover:border-[#b8a27e] hover:text-[#52685b]"
              aria-label="YouTube"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 12s0-3.85-.5-5.7c-.27-1-1.07-1.8-2.08-2.07C18.6 3.75 12 3.75 12 3.75s-6.6 0-8.42.48A2.94 2.94 0 0 0 1.5 6.3C1 8.15 1 12 1 12s0 3.85.5 5.7c.27 1 1.07 1.8 2.08 2.07 1.82.48 8.42.48 8.42.48s6.6 0 8.42-.48a2.94 2.94 0 0 0 2.08-2.07C23 15.85 23 12 23 12ZM9.75 15.5v-7l6 3.5-6 3.5Z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-zinc-200">
            Hızlı Erişim
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            <li><Link href="/hocalar" className="transition-colors hover:text-[#52685b]">Hocalarımız</Link></li>
            <li><Link href="/randevu" className="transition-colors hover:text-[#52685b]">Randevu Al</Link></li>
            <li><Link href="/#galeri" className="transition-colors hover:text-[#52685b]">Galeri</Link></li>
            <li><Link href="/#konum" className="transition-colors hover:text-[#52685b]">Konum & İletişim</Link></li>
            <li><Link href="/giris" className="transition-colors hover:text-[#52685b]">Giriş Yap</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-zinc-200">
            İletişim
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            <li>{site.address}</li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-[#52685b]">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-[#52685b]">
                {site.email}
              </a>
            </li>
            <li className="text-zinc-500">{site.workingHours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e3d7c5] py-5 text-center text-xs text-zinc-500">
        © {site.name}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
