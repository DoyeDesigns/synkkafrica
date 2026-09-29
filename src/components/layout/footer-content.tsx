"use client";

import Image from "next/image";
import Link from "next/link";

import { T } from "@/components/translation";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import { usePreferencesStore } from "@/stores/preferences-store";

const EXPLORE_LINKS: { key: TranslationKey; href: string }[] = [
  { key: "footer.explore.hotels", href: "/?section=accommodations" },
  { key: "footer.explore.carRentals", href: "/?section=car-rentals" },
  { key: "footer.explore.flights", href: "/?section=flights" },
];

const SUPPORT_LINKS: { key: TranslationKey; href: string }[] = [
  { key: "footer.support.contact", href: "/account/support" },
  { key: "footer.support.changeBooking", href: "/account/bookings" },
  { key: "footer.support.receipt", href: "/account/bookings" },
];

const COMMUNITY_LINKS: { key?: TranslationKey; label?: string; href: string }[] = [
  { label: "info@synkafrica.com", href: "mailto:info@synkafrica.com" },
];

const VENDOR_LINKS: { key: TranslationKey; href: string }[] = [
  { key: "footer.vendor.listCar", href: "/vendor/add-listing" },
  { key: "footer.vendor.listService", href: "/vendor/add-listing" },
];

const LEGAL_LINKS: { key: TranslationKey; href: string }[] = [
  { key: "footer.legal.terms", href: "/terms" },
  { key: "footer.legal.privacy", href: "/privacy" },
  { key: "footer.legal.cookies", href: "/cookies" },
  { key: "footer.legal.refunds", href: "/refunds" },
  { key: "footer.legal.vendorTerms", href: "/vendor-terms" },
];

type FooterLinkGroupProps = {
  titleKey: TranslationKey;
  links: { key?: TranslationKey; label?: string; href: string }[];
};

function FooterLinkGroup({ titleKey, links }: FooterLinkGroupProps) {
  const t = useTranslation();
  const language = usePreferencesStore((state) => state.language);

  return (
    <div>
      <h3 className="text-sm font-black font-satoshi text-white">{t(titleKey)}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => {
          const itemKey = link.key ?? link.label ?? link.href;

          return (
            <li key={`${itemKey}-${language}`}>
              <Link
                href={link.href}
                className="text-[13px] font-medium font-inter text-white transition-opacity hover:text-white hover:opacity-100"
              >
                {link.key ? <T k={link.key} /> : link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FooterContent() {
  const t = useTranslation();

  return (
    <footer className="mt-auto bg-[#7C7C7C] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-15 md:flex-row justify-between">
          <div className="w-fit">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/synkafrica-logo.svg"
                alt=""
                width={75}
                height={75}
              />
              <span className="text-lg -ml-6 font-bold tracking-tight font-montserrat">
                SynkAfrica
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-[145%] font-inter text-white">
              {t("footer.brandDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-between gap-10 lg:grid-cols-4 lg:flex-row flex-wrap lg:gap-8 w-fit">
            <FooterLinkGroup titleKey="footer.explore.title" links={EXPLORE_LINKS} />
            <FooterLinkGroup titleKey="footer.support.title" links={SUPPORT_LINKS} />
            <FooterLinkGroup titleKey="footer.community.title" links={COMMUNITY_LINKS} />
            <FooterLinkGroup titleKey="footer.vendor.title" links={VENDOR_LINKS} />
          </div>
        </div>
        <div className="relative mt-12 min-h-[140px] overflow-hidden rounded-[10px]">
          <Image
            src="/footer-image-1.png"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          <div className="relative flex min-h-[140px] flex-col items-start justify-center gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <p className="font-semibold font-montserrat text-white">
                {t("footer.appPromo.headline")}
              </p>
              <p className="mt-1 text-[22px] font-bold font-montserrat text-[#D85A30] sm:text-[28px]">
                {t("footer.appPromo.cta")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Image
                src="/badges/google-play.png"
                alt={`${t("footer.appPromo.getItOn")} ${t("footer.appPromo.googlePlay")}`}
                width={646}
                height={250}
                className="h-14 w-auto"
              />
              <Image
                src="/badges/app-store.svg"
                alt={`${t("footer.appPromo.downloadOn")} ${t("footer.appPromo.appStore")}`}
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-6 text-xs font-satoshi text-white/80">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                <T k={link.key} />
              </Link>
            ))}
          </nav>
          <p className="mt-4 sm:text-right">
            <T k="footer.copyright" />
          </p>
        </div>
      </div>

      <div className="relative h-3 w-full">
        <Image
          src="/footer-image-2.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
    </footer>
  );
}
