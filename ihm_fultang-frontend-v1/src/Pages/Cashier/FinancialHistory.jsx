import { useEffect, useState } from "react"
import {AlertCircle, Search, Calendar, User, DollarSign, Filter, Printer, Activity, Home } from "lucide-react"
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";
import {Tooltip} from "antd";
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {cashierNavLink} from "./cashierNavLink.js";
import {CashierNavBar} from "./CashierNavBar.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";


export function FinancialHistory() {

    const [transactions, setTransactions] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [showInvoice, setShowInvoice] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [nextUrl, setNextUrl] = useState(null)
    const [previousUrl, setPreviousUrl] = useState(null)

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleFilterChange = (e) => {
        setFilterType(e.target.value)
    }

    const handleGenerateInvoice = (transactionId) => {
        setShowInvoice(transactionId)
    }

    const filteredTransactions = transactions.filter((transaction) => {
        const patientName = transaction.patient 
            ? `${transaction.patient.firstName} ${transaction.patient.lastName}`.toLowerCase()
            : '';
        
        return (
            patientName.includes(searchTerm.toLowerCase()) &&
            (filterType === "all" || transaction.operation?.name === filterType)
        )
    })

    const calculateTotalPages = () => {
        if (totalCount === 0) return 1;
        return totalCount % 5 === 0 ? totalCount / 5 : Math.floor(totalCount / 5) + 1;
    }

    async function fetchFacture(url = "/bill/") {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(url);
            
            if (response.status === 200) {
                console.log("Bills fetched:", response.data);
                setTransactions(response.data.results || response.data);
                setTotalCount(response.data.count || 0);
                setNextUrl(response.data.next);
                setPreviousUrl(response.data.previous);
                setCurrentPage(response.data.current_page || 1);
            }
        } catch (error) {
            console.error("Error fetching bills:", error);
            setError("Impossible de charger l'historique des factures");
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFacture();
    }, []);


    const getTransactionIcon = (type) => {
        switch (type) {
            case "Consultation":
                return <User className="h-5 w-5 text-blue-500" />
            case "Examen":
                return <Activity className="h-5 w-5 text-green-500" />
            case "Hospitalisation":
                return <Home className="h-5 w-5 text-red-500" />
            default:
                return <DollarSign className="h-5 w-5 text-gray-500" />
        }
    }

    const handlePrint = () => {
        const printContents = document.getElementById("invoice").innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    };
    
    return (
        <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>
            <CashierNavBar/>
            <div className="mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">History of Financial Transactions</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Rechercher un patient"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex items-center space-x-4">
                        <Filter className="text-gray-400" />
                        <select
                            value={filterType}
                            onChange={handleFilterChange}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All types</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Examen">Exam</option>
                            <option value="Hospitalisation">Hospitalization</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Chargement...</div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Aucune transaction disponible.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white rounded-lg">
                                <thead className="bg-primary-end">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-md font-semibold text-white uppercase rounded-l-lg">
                                            Date
                                        </th>
                                        <th className="px-6 py-5 text-left text-md font-semibold text-white uppercase">
                                            Patient
                                        </th>
                                        <th className="px-6 py-5 text-left text-md font-semibold text-white uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-5 text-left text-md font-semibold text-white uppercase">
                                            Montant
                                        </th>
                                        <th className="px-6 py-5 text-left text-md font-semibold text-white uppercase rounded-r-lg">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div className="text-md text-gray-900">
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div className="text-md text-gray-900">
                                                        {transaction.patient 
                                                            ? `${transaction.patient.firstName} ${transaction.patient.lastName}`
                                                            : 'N/A'
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getTransactionIcon(transaction.operation?.name)}
                                                    <div className="text-md text-gray-900 ml-2">
                                                        {transaction.operation?.name || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div className="text-md font-bold text-gray-900">
                                                        {transaction.amount?.toLocaleString()} FCFA
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                                                <button
                                                    onClick={() => handleGenerateInvoice(transaction.id)}
                                                    className="flex items-center text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Printer className="h-4 w-4 mr-1" />
                                                    Imprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalCount > 5 && (
                            <div className="w-full justify-center flex mt-6 mb-4">
                                <div className="flex gap-4">
                                    <Tooltip placement={"left"} title={"previous slide"}>
                                        <button 
                                            onClick={() => previousUrl && fetchFacture(previousUrl)}
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
                                            onClick={() => nextUrl && fetchFacture(nextUrl)}
                                            disabled={!nextUrl}
                                            className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaArrowRight />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashBoard>
    )
}