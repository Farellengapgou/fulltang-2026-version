import { useEffect, useState } from 'react';
import { Search, Calendar, Filter, ChevronDown, ChevronUp, Clock, Stethoscope } from 'lucide-react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { adminNavLink } from "./adminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { Tooltip } from "antd";
import { FaArrowLeft, FaArrowRight, FaUser } from "react-icons/fa";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Utils/axiosInstance.js";

export function AdminConsultationList() 
{
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
    const [numberOfConsultation, setNumberOfConsultation] = useState(0);
    const [nextUrlForRenderConsultationList, setNextUrlForRenderConsultationList] = useState("");
    const [previousUrlForRenderConsultationList, setPreviousUrlForRenderConsultationList] = useState("");
    const [consultationList, setConsultationList] = useState([]); 
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const getPatientName = (c) => {
        const p = c.idPatient;
        if (!p) return "—";
        // try common fields
        const first = p.firstName || p.first_name || p.firstname || p.name || "";
        const last = p.lastName || p.last_name || p.lastname || p.surname || "";
        return `${first} ${last}`.trim() || String(p);
    };

    const getDoctorName = (c) => {
        const d = c.idMedicalStaffGiver;
        if (!d) return "—";
        const first = d.firstName || d.first_name || d.firstname || d.name || "";
        const last = d.lastName || d.last_name || d.lastname || d.surname || "";
        return `${first} ${last}`.trim() || String(d);
    };

    const getDate = (c) => {
        const dt = c.consultationDate || c.consultation_date || c.consultationDate;
        if (!dt) return "";
        const dateObj = new Date(dt);
        return dateObj.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getTime = (c) => {
        const dt = c.consultationDate || c.consultation_date || c.consultationDate;
        if (!dt) return "";
        const dateObj = new Date(dt);
        return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatus = (c) => {
        const s = (c.state || c.state?.toString() || '').toString();
        if (!s) return 'Unknown';
        const lower = s.toLowerCase();
        if (lower.includes('finish') || lower.includes('done') || lower.includes('completed')) return 'Finished';
        if (lower.includes('progress') || lower.includes('in progress') || lower.includes('ongoing')) return 'In progress';
        if (lower.includes('upcom') || lower.includes('pending') || lower.includes('scheduled')) return 'Upcoming';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // Reset page when search or filters change
    useEffect(() => {
        setActualPageNumber(1);
    }, [searchTerm, filterStatus]);



    async function fetchConsultations(url = "consultation/") {
        setIsLoading(true);

        try {
            const response = await axiosInstance.get(url);   // 👈 URL corrigée
            setIsLoading(false);

            if (response.status === 200) {
                setConsultationList(response.data.results);
                setNumberOfConsultation(response.data.count);
                setNextUrlForRenderConsultationList(response.data.next);
                setPreviousUrlForRenderConsultationList(response.data.previous);
                setErrorMessage("");
            }
        } catch (error) {
            setIsLoading(false);
            setConsultationList([]);
            setNumberOfConsultation(0);
            setNextUrlForRenderConsultationList("");
            setPreviousUrlForRenderConsultationList("");
            setErrorMessage("Erreur lors du chargement des consultations.");
            console.log(error);
        }
    }

    async function fetchConsultationList() {
        await fetchConsultations();
    }

    async function fetchNextOrPrevious(url) {
        await fetchConsultations(url);
    }

    useEffect(() => {
        fetchConsultationList();
    }, []);

    const filteredConsultations = consultationList
        .map(c => ({
            raw: c,
            id: c.id,
            patientName: getPatientName(c),
            doctorName: getDoctorName(c),
            date: getDate(c),
            time: getTime(c),
            status: getStatus(c),
        }))
        .filter(consultation =>
            (filterStatus === 'all' || consultation.status === filterStatus) &&
            (consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'date') {
                const aTime = new Date(a.date).getTime() || 0;
                const bTime = new Date(b.date).getTime() || 0;
                return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
            }
            if (sortBy === 'patientName') {
                return sortOrder === 'asc'
                    ? a.patientName.localeCompare(b.patientName)
                    : b.patientName.localeCompare(a.patientName);
            }
            if (sortBy === 'doctorName') {
                return sortOrder === 'asc'
                    ? a.doctorName.localeCompare(b.doctorName)
                    : b.doctorName.localeCompare(a.doctorName);
            }
            return 0;
        });

    // Pagination: show 6 per page (same as before)
    const paginatedConsultations = filteredConsultations.slice(
        (actualPageNumber - 1) * 6,
        actualPageNumber * 6
    );

    function toggleSort(criteria) {
        if (sortBy === criteria) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(criteria);
            setSortOrder('asc');
        }
    }

    function calculateNumberOfSlide() {
        return Math.max(1, Math.ceil(filteredConsultations.length / 6));
    }

    function updateActualPageNumber(action) {
        if (action === "next") {
            if (actualPageNumber < calculateNumberOfSlide()) {
                setActualPageNumber(prev => prev + 1);
            }
        } else {
            if (actualPageNumber > 1) {
                setActualPageNumber(prev => prev - 1);
            }
        }
    }

    // Render loading state
    if (isLoading) {
        return (
            <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
                <AdminNavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-primary-end font-bold">Chargement...</div>
                </div>
            </CustomDashboard>
        );
    }

    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar />
            <div className="flex flex-col min-h-screen p-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white mb-5">
                    <h1 className="text-3xl font-bold mb-2">Consultation List</h1>
                    <p className="opacity-90 font-semibold text-md">
                        Find the clinic’s complete consultation history here. You can follow the activity of each doctor, check the details of past consultations and access the information of the patients concerned.
                    </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-row gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search by a patient or a medical staff"
                                className="w-full bg-gray-100 pl-10 pr-4 py-2 border-2 outline-none border-secondary transition-all duration-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-secondary" size={20} />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary-end transition-all duration-300"
                        >
                            <Filter size={20} className="mr-2" />
                            Filters
                            {showFilters ? <ChevronUp size={20} className="ml-2" /> :
                                <ChevronDown size={20} className="ml-2" />}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:border-primary-end focus:border-2 sm:text-sm rounded-md"
                                    >
                                        <option value="all">All</option>
                                        <option value="Finished">Finished</option>
                                        <option value="In progress">In progress</option>
                                        <option value="Upcoming">Upcoming</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => toggleSort(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm rounded-md"
                                    >
                                        <option value="date">Date</option>
                                        <option value="patientName">Patient Name</option>
                                        <option value="doctorName">Medical Staff Name</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {paginatedConsultations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center w-full">
                        <div className="relative flex items-center justify-center">
                            {/* Ping circle */}
                            <span className="absolute w-28 h-28 bg-teal-200 rounded-full animate-ping opacity-75"></span>

                            {/* Icon */}
                            <Stethoscope className="w-24 h-24 text-primary-end relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-teal-600 mb-4">No consultations found</h2>
                        <p className="text-gray-600 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}

                {/* cards grid */}
                {paginatedConsultations.length > 0 &&
                    (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {paginatedConsultations.map((consultation) => (
                            <div key={consultation.id}
                                className="bg-gray-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex gap-4 mt-2">
                                                <FaUser className="text-primary-end w-6 h-6" />
                                                <h3 className="text-lg font-semibold text-gray-800">{consultation.patientName}</h3>
                                            </div>
                                            <div className="flex mt-2 gap-4">
                                                <Stethoscope className="text-primary-end w-6 h-6" />
                                                <p className="text-md text-gray-600">{consultation.doctorName}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${consultation.status === 'Finished' ? 'bg-green-100 text-green-800' : consultation.status === 'In progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{consultation.status}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-3 ml-10">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{new Date(consultation.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-2 ml-10">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{consultation.time}</span>
                                    </div>
                                </div>
                                <div className="px-4 py-3 text-right">
                                    <button className="text-white px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-primary-end to-primary-start font-bold text-sm hover:text-md transition-all duration-300"
                                        onClick={() => { navigate(AppRoutesPaths.adminConsultationDetailsPage) }}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="w-full justify-center flex mt-4 mb-2">
                    <div className="flex gap-4">
                        <Tooltip placement={"left"} title={"previous slide"}>
                            <button
                                onClick={async () => updateActualPageNumber("prev")}
                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2"
                            >
                                <FaArrowLeft />
                            </button>
                        </Tooltip>

                        <p className="text-secondary text-2xl font-bold mt-4">
                            {actualPageNumber}/{calculateNumberOfSlide()}
                        </p>

                        <Tooltip placement={"right"} title={"next slide"}>
                            <button
                                onClick={async () => updateActualPageNumber("next")}
                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2"
                            >
                                <FaArrowRight />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* error display */}
                {errorMessage && (
                    <ErrorModal isOpen={canOpenErrorMessageModal} onCloseErrorModal={()=>{setCanOpenErrorMessageModal(false)}} message={errorMessage}/>
                    
                )}
            </div>
        </CustomDashboard>
    );
}
