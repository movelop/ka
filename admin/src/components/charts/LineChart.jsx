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

// ─── Constants ────────────────────────────────────────────────────────────────

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
    <div className="bg-white dark:bg-secondary-dark-bg text-gray-800 dark:text-gray-200 text-xs rounded-lg shadow-lg px-3 py-2">
      <p className="font-semibold mb-1">{label}</p>
      <p>{formatNGN(payload[0].value)}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LineChart = ({ data = [] }) => {
  const { currentMode, currentColor } = useStateContext();

  const isDark = currentMode === "Dark";

  const chartData = useMemo(() =>
    data.map((item) => ({
      year: item._id,
      total: item.total,
    })),
  [data]);

  const gridColor   = isDark ? "#33373E" : "#e5e7eb";
  const axisColor   = isDark ? "#9ca3af" : "#6b7280";
  const strokeColor = isDark ? "#33373E" : "#ffffff";

  if (!chartData.length) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="yearlyIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={currentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={currentColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey="year"
            tick={{ fill: axisColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatNGN}
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="total"
            stroke={currentColor}
            strokeWidth={2}
            fill="url(#yearlyIncome)"
            fillOpacity={1}
            dot={{ fill: currentColor, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: currentColor, stroke: strokeColor, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;