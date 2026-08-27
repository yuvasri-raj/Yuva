import React from 'react';

interface HealthMeterProps {
  score: number; // 0 - 100
  title?: string;
  rating?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HealthMeter: React.FC<HealthMeterProps> = ({
  score,
  title = 'Health Score',
  rating,
  size = 'md'
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Color logic
  let color = '#ef4444'; // Red
  let textClass = 'text-rose-600';
  let bgClass = 'bg-rose-50 border-rose-200';

  if (clampedScore >= 80) {
    color = '#059669'; // Emerald-600
    textClass = 'text-emerald-600';
    bgClass = 'bg-emerald-50 border-emerald-200';
  } else if (clampedScore >= 60) {
    color = '#0d9488'; // Teal
    textClass = 'text-teal-600';
    bgClass = 'bg-teal-50 border-teal-200';
  } else if (clampedScore >= 40) {
    color = '#f59e0b'; // Amber
    textClass = 'text-amber-600';
    bgClass = 'bg-amber-50 border-amber-200';
  }

  const radius = size === 'lg' ? 48 : size === 'md' ? 36 : 24;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div id="health-meter-container" className="flex items-center gap-4">
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className="transform -rotate-90"
          width={radius * 2 + strokeWidth * 2}
          height={radius * 2 + strokeWidth * 2}
        >
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-xs'} ${textClass}`}>
            {clampedScore}
          </span>
          <span className="text-[9px] font-bold text-slate-400 -mt-1">/100</span>
        </div>
      </div>

      {/* Text Info */}
      <div>
        <h4 className="text-xs font-bold text-slate-600">{title}</h4>
        {rating && (
          <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-md border ${bgClass} ${textClass}`}>
            {rating}
          </span>
        )}
      </div>
    </div>
  );
};
