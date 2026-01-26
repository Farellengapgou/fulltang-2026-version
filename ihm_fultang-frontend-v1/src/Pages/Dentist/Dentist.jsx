import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { DentistNavBar } from "./DentistNavBar.jsx";
import { dentistNavLink } from "./DentistNavLink.js";

export function Dentist() {
  return (
    <CustomDashboard linkList={dentistNavLink} requiredRole="Dentist">
      <DentistNavBar />
      <div className="mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800">Dentist</h1>
        <p className="mt-2 text-gray-600">
          Accedez rapidement aux messages et aux informations principales.
        </p>
      </div>
    </CustomDashboard>
  );
}
