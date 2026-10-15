interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtext?: boolean;
  iconOnly?: boolean;
  variant?: "dark" | "light";
}

export function Logo({
  className = "",
  size = "md",
  showSubtext = true,
  iconOnly = false,
  variant = "dark",
}: LogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  const titleSize = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <svg
        className={`${iconDimensions} shrink-0 drop-shadow-2xs`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Hexagonal Shield with Rounded Corners */}
        <path
          d="M24 3L40 9V23C40 33 33 41 24 45C15 41 8 33 8 23V9L24 3Z"
          fill="#0B3D1B"
          stroke="#D97706"
          strokeWidth="1.5"
        />

        {/* Inner Contour Accent */}
        <path
          d="M24 6.5L37 11.5V23C37 31.5 31.2 38.3 24 41.8C16.8 38.3 11 31.5 11 23V11.5L24 6.5Z"
          stroke="#1E5C2D"
          strokeWidth="1"
          fill="#0F4A22"
        />

        {/* Dynamic Agricultural Soil Furrow Arcs */}
        <path
          d="M14 36C17 33 21 32 24 32C27 32 31 33 34 36"
          stroke="#D97706"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M16 31C18.5 28.5 21.5 28 24 28C26.5 28 29.5 28.5 32 31"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 26C20 24 22 23.5 24 23.5C26 23.5 28 24 30 26"
          stroke="#34D399"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Central Sprouting Seedling & Golden Wheat Ear */}
        <path
          d="M24 32V14"
          stroke="#FFFFFF"
          strokeWidth="2.25"
          strokeLinecap="round"
        />

        {/* Left Sprout Leaf */}
        <path
          d="M24 21C19 20 17 14 19 11C23 11 24 16 24 21Z"
          fill="#34D399"
          stroke="#0B3D1B"
          strokeWidth="0.75"
        />

        {/* Right Golden Harvest Leaf / Wheat Grains */}
        <path
          d="M24 18C29 17 31 11 29 8C25 8 24 13 24 18Z"
          fill="#F59E0B"
          stroke="#0B3D1B"
          strokeWidth="0.75"
        />

        {/* Summit Golden Quality Pip / Star */}
        <circle cx="24" cy="9.5" r="1.5" fill="#FCD34D" />
      </svg>

      {/* Brand Wordmark & Tagline */}
      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight leading-none ${titleSize} ${
              variant === "light" ? "text-white" : "text-emerald-950"
            }`}
          >
            Furrowmark
          </span>
          {showSubtext && (
            <span
              className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                variant === "light" ? "text-emerald-300" : "text-gray-500"
              }`}
            >
              Agricultural Inputs Depot
            </span>
          )}
        </div>
      )}
    </div>
  );
}
