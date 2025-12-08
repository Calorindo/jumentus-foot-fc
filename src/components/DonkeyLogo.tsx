const DonkeyLogo = ({ className = "w-16 h-16" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="50" cy="60" rx="25" ry="20" fill="hsl(var(--primary))" />
      
      {/* Head */}
      <ellipse cx="50" cy="35" rx="18" ry="15" fill="hsl(var(--primary))" />
      
      {/* Snout */}
      <ellipse cx="50" cy="42" rx="10" ry="8" fill="hsl(var(--primary-foreground))" />
      <ellipse cx="50" cy="44" rx="8" ry="5" fill="hsl(var(--muted))" />
      
      {/* Nostrils */}
      <circle cx="46" cy="44" r="1.5" fill="hsl(var(--foreground))" />
      <circle cx="54" cy="44" r="1.5" fill="hsl(var(--foreground))" />
      
      {/* Eyes */}
      <ellipse cx="42" cy="32" rx="4" ry="5" fill="hsl(var(--primary-foreground))" />
      <ellipse cx="58" cy="32" rx="4" ry="5" fill="hsl(var(--primary-foreground))" />
      <circle cx="42" cy="33" r="2.5" fill="hsl(var(--foreground))" />
      <circle cx="58" cy="33" r="2.5" fill="hsl(var(--foreground))" />
      <circle cx="41" cy="32" r="1" fill="hsl(var(--primary-foreground))" />
      <circle cx="57" cy="32" r="1" fill="hsl(var(--primary-foreground))" />
      
      {/* Left Ear */}
      <path
        d="M30 28 L22 8 L38 22 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--burgundy-dark))"
        strokeWidth="1"
      />
      <path
        d="M32 25 L26 12 L36 22 Z"
        fill="hsl(var(--secondary))"
      />
      
      {/* Right Ear */}
      <path
        d="M70 28 L78 8 L62 22 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--burgundy-dark))"
        strokeWidth="1"
      />
      <path
        d="M68 25 L74 12 L64 22 Z"
        fill="hsl(var(--secondary))"
      />
      
      {/* Mane */}
      <path
        d="M42 20 Q50 15 58 20"
        stroke="hsl(var(--burgundy-dark))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Legs */}
      <rect x="32" y="72" width="6" height="18" rx="3" fill="hsl(var(--primary))" />
      <rect x="42" y="72" width="6" height="18" rx="3" fill="hsl(var(--primary))" />
      <rect x="52" y="72" width="6" height="18" rx="3" fill="hsl(var(--primary))" />
      <rect x="62" y="72" width="6" height="18" rx="3" fill="hsl(var(--primary))" />
      
      {/* Hooves */}
      <rect x="31" y="86" width="8" height="4" rx="2" fill="hsl(var(--foreground))" />
      <rect x="41" y="86" width="8" height="4" rx="2" fill="hsl(var(--foreground))" />
      <rect x="51" y="86" width="8" height="4" rx="2" fill="hsl(var(--foreground))" />
      <rect x="61" y="86" width="8" height="4" rx="2" fill="hsl(var(--foreground))" />
      
      {/* Tail */}
      <path
        d="M75 55 Q85 50 82 65 Q80 75 85 80"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M83 78 Q88 82 85 88 Q82 92 88 94"
        stroke="hsl(var(--burgundy-dark))"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Soccer ball marking */}
      <circle cx="55" cy="58" r="6" fill="hsl(var(--primary-foreground))" />
      <path
        d="M55 52 L57 55 L55 58 L52 55 Z"
        fill="hsl(var(--foreground))"
      />
      <path
        d="M55 64 L57 61 L55 58 L52 61 Z"
        fill="hsl(var(--foreground))"
      />
      
      {/* Smile */}
      <path
        d="M44 47 Q50 51 56 47"
        stroke="hsl(var(--foreground))"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default DonkeyLogo;
