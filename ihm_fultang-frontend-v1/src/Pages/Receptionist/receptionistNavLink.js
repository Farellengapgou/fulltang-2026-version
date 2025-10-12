import {Calendar, Users} from "lucide-react";
import {AppRoutesPaths as appRoutes} from "../../Router/appRouterPaths.js";
import {FaQuestionCircle, FaUserMd} from "react-icons/fa";

export const receptionistNavLink = [
    {
        name: 'Patient List',
        icon: Users,
        link: appRoutes.receptionistPage,
    },
    {
        name: 'Medical Staffs',
        icon: FaUserMd,
        link: appRoutes.receptionistMedicalStaffsPage,
    },
    {
        name: 'Appointments',
        icon: Calendar,
        link: appRoutes.appointmentsPage,
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }

    ]