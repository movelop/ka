import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#03C9D7", "#FB9678", "#8BE78B", "#FF8042"];

const formatNGN = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

/**
 * Accepts aggregation _id shapes:
 *  - { year: 2026, month: 7 }
 *  - { year: 2026 }
 *  - number (legacy)
 * Returns a human friendly label like "Jul 2026" or "2026"
 */
const bucketLabel = (id) => {
  if (id == null) return "—";
  if (typeof id === "number") return String(id);
  if (typeof id === "object") {
    const year = typeof id.year === "number" ? id.year : (typeof id._id === "number" ? id._id : null);
    const month = typeof id.month === "number" ? id.month : null;
    if (month && year) return `${MONTHS[month - 1] ?? "—"} ${year}`;
    if (month) return MONTHS[month - 1] ?? "—";
    if (year) return String(year);
  }
  return "—";
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0];

  return (
    <div className="bg-white dark:bg-[#2d3139] text-xs rounded-xl shadow-xl px-3 py-2.5 border border-gray-100 dark:border-gray-700/50">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{name}</p>
      <p className="text-gray-500 dark:text-gray-400">{formatNGN(value)}</p>
      <p className="text-gray-400 dark:text-gray-500 mt-0.5">
        {percent != null ? (percent * 100).toFixed(1) : "—"}% of total
      </p>
    </div>
  );
};

// ─── Custom Legend ────────────────────────────────────────────────────────────

const CustomLegend = ({ payload = [] }) => (
  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
    {payload.map((entry) => (
      <li
        key={entry.value + entry.color}
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
      >
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        {entry.value}
      </li>
    ))}
  </ul>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Piechart = ({ data = [] }) => {
  // Normalize incoming aggregation items to { name, value }
  const pieChartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      // Prefer totalCollected, fallback to total (legacy alias), fallback to item.total
      const value = Number(item.totalCollected ?? item.total ?? item.value ?? 0);
      const name = bucketLabel(item._id ?? item);
      return { name, value };
    }).filter(d => d.value !== 0); // optionally hide zero slices
  }, [data]);

  if (!pieChartData.length) {
    return (
      <div className="w-full h-[180px] flex items-center justify-center">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="45%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={600}
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Piechart;
