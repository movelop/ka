import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#03C9D7", "#FB9678", "#8BE78B", "#FF8042"];

const Piechart = ({ data }) => {
  const pieChartData = data.map((item) => ({
    name: item._id,        // year
    value: item.total,    // or item.count
  }));

  return (
    <div className="w-full h-[180px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={5}
            dataKey="value"
          >
            {pieChartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Piechart;
