import { DoctorMessagePage } from "./DoctorMessagePage.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { SpecialistNavBar } from "./DoctorComponents/SpecialistNavBar.jsx";
import { specialistNavLink } from "./lib/specialistNavLink.js";

export function SpecialistMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={CustomDashboard}
      NavBarComponent={SpecialistNavBar}
      navLink={specialistNavLink}
      requiredRole="Specialist"
    />
  );
}
