import React, { useState, useEffect } from 'react';
import { FaSearch, FaPrint, FaCalendarAlt, FaUser, FaFileInvoiceDollar } from 'react-icons/fa';
import axiosInstance from '../../../Utils/axiosInstance';
import { formatDateOnly } from "../../../Utils/formatDateMethods";
import { AlertCircle } from 'lucide-react';

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
            <html>
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
            </html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    };

    return (
        <div className="mt-5 flex flex-col relative p-5">
            <div className="flex justify-between mb-5">
                <p className="font-bold text-xl mt-2">Historique des Ventes</p>
                <div className="flex w-[350px] h-10 border-2 border-secondary rounded-lg bg-white">
                    <FaSearch className="text-xl text-secondary m-2" />
                    <input
                        type="text"
                        placeholder="Rechercher facture, patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none focus:outline-none focus:ring-0 w-full bg-transparent"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary-end"></span></div>
            ) : filteredSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Aucune vente trouvée</p>
                </div>
            ) : (
                <div className="overflow-hidden">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                <th className="text-center text-white p-4 text-xl font-bold rounded-l-lg">Date</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Code Facture</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Patient</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Montant</th>
                                <th className="text-center text-white p-4 text-xl font-bold rounded-r-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <td className="p-4 text-center font-bold text-blue-900 rounded-l-lg">
                                        <div className="flex items-center justify-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" />
                                            {formatDateOnly(sale.date)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-bold text-gray-900">
                                        <div className="flex items-center justify-center gap-2">
                                            <FaFileInvoiceDollar className="text-gray-400" />
                                            {sale.billCode}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-semibold text-gray-700">
                                        <div className="flex items-center justify-center gap-2">
                                            <FaUser className="text-gray-400" />
                                            {sale.patientName}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-black text-primary-end">
                                        {sale.amount.toLocaleString()} FCFA
                                    </td>
                                    <td className="p-4 text-center rounded-r-lg">
                                        <button
                                            onClick={() => handlePrint(sale)}
                                            className="bg-white border text-secondary px-4 py-2 rounded-full font-bold hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <FaPrint /> Duplicata
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
