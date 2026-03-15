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
    <div className="w-full px-4 md:px-8 py-8 space-y-8">

  {/* Error */}
  {error && (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm">
      <MdOutlineCancel className="text-lg flex-shrink-0" />
      <p role="alert">{error}</p>
    </div>
  )}

  {/* ── Stat Cards ── */}
  <section>
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
      Overview
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* Earnings card */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden text-white"
        style={{ backgroundColor: currentColor }}
      >
        {/* Decorative circle */}
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-2 w-32 h-32 rounded-full bg-white/5" />

        <p className="text-sm font-medium text-white/70 mb-1">Total Earnings</p>
        <p className="text-3xl font-bold flex items-center gap-0.5 relative z-10">
          <TbCurrencyNaira />
          {income[0]?.total?.toLocaleString("en-us") ?? 0}
        </p>
        <p className="text-xs text-white/60 mt-2 relative z-10">
          {MONTHS[(income[0]?._id ?? 1) - 1] ?? "—"} · Current period
        </p>
      </div>

      {/* Monthly reservations */}
      <StatCard
        icon={<MdOutlineSupervisorAccount className="text-cyan-500" />}
        value={income[0]?.count ?? 0}
        percentage={monthlyPerc}
        label={`${MONTHS[(income[0]?._id ?? 1) - 1] ?? "—"} Reservations`}
      />

      {/* Yearly reservations */}
      <StatCard
        icon={<FiBarChart className="text-pink-500" />}
        value={yearlyIncome[0]?.count ?? 0}
        percentage={yearlyPerc}
        label={`${yearlyIncome[0]?._id ?? "—"} Reservations`}
      />
    </div>
  </section>

  {/* ── Charts row ── */}
  <section>
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
      Analytics
    </p>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Bar chart */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ backgroundColor: currentColor }}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <p className="text-white text-base font-semibold mb-1 relative z-10">Monthly Earnings</p>
        <p className="text-white/60 text-xs mb-4 relative z-10">Revenue breakdown by month</p>
        <div className="relative z-10">
          <MonthyBarChart data={income} />
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-6 border border-gray-100 dark:border-gray-700/40">
        <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Yearly Revenue</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">Distribution across years</p>
        <Piechart data={yearlyIncome} />
      </div>
    </div>
  </section>

  {/* ── Full-width charts ── */}
  <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

    {/* Line chart */}
    <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-6 border border-gray-100 dark:border-gray-700/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Bookings Overview</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Yearly booking trends</p>
        </div>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: currentColor }}
        >
          {yearlyIncome[0]?._id ?? "—"}
        </span>
      </div>
      <LineChart data={yearlyIncome} />
    </div>

    {/* Recent transactions */}
    <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-6 border border-gray-100 dark:border-gray-700/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Recent Transactions</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Latest booking activity</p>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
          Today
        </span>
      </div>
      <Table />
    </div>
  </section>

</div>
  );
};

export default Home;