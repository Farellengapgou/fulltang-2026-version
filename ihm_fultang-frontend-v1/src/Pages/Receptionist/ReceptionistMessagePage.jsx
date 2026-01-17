import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";

export function ReceptionistMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={DashBoard}
      NavBarComponent={ReceptionistNavBar}
      navLink={receptionistNavLink}
      requiredRole="Receptionist"
    />
  );
}
