import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { adminNavLink } from "./adminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";

export function AdminMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={CustomDashboard}
      NavBarComponent={AdminNavBar}
      navLink={adminNavLink}
      requiredRole="Admin"
      showComposer={true}
    />
  );
}
