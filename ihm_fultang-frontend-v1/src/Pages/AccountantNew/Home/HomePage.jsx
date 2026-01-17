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

export function DashBoard() {
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

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">Erreur: {error}</div>;

  const totalAssets =
    balanceSheet?.assets?.reduce((sum, a) => sum + a.balance, 0) || 0;
  const totalLiabilities =
    balanceSheet?.liabilities?.reduce((sum, l) => sum + l.balance, 0) || 0;
  const totalEquity =
    balanceSheet?.equity?.reduce((sum, e) => sum + e.balance, 0) || 0;
  const netIncome = incomeStatement?.net_income || 0;

  const chartData = [
    { name: "Actif", value: totalAssets },
    { name: "Passif", value: totalLiabilities },
    { name: "Capitaux", value: totalEquity },
  ];

  const incomeData = [
    { name: "Produits", value: incomeStatement?.total_revenue || 0 },
    { name: "Charges", value: incomeStatement?.total_expense || 0 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#10b981"];

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="p-6 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Tableau de Bord Comptable
          </h1>
          <p className="text-gray-600">
            Période: {currentPeriod?.month}/{currentPeriod?.year}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={() => <span>💰</span>} // Fournissez une icône
            title="Total Actif"
            value={totalAssets} // Envoyez un nombre, pas une string
            description="Valeur totale des actifs"
            color="blue"
          />
          <StatCard
            icon={() => <span>📋</span>}
            title="Total Passif"
            value={totalLiabilities}
            description="Valeur totale des passifs"
            color="red"
          />
          <StatCard
            icon={() => <span>🏛️</span>}
            title="Capitaux Propres"
            value={totalEquity}
            description="Valeur des capitaux propres"
            color="green"
          />
          <StatCard
            icon={() => <span>📈</span>}
            title="Résultat Net"
            value={netIncome}
            description={netIncome >= 0 ? "Bénéfice net" : "Perte nette"}
            color={netIncome >= 0 ? "green" : "red"}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bilan */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Structure du Bilan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toFixed(2)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Résultat */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Compte de Résultat</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Détails Bilan */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Détails du Bilan</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">
                Actif
              </h3>
              {balanceSheet?.assets?.map((asset) => (
                <div
                  key={asset.id}
                  className="flex justify-between py-2 border-b"
                >
                  <span>
                    {asset.code} - {asset.label}
                  </span>
                  <span className="font-semibold">
                    {asset.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3">
                Passif
              </h3>
              {balanceSheet?.liabilities?.map((liability) => (
                <div
                  key={liability.id}
                  className="flex justify-between py-2 border-b"
                >
                  <span>
                    {liability.code} - {liability.label}
                  </span>
                  <span className="font-semibold">
                    {liability.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">
                Capitaux
              </h3>
              {balanceSheet?.equity?.map((eq) => (
                <div key={eq.id} className="flex justify-between py-2 border-b">
                  <span>
                    {eq.code} - {eq.label}
                  </span>
                  <span className="font-semibold">{eq.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CustomDashboard>
  );
}
