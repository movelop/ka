import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ["#03C9D7", "#FB9678", "#8BE78B", "#FF8042"];

const formatNGN = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white text-gray-800 text-xs rounded-lg shadow-lg px-3 py-2">
      <p className="font-semibold mb-1">{name}</p>
      <p>{formatNGN(value)}</p>
    </div>
  );
};

// ─── Custom Legend ────────────────────────────────────────────────────────────

const CustomLegend = ({ payload }) => (
  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
    {payload.map((entry) => (
      <li key={entry.value} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        {entry.value}
      </li>
    ))}
  </ul>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Piechart = ({ data = [] }) => {
  const pieChartData = useMemo(() =>
    data.map((item) => ({
      name: item._id,
      value: item.total,
    })),
  [data]);

  if (!pieChartData.length) {
    return (
      <div className="w-full h-[180px] flex items-center justify-center">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[200px] overflow-hidden">
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
            strokeWidth={0}
          >
            {pieChartData.map((_, index) => (
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