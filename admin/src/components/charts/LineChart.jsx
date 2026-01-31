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

const LineChart = ({ data = [] }) => {
  const { currentMode, currentColor } = useStateContext();

  // 🔁 Transform API data → chart format
  const chartData = data.map((item) => ({
    year: item._id,
    total: item.total,
  }));

  return (
    // 🔴 HEIGHT IS REQUIRED FOR RECHARTS
    <div className="w-full h-[350px] min-h-[350px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="yearlyIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(value)
            }
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke={currentMode === "Dark" ? "#33373E" : "#FFFFFF"}
            fill="url(#yearlyIncome)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
