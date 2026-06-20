import Link from "next/link";

type ResultsBreadcrumbItem = {
  label: string;
  href?: string;
};

type ResultsBreadcrumbsProps = {
  items: ResultsBreadcrumbItem[];
};

export function ResultsBreadcrumbs({ items }: ResultsBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm font-satoshi">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-foreground/50">
                  |
                </span>
              ) : null}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-medium text-[#D85A30] transition-opacity hover:opacity-80"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-medium text-foreground"
                      : "font-medium text-[#D85A30]"
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
