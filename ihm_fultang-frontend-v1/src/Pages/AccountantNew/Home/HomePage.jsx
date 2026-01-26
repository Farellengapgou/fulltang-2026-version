import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../../Router/appRouterPaths.js";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import StatCard from "../../../GlobalComponents/StatCard.jsx";
import QuickActionButton from "../../../GlobalComponents/QuickActionButton.jsx";
import { useState, useEffect } from "react";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import Loader from "../../../GlobalComponents/Loader";
import {
  financialReportService,
  accountingPeriodService,
} from "../../../Services/Accounting";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wallet,
  Landmark,
  TrendingUp,
  Calendar,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function DashBoard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bs, is, period] = await Promise.all([
          financialReportService.getBalanceSheet(),
          financialReportService.getIncomeStatement(),
          accountingPeriodService.getCurrentPeriod(),
        ]);

        setBalanceSheet(bs.data);
        setIncomeStatement(is.data);
        setCurrentPeriod(period.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader size="medium" color="primary-end" />;

  if (error) {
    return (
      <CustomDashboard
        linkList={FinancialAccountantNavLink}
        requiredRole={"Accountant"}
      >
        <FinancialAccountantNavBar />
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </CustomDashboard>
    );
  }

  const totalAssets =
    balanceSheet?.assets?.reduce((sum, a) => sum + a.balance, 0) || 0;
  const totalLiabilities =
    balanceSheet?.liabilities?.reduce((sum, l) => sum + l.balance, 0) || 0;
  const totalEquity =
    balanceSheet?.equity?.reduce((sum, e) => sum + e.balance, 0) || 0;
  const totalRevenue = incomeStatement?.total_revenue || 0;
  const totalExpense = incomeStatement?.total_expense || 0;
  const netIncome = incomeStatement?.net_income || 0;

  const balanceChartData = [
    { name: "Assets", value: totalAssets },
    { name: "Liabilities", value: totalLiabilities },
    { name: "Equity", value: totalEquity },
  ];

  const incomeChartData = [
    { name: "Revenue", value: totalRevenue },
    { name: "Expenses", value: totalExpense },
  ];

  const COLORS = ["#4DB6AC", "#FF6B6B", "#4ECDC4"];

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Accounting Dashboard</h1>
          <p className="opacity-90 font-semibold text-md">
            Financial overview for period {currentPeriod?.month}/
            {currentPeriod?.year}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Wallet}
            title="Total Assets"
            value={totalAssets.toLocaleString() + " FCFA"}
            description="Current assets"
            color="bg-blue-500"
          />
          <StatCard
            icon={Landmark}
            title="Total Liabilities"
            value={totalLiabilities.toLocaleString() + " FCFA"}
            description="Current liabilities"
            color="bg-red-500"
          />
          <StatCard
            icon={DollarSign}
            title="Equity"
            value={totalEquity.toLocaleString() + " FCFA"}
            description="Owner's equity"
            color="bg-teal-500"
          />
          <StatCard
            icon={netIncome >= 0 ? TrendingUp : TrendingDown}
            title="Net Income"
            value={netIncome.toLocaleString() + " FCFA"}
            description={netIncome >= 0 ? "Profit" : "Loss"}
            color={netIncome >= 0 ? "bg-green-500" : "bg-orange-500"}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Sheet Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Balance Sheet Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={balanceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {balanceChartData.map((entry, index) => (
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

          {/* Income Statement Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Revenue vs Expenses
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4DB6AC" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Assets</h3>
            </div>
            <div className="space-y-3">
              {balanceSheet?.assets?.map((asset) => (
                <div
                  key={asset.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <div>
                    <p className="text-xs text-gray-500">{asset.code}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {asset.label}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-secondary">
                    {asset.balance.toLocaleString()}
                  </p>
                </div>
              ))}
              {balanceSheet?.assets?.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No assets recorded
                </p>
              )}
            </div>
          </div>

          {/* Liabilities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownRight className="text-red-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Liabilities</h3>
            </div>
            <div className="space-y-3">
              {balanceSheet?.liabilities?.map((liability) => (
                <div
                  key={liability.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <div>
                    <p className="text-xs text-gray-500">{liability.code}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {liability.label}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-secondary">
                    {liability.balance.toLocaleString()}
                  </p>
                </div>
              ))}
              {balanceSheet?.liabilities?.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No liabilities recorded
                </p>
              )}
            </div>
          </div>

          {/* Equity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="text-teal-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Equity</h3>
            </div>
            <div className="space-y-3">
              {balanceSheet?.equity?.map((eq) => (
                <div
                  key={eq.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <div>
                    <p className="text-xs text-gray-500">{eq.code}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {eq.label}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-secondary">
                    {eq.balance.toLocaleString()}
                  </p>
                </div>
              ))}
              {balanceSheet?.equity?.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No equity recorded
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={Calendar}
              label="Périodes Comptables"
              onClick={() => navigate(AppRouterPaths.periodClose)}
            />
            <QuickActionButton
              icon={Wallet}
              label="View Accounts"
              onClick={() => navigate(AppRouterPaths.cashPositions)}
            />
            <QuickActionButton
              icon={DollarSign}
              label="Ecriture Comptable"
              onClick={() =>
                navigate(AppRouterPaths.financialAccountantJournalEntries)
              }
            />
            <QuickActionButton
              icon={TrendingUp}
              label="Reports"
              onClick={() => navigate(AppRouterPaths.financialStatements)}
            />
          </div>
        </div>
      </div>
    </CustomDashboard>
  );
}
