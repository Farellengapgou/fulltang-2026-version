import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { MaterialAccountingNavLink } from "./NavLink.js";
import { AccountantNavBar } from "../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../Accountant/Components/AccountantDashboard.jsx";

export function MaterialAccountantMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={AccountantDashBoard}
      NavBarComponent={AccountantNavBar}
      navLink={MaterialAccountingNavLink}
      requiredRole="MaterialAccountant"
    />
  );
}
