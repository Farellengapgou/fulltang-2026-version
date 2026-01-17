import { useState } from "react";
import { FileText, Printer, Download } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getStockCard } from "../../../Utils/api/materialAccounting.js";

export function StockCard() {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [stockCardData, setStockCardData] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const handleGenerate = async () => {
        if (!selectedArticle) {
            alert("Veuillez sélectionner un article");
            return;
        }
        setIsLoading(true);
        try {
            const data = await getStockCard(selectedArticle, "PHAR01", dateFrom, dateTo);
            setStockCardData({
                article: {
                    code: selectedArticle,
                    name: selectedArticle === "PARA500" ? "Paracétamol 500mg" : "Amoxicilline 250mg",
                    category: "Médicaments",
                    unit: "Boîte",
                },
                warehouse: {
                    code: "PHAR01",
                    name: "Pharmacie principale",
                },
                movements: data.results || [],
            });
        } catch (error) {
            console.error("Error generating stock card:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        alert("Export PDF - Fonctionnalité à implémenter avec jsPDF");
    };

    return (
        <AccountantDashBoard
            linkList={MaterialAccountingNavLink}
            requiredRole={"Accountant"}
        >
            <AccountantNavBar />
            <div className="mx-auto p-12">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Fiche de Stock (OHADA)
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Document réglementaire - Art. 17-18 Acte Uniforme OHADA
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Critères de sélection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article
                            </label>
                            <select
                                value={selectedArticle || ""}
                                onChange={(e) => setSelectedArticle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            >
                                <option value="">Sélectionner un article</option>
                                <option value="PARA500">PARA500 - Paracétamol 500mg</option>
                                <option value="AMOX250">AMOX250 - Amoxicilline 250mg</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dépôt
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none">
                                <option value="">Tous les dépôts</option>
                                <option value="PHAR01">PHAR01 - Pharmacie principale</option>
                                <option value="BLOC">BLOC - Bloc opératoire</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date début
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date fin
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleGenerate}
                            className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            <FileText className="h-5 w-5 mr-2" />
                            Générer la fiche
                        </button>
                        {stockCardData && (
                            <>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                >
                                    <Printer className="h-5 w-5 mr-2" />
                                    Imprimer
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Export PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Fiche de Stock */}
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-end mx-auto mb-4"></div>
                            <p className="text-gray-600">Génération en cours...</p>
                        </div>
                    </div>
                ) : stockCardData ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        {/* En-tête */}
                        <div className="border-b-2 border-gray-300 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
                                FICHE DE STOCK
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Code article:</p>
                                    <p className="font-bold">{stockCardData.article.code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Désignation:</p>
                                    <p className="font-bold">{stockCardData.article.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Catégorie:</p>
                                    <p className="font-bold">{stockCardData.article.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Unité:</p>
                                    <p className="font-bold">{stockCardData.article.unit}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Dépôt:</p>
                                    <p className="font-bold">
                                        {stockCardData.warehouse.code} - {stockCardData.warehouse.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Table des mouvements */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-2 text-left" rowSpan="2">
                                            Date
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-left" rowSpan="2">
                                            Référence
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-left" rowSpan="2">
                                            Libellé
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">
                                            ENTRÉES
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">
                                            SORTIES
                                        </th>
                                        <th className="border border-gray-300 px-2 py-2 text-center" colSpan="3">
                                            STOCK
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-2 py-1 text-right">Qté</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">PU</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Qté</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">PU</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Qté</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">PMP</th>
                                        <th className="border border-gray-300 px-2 py-1 text-right">Valeur</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockCardData.movements.map((movement, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-2 py-2">
                                                {formatDate(movement.date)}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 font-medium">
                                                {movement.reference}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2">
                                                {movement.description}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.entry_qty || "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.entry_price ? formatCurrency(movement.entry_price) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.entry_value ? formatCurrency(movement.entry_value) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.exit_qty || "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.exit_price ? formatCurrency(movement.exit_price) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">
                                                {movement.exit_value ? formatCurrency(movement.exit_value) : "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-bold">
                                                {movement.balance_qty}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-bold">
                                                {formatCurrency(movement.pmp)}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-bold bg-green-50">
                                                {formatCurrency(movement.balance_value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-200 font-bold">
                                        <td colSpan="9" className="border border-gray-300 px-2 py-2 text-right">
                                            SOLDE FINAL:
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right">
                                            {stockCardData.movements[stockCardData.movements.length - 1].balance_qty}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right">
                                            {formatCurrency(
                                                stockCardData.movements[stockCardData.movements.length - 1].pmp
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right bg-green-100">
                                            {formatCurrency(
                                                stockCardData.movements[stockCardData.movements.length - 1].balance_value
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mentions légales */}
                        <div className="mt-6 pt-4 border-t border-gray-300">
                            <p className="text-xs text-gray-600">
                                <strong>Note:</strong> Fiche de stock établie conformément à l'Acte Uniforme OHADA
                                relatif au droit comptable et à l'information financière (Articles 17-18).
                                Méthode de valorisation: Prix Moyen Pondéré (PMP).
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Aucune fiche générée
                        </h3>
                        <p className="text-gray-600">
                            Sélectionnez un article et cliquez sur "Générer la fiche" pour afficher les mouvements
                        </p>
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
