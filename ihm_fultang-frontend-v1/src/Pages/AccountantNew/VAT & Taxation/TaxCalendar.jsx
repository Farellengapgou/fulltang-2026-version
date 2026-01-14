import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Calendar, Clock } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import taxService from "../../../Services/Accounting/taxService";

export function TaxCalendar() {
    const [isLoading, setIsLoading] = useState(false);
    const [deadlines, setDeadlines] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadDeadlines = useCallback(async () => {
        setIsLoading(true);
        try {
            // Utiliser les déclarations comme base pour le calendrier ou calendrier dédié
            // On peut tenter getTaxCalendar s'il existe (que j'ai défini dans taxService)
            let data = await taxService.getTaxCalendar();
            
            // Simulation fallback
             if (!data || data.length === 0) {
                const today = new Date();
                const currentMonth = today.toISOString().slice(0, 7);
                data = [
                    { id: 'sim-1', title: 'Déclaration TVA Mensuelle', date: `${currentMonth}-15`, status: 'PENDING', amount: 0 },
                    { id: 'sim-2', title: 'Acompte IS', date: `${currentMonth}-20`, status: 'PENDING', amount: 0 },
                     { id: 'sim-3', title: 'Déclaration IRPP sur Salaires', date: `${currentMonth}-15`, status: 'PENDING', amount: 0 }
                ];
            }

            setDeadlines(data);
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            const today = new Date();
                const currentMonth = today.toISOString().slice(0, 7);
                const data = [
                    { id: 'sim-1', title: 'Déclaration TVA Mensuelle', date: `${currentMonth}-15`, status: 'PENDING', amount: 0 },
                    { id: 'sim-2', title: 'Acompte IS', date: `${currentMonth}-20`, status: 'PENDING', amount: 0 },
                     { id: 'sim-3', title: 'Déclaration IRPP sur Salaires', date: `${currentMonth}-15`, status: 'PENDING', amount: 0 }
                ];
            setDeadlines(data);
            setErrorMessage("Mode simulation: Impossible de charger le calendrier fiscal.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDeadlines();
    }, [loadDeadlines]);

    const filteredDeadlines = deadlines.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    };

    const getDaysRemaining = (dateString) => {
        const deadline = new Date(dateString);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Calendrier Fiscal</h1>
                        <p className="text-gray-600 mt-1">Échéances et rappels</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadDeadlines} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
                            placeholder="Rechercher une échéance..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-700">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeadlines.map((event) => {
                        const daysLeft = getDaysRemaining(event.date);
                        let borderClass = "border-gray-200";
                        let bgClass = "bg-white";
                        
                        if (event.status === 'PAID' || event.status === 'SUBMITTED') {
                            borderClass = "border-green-200";
                            bgClass = "bg-green-50";
                        } else if (daysLeft < 0) {
                            borderClass = "border-red-200";
                            bgClass = "bg-red-50";
                        } else if (daysLeft <= 5) {
                            borderClass = "border-orange-200";
                            bgClass = "bg-orange-50";
                        }

                        return (
                            <div key={event.id} className={`rounded-lg shadow p-6 border ${borderClass} ${bgClass}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-full bg-white bg-opacity-60">
                                        <Calendar className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                        ${event.status === 'PAID' ? 'bg-green-200 text-green-800' : 
                                          daysLeft < 0 ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {event.status === 'PAID' ? 'Payé' : daysLeft < 0 ? 'En retard' : `${daysLeft} jours restants`}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 flex items-center">
                                    <Clock className="h-4 w-4 mr-1 inline" />
                                    {formatDate(event.date)}
                                </p>
                                <button className="w-full py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium">
                                    Voir détails
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                {!isLoading && filteredDeadlines.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow text-gray-500">
                        Aucune échéance trouvée.
                    </div>
                )}
            </div>
        </AccountantDashBoard>
    );
}
