import { FaEnvelope, FaHome, FaQuestionCircle } from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../../Router/appRouterPaths.js";

export const specialistNavLink = [
  {
    name: "Dashboard",
    link: appRoutes.specialistPage,
    icon: FaHome,
  },
  {
    name: "Messages",
    icon: FaEnvelope,
    link: appRoutes.specialistMessage,
  },
  {
    name: "Help Center",
    icon: FaQuestionCircle,
    link: appRoutes.helpCenterPage,
  },
];
