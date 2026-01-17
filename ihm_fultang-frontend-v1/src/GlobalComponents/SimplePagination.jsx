import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import PropTypes from "prop-types";

/**
 * Composant de pagination simplifié pour les données locales (sans API)
 * Utilisé pour paginer des données déjà chargées en mémoire
 */
function SimplePagination({ currentPage, totalPages, onPageChange }) {
    const [pageNumbers, setPageNumbers] = useState([]);

    useEffect(() => {
        const generatePageNumbers = () => {
            let numbers = [];
            const maxVisiblePages = 5;

            if (totalPages <= maxVisiblePages) {
                numbers = Array.from({ length: totalPages }, (_, i) => i + 1);
            } else {
                let start = Math.max(currentPage - 2, 1);
                let end = Math.min(start + maxVisiblePages - 1, totalPages);

                if (end - start < maxVisiblePages - 1) {
                    start = Math.max(end - maxVisiblePages + 1, 1);
                }

                numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

                if (start > 1) {
                    numbers = [1, '...', ...numbers];
                }
                if (end < totalPages) {
                    numbers = [...numbers, '...', totalPages];
                }
            }
            setPageNumbers(numbers);
        };

        generatePageNumbers();
    }, [currentPage, totalPages]);

    const handlePageChange = (newPage) => {
        if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
        onPageChange(newPage);
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-md bg-white border border-gray-300 shadow-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronsLeft className="h-5 w-5" />
            </button>

            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-md bg-white border border-gray-300 shadow-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {pageNumbers.map((number, index) => (
                <button
                    key={index}
                    onClick={() => typeof number === 'number' && handlePageChange(number)}
                    disabled={typeof number !== 'number'}
                    className={`px-4 py-2 rounded-md transition-colors ${number === currentPage
                            ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        } ${typeof number !== 'number' ? 'cursor-default' : ''}`}
                >
                    {number}
                </button>
            ))}

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-md bg-white border border-gray-300 shadow-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-md bg-white border border-gray-300 shadow-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronsRight className="h-5 w-5" />
            </button>
        </div>
    );
}

SimplePagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
};

export default SimplePagination;
