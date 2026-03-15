import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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
    <div className="bg-white text-gray-800 text-xs rounded-lg shadow-lg px-3 py-2">
      <p className="font-semibold mb-1">{label}</p>
      <p>{formatNGN(payload[0].value)}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MonthlyBarChart = ({ data = [] }) => {
  const chartData = useMemo(() =>
    MONTHS.map((month, index) => {
      const monthData = data.find((d) => {
        if (typeof d._id === "number") return d._id === index + 1;
        if (typeof d._id === "object" && d._id?.month) return d._id.month === index + 1;
        return false;
      });
      if (!monthData) return null;
      return { name: month, total: monthData.total };
    }).filter(Boolean),
  [data]);

  const maxTotal = Math.max(...chartData.map((d) => d.total), 0);

  if (!chartData.length) {
    return (
      <div className="w-full h-[160px] flex items-center justify-center">
        <p className="text-white text-sm opacity-70">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[160px] overflow-hidden">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
      <XAxis
        dataKey="name"
        tick={{ fill: "#fff", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis hide domain={[0, maxTotal * 1.3]} />
      <Tooltip
        content={<CustomTooltip />}
        cursor={{ fill: "rgba(255,255,255,0.08)" }}
      />
      <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={true}>
        {chartData.map((entry) => (
          <Cell
            key={entry.name}
            fill={entry.total === maxTotal ? "#ffffff" : "rgba(242,252,253,0.55)"}
          />
        ))}
        <LabelList
          dataKey="total"
          position="top"
          formatter={formatNGN}
          fill="#fff"
          fontSize={9}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>
  );
};

export default MonthlyBarChart;