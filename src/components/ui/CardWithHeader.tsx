import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardWithHeaderProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

export const CardWithHeader = ({
  title,
  subtitle,
  children,
  className,
  headerActions,
}: CardWithHeaderProps) => {
  return (
    <div className={cn("bg-card rounded-lg shadow-card overflow-hidden", className)}>
      <div className="card-header-gradient flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-primary-foreground/80 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};
