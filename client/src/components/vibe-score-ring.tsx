interface VibeScoreRingProps {
  score: number;
  size?: number;
}

export function VibeScoreRing({ score, size = 48 }: VibeScoreRingProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(score) ? circumference : circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="w-full h-full vibe-score-ring" 
        viewBox="0 0 40 40"
        data-testid={`vibe-score-ring-${score}`}
      >
        <circle 
          cx="20" 
          cy="20" 
          r={radius} 
          fill="none" 
          stroke="hsl(30, 15%, 92%)" 
          strokeWidth="3"
        />
        <circle 
          cx="20" 
          cy="20" 
          r={radius} 
          fill="none" 
          stroke="hsl(40, 90%, 50%)" 
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" data-testid={`text-vibe-score-${score}`}>
          {isNaN(score) ? '0' : score}
        </span>
      </div>
    </div>
  );
}
