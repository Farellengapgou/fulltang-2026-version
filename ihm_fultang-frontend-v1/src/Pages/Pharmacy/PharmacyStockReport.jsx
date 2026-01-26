import React, { useState, useEffect } from 'react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { PharmacyNavbar } from "./PharmacyNavBar.jsx";
import { pharmacyNavLink } from "./lib/pharmacyNavLink.js";
import { Activity, AlertTriangle, Package, Calendar, Download } from 'lucide-react';
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
        // Simple CSV export logic
        const headers = ["Name", "Stock", "Min Level", "Status", "Expiry Date"];
        const rows = stats.lowStockItems.map(item => [
            item.name,
            item.current_stock,
            item.min_stock_level,
            item.status,
            item.expiry_date || 'N/A'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "stock_report_low_items.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
            <PharmacyNavbar />
            <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Stock Report</h1>
                        <p className="text-gray-500">Inventory status and health check</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                        <Download size={18} /> Export Low Stock Report
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Total Items</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalItems}</h3>
                                    </div>
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Package size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Total Value</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalValue.toLocaleString()} FCFA</h3>
                                    </div>
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <Activity size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Low Stock Alerts</p>
                                        <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStockItems.length}</h3>
                                    </div>
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                        <AlertTriangle size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Expiring Soon</p>
                                        <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.expiringItems.length}</h3>
                                    </div>
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                        <Calendar size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Low Stock Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-orange-50/50 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-orange-500" />
                                    <h3 className="font-bold text-gray-800">Low Stock Items</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3 text-center">Stock</th>
                                                <th className="p-3 text-center">Min Level</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {stats.lowStockItems.length > 0 ? (
                                                stats.lowStockItems.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="p-3 font-medium">{item.name}</td>
                                                        <td className="p-3 text-center font-bold text-red-500">{item.current_stock}</td>
                                                        <td className="p-3 text-center text-gray-500">{item.min_stock_level}</td>
                                                        <td className="p-3">
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                                                {item.status || "Low"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-center text-gray-500">Good job! No low stock items.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Expiring Soon Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-red-50/50 flex items-center gap-2">
                                    <Calendar size={18} className="text-red-500" />
                                    <h3 className="font-bold text-gray-800">Expiring Soon (30 Days)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3 text-center">Stock</th>
                                                <th className="p-3">Expiry Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {stats.expiringItems.length > 0 ? (
                                                stats.expiringItems.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="p-3 font-medium">{item.name}</td>
                                                        <td className="p-3 text-center">{item.current_stock}</td>
                                                        <td className="p-3 text-red-600 font-medium">{item.expiry_date}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="p-4 text-center text-gray-500">No items expiring soon.</td>
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
