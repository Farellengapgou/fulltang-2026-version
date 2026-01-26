import {FaHistory, FaHome, FaQuestionCircle, FaUsers, FaEnvelope} from "react-icons/fa";
import {AppRoutesPaths as appRoutes} from "../../../Router/appRouterPaths.js";
import { Calendar } from "lucide-react";
import {FiList} from "react-icons/fi";



export const dentistNavLink = [
    {
        name: "Dashboard",
        link: appRoutes.dentistPage,
        icon: FaHome,
    },
    {
        name: 'Patient List',
        icon: FaUsers,
        link: appRoutes.dentistPatientList,
    },

    {
        name: 'Consultation',
        icon: FiList,
        subLinks: [
            {
                icon: FiList,
                name: "Consultation List",
                link: appRoutes.dentistConsultationList
            },
            {
                icon: FaHistory,
                name: "Consultation History",
                link: appRoutes.dentistConsultationHistory
            },
          /*  {
                icon: FaPlus,
                name: "Add A Consultation",
                link: appRoutes.dentistAddConsultation
            }*/
        ]
    },
    {
        name: 'Notifications',
        icon: FaEnvelope,
        link: appRoutes.dentistMessage,
    },
    {
        name: 'Appointments',
        icon: Calendar,
        link: appRoutes.dentistAppointment,
    },
   /* {
        name: 'Exams',
        icon: FaNotesMedical,
        link: appRoutes.dentistExamList,
    },*/
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
    
];
