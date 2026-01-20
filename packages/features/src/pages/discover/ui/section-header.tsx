import { Link } from "@/shared/i18n";

interface SectionHeaderProps {
  title: string;
  href?: string;
  actionLabel?: string;
}

export function SectionHeader({
  title,
  href,
  actionLabel = "View All",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-primary text-sm font-medium hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
