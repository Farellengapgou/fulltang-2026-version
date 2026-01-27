import { FaEnvelope, FaHome, FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";

export const dentistNavLink = [
  {
    name: "Dashboard",
    link: appRoutes.dentistPage,
    icon: FaHome,
  },
  {
    name: "Notifications",
    icon: FaEnvelope,
    link: appRoutes.dentistMessage,
  },
  {
    name: "Help Center",
    icon: FaQuestionCircle,
    link: appRoutes.helpCenterPage,
  },
];
