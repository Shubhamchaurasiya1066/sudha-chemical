function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function FinancialChart({ purchase, sale }) {
  const values = [
    { label: "Purchases", value: Number(purchase) || 0, color: "bg-violet-500" },
    { label: "Sales", value: Number(sale) || 0, color: "bg-blue-500" },
  ];
  const maximum = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="flex h-full flex-col justify-center gap-10 px-2 sm:px-6">
      {values.map((item) => {
        const width = item.value > 0 ? Math.max((item.value / maximum) * 100, 3) : 0;

        return (
          <div key={item.label}>
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-300">{item.label}</span>
              <span className="font-bold text-white">{formatCurrency(item.value)}</span>
            </div>
            <div className="h-8 overflow-hidden rounded-lg bg-slate-800">
              <div
                className={`h-full rounded-lg ${item.color} transition-[width] duration-500`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
