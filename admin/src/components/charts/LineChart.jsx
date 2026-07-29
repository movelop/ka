import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStateContext } from "../../context/ContextProvider";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const formatNGN = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Accepts aggregation _id shapes:
 *  - { year: 2026, month: 7 }
 *  - { year: 2026 }
 *  - number (legacy)
 * Returns { label: string, year: number|null, month: number|null }
 */
const parseBucket = (id) => {
  if (id == null) return { label: "—", year: null, month: null };
  if (typeof id === "number") return { label: String(id), year: id, month: null };
  if (typeof id === "object") {
    const year = typeof id.year === "number" ? id.year : (typeof id._id === "number" ? id._id : null);
    const month = typeof id.month === "number" ? id.month : null;
    if (month && year) return { label: `${MONTHS[month - 1] ?? "—"} ${year}`, year, month };
    if (year) return { label: String(year), year, month: null };
  }
  return { label: "—", year: null, month: null };
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div
      className="
        bg-white dark:bg-[#2d3139]
        border border-gray-100 dark:border-gray-700/50
        rounded-xl shadow-xl
        px-4 py-3 text-xs
      "
    >
      <p className="text-gray-400 dark:text-gray-500 mb-1 font-medium">{label}</p>
      <p className="text-gray-800 dark:text-gray-100 font-bold text-sm">
        {formatNGN(point.value)}
      </p>
      {point.payload?.count !== undefined && (
        <p className="text-gray-400 dark:text-gray-500 mt-1">
          {point.payload.count} payments
        </p>
      )}
    </div>
  );
};

// ─── Custom Dot ───────────────────────────────────────────────────────────────

const CustomDot = ({ cx, cy, payload, maxTotal, currentColor }) => {
  const isMax = payload.total === maxTotal;
  if (!isMax) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={currentColor} />
      <circle cx={cx} cy={cy} r={10} fill={currentColor} fillOpacity={0.18} />
    </g>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LineChart = ({ data = [] }) => {
  const { currentMode, currentColor } = useStateContext();
  const isDark = currentMode === "Dark";

  // Normalize incoming aggregation items to { name, total, count }
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      // Prefer totalCollected (monthly/collected), fallback to total (legacy alias)
      const total = Number(item.totalCollected ?? item.total ?? 0);
      const count = Number(item.countPayments ?? item.count ?? 0);
      const parsed = parseBucket(item._id ?? item);
      return {
        name: parsed.label,
        total,
        count,
        // keep raw _id for any further needs
        _id: item._id ?? item,
      };
    });
  }, [data]);

  const maxTotal = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.max(...chartData.map((d) => d.total), 0);
  }, [chartData]);

  const gridColor = isDark ? "#33373E" : "#f3f4f6";
  const axisColor = isDark ? "#6b7280" : "#9ca3af";

  if (!chartData.length) {
    return (
      <div style={{ width: "100%", height: 280 }} className="flex items-center justify-center">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={currentColor} stopOpacity={0} />
            </linearGradient>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

          <XAxis
            dataKey="name"
            tick={{ fill: axisColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("en-NG", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v)
            }
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: currentColor,
              strokeWidth: 1,
              strokeDasharray: "4 4",
              strokeOpacity: 0.5,
            }}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke={currentColor}
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            fillOpacity={1}
            filter="url(#lineGlow)"
            dot={(props) => (
              <CustomDot {...props} maxTotal={maxTotal} currentColor={currentColor} />
            )}
            activeDot={{
              r: 5,
              fill: currentColor,
              stroke: isDark ? "#2d3139" : "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
