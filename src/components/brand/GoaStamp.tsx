import { cn } from "@/lib/utils";

type GoaStampProps = {
  className?: string;
};

export function GoaStamp({ className }: GoaStampProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none drop-shadow-[3px_3px_0_rgba(13,40,32,0.35)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 148 92"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-visible"
      >
        <path
          d="M22 16
             C10 20 7 34 10 48
             C13 66 24 80 48 84
             C70 88 98 86 118 76
             C136 66 142 50 138 34
             C134 16 120 8 94 7
             C68 6 40 10 22 16 Z"
          fill="none"
          stroke="#E63888"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          d="M28 22
             C18 26 16 36 18 48
             C21 64 32 74 52 77
             C72 80 96 78 114 70
             C128 62 132 50 129 36
             C126 22 114 16 92 16
             C68 16 42 17 28 22 Z"
          fill="none"
          stroke="#E63888"
          strokeWidth="1.1"
          strokeOpacity="0.55"
          strokeLinejoin="round"
        />
        <text
          x="74"
          y="56"
          textAnchor="middle"
          fill="#E63888"
          fontFamily="var(--font-baloo), 'Noto Sans Devanagari', sans-serif"
          fontSize="34"
          fontWeight="800"
          letterSpacing="1"
        >
          गोवा
        </text>
      </svg>
    </div>
  );
}
