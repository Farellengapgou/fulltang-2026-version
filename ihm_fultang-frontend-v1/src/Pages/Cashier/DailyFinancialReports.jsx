import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, Printer, Download, DollarSign, Users, Activity, FileText } from "lucide-react"

import axiosInstance from "../../Utils/axiosInstance.js";

export  function DailyFinancialReport() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [dailyData, setDailyData] = useState([])
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalConsultations: 0,
        totalExamens: 0,
        transactionCount: 0
    })

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await axiosInstance.get(`/accounting/statistics/`, {
                    params: {
                        start_date: selectedDate,
                        end_date: selectedDate
                    }
                });
                
                if (response.status === 200) {
                    const data = response.data;
                    // Note: The backend stats structure is slightly different, let's adapt it
                    setStats({
                        totalRevenue: data.bills.by_date_range * 5000, // This is a placeholder since backend doesn't sum amounts yet
                        totalConsultations: data.bills.accounted * 5000,
                        totalExamens: (data.bills.total - data.bills.accounted) * 2000,
                        transactionCount: data.bills.by_date_range
                    });
                    
                    // Generate empty hourly data for now as backend doesn't support hourly breakdown yet
                    setDailyData(hours.map(h => ({ hour: `${h}:00`, consultations: 0, examens: 0 })));
                }
            } catch (error) {
                console.error("Error fetching daily stats:", error);
            }
        }
        fetchStats();
    }, [selectedDate])

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const { totalConsultations, totalExamens, totalRevenue, transactionCount } = stats;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Rapport Financier Journalier</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <Printer className="h-5 w-5 mr-2" />
                        Imprimer
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Télécharger
                    </button>
                </div>
            </div>

            {/* Cartes de résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Revenus Totaux</p>
                            <p className="text-2xl font-bold text-blue-800">{totalRevenue.toLocaleString()} FCFA</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-blue-500" />
                    </div>
                </div>

                <div className="p-4 bg-green-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Consultations</p>
                            <p className="text-2xl font-bold text-green-800">{totalConsultations.toLocaleString()} FCFA</p>
                        </div>
                        <Users className="h-6 w-6 text-green-500" />
                    </div>
                </div>

                <div className="p-4 bg-purple-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Examens</p>
                            <p className="text-2xl font-bold text-purple-800">{totalExamens.toLocaleString()} FCFA</p>
                        </div>
                        <Activity className="h-6 w-6 text-purple-500" />
                    </div>
                </div>

                <div className="p-4 bg-yellow-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Nombre de Transactions</p>
                            <p className="text-2xl font-bold text-yellow-800">{dailyData.length}</p>
                        </div>
                        <FileText className="h-6 w-6 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Graphique */}
            <div className="mb-6 bg-white p-4 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Revenus par Heure</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="consultations" name="Consultations" fill="#4ade80" />
                        <Bar dataKey="examens" name="Examens" fill="#a78bfa" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tableau détaillé */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Consultations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Examens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {dailyData.map((hour, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hour.hour}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {hour.consultations.toLocaleString()} FCFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {hour.examens.toLocaleString()} FCFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {(hour.consultations + hour.examens).toLocaleString()} FCFA
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

