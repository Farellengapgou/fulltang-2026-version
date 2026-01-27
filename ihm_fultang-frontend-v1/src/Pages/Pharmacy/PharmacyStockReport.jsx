import React, { useState, useEffect } from 'react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { PharmacyNavbar } from "./PharmacyNavBar.jsx";
import { pharmacyNavLink } from "./lib/pharmacyNavLink.js";
import { Activity, AlertTriangle, Package, Calendar, Download,CheckCircle, Printer } from 'lucide-react';
import axiosInstance from '../../Utils/axiosInstance';
import Loader from "../../GlobalComponents/Loader.jsx";

export function PharmacyStockReport() {
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStockItems: [],
        expiringItems: [],
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/product/');
            const products = response.data.results || response.data || [];

            const lowStock = products.filter(p => p.current_stock <= p.min_stock_level);

            // Calculate expiring soon (next 30 days)
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            const expiring = products.filter(p => {
                if (!p.expiry_date) return false;
                const expDate = new Date(p.expiry_date);
                return expDate >= today && expDate <= thirtyDaysFromNow;
            });

            const totalVal = products.reduce((acc, curr) => acc + (curr.price * curr.current_stock), 0);

            setStats({
                totalItems: products.length,
                lowStockItems: lowStock,
                expiringItems: expiring,
                totalValue: totalVal
            });
        } catch (error) {
            console.error("Error fetching stock data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const html = `
            <html>
                <head>
                    <title>Rapport de Stock - Fultang Pharmacy</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                        h1 { color: #1e293b; text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
                        .summary { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
                        .summary-item { background: #f8fafc; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
                        .summary-item h4 { margin: 0; font-size: 10px; color: #64748b; text-transform: uppercase; }
                        .summary-item p { margin: 5px 0 0 0; font-size: 18px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th { background-color: #3b82f6; color: white; text-align: left; padding: 12px 8px; }
                        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
                        .low-stock th { background-color: #ef4444; }
                        .expiring th { background-color: #f59e0b; }
                        tr:nth-child(even) { background-color: #f1f5f9; }
                        .meta { text-align: right; font-size: 10px; color: #94a3b8; margin-top: 5px; }
                    </style>
                </head>
                <body>
                    <h1>RAPPORT DE STOCK PHARMACIE</h1>
                    <div class="meta">Généré le: ${new Date().toLocaleString()}</div>
                    
                    <div class="summary">
                        <div class="summary-item"><h4>Total Produits</h4><p>${stats.totalItems}</p></div>
                        <div class="summary-item"><h4>Valeur Stock</h4><p>${stats.totalValue.toLocaleString()} FCFA</p></div>
                        <div class="summary-item"><h4>Stock Faible</h4><p>${stats.lowStockItems.length}</p></div>
                        <div class="summary-item"><h4>Périme Bientôt</h4><p>${stats.expiringItems.length}</p></div>
                    </div>

                    ${stats.lowStockItems.length > 0 ? `
                        <h2 style="color: #ef4444; font-size: 16px; margin-top: 30px;">Alertes Stock Faible</h2>
                        <table class="low-stock">
                            <thead>
                                <tr><th>Produit</th><th>Stock Actuel</th><th>Seuil Min</th><th>État</th></tr>
                            </thead>
                            <tbody>
                                ${stats.lowStockItems.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td style="text-align: center; font-weight: bold;">${item.current_stock}</td>
                                        <td style="text-align: center;">${item.min_stock_level}</td>
                                        <td style="text-align: center; color: #ef4444; font-weight: bold;">CRITIQUE</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}

                    ${stats.expiringItems.length > 0 ? `
                        <h2 style="color: #f59e0b; font-size: 16px; margin-top: 30px;">Produits Périmant Bientôt (30 Jours)</h2>
                        <table class="expiring">
                            <thead>
                                <tr><th>Produit</th><th>Stock</th><th>Date d'expiration</th></tr>
                            </thead>
                            <tbody>
                                ${stats.expiringItems.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td style="text-align: center;">${item.current_stock}</td>
                                        <td style="text-align: right; font-weight: bold;">${item.expiry_date}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}

                    <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
                        Fultang Health Management System - Module Pharmacie
                    </div>
                </body>
            </html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.onload = () => {
            win.focus();
            win.print();
        };
    };

    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
            <PharmacyNavbar />
            <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Rapport de Stock</h1>
                        <p className="text-slate-500 font-medium">État de l'inventaire et alertes santé</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-3 px-6 py-3 bg-secondary text-white rounded-xl hover:bg-primary-start transition-all font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95"
                    >
                        <Printer size={20} /> Exporter Rapport PDF
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Produits</p>
                                        <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalItems}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Package size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Valeur Stock</p>
                                        <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalValue.toLocaleString()}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Activity size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Stock Faible</p>
                                        <h3 className="text-3xl font-black text-rose-500 mt-2">{stats.lowStockItems.length}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center animate-pulse">
                                        <AlertTriangle size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Périme Bientôt</p>
                                        <h3 className="text-3xl font-black text-amber-500 mt-2">{stats.expiringItems.length}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                        <Calendar size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Low Stock Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                                <div className="p-5 border-b border-slate-100 bg-rose-50/50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                        <AlertTriangle size={16} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">Alertes Stock Faible</h3>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="p-4">Produit</th>
                                                <th className="p-4 text-center">Stock</th>
                                                <th className="p-4 text-center">Min</th>
                                                <th className="p-4 text-center">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats.lowStockItems.length > 0 ? (
                                                stats.lowStockItems.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4 font-bold text-slate-700">{item.name}</td>
                                                        <td className="p-4 text-center font-black text-rose-500 bg-rose-50/30">{item.current_stock}</td>
                                                        <td className="p-4 text-center text-slate-400 font-medium">{item.min_stock_level}</td>
                                                        <td className="p-4 text-center">
                                                            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-wide">
                                                                CRITIQUE
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                                                        <CheckCircle size={32} className="text-emerald-300" />
                                                        <span>Aucun produit en rupture. Excellent !</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Expiring Soon Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                                <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <Calendar size={16} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">Périme Bientôt (30 Jours)</h3>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="p-4">Produit</th>
                                                <th className="p-4 text-center">Stock</th>
                                                <th className="p-4 text-right">Date Expiration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats.expiringItems.length > 0 ? (
                                                stats.expiringItems.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4 font-bold text-slate-700">{item.name}</td>
                                                        <td className="p-4 text-center font-medium">{item.current_stock}</td>
                                                        <td className="p-4 text-right text-amber-600 font-mono font-bold bg-amber-50/30">{item.expiry_date}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                                                        <CheckCircle size={32} className="text-emerald-300" />
                                                        <span>Aucun produit ne périme bientôt.</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </CustomDashboard>
    );
}
