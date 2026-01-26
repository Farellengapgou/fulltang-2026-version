import React, { useState, useEffect } from 'react';
import { Search, Printer, Calendar, User, FileText, Filter, AlertCircle } from 'lucide-react';
import axiosInstance from '../../../Utils/axiosInstance';
import { SuccessModal } from '../../Modals/SuccessModal';
import { formatDateOnly } from "../../../Utils/formatDateMethods";

export function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = sales.filter(
            (sale) =>
                sale.billCode?.toLowerCase().includes(lowerTerm) ||
                sale.patientName?.toLowerCase().includes(lowerTerm)
        );
        setFilteredSales(filtered);
    }, [searchTerm, sales]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/bill/');
            const rawData = response.data.results || response.data;

            const mapped = (Array.isArray(rawData) ? rawData : []).map(bill => ({
                id: bill.id,
                billCode: bill.billCode,
                date: bill.date,
                amount: bill.amount,
                patientName: bill.patient ? `${bill.patient.firstName || ''} ${bill.patient.lastName || ''} ` : "External Patient / Anonymous",
                operator: bill.operator?.username,
                items: bill.bill_items || []
            }));

            mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSales(mapped);
            setFilteredSales(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (sale) => {
        const html = `
    < html >
                <head>
                    <title>History - Invoice ${sale.billCode}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                        h2 { text-align: center; color: #1A73A3; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>FULTANG CLINIC - DUPLICATE</h2>
                    <p><strong>Invoice:</strong> ${sale.billCode}</p>
                    <p><strong>Date:</strong> ${new Date(sale.date).toLocaleString()}</p>
                    <p><strong>Patient:</strong> ${sale.patientName}</p>
                    <table>
                        <thead>
                            <tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">U.P</th><th style="text-align:right">Total</th></tr>
                        </thead>
                        <tbody>
                            ${sale.items.map(i => `<tr><td>${i.designation}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">${(i.unityPrice || 0).toLocaleString()}</td><td style="text-align:right">${(i.total || 0).toLocaleString()}</td></tr>`).join('')}
                        </tbody>
                    </table>
                    <h3 style="text-align:right; margin-top:20px;">TOTAL: ${(sale.amount || 0).toLocaleString()} FCFA</h3>
                </body>
            </html >
    `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    };

    return (
        <div className="w-full mx-auto p-6 rounded-lg font-sans">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales History</h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by invoice, patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading history...</div>
                ) : filteredSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-semibold text-gray-600">No sales found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-primary-end">
                            <tr>
                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-tl-lg">Date</th>
                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Invoice Code</th>
                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Patient</th>
                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Amount</th>
                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="font-semibold text-gray-700">{formatDateOnly(sale.date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center font-bold text-gray-900">{sale.billCode}</td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-semibold text-gray-900">{sale.patientName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center font-bold text-primary-end">
                                        {sale.amount.toLocaleString()} FCFA
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <button
                                            onClick={() => handlePrint(sale)}
                                            className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center mx-auto gap-2 border border-gray-300 px-3 py-1 rounded-md hover:border-indigo-600"
                                        >
                                            <Printer size={16} /> Duplicate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
