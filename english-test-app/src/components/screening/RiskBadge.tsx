const CONFIG = {
  low: {
    label: "خطورة منخفضة",
    sub: "لا مؤشرات ملحوظة",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "خطورة متوسطة",
    sub: "يُنصح بمتابعة مختص",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  high: {
    label: "خطورة مرتفعة",
    sub: "يُنصح بإحالة لأخصائي",
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

export function RiskBadge({
  riskBand,
  score,
}: {
  riskBand: "low" | "medium" | "high";
  score: number;
}) {
  const c = CONFIG[riskBand];
  return (
    <div className={`${c.bg} ${c.border} border-2 rounded-2xl p-6 text-center`}>
      <div className={`w-4 h-4 ${c.dot} rounded-full mx-auto mb-3`} />
      <div className={`text-4xl font-black ${c.text} mb-1`}>
        {Math.round(score)}%
      </div>
      <div className={`text-lg font-bold ${c.text}`}>{c.label}</div>
      <div className={`text-sm ${c.text} opacity-80 mt-1`}>{c.sub}</div>
    </div>
  );
}
