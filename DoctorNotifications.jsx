import NotificationsList from "../../GlobalComponents/Notification.jsx";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx";
import { doctorNavLink } from "./lib/doctorNavLink.js";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";

export function DoctorNotifications() {
  return (
    <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
      <DoctorNavBar />
      <NotificationsList />
    </CustomDashboard>
  );
}
