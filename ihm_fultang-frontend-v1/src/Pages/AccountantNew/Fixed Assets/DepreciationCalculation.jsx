import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Calculator } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import fixedAssetService from "../../../Services/Accounting/fixedAssetService";

export function DepreciationCalculation() {
    const [isLoading, setIsLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [calculatingId, setCalculatingId] = useState(null);

    const loadAssets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fixedAssetService.getAllAssets({ status: 'ACTIVE' });
             // Simulation
            if (!data || data.length === 0) {
                 setAssets([
                     { id: 1, code: 'FA-2024-001', name: 'MacBook Pro M3', gross_value: 2500000, accumulated_depreciation: 500000, net_book_value: 2000000, status: 'ACTIVE' },
                     { id: 2, code: 'FA-2023-012', name: 'Bureau Direction', gross_value: 850000, accumulated_depreciation: 200000, net_book_value: 650000, status: 'ACTIVE' },
                     { id: 3, code: 'FA-2022-045', name: 'Véhicule Toyota Hilux', gross_value: 24000000, accumulated_depreciation: 12000000, net_book_value: 12000000, status: 'ACTIVE' },
                 ]);
            } else {
                setAssets(data);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les immobilisations.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    const handleCalculateDepreciation = async (id) => {
        setCalculatingId(id);
        try {
            await fixedAssetService.calculateDepreciation(id);
            alert("Amortissement calculé avec succès");
            loadAssets(); // Recharger pour voir les mises à jour
        } catch (error) {
            alert("Erreur lors du calcul");
        } finally {
            setCalculatingId(null);
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Calcul des Amortissements</h1>
                        <p className="text-gray-600 mt-1">Génération des écritures de dotation</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadAssets} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une immobilisation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur Brute</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cumul Amort.</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">VNC</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(asset.gross_value)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(asset.accumulated_depreciation || 0)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">{formatCurrency(asset.net_book_value || asset.gross_value)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => handleCalculateDepreciation(asset.id)}
                                                disabled={calculatingId === asset.id}
                                                className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full hover:bg-teal-200 disabled:opacity-50 text-sm"
                                            >
                                                {calculatingId === asset.id ? 'Calcul...' : (
                                                    <><Calculator size={14} className="mr-1"/> Calculer</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        {isLoading ? "Chargement..." : "Aucune immobilisation active"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountantDashBoard>
    );
}
