import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { cashierNavLink } from "./cashierNavLink.js";
import { CashierNavBar } from "./CashierNavBar.jsx";

export function CashierMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={CustomDashboard}
      NavBarComponent={CashierNavBar}
      navLink={cashierNavLink}
      requiredRole="Cashier"
    />
  );
}
