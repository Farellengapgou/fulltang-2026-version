import {
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaEye,
  FaSearch,
} from "react-icons/fa";
import { Tooltip } from "antd";
import { useEffect, useState } from "react";
import { ViewPatientDetailsModal } from "../Receptionist/ViewPatientDetailsModal.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import { LaboratoryDashBoard } from "../Laboratory/LaboratoryDashBoard.jsx";
import { LaboratoryNavBar } from "../Laboratory/LaboratoryNavBar.jsx";
import { laboratoryNavLink } from "../Laboratory/LaboratoryNavLink.js";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../Utils/Provider.jsx";
import { FaUserMd } from "react-icons/fa";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";

export function LaboratoryPatientList() {
  const [selectedPatientDetails, setSelectedPatientDetails] = useState({});
  const [canOpenViewPatientDetailModal, setCanOpenViewPatientDetailModal] =
    useState(false);
  const [patients, setPatients] = useState([]);
  const [numberOfPatients, setNumberOfPatients] = useState(0);
  const [nexUrlForRenderPatientList, setNexUrlForRenderPatientList] =
    useState("");
  const [previousUrlForRenderPatientList, setPreviousUrlForRenderPatientList] =
    useState("");
  const [actualPageNumber, setActualPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Filtre les patients
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.address?.toLowerCase().includes(searchLower)
    );
  });

  // Cette fonction calcule le nombre de pages en se basant sur 5 patients par page
  function calculateNumberOfSlide() {
    if (numberOfPatients === 0) return 1;
    return numberOfPatients % 5 === 0
      ? numberOfPatients / 5
      : Math.floor(numberOfPatients / 5) + 1;
  }

  function updateActualPageNumber(action) {
    if (action === "next") {
      if (actualPageNumber < calculateNumberOfSlide()) {
        setActualPageNumber(actualPageNumber + 1);
      }
    } else {
      if (actualPageNumber > 1) {
        setActualPageNumber(actualPageNumber - 1);
      }
    }
  }

  // On utilise ici l'endpoint des exam-request pour récupérer la liste des examens,
  // puis on en extrait les patients.
  // On utilise ici l'endpoint des exam-request pour récupérer la liste des examens,
  // puis on en extrait les patients.
  async function fetchPatients() {
    try {
      const response = await axiosInstance.get("/exam-request/");
      if (response.status === 200) {
        console.log(response.data);
        // L'API peut renvoyer directement un tableau ou un objet contenant une propriété "results"
        const examRequests = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        // Filtrer uniquement les examens non complétés
        const pendingExams = examRequests.filter(
          (exam) => exam.examStatus !== "Completed",
        );

        // Extraire le patient de chaque examen non complété
        const patientsArr = pendingExams
          .map((exam) => exam.idPatient)
          .filter(Boolean);

        // Filtrer les doublons en utilisant une Map (clé = patient.id)
        const uniquePatients = Array.from(
          new Map(patientsArr.map((p) => [p.id, p])).values(),
        );
        setPatients(uniquePatients);
        setNumberOfPatients(uniquePatients.length);
        // Si votre API est paginée, vous pouvez récupérer next/previous s'ils existent
        setNexUrlForRenderPatientList(response.data.next || "");
        setPreviousUrlForRenderPatientList(response.data.previous || "");
      }
    } catch (error) {
      setPatients([]);
      setNumberOfPatients(0);
      setNexUrlForRenderPatientList("");
      setPreviousUrlForRenderPatientList("");
      console.log(error);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchNextOrPreviousPatientList(url) {
    if (url) {
      try {
        const response = await axiosInstance.get(url);
        if (response.status === 200) {
          const examRequests = Array.isArray(response.data)
            ? response.data
            : response.data.results || [];
          const patientsArr = examRequests.map((exam) => exam.idPatient);
          const uniquePatients = Array.from(
            new Map(patientsArr.map((p) => [p.id, p])).values(),
          );
          setPatients(uniquePatients);
          setNumberOfPatients(uniquePatients.length);
          setNexUrlForRenderPatientList(response.data.next || "");
          setPreviousUrlForRenderPatientList(response.data.previous || "");
        }
      } catch (error) {
        setPatients([]);
        setNumberOfPatients(0);
        setPreviousUrlForRenderPatientList("");
        setNexUrlForRenderPatientList("");
        console.log(error);
      }
    }
  }

  return (
    <LaboratoryDashBoard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
      <LaboratoryNavBar />
      <div className="mt-5 flex flex-col relative">
        {/* Header content with search bar */}
        <div className="flex justify-between mb-5">
          <p className="font-bold text-xl mt-2 ml-5">
            List Of Patient ({filteredPatients.length})
          </p>
          <div className="flex mr-6">
            <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
              <FaSearch className="text-xl text-secondary m-2" />
              <input
                type="text"
                placeholder="search for a specific patient"
                className="flex-1 border-none focus:outline-none focus:ring-0 pr-2 rounded-r-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List of registered patients */}
        <div className="ml-5 mr-5 ">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end border-gray-200 rounded-l-2xl ">
                  No
                </th>
                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end border-gray-200">
                  First Name
                </th>
                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end border-gray-200">
                  Last Name
                </th>
                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end border-gray-200">
                  Gender
                </th>
                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end border-gray-200">
                  Address
                </th>
                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end flex-col rounded-r-2xl">
                  <p>Actions</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr
                  key={patient.id || index}
                  className="cursor-pointer hover:bg-gray-200 hover:opacity-60 transition-colors duration-200"
                  onClick={() => {
                    setSelectedPatientDetails(patient);
                    setCanOpenViewPatientDetailModal(true);
                  }}
                >
                  <td className="px-6 py-5 rounded-l-xl bg-gray-100 border-l-4 border-primary-start">
                    <div className="w-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-gray-100">
                    <div className="w-full flex items-center justify-center">
                      {patient.firstName}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-gray-100">
                    <div className="w-full flex items-center justify-center">
                      {patient.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-gray-100">
                    <div className="w-full flex items-center justify-center">
                      {patient.gender}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-gray-100">
                    <div className="w-full flex items-center justify-center">
                      {patient.address}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-gray-100">
                    <div className="w-full items-center justify-center flex gap-6">
                      <Tooltip
                        placement={"right"}
                        title={"View Medical Folder"}
                      >
                        <button
                          onClick={() => {
                            navigate(
                              `${AppRoutesPaths.LaboratoryPatientMedicalFolderPage.replace(":id", patient.id)}`,
                            );
                          }}
                          className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                        >
                          <FaEdit />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 && (
            <div className="p-8 mt-24 flex items-center justify-center">
              <div className="flex flex-col">
                <FaUserMd className="h-16 w-16 text-primary-end mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">
                  No Patient
                </h2>
                <p className="text-gray-600 mb-4 mx-auto text-center">
                  There are no patients with exam requests yet. Once registered,
                  they will appear here.
                </p>
                <button
                  className="px-4 hover:bg-primary-start duration-300 mx-auto py-2 bg-primary-end text-white rounded-lg transition-all"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Reload
                </button>
              </div>
            </div>
          )}

          {/* Pagination content */}
          {filteredPatients.length > 0 && numberOfPatients > 0 && (
            <div className="fixed w-full justify-center bottom-0 flex mt-6 mb-4 left-20">
              <div className="flex gap-4">
                <Tooltip placement={"left"} title={"previous slide"}>
                  <button
                    onClick={async () => {
                      await fetchNextOrPreviousPatientList(
                        previousUrlForRenderPatientList,
                      );
                      updateActualPageNumber("prev");
                    }}
                    className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2"
                  >
                    <FaArrowLeft />
                  </button>
                </Tooltip>
                <p className="text-secondary text-2xl font-bold mt-4">
                  {numberOfPatients === 0
                    ? "0/0"
                    : `${actualPageNumber}/${calculateNumberOfSlide()}`}
                </p>
                <Tooltip placement={"right"} title={"next slide"}>
                  <button
                    onClick={async () => {
                      await fetchNextOrPreviousPatientList(
                        nexUrlForRenderPatientList,
                      );
                      updateActualPageNumber("next");
                    }}
                    className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2"
                  >
                    <FaArrowRight />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Modal for viewing patient details */}
          <ViewPatientDetailsModal
            isOpen={canOpenViewPatientDetailModal}
            patient={selectedPatientDetails}
            onClose={() => {
              setCanOpenViewPatientDetailModal(false);
            }}
          />
        </div>
      </div>
    </LaboratoryDashBoard>
  );
}
