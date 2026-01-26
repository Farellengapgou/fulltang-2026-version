import {
    FaArrowLeft,
    FaArrowRight,
    FaEye,
    FaSearch,
    FaFileMedical,
    FaFilePdf,
    FaClock,
    FaCheckCircle,
    FaExclamationCircle,
    FaSync
} from "react-icons/fa";
import { Tooltip, Select, Input, Spin, Tag, Space, Empty } from "antd";
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../Utils/axiosInstance.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx";
import { doctorNavLink } from "./lib/doctorNavLink.js";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../Utils/Provider.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";

const ITEMS_PER_PAGE = 5;

const EXAM_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

const PATIENT_STATUS = {
    INPATIENT: 'inpatient',
    OUTPATIENT: 'outpatient'
};

export function DoctorExamsList() {
    // --- ÉTATS ---
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // --- HOOKS ---
    const { userData } = useAuthentication();
    const navigate = useNavigate();

    // --- CALCULS MÉMORISÉS ---
    const numberOfExams = filteredExams.length;
    const totalPages = useMemo(() =>
        numberOfExams === 0 ? 1 : Math.ceil(numberOfExams / ITEMS_PER_PAGE),
        [numberOfExams]
    );

    const paginatedExams = useMemo(() => {
        const startIndex = (actualPageNumber - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredExams.slice(startIndex, endIndex);
    }, [filteredExams, actualPageNumber]);

    // --- STATISTIQUES ---
    const stats = useMemo(() => ({
        total: exams.length,
        pending: exams.filter(e => e.examStatus?.toLowerCase() === EXAM_STATUS.PENDING).length,
        completed: exams.filter(e => e.examStatus?.toLowerCase() === EXAM_STATUS.COMPLETED).length,
        inProgress: exams.filter(e => e.examStatus?.toLowerCase() === EXAM_STATUS.IN_PROGRESS).length,
        uniquePatients: new Set(exams.map(e => e.idPatient?.id)).size
    }), [exams]);

    // --- RÉCUPÉRATION DES EXAMENS ---
    const fetchExams = async (showLoading = true) => {
        if (showLoading) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            console.log("📋 Récupération des examens...");
            const response = await axiosInstance.get(`/exam-request/`);

            if (response.status === 200) {
                console.log("✅ Examens reçus:", response.data);

                // Extraire les résultats de la structure paginée
                const examsData = response.data.results || response.data;
                console.log("📊 Données extraites:", examsData);

                // Filtrer les examens par le docteur connecté
                const doctorExams = examsData.filter(exam => {
                    const examStaffId = exam.idMedicalStaff?.id || exam.idMedicalStaff;
                    const userStaffId = userData?.id;
                    console.log(`Comparaison: ${examStaffId} === ${userStaffId}`);
                    return examStaffId === userStaffId;
                });

                console.log(`✅ ${doctorExams.length} examens pour ce docteur`);

                setExams(doctorExams);
                setFilteredExams(doctorExams);
                setErrorMessage("");
                setErrorStatus(null);
                setActualPageNumber(1);
            }
        } catch (error) {
            console.error("❌ Erreur chargement examens:", error.message);
            console.error("Détails:", error);

            if (error.response?.status === 404) {
                console.warn("⚠️ Endpoint non trouvé - vérifiez l'URL API");
                setErrorMessage("Endpoint API non trouvé. Contactez le support technique.");
            } else if (error.response?.status === 401) {
                setErrorMessage("Session expirée. Veuillez vous reconnecter.");
            } else {
                setErrorMessage("Erreur lors de la récupération de la liste des examens");
            }

            setExams([]);
            setFilteredExams([]);
            setErrorStatus(error.response?.status || 500);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // --- INITIALISATION ---
    useEffect(() => {
        if (userData?.id) {
            console.log("👨‍⚕️ Docteur connecté:", userData.id);
            fetchExams();
        }
    }, [userData?.id]);

    // --- FILTRAGE DES EXAMENS ---
    useEffect(() => {
        let filtered = [...exams];

        // Filtre par recherche
        if (searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(exam =>
                exam.idPatient?.firstName?.toLowerCase().includes(lowerSearchTerm) ||
                exam.idPatient?.lastName?.toLowerCase().includes(lowerSearchTerm) ||
                exam.idExam?.examName?.toLowerCase().includes(lowerSearchTerm) ||
                exam.examName?.toLowerCase().includes(lowerSearchTerm) ||
                exam.idPatient?.id?.toString().includes(lowerSearchTerm)
            );
        }

        // Filtre par statut
        if (statusFilter !== "all") {
            filtered = filtered.filter(exam =>
                exam.examStatus?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredExams(filtered);
        setActualPageNumber(1);
    }, [searchTerm, statusFilter, exams]);

    // --- FORMATAGE ET AFFICHAGE ---
    const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifié';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getExamStatusTag = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const statusConfig = {
            [EXAM_STATUS.PENDING]: { color: 'warning', icon: <FaClock />, label: 'En attente' },
            [EXAM_STATUS.IN_PROGRESS]: { color: 'processing', icon: <FaFileMedical />, label: 'En cours' },
            [EXAM_STATUS.COMPLETED]: { color: 'success', icon: <FaCheckCircle />, label: 'Complété' }
        };

        const config = statusConfig[statusLower] || { color: 'default', label: status || 'Non spécifié' };
        return (
            <Tag
                icon={config.icon}
                color={config.color}
                className="px-3 py-1 font-medium"
            >
                {config.label}
            </Tag>
        );
    };

    const getPatientStatusTag = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const config = statusLower === PATIENT_STATUS.INPATIENT
            ? { color: 'red', label: 'Hospitalisé' }
            : { color: 'blue', label: 'Externe' };

        return <Tag color={config.color}>{config.label}</Tag>;
    };

    // --- NAVIGATION ---
    const handlePrevPage = () => {
        if (actualPageNumber > 1) {
            setActualPageNumber(actualPageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (actualPageNumber < totalPages) {
            setActualPageNumber(actualPageNumber + 1);
        }
    };

    const handleViewExamDetails = (examId) => {
        navigate(`/doctor/exam/${examId}`);
    };

    const handleViewResults = (examId) => {
        navigate(`/doctor/exam/${examId}/results`);
    };

    const handleAddResult = (examId) => {
        navigate(`/doctor/exam/${examId}/add-result`);
    };

    const handleRefresh = () => {
        fetchExams(false);
    };

    // --- RENDU ---
    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar />
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

                {/* En-tête avec titre */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">
                            📋 Examens Prescrits
                        </h1>
                        <p className="text-gray-500 mt-2">Gestion des examens médicaux prescrits</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-primary-end transition-all duration-300 disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                    >
                        <FaSync className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Total des Examens</p>
                                <p className="text-3xl font-bold text-blue-700 mt-2">{stats.total}</p>
                            </div>
                            <FaFileMedical className="text-4xl text-blue-300 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium">En Attente</p>
                                <p className="text-3xl font-bold text-yellow-700 mt-2">{stats.pending}</p>
                            </div>
                            <FaClock className="text-4xl text-yellow-300 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Complétés</p>
                                <p className="text-3xl font-bold text-green-700 mt-2">{stats.completed}</p>
                            </div>
                            <FaCheckCircle className="text-4xl text-green-300 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-600 text-sm font-medium">En Cours</p>
                                <p className="text-3xl font-bold text-purple-700 mt-2">{stats.inProgress}</p>
                            </div>
                            <FaFileMedical className="text-4xl text-purple-300 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-lg border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-600 text-sm font-medium">Patients Uniques</p>
                                <p className="text-3xl font-bold text-indigo-700 mt-2">{stats.uniquePatients}</p>
                            </div>
                            <FaExclamationCircle className="text-4xl text-indigo-300 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Filtres et Recherche */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Filtres et Recherche</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Filtrer par Statut
                            </label>
                            <Select
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)}
                                style={{ width: '100%' }}
                                size="large"
                                options={[
                                    { label: 'Tous les Statuts', value: 'all' },
                                    { label: 'En Attente', value: EXAM_STATUS.PENDING },
                                    { label: 'En Cours', value: EXAM_STATUS.IN_PROGRESS },
                                    { label: 'Complété', value: EXAM_STATUS.COMPLETED }
                                ]}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rechercher
                            </label>
                            <Input
                                placeholder="Nom du patient, ID ou type d'examen..."
                                prefix={<FaSearch className="text-gray-400" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                                size="large"
                            />
                        </div>
                    </div>
                </div>

                {/* Contenu Principal */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-sm">
                        <Loader size={"medium"} color={"primary-end"} />
                    </div>
                ) : errorStatus ? (
                    <ServerErrorPage errorStatus={errorStatus} message={errorMessage} />
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                        {paginatedExams.length > 0 ? (
                            <>
                                {/* Tableau */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gradient-to-r from-primary-end to-primary-start">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-white font-semibold">N°</th>
                                                <th className="px-6 py-4 text-left text-white font-semibold">Patient</th>
                                                <th className="px-6 py-4 text-left text-white font-semibold">Type d'Examen</th>
                                                <th className="px-6 py-4 text-left text-white font-semibold">Date de Prescription</th>
                                                <th className="px-6 py-4 text-center text-white font-semibold">Statut Patient</th>
                                                <th className="px-6 py-4 text-center text-white font-semibold">Statut Examen</th>
                                                <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {paginatedExams.map((exam, index) => (
                                                <tr
                                                    key={exam.id || index}
                                                    className="hover:bg-gray-50 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                                                        {(actualPageNumber - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="font-semibold text-gray-800">
                                                                {exam.idPatient?.firstName} {exam.idPatient?.lastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {exam.idPatient?.id}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="font-medium text-gray-800">
                                                                {exam.examName || exam.idExam?.examName || 'N/A'}
                                                            </div>
                                                            {exam.idExam?.examDescription && (
                                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                                    {exam.idExam.examDescription}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        {formatDate(exam.addDate)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getPatientStatusTag(exam.patientStatus)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getExamStatusTag(exam.examStatus)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-3">
                                                            <Tooltip title="Voir les détails">
                                                                <button
                                                                    onClick={() => handleViewExamDetails(exam.id)}
                                                                    className="flex items-center justify-center w-9 h-9 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
                                                                >
                                                                    <FaEye size={16} />
                                                                </button>
                                                            </Tooltip>

                                                            {exam.examStatus?.toLowerCase() === EXAM_STATUS.COMPLETED ? (
                                                                <Tooltip title="Voir les résultats">
                                                                    <button
                                                                        onClick={() => handleViewResults(exam.id)}
                                                                        className="flex items-center justify-center w-9 h-9 text-green-600 hover:bg-green-50 rounded-full transition-all duration-300"
                                                                    >
                                                                        <FaFilePdf size={16} />
                                                                    </button>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="Ajouter les résultats">
                                                                    <button
                                                                        onClick={() => handleAddResult(exam.id)}
                                                                        className="flex items-center justify-center w-9 h-9 text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-300"
                                                                    >
                                                                        <FaFileMedical size={16} />
                                                                    </button>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Affichage <span className="font-semibold">{(actualPageNumber - 1) * ITEMS_PER_PAGE + 1}</span> à{' '}
                                        <span className="font-semibold">
                                            {Math.min(actualPageNumber * ITEMS_PER_PAGE, numberOfExams)}
                                        </span> sur <span className="font-semibold">{numberOfExams}</span> examen{numberOfExams > 1 ? 's' : ''}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Tooltip title="Page précédente">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={actualPageNumber === 1}
                                                className={`p-2 rounded-lg transition-all ${actualPageNumber === 1
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-secondary hover:bg-secondary hover:text-white'
                                                    }`}
                                            >
                                                <FaArrowLeft size={18} />
                                            </button>
                                        </Tooltip>

                                        <span className="px-4 py-2 font-semibold text-secondary bg-gray-100 rounded-lg">
                                            {actualPageNumber} / {totalPages}
                                        </span>

                                        <Tooltip title="Page suivante">
                                            <button
                                                onClick={handleNextPage}
                                                disabled={actualPageNumber === totalPages}
                                                className={`p-2 rounded-lg transition-all ${actualPageNumber === totalPages
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-secondary hover:bg-secondary hover:text-white'
                                                    }`}
                                            >
                                                <FaArrowRight size={18} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-64 flex flex-col justify-center items-center">
                                <FaFileMedical className="text-6xl text-gray-300 mb-4" />
                                <p className="text-xl font-semibold text-gray-600 mb-2">Aucun examen trouvé</p>
                                <p className="text-gray-500">
                                    {exams.length > 0
                                        ? 'Modifiez vos filtres de recherche'
                                        : 'Aucun examen n\'a été prescrit pour vous'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CustomDashboard>
    );
}