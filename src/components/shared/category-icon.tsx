import { CATEGORY_ICON_MAP } from "@/lib/category-icons";
import type { CategoryIconKey } from "@/types/domain";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon: CategoryIconKey;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryIcon({
  icon,
  color,
  size = "md",
  className,
}: CategoryIconProps) {
  const entry = CATEGORY_ICON_MAP[icon] ?? CATEGORY_ICON_MAP.tag;
  const Icon = entry.icon;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border",
        size === "sm" && "size-7",
        size === "md" && "size-9",
        size === "lg" && "size-11 rounded-xl",
        className,
      )}
      style={{
        backgroundColor: `${color}16`,
        borderColor: `${color}30`,
        color,
      }}
    >
      <Icon
        className={cn(
          size === "sm" && "size-3.5",
          size === "md" && "size-4",
          size === "lg" && "size-5",
        )}
      />
    </span>
  );
}
