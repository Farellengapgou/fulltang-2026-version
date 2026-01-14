import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Download,
  Eye,
  Filter,
} from "lucide-react";
import { FinancialAccountantDashBoard } from "../DashBoard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import { FinancialAccountantNavBar } from "../NavBar.jsx";

export function CustomReports() {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Rapport Activité Mensuelle",
      description: "Détail des revenus et dépenses par département",
      category: "Activité",
      createdDate: "2025-06-01",
      lastModified: "2025-06-14",
      format: "PDF/Excel",
      owner: "Comptable Senior",
    },
    {
      id: 2,
      name: "Analyse Rentabilité Services",
      description: "Profitabilité détaillée par ligne de service",
      category: "Analyse",
      createdDate: "2025-05-15",
      lastModified: "2025-06-10",
      format: "Excel",
      owner: "Analyste Financier",
    },
    {
      id: 3,
      name: "Rapport Clients Importants",
      description: "Analyse des principaux clients et leurs contributions",
      category: "Clients",
      createdDate: "2025-04-20",
      lastModified: "2025-06-08",
      format: "PDF",
      owner: "Chef Comptable",
    },
    {
      id: 4,
      name: "Suivi Budgets Départements",
      description: "Écarts budgétaires par département et catégorie",
      category: "Budget",
      createdDate: "2025-03-10",
      lastModified: "2025-06-12",
      format: "Excel/Dashboard",
      owner: "Analyste Budget",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");

  const filteredReports = reports.filter(
    (report) =>
      (report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === "Tous" || report.category === filterCategory)
  );

  const categories = ["Tous", "Activité", "Analyse", "Clients", "Budget"];

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
                  Rapports Personnalisés
                </h1>
                <p className="opacity-90">
                  Création et gestion de rapports financiers sur mesure
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50">
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Rapport
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un rapport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary-end bg-opacity-10 text-primary-end text-xs font-semibold rounded-full">
                    {report.category}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Format</p>
                      <p className="font-semibold text-gray-900">
                        {report.format}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Propriétaire</p>
                      <p className="font-semibold text-gray-900">
                        {report.owner}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Créé le</p>
                      <p className="font-semibold text-gray-900">
                        {report.createdDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Modifié le</p>
                      <p className="font-semibold text-gray-900">
                        {report.lastModified}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-primary-end text-primary-end rounded-lg hover:bg-teal-50 font-semibold flex items-center justify-center text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Aperçu
                  </button>
                  <button className="flex-1 px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-800 font-semibold flex items-center justify-center text-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-orange-600 rounded-lg hover:bg-orange-50">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Reports Template */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Modèles de Rapport Populaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Tableaux de Bord Exécutif", icon: "📊" },
                { name: "Analyse Comparative", icon: "📈" },
                { name: "Rapport Audit Interne", icon: "✓" },
                { name: "Détails par Patient", icon: "👤" },
                { name: "Performance Services", icon: "⭐" },
                { name: "Prévisions Annuelles", icon: "🔮" },
              ].map((template, idx) => (
                <button
                  key={idx}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left hover:border-primary-end border border-transparent"
                >
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <p className="font-semibold text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Créer depuis ce modèle
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FinancialAccountantDashBoard>
  );
}
