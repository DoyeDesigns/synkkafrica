import { CircleUser, Globe, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="absolute top-0 left-0 z-50 w-full bg-transparent">
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
            <span>Download App</span>
          </Link>

          <Link
            href="/vendor"
            className="hidden transition-opacity hover:opacity-80 lg:inline"
          >
            Become a Vendor
          </Link>

          <button
            type="button"
            className="hidden transition-opacity hover:opacity-80 lg:inline"
          >
            NGN | Choose Currency
          </button>

          <button
            type="button"
            aria-label="Choose language"
            className="hidden transition-opacity hover:opacity-80 sm:inline-flex"
          >
            <Globe className="h-5 w-5" strokeWidth={1.75} />
          </button>

          {session?.user ? (
            <Link
              href="/account"
              className="rounded-md font-montserrat bg-[#e45d25] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#cf5422] sm:px-4 sm:text-sm"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md font-montserrat bg-[#e45d25] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#cf5422] sm:px-4 sm:text-sm"
            >
              Sign in | Create Account
            </Link>
          )}

          <Link
            href={session?.user ? "/account" : "/login"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/80 text-white transition-opacity hover:opacity-80"
            aria-label={session?.user ? "Account notifications" : "Sign in"}
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-full w-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <CircleUser className="h-6 w-6" strokeWidth={1.5} />
            )}
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold leading-none text-white">
              2
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
