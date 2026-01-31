import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const MonthlyBarChart = ({ data = [] }) => {
  // 🔁 Transform API data → Recharts format
  const chartData = data.map((item) => ({
    name: MONTHS[item._id.month - 1],
    total: item.total,
  }));

  return (
    // ✅ HEIGHT IS MANDATORY
    <div className="w-full h-[140px] min-h-[140px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#fff", fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(value)
            }
          />
          <Bar
            dataKey="total"
            fill="rgb(242,252,253)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
