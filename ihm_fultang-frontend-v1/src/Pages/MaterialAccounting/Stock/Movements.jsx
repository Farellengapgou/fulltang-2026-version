import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { MaterialAccountingNavLink } from "../NavLink.js";
import { getMovements } from "../../../Utils/api/materialAccounting.js";

export function Movements() {
    const [movements, setMovements] = useState([]);
    const [filteredMovements, setFilteredMovements] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const movementTypes = {
        IN: { label: "Entrée", color: "green", icon: TrendingDown },
        OUT: { label: "Sortie", color: "red", icon: TrendingUp },
        TRANSFER: { label: "Transfert", color: "blue", icon: Filter },
        ADJUSTMENT: { label: "Ajustement", color: "orange", icon: Filter },
    };

    useEffect(() => {
        loadMovements();
    }, []);

    useEffect(() => {
        filterMovements();
    }, [searchTerm, typeFilter, movements]);

    const loadMovements = async () => {
        try {
            setIsLoading(true);
            const data = await getMovements();
            setMovements(data.results || []);
        } catch (error) {
            console.error("Error loading movements:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterMovements = () => {
        let filtered = movements;

        if (searchTerm) {
            filtered = filtered.filter(
                (mov) =>
                    mov.movement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mov.article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mov.article.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (typeFilter) {
            filtered = filtered.filter((mov) => mov.movement_type === typeFilter);
        }

        setFilteredMovements(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMovementIcon = (type) => {
        const IconComponent = movementTypes[type]?.icon || Filter;
        const color = movementTypes[type]?.color || "gray";
        const colorClass = {
            green: "text-green-600",
            red: "text-red-600",
            blue: "text-blue-600",
            orange: "text-orange-600",
        }[color];

        return <IconComponent className={`h-5 w-5 ${colorClass}`} />;
    };

    if (isLoading) {
        return (
            <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
                <AccountantNavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-end mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            </AccountantDashBoard>
        );
    }

    return (
        <AccountantDashBoard linkList={MaterialAccountingNavLink} requiredRole={"MaterialAccountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Mouvements de Stock</h1>
                        <p className="text-gray-600 mt-1">Historique complet et traçabilité</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Total Mouvements</p>
                        <p className="text-2xl font-bold text-gray-800">{movements.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 bg-green-50">
                        <p className="text-sm text-green-600">Entrées</p>
                        <p className="text-2xl font-bold text-green-800">
                            {movements.filter(m => m.movement_type === "IN").length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 bg-red-50">
                        <p className="text-sm text-red-600">Sorties</p>
                        <p className="text-2xl font-bold text-red-800">
                            {movements.filter(m => m.movement_type === "OUT").length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 bg-blue-50">
                        <p className="text-sm text-blue-600">Transferts</p>
                        <p className="text-2xl font-bold text-blue-800">
                            {movements.filter(m => m.movement_type === "TRANSFER").length}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par n° mouvement ou article..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                    >
                        <option value="">Tous les types</option>
                        {Object.entries(movementTypes).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </select>
                </div>

                {filteredMovements.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-primary-end rounded-l-xl text-left text-sm text-white font-bold">N° Mouvement</th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Type</th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Article</th>
                                    <th className="px-6 py-3 bg-primary-end text-left text-sm text-white font-bold">Dépôt</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Quantité</th>
                                    <th className="px-6 py-3 bg-primary-end text-right text-sm text-white font-bold">Valeur</th>
                                    <th className="px-6 py-3 bg-primary-end text-center text-sm text-white font-bold">Date</th>
                                    <th className="px-6 py-3 bg-primary-end rounded-r-xl text-left text-sm text-white font-bold">Utilisateur</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td className="px-6 py-4 bg-gray-50 border-l-4 border-primary-end rounded-l-xl">
                                            <span className="font-bold text-gray-900">{movement.movement_number}</span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {getMovementIcon(movement.movement_type)}
                                                <span className="text-sm font-medium">{movementTypes[movement.movement_type]?.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-900">{movement.article.name}</p>
                                                <p className="text-xs text-gray-500">{movement.article.code}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50">
                                            <p className="text-sm text-gray-800">
                                                {movement.movement_type === "IN"
                                                    ? movement.destination_warehouse?.name
                                                    : movement.source_warehouse?.name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <span className="font-bold text-gray-900">{movement.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-right">
                                            <span className="font-bold text-gray-900">{formatCurrency(movement.total_value)}</span>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 text-center">
                                            <p className="text-sm text-gray-600">{formatDateTime(movement.operation_date)}</p>
                                        </td>
                                        <td className="px-6 py-4 bg-gray-50 rounded-r-xl">
                                            <p className="text-sm text-gray-800">{movement.created_by.name}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Aucun mouvement trouvé</h3>
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
