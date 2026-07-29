import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import api from "../hooks/api";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdOutlineSupervisorAccount, MdOutlineCancel } from "react-icons/md";
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
  return ((current - previous) / (previous || 1)) * 100;
};

const derivePercentage = (data, key) => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  if (data.length >= 2) return Number(calculatePercentage(Number(data[0][key] ?? 0), Number(data[1][key] ?? 0)).toFixed(2));
  return Number(calculatePercentage(Number(data[0][key] ?? 0), 0).toFixed(2));
};

/**
 * Parse aggregation _id shapes:
 * - { year: 2026, month: 7 }
 * - { year: 2026 }
 * - number (legacy)
 */
const parseBucketId = (id) => {
  if (id == null) return { year: null, month: null };
  if (typeof id === "number") return { year: id, month: null };
  if (typeof id === "object") {
    const year = typeof id.year === "number" ? id.year : (typeof id._id === "number" ? id._id : null);
    const month = typeof id.month === "number" ? id.month : null;
    return { year, month };
  }
  return { year: null, month: null };
};

const monthLabelFromBucket = (bucket) => {
  if (!bucket) return "—";
  const { year, month } = parseBucketId(bucket._id ?? bucket);
  if (month && year) return `${MONTHS[month - 1] ?? "—"} ${year}`;
  if (month) return MONTHS[month - 1] ?? "—";
  if (year) return String(year);
  return "—";
};

const yearLabelFromBucket = (bucket) => {
  if (!bucket) return "—";
  const { year } = parseBucketId(bucket._id ?? bucket);
  return year ? String(year) : "—";
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

  const [income, setIncome] = useState([]); // monthly collected buckets from API
  const [yearlyIncome, setYearlyIncome] = useState([]); // yearly collected buckets from API
  const [error, setError] = useState(null);

  const authHeaders = { headers: { token: `Bearer ${user?.token}` } };

  /* ── Fetch monthly income ── */
  const fetchMonthlyIncome = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/bookings/income/month", authHeaders);
      // API returns { income: [ { _id: { year, month }, totalCollected, countPayments }, ... ] }
      const data = Array.isArray(res.data?.income) ? res.data.income : [];
      // sort descending (latest first)
      const sorted = data.slice().sort((a, b) => {
        const ay = a._id?.year ?? 0;
        const am = a._id?.month ?? 0;
        const by = b._id?.year ?? 0;
        const bm = b._id?.month ?? 0;
        if (ay !== by) return by - ay;
        return bm - am;
      });
      setIncome(sorted);
    } catch (err) {
      console.error("Monthly income error:", err);
      setError("Failed to load monthly income.");
    }
  }, [user?.token]);

  /* ── Fetch yearly income ── */
  const fetchYearlyIncome = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/bookings/income/year", authHeaders);
      // API returns { income: [ { _id: { year }, totalCollected, countPayments }, ... ] }
      const data = Array.isArray(res.data?.income) ? res.data.income : [];
      const sorted = data.slice().sort((a, b) => {
        const ay = a._id?.year ?? (typeof a._id === "number" ? a._id : 0);
        const by = b._id?.year ?? (typeof b._id === "number" ? b._id : 0);
        return by - ay;
      });
      setYearlyIncome(sorted);
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

  // Derive percentages from collected series
  const monthlyPerc = derivePercentage(income, "totalCollected");
  const yearlyPerc  = derivePercentage(yearlyIncome, "totalCollected");

  const latestMonth = income[0] ?? null;
  const latestYear  = yearlyIncome[0] ?? null;

  // Prepare data for MonthyBarChart which expects `total` field for each month entry
  const barChartData = useMemo(() => {
    return income.map((row) => ({
      _id: row._id,
      name: (row._id && row._id.month) ? MONTHS[row._id.month - 1] : monthLabelFromBucket(row),
      total: Number(row.totalCollected ?? 0),
      countPayments: row.countPayments ?? 0,
    }));
  }, [income]);

  // Prepare data for LineChart / Piechart if they expect `total` field
  const yearlyChartData = useMemo(() => {
    return yearlyIncome.map((row) => ({
      _id: row._id,
      name: row._id?.year ?? row._id ?? "—",
      total: Number(row.totalCollected ?? 0),
      countPayments: row.countPayments ?? 0,
    }));
  }, [yearlyIncome]);

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

          {/* Collected earnings card */}
          <div
            className="relative rounded-2xl p-6 overflow-hidden text-white"
            style={{ backgroundColor: currentColor }}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -right-2 w-32 h-32 rounded-full bg-white/5" />

            <p className="text-sm font-medium text-white/70 mb-1">Total Collected</p>
            <p className="text-3xl font-bold flex items-center gap-0.5 relative z-10">
              <TbCurrencyNaira />
              {(latestMonth?.totalCollected ?? 0).toLocaleString("en-us")}
            </p>
            <p className="text-xs text-white/60 mt-2 relative z-10">
              {monthLabelFromBucket(latestMonth)} · Current period
            </p>
          </div>

          {/* Monthly payments count */}
          <StatCard
            icon={<MdOutlineSupervisorAccount className="text-cyan-500" />}
            value={latestMonth?.countPayments ?? 0}
            percentage={monthlyPerc}
            label={`${monthLabelFromBucket(latestMonth)} Payments`}
          />

          {/* Yearly collected */}
          <StatCard
            icon={<FiBarChart className="text-pink-500" />}
            value={(latestYear?.countPayments ?? 0).toLocaleString?.("en-us") ?? latestYear?.countPayments ?? 0}
            percentage={yearlyPerc}
            label={`${yearLabelFromBucket(latestYear)} Reservations`}
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
            <p className="text-white text-base font-semibold mb-1 relative z-10">Monthly Collected</p>
            <p className="text-white/60 text-xs mb-4 relative z-10">Payments received by month</p>
            <div className="relative z-10">
              <MonthyBarChart data={barChartData} />
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-6 border border-gray-100 dark:border-gray-700/40">
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Yearly Collected</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">Payments collected per year</p>
            <Piechart data={yearlyChartData} />
          </div>
        </div>
      </section>

      {/* ── Full-width charts ── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Line chart */}
        <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-6 border border-gray-100 dark:border-gray-700/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Collected Overview</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Yearly payments trend</p>
            </div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: currentColor }}
            >
              {yearLabelFromBucket(latestYear)}
            </span>
          </div>
          <LineChart data={yearlyChartData} />
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
