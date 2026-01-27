import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
import { PharmacyDashboard } from "./PharmacyDashboard.jsx";
import { PharmacyNavbar } from "./PharmacyNavBar.jsx";
import { AccessDenied } from "../../GlobalComponents/AccessDenied.jsx";
import { Loading } from "../../GlobalComponents/Loading.jsx";
import { useAuthentication } from "../../Utils/Provider.jsx";
import { useEffect, useState } from "react";

function PharmacyDashboardWrapper({ children, requiredRole }) {
  const { isAuthenticated, hasRole } = useAuthentication();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated()) {
    return null;
  }

  if (!hasRole(requiredRole)) {
    return <AccessDenied Role={requiredRole} />;
  }

  return <PharmacyDashboard>{children}</PharmacyDashboard>;
}

export function PharmacyMessagePage() {
  return (
    <DoctorMessagePage
      DashboardComponent={PharmacyDashboardWrapper}
      NavBarComponent={PharmacyNavbar}
      navLink={[]}
      requiredRole="Pharmacist"
    />
  );
}
