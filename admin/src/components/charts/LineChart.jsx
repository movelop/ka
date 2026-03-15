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

const formatNGN = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
        {formatNGN(payload[0].value)}
      </p>
      {payload[0].payload?.count !== undefined && (
        <p className="text-gray-400 dark:text-gray-500 mt-1">
          {payload[0].payload.count} bookings
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
      <circle cx={cx} cy={cy} r={10} fill={currentColor} fillOpacity={0.2} />
    </g>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LineChart = ({ data = [] }) => {
  const { currentMode, currentColor } = useStateContext();
  const isDark = currentMode === "Dark";

  const chartData = useMemo(() =>
    data.map((item) => ({
      year:  item._id,
      total: item.total,
      count: item.count,
    })),
  [data]);

  const maxTotal  = useMemo(() => Math.max(...chartData.map((d) => d.total), 0), [chartData]);
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
            {/* Main gradient fill */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={currentColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={currentColor} stopOpacity={0} />
            </linearGradient>
            {/* Glow filter on the stroke line */}
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />

          <XAxis
            dataKey="year"
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
              <CustomDot
                {...props}
                maxTotal={maxTotal}
                currentColor={currentColor}
              />
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