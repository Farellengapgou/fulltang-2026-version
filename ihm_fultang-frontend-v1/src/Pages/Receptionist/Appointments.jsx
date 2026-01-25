import { useEffect, useState } from "react";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import { Tooltip } from "antd";
import axiosInstance from "../../Utils/axiosInstance.js";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";

export function Appointments() {
    const [appointmentList, setAppointmentList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 10;

    const [searchTerm, setSearchTerm] = useState("");

    async function retrieveAppointments() {
        setIsLoading(true);
        try {
            // Requesting max page size to support client-side filtering for now
            const response = await axiosInstance.get('/appointment/?page_size=50');
            setIsLoading(false);
            if (response.status === 200) {
                // Handle paginated response (results) or fallback to data if array
                const data = response.data.results || response.data;
                setAppointmentList(Array.isArray(data) ? data : []);
                setErrorStatus(null);
                setErrorMessage("");
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            setErrorStatus(error.response?.status);
            setErrorMessage("Something went wrong when retrieving appointments, please try again later !");
        }
    }

    useEffect(() => {
        retrieveAppointments();
    }, []);

    // Filter appointments based on search
    const filteredAppointments = appointmentList.filter((appointment) => {
        const patientName = appointment?.idPatient?.firstName + " " + appointment?.idPatient?.lastName;
        const doctorName = appointment?.idMedicalStaff?.first_name + " " + appointment?.idMedicalStaff?.last_name;
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Pagination logic
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <DashBoard requiredRole={"Receptionist"} linkList={receptionistNavLink}>
            <ReceptionistNavBar />

            {/*Header content with search bar*/}
            <div className="flex justify-between mb-8 mt-5">
                <p className="font-bold text-xl mt-2 ml-5"> List Of Scheduled Appointments </p>
                <div className="flex mr-5">
                    <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                        <FaSearch className="text-xl text-secondary m-2" />
                        <input
                            type="text"
                            placeholder={"Search by patient or doctor..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full mr-2 border-none focus:outline-none focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            {/*List of scheduled appointments*/}
            {isLoading ? (
                <div className="h-[400px] w-full flex justify-center items-center">
                    <Loader size={"medium"} color={"primary-end"} />
                </div>
            ) : errorStatus ? (
                <ServerErrorPage errorStatus={errorStatus} message={errorMessage} />
            ) : (
                <div className="ml-5 mr-5 ">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className=" ">
                                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end rounded-l-2xl ">No</th>
                                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end ">Doctor</th>
                                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end ">Patient</th>
                                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end  ">Reason</th>
                                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end  ">Scheduled Time</th>
                                <th className="text-center text-white p-4 text-xl font-bold bg-primary-end flex-col rounded-r-2xl">
                                    <p>Requirements</p>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAppointments.length > 0 ? (
                                currentAppointments.map((appointment, index) => (
                                    <tr key={appointment.id || index} className="">
                                        <td className="p-4 text-md text-blue-900 rounded-l-lg bg-gray-100 text-center">
                                            {(currentPage - 1) * appointmentsPerPage + index + 1}
                                        </td>
                                        <td className="p-4 text-md text-center bg-gray-100 font-bold">
                                            {appointment.idMedicalStaff ? `Dr. ${appointment.idMedicalStaff.first_name} ${appointment.idMedicalStaff.last_name}` : "N/A"}
                                        </td>
                                        <td className="p-4 text-md bg-gray-100 text-center">
                                            {appointment.idPatient ? `${appointment.idPatient.firstName} ${appointment.idPatient.lastName}` : "N/A"}
                                        </td>
                                        <td className="p-4 text-md bg-gray-100 text-center">{appointment.reason || "N/A"}</td>
                                        <td className="p-4 text-center bg-gray-100 text-md">
                                            {new Date(appointment.atDate).toLocaleString()}
                                        </td>
                                        <td className="p-4 relative bg-gray-100 rounded-r-lg">
                                            <div className="w-full items-center justify-center flex gap-6">
                                                <p>{appointment.requirements || "N/A"}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 bg-gray-50 rounded-lg">
                                        <p className="text-xl text-gray-500">No appointments found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/*Pagination content */}
                    {filteredAppointments.length > appointmentsPerPage && (
                        <div className="justify-center flex mt-6 mb-4">
                            <div className="flex gap-4">
                                <Tooltip placement={"left"} title={"previous page"}>
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={`w-14 h-14 border-2 rounded-lg text-xl flex justify-center items-center mt-2 transition-all duration-300 ${currentPage === 1
                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "border-secondary text-secondary hover:bg-secondary hover:text-white hover:text-2xl shadow-xl"
                                            }`}>
                                        <FaArrowLeft />
                                    </button>
                                </Tooltip>
                                <p className="text-secondary text-2xl font-bold mt-4">{currentPage}/{totalPages}</p>
                                <Tooltip placement={"right"} title={"next page"}>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`w-14 h-14 border-2 rounded-lg text-xl flex justify-center items-center mt-2 transition-all duration-300 ${currentPage === totalPages
                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                            : "border-secondary text-secondary hover:bg-secondary hover:text-white hover:text-2xl shadow-xl"
                                            }`}>
                                        <FaArrowRight />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DashBoard>
    )
}