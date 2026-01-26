import { FaHome, FaPills, FaFileAlt, FaBoxes, FaQuestionCircle, FaChartLine } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../../Router/appRouterPaths.js";
import { Package } from "lucide-react";

export const pharmacyNavLink = [
    {
        name: "Dashboard",
        link: "/pharmacy/dashboard",
        icon: FaHome,
    },
    {
        name: 'Medications',
        icon: FaPills,
        subLinks: [
            {
                icon: Package,
                name: "Medications List",
                link: "/pharmacy/medications"
            },
            {
                icon: FaBoxes,
                name: "Add Medication",
                link: "/pharmacy/add-medication"
            }
        ]
    },
    {
        name: 'Sales',
        icon: FaFileAlt,
        subLinks: [
            {
                name: "Prescription Sales",
                link: "/pharmacy/sales?tab=prescription",
                icon: FaFileAlt
            },
            {
                name: "OTC Sales",
                link: "/pharmacy/sales?tab=otc",
                icon: FaFileAlt
            },
            {
                name: "Sales History",
                link: "/pharmacy/sales?tab=history",
                icon: FaFileAlt
            }
        ]
    },
    {
        name: 'Stock Report',
        icon: FaChartLine,
        link: "/pharmacy/reports",
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];
