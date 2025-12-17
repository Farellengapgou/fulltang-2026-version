import { useEffect, useState } from "react";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import {
    FaArrowLeft,
    FaArrowRight,
    FaEdit,
    FaEye,
    FaPlus,
    FaSearch,
    FaTimes
} from "react-icons/fa";
import { Tooltip } from "antd";
import axiosInstance from "../../Utils/axiosInstance.js";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import noPatientImage from "../../assets/noPatients.png";

import { AddNewPatientModal } from "./addNewPatientModal.jsx";
import { EditPatientInfosModal } from "./EditPatientInfosModal.jsx";
import { ViewPatientDetailsModal } from "./ViewPatientDetailsModal.jsx";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";

export function Receptionist() {
    // Modals
    const [canOpenAddNewPatientModal, setCanOpenAddNewPatientModal] = useState(false);
    const [canOpenEditPatientDetailModal, setCanOpenEditPatientDetailModal] = useState(false);
    const [canOpenViewPatientDetailModal, setCanOpenViewPatientDetailModal] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);

    // Data
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatientDetails, setSelectedPatientDetails] = useState({});

    // Pagination
    const [nextUrl, setNextUrl] = useState("");
    const [previousUrl, setPreviousUrl] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState(1);

    // UI
    const [waitData, setWaitData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Recherche temps réel
    const [searchQuery, setSearchQuery] = useState("");

    // =============================
    // FETCH PATIENTS
    // =============================
    useEffect(() => {
        async function fetchPatients() {
            setWaitData(true);
            try {
                const response = await axiosInstance.get("/patient/");
                setPatients(response.data.results);
                setFilteredPatients(response.data.results);
                setNextUrl(response.data.next);
                setPreviousUrl(response.data.previous);
                setActualPageNumber(response.data.current_page || 1);
                setNumberOfPages(response.data.total_pages || 1);
                setErrorStatus(null);
            } catch (error) {
                setErrorStatus(error.response?.status);
                setErrorMessage("Failed to load patients");
            } finally {
                setWaitData(false);
            }
        }
        fetchPatients();
    }, []);

    // =============================
    // SEARCH REAL-TIME
    // =============================
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (!value.trim()) {
            setFilteredPatients(patients);
            return;
        }

        const lowerValue = value.toLowerCase();

        const filtered = patients.filter(patient =>
            patient.firstName?.toLowerCase().includes(lowerValue) ||
            patient.lastName?.toLowerCase().includes(lowerValue) ||
            patient.phoneNumber?.includes(value) ||
            patient.email?.toLowerCase().includes(lowerValue)
        );

        setFilteredPatients(filtered);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredPatients(patients);
    };

    // =============================
    // PAGINATION
    // =============================
    const fetchNextOrPreviousPatientList = async (url) => {
        if (!url) return;
        setWaitData(true);
        try {
            const response = await axiosInstance.get(url);
            setPatients(response.data.results);
            setFilteredPatients(response.data.results);
            setNextUrl(response.data.next);
            setPreviousUrl(response.data.previous);
            setActualPageNumber(response.data.current_page);
            setNumberOfPages(response.data.total_pages);
        } catch (error) {
            console.log(error);
        } finally {
            setWaitData(false);
        }
    };

    // =============================
    // RENDER
    // =============================
    return (
        <DashBoard requiredRole="Receptionist" linkList={receptionistNavLink}>
            <ReceptionistNavBar/>

            <div className="mt-5 flex flex-col relative">
                {/* HEADER */}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5">List Of Patients</p>

                    <div className="flex mr-5">
                        <div className="flex w-[350px] h-10 border-2 border-secondary rounded-lg relative">
                            <FaSearch className="text-xl text-secondary m-2"/>
                            <input
                                type="text"
                                placeholder="Search by name, phone or email..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full border-none focus:outline-none pr-8"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                {waitData ? (
                    <div className="h-[500px] flex justify-center items-center">
                        <Loader size="medium" color="primary-end"/>
                    </div>
                ) : errorStatus ? (
                    <ServerErrorPage errorStatus={errorStatus} message={errorMessage}/>
                ) : filteredPatients.length > 0 ? (
                    <div className="ml-5 mr-5">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="bg-primary-end text-white p-4 rounded-l-xl">No</th>
                                    <th className="bg-primary-end text-white p-4">First Name</th>
                                    <th className="bg-primary-end text-white p-4">Last Name</th>
                                    <th className="bg-primary-end text-white p-4">Gender</th>
                                    <th className="bg-primary-end text-white p-4">Address</th>
                                    <th className="bg-primary-end text-white p-4 rounded-r-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient, index) => (
                                    <tr key={patient.id}>
                                        <td className="bg-gray-100 p-4 text-center">{index + 1}</td>
                                        <td className="bg-gray-100 p-4 text-center font-bold">{patient.firstName}</td>
                                        <td className="bg-gray-100 p-4 text-center">{patient.lastName}</td>
                                        <td className="bg-gray-100 p-4 text-center">{patient.gender}</td>
                                        <td className="bg-gray-100 p-4 text-center">{patient.address}</td>
                                        <td className="bg-gray-100 p-4 text-center">
                                            <div className="flex justify-center gap-4">
                                                <FaEye
                                                    className="text-primary-end cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedPatientDetails(patient);
                                                        setCanOpenViewPatientDetailModal(true);
                                                    }}
                                                />
                                                <FaEdit
                                                    className="text-green-500 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedPatientDetails(patient);
                                                        setCanOpenEditPatientDetailModal(true);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* PAGINATION ONLY IF NO SEARCH */}
                        {searchQuery === "" && (
                            <div className="flex justify-center mt-6 gap-4">
                                <button onClick={() => fetchNextOrPreviousPatientList(previousUrl)}>
                                    <FaArrowLeft/>
                                </button>
                                <p>{actualPageNumber}/{numberOfPages}</p>
                                <button onClick={() => fetchNextOrPreviousPatientList(nextUrl)}>
                                    <FaArrowRight/>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center mt-20">
                        <img src={noPatientImage} className="w-36 h-36"/>
                        <p className="mt-4 text-gray-600">
                            {searchQuery ? "No patient found" : "No patients registered"}
                        </p>
                    </div>
                )}

                {/* ADD BUTTON */}
                <Tooltip title="Add new patient">
                    <button
                        onClick={() => setCanOpenAddNewPatientModal(true)}
                        className="fixed bottom-5 right-16 w-14 h-14 rounded-full bg-primary-end text-white text-3xl"
                    >
                        <FaPlus/>
                    </button>
                </Tooltip>

                {/* MODALS */}
                <AddNewPatientModal
                    isOpen={canOpenAddNewPatientModal}
                    onClose={() => setCanOpenAddNewPatientModal(false)}
                    setCanOpenSuccessModal={setCanOpenSuccessModal}
                    setSuccessMessage={() => {}}
                    setIsLoading={setIsLoading}
                />

                <EditPatientInfosModal
                    isOpen={canOpenEditPatientDetailModal}
                    onClose={() => setCanOpenEditPatientDetailModal(false)}
                    patientData={selectedPatientDetails}
                />

                <ViewPatientDetailsModal
                    isOpen={canOpenViewPatientDetailModal}
                    patient={selectedPatientDetails}
                    onClose={() => setCanOpenViewPatientDetailModal(false)}
                />

                <SuccessModal
                    isOpen={canOpenSuccessModal}
                    message="Success"
                    canOpenSuccessModal={setCanOpenSuccessModal}
                />

                {isLoading && <Wait/>}
            </div>
        </DashBoard>
    );
}
