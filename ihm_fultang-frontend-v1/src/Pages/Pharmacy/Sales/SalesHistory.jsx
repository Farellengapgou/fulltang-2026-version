import React, { useState, useEffect } from 'react';
import { FaSearch, FaPrint, FaCalendarAlt, FaUser, FaFileInvoiceDollar, FaArrowLeft, FaArrowRight, FaFilter } from 'react-icons/fa';
import { Tooltip, Select } from 'antd';
import axiosInstance from '../../../Utils/axiosInstance';
import { formatDateOnly } from "../../../Utils/formatDateMethods";
import { AlertCircle } from 'lucide-react';

export function SalesHistory() {
    const [allSales, setAllSales] = useState([]); // Toutes les ventes récupérées
    const [filteredSales, setFilteredSales] = useState([]); // Ventes filtrées affichées
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Nombre d'éléments par page affichés
    const [isFetchingAll, setIsFetchingAll] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState('all');
    const [totalCount, setTotalCount] = useState(0);
    const [operators, setOperators] = useState([]);
    const [dateFilter, setDateFilter] = useState('all');

     // Récupérer TOUTES les données paginées
    const fetchAllSales = async () => {
        setIsFetchingAll(true);
        let allSalesData = [];
        let nextUrl = '/bill/';
        
        try {
            while (nextUrl) {
                const response = await axiosInstance.get(nextUrl);
                const rawData = response.data.results || response.data;
                
                if (Array.isArray(rawData)) {
                    // Filtrer immédiatement les ventes de pharmaciens
                    const pharmacistSales = rawData.filter(bill => {
                        const hasMedication = bill.bill_items && bill.bill_items.some(item => 
                            item.medicament !== null && item.medicament !== undefined
                        );
                        const isPharmacist = bill.operator?.role === "Pharmacist";
                        return hasMedication && isPharmacist;
                    });
                    
                    allSalesData = [...allSalesData, ...pharmacistSales];
                }
                
                nextUrl = response.data.next;
            }
            
            // Transformer les données
            const transformedSales = allSalesData.map(bill => ({
                id: bill.id,
                billCode: bill.billCode,
                date: bill.date,
                amount: bill.amount,
                patientName: bill.patient ? 
                    `${bill.patient.firstName || ''} ${bill.patient.lastName || ''}`.trim() || "Patient sans nom" 
                    : "Patient externe / Anonyme",
                operator: bill.operator?.username,
                operatorId: bill.operator?.id,
                operatorName: bill.operator ? 
                    `${bill.operator.first_name || ''} ${bill.operator.last_name || ''}`.trim() || bill.operator.username
                    : "Opérateur inconnu",
                operatorRole: bill.operator?.role,
                items: bill.bill_items || []
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setAllSales(transformedSales);
            setFilteredSales(transformedSales);
            
            // Extraire la liste des opérateurs uniques
            const uniqueOperators = [...new Set(transformedSales.map(s => s.operatorId))]
                .map(id => {
                    const sale = transformedSales.find(s => s.operatorId === id);
                    return {
                        id: sale.operatorId,
                        name: sale.operatorName,
                        username: sale.operator
                    };
                });
            setOperators(uniqueOperators);
            
        } catch (error) {
            console.error("Erreur lors de la récupération des ventes:", error);
        } finally {
            setIsFetchingAll(false);
        }
    };

    useEffect(() => {
        fetchAllSales();
    }, []);

    const calculateTotalPages = () => {
        if (totalCount === 0) return 1;
        return totalCount % 5 === 0 ? totalCount / 5 : Math.floor(totalCount / 5) + 1;
    }

    // Filtrer les données
    useEffect(() => {
        let filtered = [...allSales];
        
        // Filtre par recherche
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(sale =>
                sale.billCode?.toLowerCase().includes(lowerTerm) ||
                sale.patientName?.toLowerCase().includes(lowerTerm) ||
                sale.operatorName?.toLowerCase().includes(lowerTerm) ||
                sale.operator?.toLowerCase().includes(lowerTerm)
            );
        }
        
        // Filtre par opérateur
        if (selectedOperator !== 'all') {
            filtered = filtered.filter(sale => sale.operatorId === parseInt(selectedOperator));
        }
        
        // Filtre par date
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            switch (dateFilter) {
                case 'today':
                    filtered = filtered.filter(sale => {
                        const saleDate = new Date(sale.date);
                        return saleDate >= today;
                    });
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filtered = filtered.filter(sale => new Date(sale.date) >= weekAgo);
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filtered = filtered.filter(sale => new Date(sale.date) >= monthAgo);
                    break;
                default:
                    break;
            }
        }
        
        setFilteredSales(filtered);
        setCurrentPage(1); // Réinitialiser à la première page après filtrage
    }, [searchTerm, selectedOperator, dateFilter, allSales]);

    // Pagination pour l'affichage
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

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

                    {/* Pagination */}
                    {!loading && filteredSales.length > 0 && totalCount > 5 && (
                        <div className="w-full justify-center flex mt-6 mb-4">
                            <div className="flex gap-4">
                                <Tooltip placement={"left"} title={"previous slide"}>
                                    <button 
                                        onClick={() => previousUrl && fetchSales(previousUrl)}
                                        disabled={!previousUrl}
                                        className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaArrowLeft />
                                    </button>
                                </Tooltip>
                                <p className="text-secondary text-2xl font-bold mt-4">
                                    {`${currentPage} / ${calculateTotalPages()}`}
                                </p>
                                <Tooltip placement={"right"} title={"next slide"}>
                                    <button 
                                        onClick={() => nextUrl && fetchSales(nextUrl)}
                                        disabled={!nextUrl}
                                        className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaArrowRight />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
