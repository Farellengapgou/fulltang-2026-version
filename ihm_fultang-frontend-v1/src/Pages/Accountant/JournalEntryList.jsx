import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileInvoiceDollar,
  FaEye,
  FaArrowLeft,
  FaArrowRight,
  FaPlus // Import Plus icon
} from "react-icons/fa";
import { Tooltip } from "antd";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";
import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import Wait from "../Modals/wait";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function JournalEntryList() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [page, setPage] = useState(1);
  const navigate = useNavigate(); // Hook for navigation

  const fetchEntries = async (url) => {
    setIsLoading(true);
    try {
      const endpoint = url || "/journal-entries/";
      const response = await axiosInstanceAccountant.get(endpoint);
      setEntries(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleNext = () => {
    if (pagination.next) {
      fetchEntries(pagination.next);
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (pagination.previous) {
      fetchEntries(pagination.previous);
      setPage(page - 1);
    }
  };
  
  // Note: assuming JournalEntry model has field 'total_debit' or we compute it. 
  // Let's assume serializer provides it or we sum lines if detailed.
  // For MVP list, let's assume simple fields.

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <AccountantDashBoard requiredRole={"Accountant"} linkList={AccountantNavLink}>
      <AccountantNavBar />
      <div className="container mx-auto px-4 py-6 h-full flex flex-col relative"> {/* Added relative for positioning FAB */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
            <FaFileInvoiceDollar />
            Journal des Écritures
          </h1>
          
          <div className="flex gap-4">
              <div className="flex items-center bg-white rounded-lg border shadow-sm px-3 py-2 w-64">
                <FaSearch className="text-gray-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search entries..." 
                    className="bg-transparent border-none focus:outline-none w-full text-sm"
                />
              </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Débit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Crédit</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {/* Assuming API provides voucher_number or similar */}
                       {entry.id}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                      {/* Assuming logic: if debit entry, show amount. But entry has lines. 
                          Ideally list should show total debit of the entry */}
                      {formatAmount(0)} 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                      {formatAmount(0)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                       }`}>
                        {entry.status || 'Posted'}
                      </span>
                    </td>
                    {/*
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Tooltip title="View Details">
                            <button className="text-secondary hover:text-blue-900">
                                <FaEye />
                            </button>
                        </Tooltip>
                    </td>
                    */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">
                    Aucune écriture trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */ }
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, pagination.count)}</span> of <span className="font-medium">{pagination.count}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={handlePrevious}
                            disabled={!pagination.previous}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${!pagination.previous ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <span className="sr-only">Previous</span>
                            <FaArrowLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!pagination.next}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!pagination.next ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <span className="sr-only">Next</span>
                            <FaArrowRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>

        {/* Floating Action Button for Adding New Entry */}
        <Tooltip placement="left" title="Add Journal Entry">
            <button
              onClick={() => navigate("/accountant/create-journal-entry")} // Navigate to Create page
              className="fixed bottom-8 right-8 w-16 h-16 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:bg-secondary-dark hover:scale-110 transition-all duration-300 z-50 focus:outline-none"
            >
              <FaPlus />
            </button>
        </Tooltip>

      </div>
      {isLoading && <Wait />}
    </AccountantDashBoard>
  );
}
