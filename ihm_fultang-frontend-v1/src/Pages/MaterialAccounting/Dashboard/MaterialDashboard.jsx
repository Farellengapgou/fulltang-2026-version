import { useState, useEffect } from "react";
import {
    Package,
    TrendingUp,
    AlertTriangle,
    Activity,
    DollarSign,
    Calendar,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getDashboardStats } from "../../../Utils/api/materialAccounting.js";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export function MaterialDashboard() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-end mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement du tableau de bord...</p>
                    </div>
                </div>
            </AccountantDashBoard>
        );
    }

    if (error) {
        return (
            <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-800">Erreur de chargement</h2>
                        <p className="text-red-600 mt-2">{error}</p>
                        <button onClick={loadDashboardData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Réessayer
                        </button>
                    </div>
                </div>
            </AccountantDashBoard>
        );
    }

    const stockDistribution = stats?.stock_by_warehouse?.map(w => ({
        name: w.name,
        value: w.value
    })) || [];

    const trendData = [
        { month: "Jan", value: 18000000 },
        { month: "Feb", value: 19500000 },
        { month: "Mar", value: 19000000 },
        { month: "Apr", value: 20500000 },
        { month: "May", value: 21000000 },
        { month: "Jun", value: stats?.total_stock_value || 21500000 },
    ];

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Comptabilité Matière</h1>
                        <p className="text-gray-600 mt-2">Analyse stratégique et opérationnelle des stocks</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-gray-500">Dernière mise à jour</p>
                        <p className="font-medium text-gray-800">{new Date().toLocaleString("fr-FR")}</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Valeur Stock</h3>
                            <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="h-5 w-5 text-blue-600" /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats?.total_stock_value || 0)}</p>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-green-600 font-bold flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                                <ArrowUp className="h-3 w-3 mr-0.5" /> 5.2%
                            </span>
                            <span className="text-gray-400 ml-2">vs mois dernier</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all border-l-4 border-l-primary-end">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Articles</h3>
                            <div className="p-2 bg-teal-50 rounded-lg"><Package className="h-5 w-5 text-primary-end" /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.total_articles || 0}</p>
                        <p className="mt-2 text-xs text-gray-400">Répartis en {stats?.stock_by_warehouse?.length || 0} dépôts</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Mouvements</h3>
                            <div className="p-2 bg-green-50 rounded-lg"><Activity className="h-5 w-5 text-green-600" /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.movements_this_month || 0}</p>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-green-600 font-bold flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                                <ArrowUp className="h-3 w-3 mr-0.5" /> 12%
                            </span>
                            <span className="text-gray-400 ml-2">Flux du mois</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Alertes Brut</h3>
                            <div className="p-2 bg-red-50 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats?.alerts_count || 0}</p>
                        <p className="mt-2 text-xs text-red-500 font-medium">Action requise immédiate</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Evolution Valeur */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Évolution de la Valeur du Stock</h3>
                            <select className="text-sm border-gray-200 rounded-lg py-1 px-2 focus:ring-primary-end focus:border-primary-end">
                                <option>6 derniers mois</option>
                                <option>12 derniers mois</option>
                            </select>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}M`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val) => [formatCurrency(val), "Valeur"]}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Répartition par Dépôt */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Répartition par Dépôt</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stockDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stockDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => formatCurrency(val)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {stockDistribution.map((w, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center">
                                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-gray-600">{w.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-800">
                                        {stats?.total_stock_value ? ((w.value / stats.total_stock_value) * 100).toFixed(1) : "0"}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Consommations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Consommations</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.top_consuming_articles?.map(item => ({ name: item.article, val: item.value })) || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip formatter={(val) => formatCurrency(val)} />
                                    <Bar dataKey="val" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-100">
                                        <th className="pb-2 font-medium">Article</th>
                                        <th className="pb-2 font-medium text-right">Valeur</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.top_consuming_articles?.slice(0, 3).map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2 text-gray-700">{item.article}</td>
                                            <td className="py-2 text-right font-bold text-gray-800">{formatCurrency(item.value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mouvements Récents */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Mouvements Récents</h3>
                            <button className="text-primary-end text-sm font-medium hover:underline">Voir tout</button>
                        </div>
                        <div className="space-y-4">
                            {stats?.recent_movements?.map((mov, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className={`p-2 rounded-lg ${mov.movement_type === "IN" ? "bg-green-100" : "bg-red-100"}`}>
                                        {mov.movement_type === "IN" ? <ArrowDown className="h-4 w-4 text-green-600" /> : <ArrowUp className="h-4 w-4 text-red-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{mov.article.name}</p>
                                        <p className="text-xs text-gray-500">{mov.movement_type === "IN" ? "Entrée vers" : "Sortie depuis"} {mov.movement_type === "IN" ? mov.destination_warehouse?.name : mov.source_warehouse?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">{mov.quantity} unités</p>
                                        <p className="text-xs text-gray-400">{formatCurrency(mov.total_value)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
