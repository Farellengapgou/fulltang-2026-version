import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { nurseNavLink } from "./nurseNavLink.js";
import { NurseNavBar } from "./NurseNavBar.jsx";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";

export function NurseMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={DashBoard}
      NavBarComponent={NurseNavBar}
      navLink={nurseNavLink}
      requiredRole="Nurse"
    />
  );
}
