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
  AreaChart,
  Area
} from "recharts";
import { Wallet, Landmark, Landmark as Bank, TrendingUp, Calendar, ChevronRight, ArrowUpRight, ArrowDownRight, Hash, PieChart as PieIcon, BarChart3 } from "lucide-react";

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
  if (error) return <div className="text-red-500 p-10 font-black uppercase tracking-widest bg-red-50 rounded-[2rem] border-2 border-dashed border-red-100 m-10">Oups! Erreur de synchronisation: {error}</div>;

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
    { name: "PRODUITS", value: incomeStatement?.total_revenue || 0 },
    { name: "CHARGES", value: incomeStatement?.total_expense || 0 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#10b981"];

  return (
    <CustomDashboard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="ft-page">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-secondary tracking-tighter uppercase mb-1">
              Cockpit Comptable
            </h1>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
                    Session Active • {currentPeriod?.month}/{currentPeriod?.year}
                </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="ft-btn ft-btn-md ft-btn-primary gap-2">
                <Calendar size={18} /> Clôturer la période
            </button>
          </div>
        </div>

        {/* KPI Cards section stylized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-blue-500/20 transition-all cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Wallet size={24} />
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+2.4%</span>
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Actif</h3>
            <div className="text-2xl font-black text-secondary tracking-tight">
                {totalAssets.toLocaleString()} <span className="text-[10px] opacity-40 ml-1">FCFA</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-red-500/20 transition-all cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                    <Bank size={24} />
                </div>
                <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">+1.8%</span>
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Passif</h3>
            <div className="text-2xl font-black text-secondary tracking-tight">
                {totalLiabilities.toLocaleString()} <span className="text-[10px] opacity-40 ml-1">FCFA</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-emerald-500/20 transition-all cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Landmark size={24} />
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Stable</span>
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Capitaux Propres</h3>
            <div className="text-2xl font-black text-secondary tracking-tight">
                {totalEquity.toLocaleString()} <span className="text-[10px] opacity-40 ml-1">FCFA</span>
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] shadow-sm border border-gray-100 transition-all cursor-default ${
            netIncome >= 0 ? 'bg-secondary text-white' : 'bg-rose-600 text-white'
          }`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/10 text-white rounded-2xl">
                    <TrendingUp size={24} />
                </div>
            </div>
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Résultat Net</h3>
            <div className="text-2xl font-black tracking-tight">
                {netIncome.toLocaleString()} <span className="text-[10px] opacity-40 ml-1 uppercase">FCFA</span>
            </div>
          </div>
        </div>

        {/* Charts & Reports section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <BarChart3 size={20} />
                    </div>
                    <h2 className="text-lg font-black text-secondary tracking-tight uppercase italic">Flux de Résultat</h2>
                </div>
            </div>
            
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}}
                    />
                    <Tooltip 
                        contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '1rem'}}
                        cursor={{fill: '#f9fafb'}}
                    />
                    <Bar 
                        dataKey="value" 
                        fill="#3b82f6" 
                        radius={[10, 10, 0, 0]} 
                        barSize={60}
                    />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col items-center justify-center">
            <div className="self-start mb-8 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
                    <PieIcon size={20} />
                </div>
                <h2 className="text-lg font-black text-secondary tracking-tight uppercase italic">Répartition du Bilan</h2>
            </div>
            
            <div className="h-[280px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">Balance</div>
                    <div className="text-sm font-black text-secondary">OK</div>
                </div>
            </div>
            
            <div className="w-full space-y-3 mt-6">
                {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-black">
                        <div className="flex items-center gap-2 uppercase tracking-tight text-gray-500">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                            {item.name}
                        </div>
                        <div className="text-secondary">{((item.value / (totalAssets + totalLiabilities + totalEquity)) * 100).toFixed(1)}%</div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Financial details listing premium */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-50 overflow-hidden">
            <div className="flex items-center gap-4 mb-10 underline decoration-secondary/10 decoration-8 underline-offset-8">
                <Hash className="text-secondary" size={28} />
                <h2 className="text-2xl font-black text-secondary uppercase tracking-tight italic">Comptabilité des Actifs & Passifs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">Actifs du Bilan</h3>
                        <ArrowUpRight className="text-blue-600" size={20} />
                    </div>
                    <div className="space-y-4">
                        {balanceSheet?.assets?.map((asset) => (
                            <div key={asset.id} className="flex justify-between items-center group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-gray-300 uppercase leading-none">{asset.code}</div>
                                    <div className="text-xs font-bold text-gray-600 group-hover:text-secondary transition-colors uppercase italic">{asset.label}</div>
                                </div>
                                <div className="text-sm font-black text-secondary tabular-nums">
                                    {asset.balance.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest">Passifs & Dettes</h3>
                        <ArrowDownRight className="text-rose-600" size={20} />
                    </div>
                    <div className="space-y-4">
                        {balanceSheet?.liabilities?.map((liability) => (
                            <div key={liability.id} className="flex justify-between items-center group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-gray-300 uppercase leading-none">{liability.code}</div>
                                    <div className="text-xs font-bold text-gray-600 group-hover:text-secondary transition-colors uppercase italic">{liability.label}</div>
                                </div>
                                <div className="text-sm font-black text-secondary tabular-nums">
                                    {liability.balance.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest">Fonds & Capitaux</h3>
                        <Landmark className="text-emerald-600" size={20} />
                    </div>
                    <div className="space-y-4">
                        {balanceSheet?.equity?.map((eq) => (
                            <div key={eq.id} className="flex justify-between items-center group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-gray-300 uppercase leading-none">{eq.code}</div>
                                    <div className="text-xs font-bold text-gray-600 group-hover:text-secondary transition-colors uppercase italic">{eq.label}</div>
                                </div>
                                <div className="text-sm font-black text-secondary tabular-nums">
                                    {eq.balance.toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {balanceSheet?.equity?.length === 0 && (
                            <div className="text-center py-10 text-gray-300 font-black uppercase text-[10px] tracking-widest">
                                Aucun mouvement de capitaux.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </CustomDashboard>
  );
}
