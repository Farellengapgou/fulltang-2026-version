import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import supplierService from "../../../Services/Accounting/supplierService";

export function SupplierDirectory() {
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadSuppliers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await supplierService.getAllSuppliers();
            // Simulation
            if (!data || data.length === 0) {
                 setSuppliers([
                     { id: 1, name: 'CAMEG', category: 'Médicaments', email: 'contact@cameg.cm', phone: '+237 222 22 22 22', address: 'Douala, Cameroun', balance: 5000000 },
                     { id: 2, name: 'Laborex', category: 'Réactifs Labo', email: 'info@laborex.cm', phone: '+237 233 33 33 33', address: 'Yaoundé, Cameroun', balance: 1200000 },
                     { id: 3, name: 'Eneo', category: 'Services Publics', email: 'service-client@eneo.cm', phone: '8010', address: 'Douala', balance: 450000 },
                 ]);
            } else {
                setSuppliers(data);
            }
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Impossible de charger les fournisseurs.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Annuaire Fournisseurs</h1>
                        <p className="text-gray-600 mt-1">Gestion de la base de fournisseurs</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadSuppliers} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                        <button className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouveau Fournisseur
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un fournisseur..."
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => (
                            <div key={supplier.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-teal-100 text-teal-700 font-bold rounded-lg w-12 h-12 flex items-center justify-center text-xl">
                                            {supplier.name ? supplier.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex space-x-1">
                                            <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"><Edit2 size={16}/></button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{supplier.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{supplier.category || 'Fournisseur Général'}</p>
                                    
                                    <div className="space-y-2">
                                        {supplier.email && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail size={16} className="mr-2 text-gray-400"/>
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone size={16} className="mr-2 text-gray-400"/>
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin size={16} className="mr-2 text-gray-400"/>
                                                <span className="truncate">{supplier.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Solde Dû</span>
                                    <span className="font-bold text-gray-800">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(supplier.balance || 0)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">{isLoading ? "Chargement..." : "Aucun fournisseur trouvé"}</p>
                        </div>
                    )}
                </div>
            </div>
        </AccountantDashBoard>
    );
}
