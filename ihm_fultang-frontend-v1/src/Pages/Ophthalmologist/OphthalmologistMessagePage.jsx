import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { OphthalmologistNavBar } from "./OphthalmologistComponents/OphthalmologistNavBar.jsx";
import { ophthaNavLink } from "./lib/OphthalmologistNavLink.js";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";

export function OphthaMessage() {
  return (
    <DoctorMessagePage
      DashboardComponent={CustomDashboard}
      NavBarComponent={OphthalmologistNavBar}
      navLink={ophthaNavLink}
      requiredRole="Ophthalmologist"
    />
  );
}
