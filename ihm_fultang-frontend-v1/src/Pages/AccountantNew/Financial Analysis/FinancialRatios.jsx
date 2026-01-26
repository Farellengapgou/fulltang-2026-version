import { useState, useEffect } from "react";
import { X, Search, TrendingUp, Activity, PieChart, Calendar, ChevronRight } from "lucide-react";
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
  AreaChart,
  Area
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
        setLoading(true);
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

  // Sort by month
  chartData.sort((a, b) => a.month - b.month);

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="ft-page">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight uppercase">Analyses Financières</h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest italic">Indicateurs de performance et de santé financière</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Exercice</span>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="ft-input pl-11 w-32 font-black text-secondary"
                />
            </div>
          </div>
        </div>

        {/* Highlight Chart Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
                    <TrendingUp size={20} />
                </div>
                <h2 className="text-lg font-black text-secondary tracking-tight uppercase">Évolution des Ratios Clés</h2>
            </div>
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase">Liquidité</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase">Rentabilité</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase">Solvabilité</span>
                </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-4">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorLiq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}}
                        tickFormatter={(val) => monthNames[val-1] || val}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}}
                    />
                    <Tooltip 
                        contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '1.5rem'}}
                        labelStyle={{fontWeight: 900, color: '#1f2937', marginBottom: '0.5rem'}}
                    />
                    <Area
                        type="monotone"
                        dataKey="LIQUIDITY"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorLiq)"
                        name="Liquidité"
                    />
                    <Area
                        type="monotone"
                        dataKey="PROFITABILITY"
                        stroke="#10b981"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorRent)"
                        name="Rentabilité"
                    />
                    <Line
                        type="monotone"
                        dataKey="SOLVENCY"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        dot={{ r: 6, fill: "#f59e0b", border: 0 }}
                        name="Solvabilité"
                    />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">Aucune donnée disponible pour {year}</p>
                </div>
            )}
          </div>
        </div>

        {/* Detailed Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ratios.map((r) => (
            <div key={r.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 group hover:border-secondary/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${
                        r.ratio_type === 'LIQUIDITY' ? 'bg-blue-50 text-blue-600' :
                        r.ratio_type === 'PROFITABILITY' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-amber-50 text-amber-600'
                    }`}>
                        <PieChart size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {monthNames[r.period_month-1]} {r.period_year}
                    </span>
                </div>
                
                <h3 className="text-sm font-black text-gray-600 leading-tight mb-1 group-hover:text-secondary transition-colors underline decoration-gray-100 decoration-2 underline-offset-4">
                    {r.ratio_name}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{r.ratio_type}</p>
                
                <div className="flex items-end justify-between">
                    <div>
                        <span className="text-3xl font-black text-secondary tracking-tighter">
                            {r.value.toFixed(2)}
                        </span>
                        <span className="ml-1 text-xs font-bold text-gray-400">%</span>
                    </div>
                </div>
            </div>
          ))}
          
          {ratios.length === 0 && (
              <div className="col-span-full py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <Activity size={32} className="mb-2" />
                <p className="font-bold text-sm uppercase tracking-widest italic">Chargement des données indicateurs...</p>
              </div>
          )}
        </div>
      </div>
    </CustomDashboard>
  );
}
