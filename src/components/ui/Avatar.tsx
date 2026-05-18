import { cn, initials } from "@/lib/cn";

export function Avatar({
  name,
  tone = "from-cyan-400 to-royal-600",
  size = 32,
  ring = false,
}: {
  name: string;
  tone?: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      className={cn(
        "grid place-items-center rounded-full bg-gradient-to-br font-bold text-white shrink-0",
        tone,
        ring && "ring-2 ring-[rgb(var(--bg-2))]"
      )}
    >
      {initials(name)}
    </div>
  );
}
