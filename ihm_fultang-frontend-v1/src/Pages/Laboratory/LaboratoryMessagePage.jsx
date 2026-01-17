import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { laboratoryNavLink } from "./LaboratoryNavLink.js";
import { LaboratoryNavBar } from "./LaboratoryNavBar.jsx";
import { LaboratoryDashBoard } from "./LaboratoryDashBoard.jsx";

export function LaboratoryMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={LaboratoryDashBoard}
      NavBarComponent={LaboratoryNavBar}
      navLink={laboratoryNavLink}
      requiredRole="Labtech"
    />
  );
}
