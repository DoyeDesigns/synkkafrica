import Link from "next/link";

type ListingCardLinkProps = {
  href: string;
  label: string;
};

export function ListingCardLink({ href, label }: ListingCardLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="absolute inset-0 z-[1] touch-pan-x rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85A30]"
    />
  );
}
