import { FaHome, FaPills, FaBoxes, FaQuestionCircle, FaChartLine, FaFilePrescription, FaShoppingBasket, FaHistory, FaCashRegister } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../../Router/appRouterPaths.js";
import { Package } from "lucide-react";

export const pharmacyNavLink = [
    {
        name: "Dashboard",
        link: appRoutes.pharmacyPage,
        icon: FaHome,
    },
    {
        name: 'Medications',
        icon: FaPills,
        subLinks: [
            {
                icon: Package,
                name: "Medications List",
                link: appRoutes.pharmacyMedicationList
            },
            {
                icon: FaBoxes,
                name: "Add Medication",
                link: appRoutes.pharmacyAddMedication
            }
        ]
    },
    {
        name: 'Sales',
        icon: FaCashRegister,
        subLinks: [
            {
                name: "Prescription Sales",
                link: appRoutes.pharmacyPrescriptionSales,
                icon: FaFilePrescription
            },
            {
                name: "OTC Sales",
                link: appRoutes.pharmacyOTCSales,
                icon: FaShoppingBasket
            },
            {
                name: "Sales History",
                link: appRoutes.pharmacySalesHistory,
                icon: FaHistory
            }
        ]
    },
    {
        name: 'Stock Report',
        icon: FaChartLine,
        link: appRoutes.pharmacyReports,
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];
