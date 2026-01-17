// ...existing code...
import {
    Microscope,
    Pill,
    User,
    Calendar,
    Weight,
    Ruler,
    Thermometer,
    Activity,
    PillIcon as Pills,
    FileText,
    Stethoscope,
    ClipboardList,
    Heart,
    AlertTriangle,
    MapPin,
    Phone,
    ArrowLeft,
    Printer,
    Clock,
} from "lucide-react"
import { doctorNavLink } from "./lib/doctorNavLink.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useCalculateAge } from "../../Utils/compute.js";
import { formatDateOnly, formatDateOnlyWithoutWeekDay, formatDateToTime } from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "./DoctorComponents/MedicalParametersCard.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { useEffect, useState } from "react";
import { GiMedicines } from "react-icons/gi";
import { FaEdit } from "react-icons/fa";
import EditConsultationModal from "./DoctorComponents/EditConsultationModal.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import { Spin } from "antd";

export function ConsultationHistoryDetails() {

    const { state } = useLocation();
    const consultation = state?.consultation || {};

    const patientInfos = consultation?.idPatient;
    const medicalFolderPageInfos = consultation?.idMedicalFolderPage;

    const { calculateAge } = useCalculateAge();
    const { value: ageValue, unit: ageUnit } = calculateAge(patientInfos?.birthDate);

    const navigate = useNavigate();
    const [canOpenEditConsultationModal, setCanOpenEditConsultationModal] = useState(false);
    
    // --- ÉTATS POUR LES PARAMÈTRES ---
    const [medicalParams, setMedicalParams] = useState(null);
    const [isLoadingParams, setIsLoadingParams] = useState(false);

    // helper to build path robustly depending on axios baseURL
    const buildLastParamsPath = (id) => {
        try {
            const base = axiosInstance?.defaults?.baseURL || "";
            const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
            // if base already ends with /medical or contains /api/v1/medical, avoid adding extra "medical"
            const hasMedical = normalized.endsWith("/medical") || normalized.includes("/api/v1/medical") || normalized.includes("/v1/medical");
            if (hasMedical) {
                return `/medical-folder/${id}/last-params/`;
            }
            // otherwise include /medical prefix
            return `/medical/medical-folder/${id}/last-params/`;
        } catch (e) {
            return `/medical/medical-folder/${id}/last-params/`;
        }
    };

    // --- RÉCUPÉRATION DES PARAMÈTRES MÉDICAUX ---
    const fetchMedicalParams = async () => {
        if (!medicalFolderPageInfos?.id) {
            console.warn("⚠️ ID dossier médical manquant");
            setMedicalParams(medicalFolderPageInfos?.parameters || {});
            return;
        }

        setIsLoadingParams(true);

        try {
            console.log(`📊 Récupération des paramètres pour le dossier: ${medicalFolderPageInfos.id}`);
            
            const path = buildLastParamsPath(medicalFolderPageInfos.id);
            console.log("🔗 Requête params path:", path, "baseURL:", axiosInstance?.defaults?.baseURL);
            const response = await axiosInstance.get(path);

            if (response?.status === 200 && response.data) {
                console.log("✅ Paramètres récupérés depuis l'API:", response.data);
                setMedicalParams(response.data);
            } else {
                console.warn("⚠️ Réponse inattendue lors récupération paramètres:", response);
                setMedicalParams(medicalFolderPageInfos?.parameters || {});
            }
        } catch (error) {
            console.error("❌ Erreur récupération paramètres (API):", error);
            console.warn("📦 Utilisation des paramètres en cache local");
            setMedicalParams(medicalFolderPageInfos?.parameters || {});
        } finally {
            setIsLoadingParams(false);
        }
    };

    // --- INITIALISATION ---
    useEffect(() => {
        if (medicalFolderPageInfos?.id) {
            fetchMedicalParams();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medicalFolderPageInfos?.id]);

    // --- AFFICHAGE DES PARAMÈTRES ---
    const displayParams = medicalParams || medicalFolderPageInfos?.parameters || {};

    const MedicalParametersInfos = [
        {
            icon: Weight,
            label: 'Poids',
            value: displayParams?.weight ? parseFloat(displayParams.weight) : '-',
            unit: displayParams?.weight ? ' Kg' : ''
        },
        {
            icon: Ruler,
            label: 'Taille',
            value: displayParams?.height ? parseFloat(displayParams.height) : '-',
            unit: displayParams?.height ? ' m' : ''
        },
        {
            icon: Thermometer,
            label: 'Température',
            value: displayParams?.temperature ? parseFloat(displayParams.temperature) : '-',
            unit: displayParams?.temperature ? '°C' : ''
        },
        {
            icon: Activity,
            label: 'Tension Artérielle',
            value: displayParams?.bloodPressure || '-',
            unit: displayParams?.bloodPressure ? ' mmHg' : ''
        },
        {
            icon: Heart,
            label: 'Fréquence Cardiaque',
            value: displayParams?.heartRate ? parseInt(displayParams.heartRate) : '-',
            unit: displayParams?.heartRate ? ' bpm' : ''
        },
        {
            icon: AlertTriangle,
            label: 'Allergies',
            value: displayParams?.allergies || 'Aucune'
        },
        {
            icon: Pills,
            label: 'Antécédents Familiaux',
            value: displayParams?.familyMedicalHistory || 'N/A'
        },
        {
            icon: FileText,
            label: 'Médicaments Actuels',
            value: displayParams?.currentMedication || 'Aucun'
        }
    ];

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar />
            <div className="space-y-6 p-4">

                {/* INFORMATIONS PATIENT */}
                <div className="bg-white rounded-lg shadow-md p-6">

                    {/* En-tête Patient */}
                    <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                                <User className="w-12 h-12 text-primary-start" />
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white uppercase">
                                            Consultation de {patientInfos?.firstName || 'Patient'} {patientInfos?.lastName || ''}
                                        </h1>
                                        <p className="text-white text-sm mt-1 opacity-90">
                                            ID Dossier: {medicalFolderPageInfos?.id || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-lg">
                                            {consultation?.consultationDate
                                                ? formatDateOnly(consultation?.consultationDate)
                                                : 'Date non spécifiée'}
                                        </p>
                                    </div>
                                </div>

                                {/* Informations Patient */}
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold text-white text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>
                                            Né(e) le {patientInfos?.birthDate
                                                ? formatDateOnlyWithoutWeekDay(patientInfos?.birthDate)
                                                : 'Date inconnue'
                                            } ({ageValue} {ageUnit})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <span>{patientInfos?.address || 'Adresse non spécifiée'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5" />
                                        <span>{patientInfos?.phoneNumber || 'Téléphone non spécifié'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barre d'Actions */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm rounded-lg mb-6 p-4 border border-gray-200">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-secondary hover:text-primary-end font-bold flex gap-2 items-center transition-colors duration-200"
                            >
                                <div className="w-8 h-8 border-2 border-secondary rounded-full flex justify-center items-center hover:border-primary-end transition-colors">
                                    <ArrowLeft size={18} />
                                </div>
                                <span className="text-sm">Retour à l'historique</span>
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCanOpenEditConsultationModal(true)}
                                    className="bg-secondary hover:bg-primary-end text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 shadow-sm"
                                >
                                    <FaEdit size={16} />
                                    Modifier la consultation
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 shadow-sm"
                                >
                                    <Printer size={16} />
                                    Imprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION PARAMÈTRES MÉDICAUX */}
                    <div className="w-full mb-6">
                        <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-secondary uppercase tracking-wide">
                                    📊 Paramètres Médicaux
                                </h2>
                                {isLoadingParams && (
                                    <Spin size="small" tip="Chargement..." />
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {MedicalParametersInfos.map((info, index) => {
                                    const IconComponent = info.icon;
                                    return (
                                        <MedicalParametersCard
                                            key={index}
                                            icon={<IconComponent size={24} className="text-primary-start" />}
                                            label={info.label}
                                            value={info.value}
                                            unit={info.unit}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* NOTES ET DÉTAILS DE LA CONSULTATION */}
                    <div className="bg-white rounded-xl space-y-6 p-6 border border-gray-100">

                        {/* Notes Infirmier */}
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                <ClipboardList className="h-5 w-5 mr-2 text-blue-500" />
                                Notes de l'Infirmier
                            </h3>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-gray-700 leading-relaxed">
                                    {medicalFolderPageInfos?.nurseNotes || consultation?.consultationNotes || 'Aucune note'}
                                </p>
                            </div>
                        </div>

                        {/* Notes Médecin */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                <ClipboardList className="h-5 w-5 mr-2 text-green-500" />
                                Notes du Médecin
                            </h3>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-gray-700 leading-relaxed">
                                    {medicalFolderPageInfos?.doctorNote || 'Aucune note'}
                                </p>
                            </div>
                        </div>

                        {/* Diagnostic */}
                        <div className="border-l-4 border-red-500 pl-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                <Stethoscope className="h-5 w-5 mr-2 text-red-500" />
                                Diagnostic
                            </h3>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <p className="text-gray-800 font-semibold text-lg">
                                    {medicalFolderPageInfos?.diagnostic || 'Diagnostic non spécifié'}
                                </p>
                            </div>
                        </div>

                        {/* PRESCRIPTIONS */}
                        {medicalFolderPageInfos?.prescriptions?.length > 0 && (
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <GiMedicines className="h-6 w-6 mr-2 text-purple-500" />
                                    Prescriptions ({medicalFolderPageInfos.prescriptions.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {medicalFolderPageInfos.prescriptions.map((prescription, pIndex) =>
                                        prescription?.prescriptionDrug?.map((drug, dIndex) => (
                                            <div
                                                key={`${pIndex}-${dIndex}`}
                                                className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <Pill className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                                                    <p className="font-bold text-gray-800 text-sm">
                                                        {drug?.medicament?.name || 'Médicament inconnu'}
                                                    </p>
                                                </div>
                                                <div className="space-y-2 text-sm text-gray-700 bg-white bg-opacity-50 rounded p-3">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Dosage:</span>
                                                        <span>{drug?.dosage || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Fréquence:</span>
                                                        <span>{drug?.frequency || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Durée:</span>
                                                        <span>{drug?.duration || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* EXAMENS PRESCRITS */}
                        {medicalFolderPageInfos?.examRequests?.length > 0 && (
                            <div className="border-l-4 border-orange-500 pl-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Microscope className="h-6 w-6 mr-2 text-orange-500" />
                                    Examens ({medicalFolderPageInfos.examRequests.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {medicalFolderPageInfos.examRequests.map((exam, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <Microscope className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                                                <p className="font-bold text-gray-800">
                                                    {exam?.idExam?.examName || 'Examen inconnu'}
                                                </p>
                                            </div>
                                            {exam?.notes && (
                                                <div className="bg-white bg-opacity-50 rounded p-3 text-sm text-gray-700">
                                                    <p className="font-semibold mb-1">Instructions:</p>
                                                    <p>{exam?.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RENDEZ-VOUS */}
                        {consultation?.appointments?.length > 0 && (
                            <div className="border-l-4 border-teal-500 pl-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Clock className="h-6 w-6 mr-2 text-teal-500" />
                                    Rendez-vous ({consultation.appointments.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {consultation.appointments.map((appointment, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="text-teal-600" size={20} />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                                                        <p className="font-bold text-gray-800">
                                                            {appointment?.atDate ? formatDateOnly(appointment?.atDate) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock className="text-teal-600" size={20} />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase">Heure</p>
                                                        <p className="font-bold text-gray-800">
                                                            {appointment?.atDate ? formatDateToTime(appointment?.atDate) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {appointment?.reason && (
                                                    <div className="bg-white bg-opacity-50 rounded p-2 mt-2">
                                                        <p className="text-xs font-semibold text-gray-500">Motif</p>
                                                        <p className="text-gray-700">{appointment?.reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Édition */}
            <EditConsultationModal
                isOpen={canOpenEditConsultationModal}
                onClose={() => setCanOpenEditConsultationModal(false)}
                consultation={consultation}
                onSave={() => setCanOpenEditConsultationModal(false)}
            />
        </CustomDashboard>
    )
}
// ...existing code...
