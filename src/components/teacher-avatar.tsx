import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-[#dce5dc] to-[#b5c8b9]",
  "from-[#ece4d7] to-[#d2c0a4]",
  "from-[#dce4e7] to-[#b7c5ca]",
  "from-[#e5e1e9] to-[#c7c1d0]",
  "from-[#e5e7df] to-[#c4cbbb]",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr"))
    .join("");
}

export function TeacherAvatar({
  name,
  photoUrl,
  size = "md",
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass = {
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-4xl",
  }[size];
  const gradient = GRADIENTS[name.length % GRADIENTS.length];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn("shrink-0 rounded-2xl object-cover", sizeClass, className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-display font-semibold text-[#34443a]",
        gradient,
        sizeClass,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
