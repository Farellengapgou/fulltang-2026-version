import { useState, useEffect } from "react";
import { financialRatioService } from "../../../Services/Accounting";
import Loader from "../../../GlobalComponents/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard.jsx";
import { FinancialAccountantNavBar } from "../NavBar.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";

export function FinancialRatios() {
  const [ratios, setRatios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchRatios = async () => {
      try {
        const response = await financialRatioService.getRatiosByType(
          "LIQUIDITY"
        );
        setRatios(response.data.results || response.data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRatios();
  }, [year]);

  if (loading) return <Loader />;

  const chartData = ratios.reduce((acc, r) => {
    const month = r.period_month;
    const existing = acc.find((d) => d.month === month);
    if (existing) {
      existing[r.ratio_type] = r.value;
    } else {
      acc.push({ month, [r.ratio_type]: r.value });
    }
    return acc;
  }, []);

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="p-6 bg-gray-50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-3">Ratios Financiers</h1>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-bold mb-3">Évolution des Ratios</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="LIQUIDITY"
                  stroke="#3b82f6"
                  name="Liquidité"
                />
                <Line
                  type="monotone"
                  dataKey="PROFITABILITY"
                  stroke="#10b981"
                  name="Rentabilité"
                />
                <Line
                  type="monotone"
                  dataKey="SOLVENCY"
                  stroke="#f59e0b"
                  name="Solvabilité"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Aucune donnée</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ratios.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-sm">{r.ratio_name}</h3>
              <p className="text-xs text-gray-500">{r.ratio_type}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {r.value.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {r.period_month}/{r.period_year}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CustomDashboard>
  );
}
