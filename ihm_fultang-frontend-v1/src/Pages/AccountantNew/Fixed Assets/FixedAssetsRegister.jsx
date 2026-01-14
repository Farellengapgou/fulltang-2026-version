import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function FixedAssetsRegister() {
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Scanner Médical",
      category: "Équipements Médicaux",
      acquisitionDate: "2023-01-15",
      acquisitionValue: 25000000,
      residualValue: 20000000,
      usefulLife: 5,
      status: "active",
    },
    {
      id: 2,
      name: "Véhicule Ambulance",
      category: "Véhicules",
      acquisitionDate: "2022-06-20",
      acquisitionValue: 15000000,
      residualValue: 10500000,
      usefulLife: 5,
      status: "active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                  Registre des Immobilisations
                </h1>
                <p className="opacity-90">
                  Gestion des actifs immobilisés et amortissements
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50">
                <Plus className="w-5 h-5 mr-2" />
                Nouvel Actif
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un actif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
              />
            </div>
          </div>

          {/* Assets Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Désignation
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date Acquisition
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Valeur d'Acquisition
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Valeur Résiduelle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Durée Utile
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asset.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asset.acquisitionDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(asset.acquisitionValue / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {(asset.residualValue / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asset.usefulLife} ans
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
