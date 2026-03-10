import { useState, useEffect, useCallback, useContext } from "react";
import api from "../hooks/api";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { FiBarChart } from "react-icons/fi";

import { useStateContext } from "../context/ContextProvider";
import { AuthContext } from "../context/AuthContextProvider";
import { MonthyBarChart, LineChart, Piechart, Table } from "../components";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calculatePercentage = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0 && current > 0) return 100;
  return ((current - previous) / previous) * 100;
};

const derivePercentage = (data, key) => {
  if (data.length >= 2) return calculatePercentage(data[0][key], data[1][key]).toFixed(2);
  if (data.length === 1) return calculatePercentage(data[0][key], 0).toFixed(2);
  return 0;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon, value, percentage, label }) => (
  <div className="bg-white dark:bg-secondary-dark-bg rounded-xl w-full max-w-[220px] p-4">
    <div className="text-3xl">{icon}</div>
    <p className="mt-3 text-lg font-semibold">
      {value}
      <span className={`ml-2 text-sm ${Number(percentage) < 0 ? "text-red-800" : "text-green-800"}`}>
        {percentage}%
      </span>
    </p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Home = () => {
  const { currentColor } = useStateContext();
  const { user } = useContext(AuthContext);

  const [income, setIncome] = useState([]);
  const [yearlyIncome, setYearlyIncome] = useState([]);
  const [error, setError] = useState(null);

  const authHeaders = { headers: { token: `Bearer ${user?.token}` } };

  /* ── Fetch monthly income ── */
  const fetchMonthlyIncome = useCallback(async () => {
    try {
      const res = await api.get("/bookings/income/month", authHeaders);
      setIncome(res.data?.income || []);
    } catch (err) {
      console.error("Monthly income error:", err);
      setError("Failed to load monthly income.");
    }
  }, [user?.token]);

  /* ── Fetch yearly income ── */
  const fetchYearlyIncome = useCallback(async () => {
    try {
      const res = await api.get("/bookings/income/year", authHeaders);
      setYearlyIncome(res.data?.income || []);
    } catch (err) {
      console.error("Yearly income error:", err);
      setError("Failed to load yearly income.");
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return;
    fetchMonthlyIncome();
    fetchYearlyIncome();
  }, [user?.token, fetchMonthlyIncome, fetchYearlyIncome]);

  // Derive percentages directly from state (no stale-closure bug)
  const monthlyPerc = derivePercentage(income, "count");
  const yearlyPerc  = derivePercentage(yearlyIncome, "count");

  return (
    <div className="mt-24 w-full overflow-hidden">

      {error && (
        <p role="alert" className="text-center text-sm text-red-500 mb-4">{error}</p>
      )}

      {/* ── Top Cards ── */}
      <div className="flex flex-wrap justify-center gap-4 max-w-full overflow-hidden">

        {/* Earnings */}
        <div className="bg-white dark:bg-secondary-bg rounded-xl w-full max-w-[320px] p-6">
          <p className="font-bold text-gray-400">Earnings</p>
          <p className="text-2xl flex items-center font-semibold">
            <TbCurrencyNaira />
            {income[0]?.total?.toLocaleString("en-us") ?? 0}
          </p>
        </div>

        <StatCard
          icon={<MdOutlineSupervisorAccount className="text-cyan-500" />}
          value={income[0]?.count ?? 0}
          percentage={monthlyPerc}
          label={`${MONTHS[(income[0]?._id ?? 1) - 1] ?? "—"} Reservations`}
        />

        <StatCard
          icon={<FiBarChart className="text-pink-500" />}
          value={yearlyIncome[0]?.count ?? 0}
          percentage={yearlyPerc}
          label={`${yearlyIncome[0]?._id ?? "—"} Reservations`}
        />
      </div>

      {/* ── Charts ── */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 max-w-full overflow-hidden">
        <div
          className="rounded-2xl w-full max-w-[420px] p-4"
          style={{ backgroundColor: currentColor }}
        >
          <p className="text-white text-xl font-semibold mb-2">Earnings</p>
          <MonthyBarChart data={income} />
        </div>

        <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl w-full max-w-[420px] p-4">
          <p className="text-xl font-semibold mb-2">Yearly Revenue</p>
          <Piechart data={yearlyIncome} />
        </div>
      </div>

      {/* ── Line Chart ── */}
      <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl w-full max-w-[760px] mx-auto mt-6 p-4 overflow-hidden">
        <p className="text-xl font-semibold mb-4">Bookings Overview</p>
        <LineChart data={yearlyIncome} />
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl w-full max-w-[760px] mx-auto mt-6 p-4 overflow-hidden">
        <p className="text-xl font-semibold mb-4">Recent Transactions</p>
        <Table />
      </div>

    </div>
  );
};

export default Home;