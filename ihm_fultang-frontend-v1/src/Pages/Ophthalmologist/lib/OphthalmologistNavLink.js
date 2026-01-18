import {FaHistory, FaHome, FaQuestionCircle, FaUsers, FaEnvelope} from "react-icons/fa";
import {AppRoutesPaths as appRoutes} from "../../../Router/appRouterPaths.js";
import { Calendar } from "lucide-react";
import {FiList} from "react-icons/fi";

export const ophthaNavLink = [
    {
        name: "Dashboard",
        link: appRoutes.ophthalmologistPage,
        icon: FaHome,
    },
    {
        name: 'Patient List',
        icon: FaUsers,
        link: appRoutes.ophthaPatientList,
    },
    {
        name: 'Consultation',
        icon: FiList,
        subLinks: [
            {
                icon: FiList,
                name: "Consultation List",
                link: appRoutes.ophthaConsultationList
            },
            {
                icon: FaHistory,
                name: "Consultation History",
                link: appRoutes.ophthaConsultationHistory
            },
        ]
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
]