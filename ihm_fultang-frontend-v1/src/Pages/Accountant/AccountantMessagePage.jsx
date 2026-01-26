import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { AccountantNavLink } from "./AccountantNavLink.js";
import { AccountantNavBar } from "./Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "./Components/AccountantDashboard.jsx";

export function AccountantMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={AccountantDashBoard}
      NavBarComponent={AccountantNavBar}
      navLink={AccountantNavLink}
      requiredRole="Accountant"
    />
  );
}
