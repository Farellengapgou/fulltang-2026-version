import { useState } from "react";
import { Plus, Search, Check, X, Edit2 } from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function PhysicalInventory() {
  const [inventories, setInventories] = useState([
    {
      id: 1,
      product: "Paracétamol 500mg",
      category: "Médicaments",
      expectedQuantity: 500,
      actualQuantity: 480,
      unit: "Boîte",
      variance: -20,
      status: "counted",
    },
    {
      id: 2,
      product: "Seringue 10ml",
      category: "Fournitures",
      expectedQuantity: 2000,
      actualQuantity: 2050,
      unit: "Pièce",
      variance: 50,
      status: "counted",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

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
                <h1 className="text-3xl font-bold mb-2">Inventaire Physique</h1>
                <p className="opacity-90">
                  Enregistrement des comptages physiques
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50">
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Comptage
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Produit
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Quantité Attendue
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Quantité Comptée
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Écart
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Unité
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventories.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {item.expectedQuantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {item.actualQuantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={
                          item.variance < 0
                            ? "text-red-600 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {item.variance > 0 ? "+" : ""}
                        {item.variance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {item.status === "counted" ? "Comptée" : "En Attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
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
