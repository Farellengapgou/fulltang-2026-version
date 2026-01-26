import {
  FaHome,
  FaChartBar,
  FaEdit,
  FaBook,
  FaUserTie,
  FaChartLine,
  FaCalculator,
  FaBuilding,
  FaFileAlt,
  FaTruck,
  FaBoxes,
  FaUniversity,
  FaUsers,
  FaQuestionCircle,
  FaLock,
} from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";

export const FinancialAccountantNavLink = [
  {
    name: "Tableau De Bord",
    link: appRoutes.financialAccountantHome,
    icon: FaHome,
  },
  {
    name: "Comptabilité De Base",
    subLinks: [
      {
        name: "Plan Comptable",
        link: appRoutes.financialAccountantChartOfAccount,
        icon: FaChartBar,
      },
      {
        name: "Journal Comptable",
        link: appRoutes.financialAccountantAccountingJournals,
        icon: FaBook,
      },
      {
        name: "Écritures Comptable",
        link: appRoutes.financialAccountantJournalEntries,
        icon: FaEdit,
      },
      {
        name: "Périodes Comptables",
        link: appRoutes.periodClose,
        icon: FaLock,
      },
    ],
  },
  {
    name: "Tiers",
    subLinks: [
      {
        name: "Clients",
        link: appRoutes.customers,
        icon: FaUsers,
      },
      {
        name: "Fournisseurs",
        link: appRoutes.suppliers,
        icon: FaTruck,
      },
    ],
  },
  {
    name: "Actifs Et Stocks",
    subLinks: [
      {
        name: "Immobilisations",
        link: appRoutes.fixedAssetsRegister,
        icon: FaBuilding,
      },
      {
        name: "Inventaire",
        link: appRoutes.inventoryValuation,
        icon: FaBoxes,
      },
    ],
  },
  {
    name: "Gestion de Paie",
    link: appRoutes.financialAccountPayroll,
    icon: FaUserTie,
  },
  {
    name: "Fiscalité",
    subLinks: [
      {
        name: "TVA",
        link: appRoutes.vatCalculation,
        icon: FaCalculator,
      },
      {
        name: "Taux Fiscaux",
        link: appRoutes.taxCalendar,
        icon: FaChartLine,
      },
      {
        name: "Déclarations Fiscales",
        link: appRoutes.taxDeclarations,
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Trésorerie",
    subLinks: [
      {
        name: "Comptes Bancaires",
        link: appRoutes.cashPositions,
        icon: FaUniversity,
      },
      {
        name: "Réconciliation Bancaire",
        link: appRoutes.bankReconciliation,
        icon: FaCalculator,
      },
    ],
  },
  {
    name: "Budget",
    link: appRoutes.budgetEntry,
    icon: FaCalculator,
  },
  {
    name: "Analyse Et Ratios",
    subLinks: [
      {
        name: "Ratios Financiers",
        link: appRoutes.financialRatios,
        icon: FaChartLine,
      },
      {
        name: "Comptes Analytiques",
        link: appRoutes.profitabilityAnalysis,
        icon: FaChartBar,
      },
    ],
  },
  {
    name: "Rapports Financiers",
    link: appRoutes.financialStatements,
  },
  {
    name: "Centre d'Aide",
    link: appRoutes.helpCenter,
    icon: FaQuestionCircle,
  },
];
