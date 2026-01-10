import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {receptionistNavLink} from "./receptionistNavLink.js";
import {ReceptionistNavBar} from "./ReceptionistNavBar.jsx";
import {FaArrowLeft, FaArrowRight, FaPlus, FaSearch, FaTimes} from "react-icons/fa";
import {Tooltip} from "antd";
import {useEffect, useState} from "react";
import axiosInstance from "../../Utils/axiosInstance.js";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import noPatientImage from "../../assets/noPatients.png";
import {AddAppointmentModal} from "./AddAppointmentModal.jsx";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";

export function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [nextUrl, setNextUrl] = useState("");
    const [previousUrl, setPreviousUrl] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState(1);
    const [waitData, setWaitData] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [canOpenAddAppointmentModal, setCanOpenAddAppointmentModal] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch appointments
    useEffect(() => {
        fetchAppointments();
    }, []);

    async function fetchAppointments() {
        setWaitData(true);
        try {
            const response = await axiosInstance.get("/appointment/");
            if (response.status === 200) {
                // Filter only pending appointments
                const pendingAppointments = response.data.results.filter(
                    apt => apt.state === "Pending"
                );
                setAppointments(pendingAppointments);
                setFilteredAppointments(pendingAppointments);
                setNextUrl(response.data.next);
                setPreviousUrl(response.data.previous);
                setActualPageNumber(response.data.current_page || 1);
                setNumberOfPages(response.data.total_pages || 1);
                setErrorStatus(null);
            }
        } catch (error) {
            console.log(error);
            setErrorStatus(error.response?.status || 500);
            setErrorMessage("Failed to load appointments");
        } finally {
            setWaitData(false);
        }
    }

    // Pagination
    async function fetchNextOrPreviousAppointmentList(url) {
        if (!url) return;
        setWaitData(true);
        try {
            const response = await axiosInstance.get(url);
            const pendingAppointments = response.data.results.filter(
                apt => apt.state === "Pending"
            );
            setAppointments(pendingAppointments);
            setFilteredAppointments(pendingAppointments);
            setNextUrl(response.data.next);
            setPreviousUrl(response.data.previous);
            setActualPageNumber(response.data.current_page);
            setNumberOfPages(response.data.total_pages);
        } catch (error) {
            console.log(error);
        } finally {
            setWaitData(false);
        }
    }

    // Search functionality
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (!value.trim()) {
            setFilteredAppointments(appointments);
            return;
        }

        const lowerValue = value.toLowerCase();
        const filtered = appointments.filter(appointment =>
            appointment.idPatient?.firstName?.toLowerCase().includes(lowerValue) ||
            appointment.idPatient?.lastName?.toLowerCase().includes(lowerValue) ||
            appointment.idMedicalStaff?.username?.toLowerCase().includes(lowerValue) ||
            appointment.reason?.toLowerCase().includes(lowerValue)
        );

        setFilteredAppointments(filtered);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredAppointments(appointments);
    };

    // Format date
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashBoard requiredRole={"Receptionist"} linkList={receptionistNavLink}>
            <ReceptionistNavBar/>

            <div className="flex justify-between mb-8 mt-5">
                <p className="font-bold text-xl mt-2 ml-5">List Of Scheduled Appointments</p>
                <div className="flex mr-5">
                    <div className="flex w-[350px] h-10 border-2 border-secondary rounded-lg relative">
                        <FaSearch className="text-xl text-secondary m-2"/>
                        <input
                            type="text"
                            placeholder="Search by patient, doctor or reason..."
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

            {waitData ? (
                <div className="h-[500px] flex justify-center items-center">
                    <Loader size="medium" color="primary-end"/>
                </div>
            ) : errorStatus ? (
                <ServerErrorPage errorStatus={errorStatus} message={errorMessage}/>
            ) : filteredAppointments.length > 0 ? (
                <div className="ml-5 mr-5">
                    {searchQuery && (
                        <div className="mb-3 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 font-medium">
                                {filteredAppointments.length} result(s) found for "{searchQuery}"
                            </p>
                            <button
                                onClick={clearSearch}
                                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                        <tr>
                            <th className="text-center text-white p-4 text-xl font-bold bg-primary-end rounded-l-2xl">No</th>
                            <th className="text-center text-white p-4 text-xl font-bold bg-primary-end">Doctor</th>
                            <th className="text-center text-white p-4 text-xl font-bold bg-primary-end">Patient</th>
                            <th className="text-center text-white p-4 text-xl font-bold bg-primary-end">Reason</th>
                            <th className="text-center text-white p-4 text-xl font-bold bg-primary-end">Scheduled Time</th>
                            <th className="text-center text-white p-4 text-xl font-bold bg-primary-end rounded-r-2xl">
                                Requirements
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAppointments.map((appointment, index) => (
                            <tr key={appointment.id || index}>
                                <td className="p-4 text-md text-blue-900 rounded-l-lg bg-gray-100 text-center">
                                    {index + 1}
                                </td>
                                <td className="p-4 text-md text-center bg-gray-100 font-bold">
                                    {appointment.idMedicalStaff?.username || 'N/A'}
                                </td>
                                <td className="p-4 text-md bg-gray-100 text-center">
                                    {appointment.idPatient?.firstName} {appointment.idPatient?.lastName}
                                </td>
                                <td className="p-4 text-md bg-gray-100 text-center">
                                    {appointment.reason || 'N/A'}
                                </td>
                                <td className="p-4 text-center bg-gray-100 text-md">
                                    {formatDateTime(appointment.consultationDate)}
                                </td>
                                <td className="p-4 relative bg-gray-100 rounded-r-lg">
                                    <div className="w-full items-center justify-center flex">
                                        <p>{appointment.requirements || 'None'}</p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {!searchQuery && (
                        <div className="justify-center flex mt-6 mb-4">
                            <div className="flex gap-4">
                                <Tooltip placement={"left"} title={"previous slide"}>
                                    <button
                                        onClick={() => fetchNextOrPreviousAppointmentList(previousUrl)}
                                        disabled={!previousUrl}
                                        className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaArrowLeft/>
                                    </button>
                                </Tooltip>
                                <p className="text-secondary text-2xl font-bold mt-4">
                                    {actualPageNumber}/{numberOfPages}
                                </p>
                                <Tooltip placement={"right"} title={"next slide"}>
                                    <button
                                        onClick={() => fetchNextOrPreviousAppointmentList(nextUrl)}
                                        disabled={!nextUrl}
                                        className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaArrowRight/>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-20">
                    <img src={noPatientImage} alt="No appointments" className="w-36 h-36 rounded-lg"/>
                    <h3 className="font-bold text-2xl mt-4 mb-2 text-gray-800">
                        {searchQuery ? "No results found" : "No appointments scheduled"}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-xl text-md font-medium">
                        {searchQuery
                            ? `No appointments found matching "${searchQuery}".`
                            : "There are currently no pending appointments. Schedule a new appointment to get started."
                        }
                    </p>
                    {searchQuery ? (
                        <button
                            onClick={clearSearch}
                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary-end transition-all duration-300 font-semibold"
                        >
                            Clear search
                        </button>
                    ) : (
                        <button
                            onClick={() => setCanOpenAddAppointmentModal(true)}
                            className="flex items-center px-4 py-2 bg-primary-start font-semibold text-white rounded-md hover:bg-primary-end transition-all duration-300"
                        >
                            <span className="mr-2 text-lg">+</span>
                            Add a new appointment
                        </button>
                    )}
                </div>
            )}

            <Tooltip placement="top" title="Add new appointment">
                <button
                    onClick={() => setCanOpenAddAppointmentModal(true)}
                    className="fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-3xl font-bold text-white from-primary-start to-primary-end hover:text-4xl transition-all duration-300 flex items-center justify-center"
                >
                    <FaPlus/>
                </button>
            </Tooltip>

            <AddAppointmentModal
                isOpen={canOpenAddAppointmentModal}
                onClose={() => setCanOpenAddAppointmentModal(false)}
                setCanOpenSuccessModal={setCanOpenSuccessModal}
                setSuccessMessage={setSuccessMessage}
                setIsLoading={setIsLoading}
            />

            <SuccessModal
                isOpen={canOpenSuccessModal}
                message={successMessage}
                canOpenSuccessModal={setCanOpenSuccessModal}
                makeAction={() => {
                    setCanOpenSuccessModal(false);
                    fetchAppointments();
                }}
            />

            {isLoading && <Wait/>}
        </DashBoard>
    );
}