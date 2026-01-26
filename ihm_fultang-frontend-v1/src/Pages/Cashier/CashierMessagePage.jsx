import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { cashierNavLink } from "./cashierNavLink.js";
import { CashierNavBar } from "./CashierNavBar.jsx";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";

export function CashierMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={DashBoard}
      NavBarComponent={CashierNavBar}
      navLink={cashierNavLink}
      requiredRole="Cashier"
    />
  );
}
