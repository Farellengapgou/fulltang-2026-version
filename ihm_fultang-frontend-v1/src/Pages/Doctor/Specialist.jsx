import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { specialistNavLink } from "./lib/specialistNavLink.js";
import { SpecialistNavBar } from "./DoctorComponents/SpecialistNavBar.jsx";

export function Specialist() {
  return (
    <CustomDashboard linkList={specialistNavLink} requiredRole="Specialist">
      <SpecialistNavBar />
      <div className="mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800">Specialist</h1>
        <p className="mt-2 text-gray-600">
          Accedez rapidement aux messages et aux informations principales.
        </p>
      </div>
    </CustomDashboard>
  );
}
