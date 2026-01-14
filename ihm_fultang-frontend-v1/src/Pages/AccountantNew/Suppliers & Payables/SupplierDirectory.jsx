import { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function SupplierDirectory() {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Pharma Solutions",
      contact: "Moussa Diop",
      phone: "+221 77 123 4567",
      email: "contact@pharmasol.sn",
      address: "Dakar, Senegal",
      paymentTerms: "Net 30",
      status: "active",
    },
    {
      id: 2,
      name: "Medical Supplies Ltd",
      contact: "Jean Sarr",
      phone: "+221 77 234 5678",
      email: "supplies@medsup.sn",
      address: "Thiès, Senegal",
      paymentTerms: "Net 45",
      status: "active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FinancialAccountantDashBoard
      linkList={FinancialAccountantNavLink}
      requiredRole={"Accountant"}
    >
      <FinancialAccountantNavBar />
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-xl text-white p-8 mb-8 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Répertoire des Fournisseurs
                </h1>
                <p className="opacity-90">
                  Gérez vos relations fournisseurs et conditions de paiement
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Fournisseur
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
              />
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-gray-600">{supplier.contact}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {supplier.status === "active" ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary-end" />
                    {supplier.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-primary-end" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary-end" />
                    {supplier.address}
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Conditions:{" "}
                    <span className="text-primary-end">
                      {supplier.paymentTerms}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="flex-1 p-2 text-orange-600 hover:bg-orange-50 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
