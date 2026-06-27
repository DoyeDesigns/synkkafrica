"use client";

import { Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import { AccountMenuDropdown } from "@/components/layout/account-menu-dropdown";
import { CurrencyDropdown } from "@/components/layout/currency-dropdown";
import { LanguageDropdown } from "@/components/layout/language-dropdown";
import { useTranslation } from "@/hooks/use-translation";
import { ACCOUNT_AREA_PREFIX } from "@/features/account/constants";
import { TOUR_PACKAGES_PATH } from "@/features/tour-packages/data/tour-packages";

type NavbarContentProps = {
  session: Session | null;
};

export function NavbarContent({ session }: NavbarContentProps) {
  const t = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAccountArea = pathname.startsWith(ACCOUNT_AREA_PREFIX);
  const isTourPackages = pathname.startsWith(TOUR_PACKAGES_PATH);

  return (
    <header
      className={`absolute top-0 left-0 z-50 w-full ${
        isHome
          ? "bg-transparent"
          : isAccountArea
            ? "bg-[#303030]"
            : isTourPackages
              ? "bg-[#212121]/19"
              : "bg-[#21212178]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/synkkafrica-logo.svg"
            alt=""
            width={75}
            height={75}
            priority
          />
          <span className="text-xl font-bold -ml-6 tracking-tight font-montserrat text-white">
            Synkkafrica
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-satoshi font-bold text-white sm:gap-4 lg:gap-6">
          <Link
            href="/download"
            className="hidden items-center gap-1.5 transition-opacity hover:opacity-80 md:flex"
          >
            <Smartphone className="h-4 w-4" strokeWidth={1.75} />
            <span>{t("nav.downloadApp")}</span>
          </Link>

          <Link
            href="/vendor"
            className="hidden transition-opacity hover:opacity-80 lg:inline"
          >
            {t("nav.becomeVendor")}
          </Link>

          <CurrencyDropdown />
          <LanguageDropdown />

          {!session?.user ? (
            <Link
              href="/login"
              className="rounded-md font-montserrat bg-[#e45d25] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#cf5422] sm:px-4 sm:text-sm"
            >
              {t("nav.signInCreate")}
            </Link>
          ) : null}

          {session?.user ? <AccountMenuDropdown session={session} /> : null}
        </nav>
      </div>
    </header>
  );
}
