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
  FaEnvelope,
} from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";

export const FinancialAccountantNavLink = [
  {
    name: "Dashboard",
    link: appRoutes.financialAccountantHome,
    icon: FaHome,
  },
  {
    name: "Basic Accounting",
    subLinks: [
      {
        name: "Chart of Accounts",
        link: appRoutes.financialAccountantChartOfAccount,
        icon: FaChartBar,
      },
      {
        name: "Accounting Journals",
        link: appRoutes.financialAccountantAccountingJournals,
        icon: FaBook,
      },
      {
        name: "Journal Entries",
        link: appRoutes.financialAccountantJournalEntries,
        icon: FaEdit,
      },
      {
        name: "Accounting Periods",
        link: appRoutes.periodClose,
        icon: FaLock,
      },
    ],
  },
  {
    name: "Third Parties",
    subLinks: [
      {
        name: "Customers",
        link: appRoutes.customers,
        icon: FaUsers,
      },
      {
        name: "Suppliers",
        link: appRoutes.suppliers,
        icon: FaTruck,
      },
    ],
  },
  {
    name: "Assets & Inventory",
    subLinks: [
      {
        name: "Fixed Assets",
        link: appRoutes.fixedAssetsRegister,
        icon: FaBuilding,
      },
      {
        name: "Inventory",
        link: appRoutes.inventoryValuation,
        icon: FaBoxes,
      },
    ],
  },
  {
    name: "Payroll Management",
    link: appRoutes.financialAccountPayroll,
    icon: FaUserTie,
  },
  {
    name: "Taxation",
    subLinks: [
      {
        name: "TVA",
        link: appRoutes.vatCalculation,
        icon: FaCalculator,
      },
      {
        name: "Tax Rates",
        link: appRoutes.taxCalendar,
        icon: FaChartLine,
      },
      {
        name: "Tax Declarations",
        link: appRoutes.taxDeclarations,
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Cash Management",
    subLinks: [
      {
        name: "Bank Accounts",
        link: appRoutes.cashPositions,
        icon: FaUniversity,
      },
      {
        name: "Bank Reconciliation",
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
    name: "Analysis & Ratios",
    subLinks: [
      {
        name: "Financial Ratios",
        link: appRoutes.financialRatios,
        icon: FaChartLine,
      },
      {
        name: "Analytic Accounts",
        link: appRoutes.profitabilityAnalysis,
        icon: FaChartBar,
      },
    ],
  },
  {
    name: "Financial Reports",
    link: appRoutes.financialStatements,
  },
  {
    name: "Notifications",
    link: appRoutes.accountantMessage,
    icon: FaEnvelope,
  },
  {
    name: "Help Center",
    link: appRoutes.helpCenterPage,
    icon: FaQuestionCircle,
  },
];
