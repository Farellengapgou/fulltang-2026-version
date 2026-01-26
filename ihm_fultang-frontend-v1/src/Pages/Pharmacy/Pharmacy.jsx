import { Package, ShoppingCart, AlertCircle, TrendingUp, Pill, FileText, Users, Activity } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";
import { PharmacyNavbar } from "./PharmacyNavBar.jsx";
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { pharmacyNavLink } from "./lib/pharmacyNavLink.js";
import axiosInstance from '../../Utils/axiosInstance';
import { useState, useEffect } from 'react';

export function Pharmacy() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalMedications: 0,
    lowStock: 0,
    pendingOrders: 0,
    todaySales: 0
  });

  const [loading, setLoading] = useState(false);

  // Récupérer le token
  const getToken = () => localStorage.getItem("token_key_fultang");

  // Récupérer les statistiques de la pharmacie
  useEffect(() => {
    const fetchPharmacyStats = async () => {
      setLoading(true);

      try {
        const token = getToken();
        if (!token) {
          console.log("Aucun token trouvé");
          return;
        }

        // Essayer de récupérer les médicaments (Produits)
        try {
          const medicationsResponse = await axiosInstance.get("/product/");

          // Handle pagination result (response.data.results) or direct list
          const results = medicationsResponse.data.results || medicationsResponse.data;

          if (Array.isArray(results)) {
            const totalMeds = results.length;
            // Filtrer les médicaments avec stock faible (< 10 par exemple)
            const lowStockMeds = results.filter(
              med => (med.quantity || med.current_stock || 0) < 10
            ).length;

            setStats(prev => ({
              ...prev,
              totalMedications: totalMeds,
              lowStock: lowStockMeds
            }));

            console.log(`Médicaments: ${totalMeds}, Stock faible: ${lowStockMeds}`);
          }
        } catch (error) {
          console.warn("Erreur médicaments:", error.message);
          // Valeurs par défaut
          setStats(prev => ({
            ...prev,
            totalMedications: 0,
            lowStock: 0
          }));
        }

        // Essayer de récupérer les prescriptions pending
        try {
          const prescriptionsResponse = await axiosInstance.get("/prescription/");

          const pResults = prescriptionsResponse.data.results || prescriptionsResponse.data;

          if (Array.isArray(pResults)) {
            // Pending checks logic might vary depending on backend field
            // Assuming we check simply for existence or specific status if available
            const pendingPrescriptions = pResults.length;

            setStats(prev => ({
              ...prev,
              pendingOrders: pendingPrescriptions
            }));

            console.log(`Prescriptions en attente total: ${pendingPrescriptions}`);
          }
        } catch (error) {
          console.warn("Erreur prescriptions:", error.message);
          setStats(prev => ({
            ...prev,
            pendingOrders: 0
          }));
        }

        // Pour les ventes du jour, on met une valeur par défaut car cela nécessite un endpoint spécifique
        setStats(prev => ({
          ...prev,
          todaySales: 0
        }));

      } catch (error) {
        console.error("Erreur générale:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyStats();
  }, []);

  // Cartes de statistiques adaptées à la pharmacie
  const statCards = [
    {
      icon: Package,
      title: "Total Medications",
      value: stats.totalMedications,
      description: "Medications in stock",
      color: "bg-blue-500"
    },
    {
      icon: AlertCircle,
      title: "Low Stock Alert",
      value: stats.lowStock,
      description: "Items below minimum",
      color: "bg-orange-500"
    },
    {
      icon: ShoppingCart,
      title: "Pending Orders",
      value: stats.pendingOrders,
      description: "Prescriptions to fill",
      color: "bg-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Today's Sales",
      value: stats.todaySales,
      description: "Medications dispensed",
      color: "bg-green-500"
    }
  ];

  // Actions rapides adaptées à la pharmacie
  const quickActions = [
    {
      icon: Pill,
      label: "Manage Medications",
      onClick: () => navigate("/pharmacy/medications")
    },
    {
      icon: FileText,
      label: "View Prescriptions",
      onClick: () => navigate("/pharmacy/sales?tab=prescription")
    },
    {
      icon: Package,
      label: "Add New Medication",
      onClick: () => navigate("/pharmacy/add-medication")
    },
    {
      icon: Activity,
      label: "Stock Report",
      onClick: () => navigate("/pharmacy/reports")
    }
  ];

  // Affichage pendant le chargement
  if (loading) {
    return (
      <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
        <PharmacyNavbar />
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </CustomDashboard>
    );
  }

  return (
    <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
      <PharmacyNavbar />
      <div className="p-6 space-y-6">
        {/* En-tête du Dashboard */}
        <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to the Pharmacy dashboard</h1>
          <p className="opacity-90 font-semibold text-xl">
            Manage medications, track inventory, and process prescriptions efficiently from this centralized interface.
          </p>
        </div>

        {/* Cartes de Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              icon={card.icon}
              title={card.title}
              value={card.value}
              description={card.description}
              color={card.color}
            />
          ))}
        </div>

        {/* Actions Rapides */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>

        {/* Section Alertes de Stock */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Stock Alerts</h2>
          </div>
          <p className="text-gray-600">
            {stats.lowStock > 0
              ? `${stats.lowStock} medication(s) are running low on stock. Please review inventory and reorder.`
              : "All medications are well stocked. No alerts at this time."}
          </p>
        </div>
      </div>
    </CustomDashboard>
  );
}