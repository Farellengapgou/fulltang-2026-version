import {
    FaHome,
    FaBoxes,
    FaCog,
    FaWarehouse,
    FaTruck,
    FaClipboardList,
    FaExchangeAlt,
    FaFileInvoice,
    FaChartBar,
    FaQuestionCircle,
} from "react-icons/fa";
import { Package, PackageCheck, PackageX, Layers, TrendingUp, ShoppingCart, FolderTree } from "lucide-react";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";

export const MaterialAccountingNavLink = [
    {
        name: "Dashboard",
        link: appRoutes.materialAccountingDashboard,
        icon: FaHome,
        description: "Vue d'ensemble du stock",
    },

    // Configuration
    {
        name: "Configuration",
        icon: FaCog,
        subLinks: [
            {
                icon: Layers,
                name: "Catégories",
                link: appRoutes.materialCategories,
                description: "Gestion des catégories d'articles",
            },
            {
                icon: FolderTree,
                name: "Familles",
                link: appRoutes.materialFamilies,
                description: "Gestion des familles (sous-catégories)",
            },
            {
                icon: ShoppingCart,
                name: "Articles",
                link: appRoutes.materialArticles,
                description: "Catalogue des articles",
            },
            {
                icon: FaWarehouse,
                name: "Dépôts",
                link: appRoutes.materialWarehouses,
                description: "Gestion des magasins et dépôts",
            },
            {
                icon: FaTruck,
                name: "Fournisseurs",
                link: appRoutes.materialSuppliers,
                description: "Gestion des fournisseurs",
            },
        ],
    },

    // Gestion des Stocks
    {
        name: "Gestion des Stocks",
        icon: FaBoxes,
        subLinks: [
            {
                icon: FaBoxes,
                name: "États des Stocks",
                link: appRoutes.materialStockLevels,
                description: "Niveaux de stock par dépôt",
            },
            {
                icon: Package,
                name: "Lots",
                link: appRoutes.materialBatches,
                description: "Gestion des lots et péremptions",
            },
            {
                icon: TrendingUp,
                name: "Mouvements",
                link: appRoutes.materialMovements,
                description: "Historique des mouvements",
            },
        ],
    },

    // Opérations
    {
        name: "Opérations",
        icon: FaExchangeAlt,
        subLinks: [
            {
                icon: PackageCheck,
                name: "Bons d'Entrée",
                link: appRoutes.materialReceipts,
                description: "Réceptions de marchandises",
            },
            {
                icon: PackageX,
                name: "Bons de Sortie",
                link: appRoutes.materialIssues,
                description: "Sorties de stock",
            },
            {
                icon: FaExchangeAlt,
                name: "Transferts",
                link: appRoutes.materialTransfers,
                description: "Transferts inter-dépôts",
            },
        ],
    },

    // Inventaires
    {
        name: "Inventaires",
        icon: FaClipboardList,
        subLinks: [
            {
                icon: FaClipboardList,
                name: "Inventaires Physiques",
                link: appRoutes.materialInventories,
                description: "Comptages et ajustements",
            },
        ],
    },

    // Analyses & Rapports
    {
        name: "Analyses & Rapports",
        icon: FaChartBar,
        subLinks: [
            {
                name: "Fiche de Stock",
                link: appRoutes.materialStockCard,
                description: "Fiche de stock (OHADA)",
            },
            {
                name: "Inventaire Permanent",
                link: appRoutes.materialPerpetualInventory,
                description: "État valorisé des stocks",
            },
            {
                name: "Analyse ABC",
                link: appRoutes.materialABCAnalysis,
                description: "Analyse 20/80 (Pareto)",
            },
            {
                name: "Rotation des Stocks",
                link: appRoutes.materialTurnoverRate,
                description: "Taux de rotation et écoulement",
            },
            {
                name: "Rapprochement Stock-Compta",
                link: appRoutes.materialReconciliation,
                description: "Concordance inventaire/compta",
            },
        ],
    },

    {
        name: "Aide",
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
        description: "Documentation et support",
    },
];
