import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { dentistNavLink } from "./DentistNavLink.js";
import { DentistNavBar } from "./DentistNavBar.jsx";

export function DentistMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={CustomDashboard}
      NavBarComponent={DentistNavBar}
      navLink={dentistNavLink}
      requiredRole="Dentist"
    />
  );
}
