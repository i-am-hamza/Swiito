import { cn } from "@/lib/utils/format";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}

export function Card({ children, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-surface rounded-lg border border-[var(--border)] shadow-card overflow-hidden",
        className
      )}
    >
      {children}
    </Tag>
  );
}
