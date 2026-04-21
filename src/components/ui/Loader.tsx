import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

interface LoaderProps {
  title: string;
  description?: string;
  fullScreen?: boolean;
}

export function Loader({ title, description, fullScreen }: LoaderProps) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-8",
        fullScreen && "min-h-screen rounded-none border-none bg-[var(--bg)]"
      )}
    >
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="mx-auto mt-6 h-11 w-11 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--text)]" />
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
