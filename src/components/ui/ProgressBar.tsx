interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden ${className || ""}`}>
      <div
        className="h-full bg-emerald-500 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
