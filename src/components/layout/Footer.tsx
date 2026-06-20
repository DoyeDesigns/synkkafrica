import Image from "next/image";
import Link from "next/link";

const EXPLORE_LINKS = [
  { label: "Hotels & Accommodations", href: "/?section=accommodations" },
  { label: "Car Rentals", href: "/?section=car-rentals" },
  { label: "Flight bookings", href: "/?section=flights" },
  { label: "Dinning & Restaurants", href: "/?section=tours" },
] as const;

const SUPPORT_LINKS = [
  { label: "Contact support", href: "/support" },
  { label: "Change or cancel your booking", href: "/bookings" },
  { label: "Payment options", href: "/payment-options" },
  { label: "View or print your booking receipt", href: "/bookings" },
] as const;

const COMMUNITY_LINKS = [
  { label: "Our Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "info@synkkafrica.com", href: "mailto:info@synkkafrica.com" },
  { label: "In the News", href: "/news" },
] as const;

const VENDOR_LINKS = [
  { label: "List your Car", href: "/vendor" },
  { label: "List your service", href: "/vendor" },
  { label: "Contact us", href: "/contact" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Security Page", href: "/security" },
  { label: "FAQs", href: "/faqs" },
] as const;

type FooterLinkGroupProps = {
  title: string;
  links: readonly { label: string; href: string }[];
};

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-black font-satoshi text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[13px] font-medium font-inter text-white transition-opacity hover:text-white hover:opacity-100"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-[#7C7C7C] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-15 md:flex-row justify-between">
          <div className="w-fit">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/synkkafrica-logo.svg"
                alt=""
                width={75}
                height={75}
              />
              <span className="text-lg -ml-6 font-bold tracking-tight font-montserrat uppercase">
                Synkkafrica
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-[145%] font-inter text-white">
              SynKKafrica is an emerging, all-in-one travel and premium experience
              platform designed to connect people globally to the heart of the
              African travel and lifestyle ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-between gap-10 lg:grid-cols-4 lg:flex-row  flex-wrap lg:gap-8 w-fit">
          <FooterLinkGroup title="Explore SynKKafrica" links={EXPLORE_LINKS} />
          <FooterLinkGroup title="Support" links={SUPPORT_LINKS} />
          <FooterLinkGroup title="Community" links={COMMUNITY_LINKS} />
          <FooterLinkGroup title="Become a Vendor" links={VENDOR_LINKS} />
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
                Get the full SynKKafrica experience.
              </p>
              <p className="mt-1 text-[22px] font-bold font-montserrat text-[#D85A30] sm:text-[28px]">
                Download the App today
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/download"
                className="inline-flex min-w-[150px] items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <span className="text-[10px] font-normal leading-none opacity-80">
                  GET IT ON
                </span>
                <span className="text-sm leading-none">Google Play</span>
              </Link>

              <Link
                href="/download"
                className="inline-flex min-w-[150px] items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <span className="text-[10px] font-normal leading-none opacity-80">
                  Download on the
                </span>
                <span className="text-sm leading-none">App Store</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/20 pt-6 text-xs font-satoshi text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {LEGAL_LINKS.map((link, index) => (
              <span key={link.label} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">•</span> : null}
                <Link
                  href={link.href}
                  className="transition-opacity hover:text-white hover:opacity-100"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>

          <p>Copyright © 2025 Synkkafrica | All Rights Reserved</p>
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
