import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../hooks/api";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { FiBarChart } from "react-icons/fi";

import { useStateContext } from "../context/ContextProvider";
import { AuthContext } from "../context/AuthContextProvider";
import { MonthyBarChart, LineChart, Piechart, Table } from "../components";

const Home = () => {
  const { currentColor } = useStateContext();
  const { user } = useContext(AuthContext);

  const [income, setIncome] = useState([]);
  const [perc, setPerc] = useState(0);

  const [yearlyIncome, setYearlyIncome] = useState([]);
  const [yearlyPerc, setYearlyPerc] = useState(0);

  const calculatePercentage = (current, previous) => {
  if (previous === 0 && current === 0) return 0; // nothing happened
  if (previous === 0 && current > 0) return 100; // all new
  return ((current - previous) / previous) * 100;
};


  const MONTHS = useMemo(
    () => [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ],
    []
  );

  /* ================= MONTHLY INCOME ================= */
  useEffect(() => {
    if (!user?.token) return;

    const getIncome = async () => {
      try {
        const res = await api.get("/bookings/income/month", {
          headers: { token: `Bearer ${user.token}` },
        });

        const data = res.data?.income || [];
        setIncome(data);
        

        if (income.length >= 2) {
          const percentage = calculatePercentage(income[0].count, income[1].count);
          setPerc(percentage.toFixed(2));
        } else if (income.length === 1) {
          // only current month exists, previous month = 0
          const percentage = calculatePercentage(income[0].count, 0);
          setPerc(percentage.toFixed(2));
        } else {
          setPerc(0);
        }
      } catch (err) {
        console.error("Monthly income error:", err);
      }
    };

    getIncome();
  }, [user?.token]);

  /* ================= YEARLY INCOME ================= */
  useEffect(() => {
    if (!user?.token) return;

    const getYearlyIncome = async () => {
      try {
        const res = await api.get("/bookings/income/year", {
          headers: { token: `Bearer ${user.token}` },
        });

        const data = res.data?.income || [];
        setYearlyIncome(data);
        

        if (yearlyIncome.length >= 2) {
          const percentage = calculatePercentage(yearlyIncome[0].total, yearlyIncome[1].total);
          setYearlyPerc(percentage.toFixed(2));
        } else if (yearlyIncome.length === 1) {
          const percentage = calculatePercentage(yearlyIncome[0].total, 0);
          setYearlyPerc(percentage.toFixed(2));
        } else {
          setYearlyPerc(0);
        }
      } catch (err) {
        console.error("Yearly income error:", err);
      }
    };

    getYearlyIncome();
  }, [user?.token]);

  return (
    <div className="mt-24 w-full overflow-hidden">

      {/* ================= TOP CARDS ================= */}
      <div className="flex flex-wrap justify-center gap-4 max-w-full overflow-hidden">

        {/* Earnings */}
        <div className="bg-white dark:bg-secondary-bg rounded-xl w-full max-w-[320px] p-6">
          <p className="font-bold text-gray-400">Earnings</p>
          <p className="text-2xl flex items-center font-semibold">
            <TbCurrencyNaira />
            {income[0]?.total?.toLocaleString("en-us") || 0}
          </p>
        </div>

        {/* Monthly */}
        <div className="bg-white dark:bg-secondary-dark-bg rounded-xl w-full max-w-[220px] p-4">
          <MdOutlineSupervisorAccount className="text-3xl text-cyan-500" />
          <p className="mt-3 text-lg font-semibold">
            {income[0]?.count || 0}
            <span
              className={`ml-2 text-sm ${
                perc < 0 ? "text-red-800" : "text-green-800"
              }`}
            >
              {perc}%
            </span>
          </p>
          <p className="text-sm text-gray-400">
            {MONTHS[income[0]?._id - 1]} Reservations
          </p>
        </div>

        {/* Yearly */}
        <div className="bg-white dark:bg-secondary-dark-bg rounded-xl w-full max-w-[220px] p-4">
          <FiBarChart className="text-3xl text-pink-500" />
          <p className="mt-3 text-lg font-semibold">
            {yearlyIncome[0]?.count || 0}
            <span
              className={`ml-2 text-sm ${
                yearlyPerc < 0 ? "text-red-800" : "text-green-800"
              }`}
            >
              {yearlyPerc}%
            </span>
          </p>
          <p className="text-sm text-gray-400">
            {yearlyIncome[0]?._id} Reservations
          </p>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 max-w-full overflow-hidden">

        <div
          className="rounded-2xl w-full max-w-[420px] p-4"
          style={{ backgroundColor: currentColor }}
        >
          <p className="text-white text-xl font-semibold mb-2">Earnings</p>
          <MonthyBarChart data={income}/>
        </div>

        <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl w-full max-w-[420px] p-4">
          <p className="text-xl font-semibold mb-2">Yearly Revenue</p>
          <Piechart data={yearlyIncome} />
        </div>
      </div>

      {/* ================= LINE CHART ================= */}
      <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl w-full max-w-[760px] mx-auto mt-6 p-4 overflow-hidden">
        <p className="text-xl font-semibold mb-4">Bookings Overview</p>
        <LineChart data={yearlyIncome} />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl w-full max-w-[760px] mx-auto mt-6 p-4 overflow-hidden">
        <p className="text-xl font-semibold mb-4">Recent Transactions</p>
        <Table />
      </div>
    </div>
  );
};

export default Home;
