import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = "light",
  showTagline = false,
  compact = false,
  className,
}: BrandLogoProps) {
  const isDarkSurface = variant === "dark";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border",
          isDarkSurface
            ? "border-emerald-400/20 bg-white/8"
            : "border-brand-dark/10 bg-brand-dark",
        )}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="13"
            width="4.2"
            height="7"
            rx="1.5"
            fill="#34D399"
            fillOpacity="0.45"
          />
          <rect
            x="9.9"
            y="8.5"
            width="4.2"
            height="11.5"
            rx="1.5"
            fill="#059669"
          />
          <rect
            x="16.8"
            y="4"
            width="4.2"
            height="16"
            rx="1.5"
            fill="#34D399"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-lg font-semibold tracking-tight",
              isDarkSurface ? "text-white" : "text-brand-dark",
            )}
          >
            Fin<span className="text-brand-primary">Track</span>
          </span>
          {showTagline && (
            <span
              className={cn(
                "mt-0.5 text-[11px] font-medium",
                isDarkSurface ? "text-emerald-100/75" : "text-muted-foreground",
              )}
            >
              Tus finanzas, bajo control
            </span>
          )}
        </span>
      )}
    </span>
  );
}
