"use client"

import { useState, useEffect, useCallback } from "react";
import { Search, Calendar, User, Stethoscope, Clock } from "lucide-react";
import { FaArrowLeft, FaArrowRight, FaEye } from "react-icons/fa";
import { laboratoryNavLink } from "./LaboratoryNavLink.js";
import { Tooltip } from "antd";
import { LaboratoryNavBar } from "./LaboratoryNavBar.jsx";
import { LaboratoryDashBoard } from "./LaboratoryDashBoard.jsx";
import { useAuthentication } from "../../Utils/Provider.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import { formatDateOnly, formatDateToTime } from "../../Utils/formatDateMethods.js";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Utils/axiosInstance.js";

export function ExamHistory() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { userData } = useAuthentication();
    const [examHistoryList, setExamHistoryList] = useState([]);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [numberOfExams, setNumberOfExams] = useState(0);
    const [nextUrl, setNextUrl] = useState("");
    const [previousUrl, setPreviousUrl] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);

    function calculateNumberOfSlide() {
        if (numberOfExams === 0) return 1;
        return numberOfExams % 5 === 0
            ? numberOfExams / 5
            : Math.floor(numberOfExams / 5) + 1;
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

    // Chargement des données depuis /exam-result/
    const loadExamHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/exam-result/");
            if (response.status === 200) {
                console.log(response.data);
                const data = response.data.results || response.data;
                const transformed = data.map((exam) => ({
                    ...exam,
                    patientName: exam.idPatient
                        ? `${exam.idPatient.firstName} ${exam.idPatient.lastName}`
                        : "Patient inconnu",
                    examName: exam.idExamRequest ? `Exam Request #${exam.idExamRequest}` : "N/A",
                    status: exam.examFile ? "Terminé" : "En attente",
                    doctorName: exam.idMedicalStaff
                        ? `${exam.idMedicalStaff.first_name} ${exam.idMedicalStaff.last_name}`
                        : "Médecin inconnu",
                    date: exam.addDate,
                }));
                setExamHistoryList(transformed);
                setNumberOfExams(response.data.count || transformed.length);
                setNextUrl(response.data.next || "");
                setPreviousUrl(response.data.previous || "");
                setErrorStatus(null);
                setErrorMessage("");
            }
        } catch (error) {
            console.error(error);
            setErrorStatus(500);
            setErrorMessage("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExamHistory();
    }, [loadExamHistory]);

    async function fetchNextOrPreviousExamHistory(url) {
        if (url) {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get(url);
                if (response.status === 200) {
                    const data = response.data.results || response.data;
                    const transformed = data.map((exam) => ({
                        ...exam,
                        patientName: exam.idPatient
                            ? `${exam.idPatient.firstName} ${exam.idPatient.lastName}`
                            : "Patient inconnu",
                        examName: exam.idExamRequest ? `Exam Request #${exam.idExamRequest}` : "N/A",
                        status: exam.examFile ? "Terminé" : "En attente",
                        doctorName: exam.idMedicalStaff
                            ? `${exam.idMedicalStaff.first_name} ${exam.idMedicalStaff.last_name}`
                            : "Médecin inconnu",
                        date: exam.addDate,
                    }));
                    setExamHistoryList(transformed);
                    setNextUrl(response.data.next || "");
                    setPreviousUrl(response.data.previous || "");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    const filteredExams = examHistoryList.filter((exam) => {
        const fullName = exam.patientName || "";
        const matchesSearch =
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.examName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate =
            !dateFilter ||
            new Date(exam.date || "").toISOString().split("T")[0] === dateFilter;
        return matchesSearch && matchesDate;
    });

    return (
        <LaboratoryDashBoard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
            <LaboratoryNavBar />
            <div className="mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Exams History</h1>

                {/* Filtres */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by patient or exam name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none transition-all duration-300"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="text-gray-400 h-5 w-5" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Liste de l'historique */}
                {isLoading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"} />
                    </div>
                ) : errorStatus ? (
                    <ServerErrorPage errorStatus={errorStatus} message={errorMessage} />
                ) : filteredExams && filteredExams.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                            <tr>
                                <th className="px-6 py-3 bg-primary-end rounded-l-xl text-center text-md text-white font-bold uppercase">
                                    Patient
                                </th>
                                <th className="px-6 py-3 bg-primary-end text-center text-md text-white font-bold uppercase">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 bg-primary-end text-center text-md text-white font-bold uppercase">
                                    Doctor
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white border-separate">
                            {filteredExams.map((exam) => (
                                <tr 
                                    key={exam.id}
                                    className="cursor-pointer hover:bg-gray-200 hover:opacity-60 transition-colors duration-200"
                                    onClick={() => {
                                        navigate(`${AppRoutesPaths.laboratoryExamResultDetails.replace(":id", exam.id)}`);
                                    }}
                                >
                                    <td className="px-6 py-5 rounded-l-xl bg-gray-100 border-l-4 border-primary-start">
                                        <div className="w-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-400 mr-2" />
                                            <div className="text-md font-medium text-gray-900">{exam.patientName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-gray-100">
                                        <div className="w-full flex justify-center items-center">
                                            <Clock className="h-5 w-5 text-gray-400 mr-2 mt-2" />
                                            <div>
                                                <div className="text-sm text-center text-gray-900">
                                                    {exam.date ? formatDateOnly(exam.date) : "N/A"}
                                                </div>
                                                <div className="text-sm text-center text-gray-500">
                                                    {exam.date ? formatDateToTime(exam.date) : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-gray-100">
                                        <div className="flex items-center justify-center text-sm text-gray-900">
                                            <Stethoscope className="h-5 w-5 text-gray-400 mr-2" />
                                            {exam.doctorName}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 mt-24 flex items-center justify-center">
                        <div className="flex flex-col">
                            <Calendar className="h-16 w-16 text-primary-end mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">No Exam History</h2>
                            <p className="text-gray-600 mb-4 mx-auto text-center">
                                There are no exams recorded yet. Once exams are conducted, they will appear here for better tracking.
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

                { filteredExams.length > 0 && numberOfExams > 0 && (
                    <div className="fixed w-full justify-center bottom-0 flex mt-6 mb-4 left-20">
                        <div className="flex gap-4">
                            <Tooltip placement={"left"} title={"previous slide"}>
                                <button
                                    onClick={async () => {
                                        await fetchNextOrPreviousExamHistory(previousUrl);
                                        updateActualPageNumber("prev");
                                    }}
                                    className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2"
                                >
                                    <FaArrowLeft />
                                </button>
                            </Tooltip>
                            <p className="text-secondary text-2xl font-bold mt-4">
                                {numberOfExams === 0 ? "0/0" : `${actualPageNumber}/${calculateNumberOfSlide()}`}
                            </p>
                            <Tooltip placement={"right"} title={"next slide"}>
                                <button
                                    onClick={async () => {
                                        await fetchNextOrPreviousExamHistory(nextUrl);
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
            </div>
        </LaboratoryDashBoard>
    );
}
