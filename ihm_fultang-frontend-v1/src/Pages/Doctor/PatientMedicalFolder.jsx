import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
    User, 
    FileText,
    ArrowLeft,
    Calendar,
    MapPin,
    Phone,
    Printer,
    Weight,
    Ruler,
    Thermometer,
    Activity,
    Heart,
    AlertTriangle,
    Pill,
    Stethoscope,
    ClipboardList,
    Clock,
    Microscope
} from "lucide-react";
import { message } from "antd";
import axiosInstance from "../../Utils/axiosInstance.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx";
import { doctorNavLink } from "./lib/doctorNavLink.js";
import { useAuthentication } from "../../Utils/Provider.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { useCalculateAge } from "../../Utils/compute.js";
import { formatDateOnly, formatDateOnlyWithoutWeekDay } from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "./DoctorComponents/MedicalParametersCard.jsx";

export function PatientMedicalFolder() {
    const { patientId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { userData } = useAuthentication();
    const { calculateAge } = useCalculateAge();
    
    const [medicalFolder, setMedicalFolder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);

    const patient = location.state?.patient;
    const { value: ageValue, unit: ageUnit } = calculateAge(patient?.birthDate);

    const buildMedicalFolderPath = (id, preferBaseHasMedical = null) => {
        const base = axiosInstance?.defaults?.baseURL || "";
        const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
        const baseHasMedical = normalized.endsWith("/medical") || normalized.includes("/api/v1/medical") || normalized.includes("/v1/medical");
        const useNoExtraMedical = preferBaseHasMedical !== null ? preferBaseHasMedical : baseHasMedical;
        return useNoExtraMedical ? `/medical-folder/${id}/` : `/medical/medical-folder/${id}/`;
    };

    const loadMedicalFolder = useCallback(async () => {
        if (!patientId) {
            message.error("ID patient manquant");
            return;
        }
        
        setIsLoading(true);
        console.log("🔄 Chargement dossier pour patient:", patientId, "axios baseURL:", axiosInstance?.defaults?.baseURL);

        // build primary and alternate paths to be resilient
        const primaryPath = buildMedicalFolderPath(patientId);
        const alternatePath = primaryPath.includes("/medical/medical-folder/") 
            ? `/medical-folder/${patientId}/` 
            : `/medical/medical-folder/${patientId}/`;

        try {
            console.log("→ Requête dossier (primary):", primaryPath);
            let response = await axiosInstance.get(primaryPath);
            if (response?.status === 200) {
                console.log("✅ Dossier chargé (primary):", response.data);
                setMedicalFolder(response.data);
                setErrorStatus(null);
                if (response.data?.pages && response.data.pages.length > 0) setSelectedPage(response.data.pages[0]);
                setIsLoading(false);
                return;
            }
            console.warn("⚠️ Réponse inattendue (primary):", response);
        } catch (errPrimary) {
            console.warn("❌ Erreur primary:", errPrimary?.response?.status, errPrimary?.response?.data || errPrimary.message);
        }

        // try alternate
        try {
            console.log("→ Requête dossier (alternate):", alternatePath);
            const response2 = await axiosInstance.get(alternatePath);
            if (response2?.status === 200) {
                console.log("✅ Dossier chargé (alternate):", response2.data);
                setMedicalFolder(response2.data);
                setErrorStatus(null);
                if (response2.data?.pages && response2.data.pages.length > 0) setSelectedPage(response2.data.pages[0]);
                setIsLoading(false);
                return;
            }
            console.warn("⚠️ Réponse inattendue (alternate):", response2);
        } catch (errAlt) {
            console.error("❌ Erreur alternate:", errAlt?.response?.status, errAlt?.response?.data || errAlt.message);

            const status = errAlt?.response?.status;
            if (status === 404) {
                message.warning("Aucun dossier médical trouvé pour ce patient");
                setMedicalFolder({ pages: [] });
            } else if (status === 401) {
                message.error("Session expirée - Redirection...");
                setTimeout(() => navigate('/login'), 1200);
            } else {
                setErrorStatus(status || 500);
                message.error("Erreur lors du chargement du dossier médical");
            }
        } finally {
            setIsLoading(false);
        }
    }, [patientId, navigate]);

    useEffect(() => {
        loadMedicalFolder();
    }, [loadMedicalFolder]);

    if (isLoading) {
        return (
            <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
                <DoctorNavBar />
                <div className="h-[500px] w-full flex justify-center items-center flex-col">
                    <Loader size={"medium"} color={"primary-end"} />
                    <p className="mt-4 text-gray-600">Chargement du dossier médical...</p>
                </div>
            </CustomDashboard>
        );
    }

    if (errorStatus && errorStatus !== 404) {
        return <ServerErrorPage errorStatus={errorStatus} />;
    }

    const MedicalParametersInfos = selectedPage ? [
        {
            icon: Weight,
            label: 'Poids',
            value: selectedPage?.parameters?.weight ? parseFloat(selectedPage.parameters.weight) : '-',
            unit: selectedPage?.parameters?.weight && ' Kg'
        },
        {
            icon: Ruler,
            label: 'Taille',
            value: selectedPage?.parameters?.height ? parseFloat(selectedPage.parameters.height) : '-',
            unit: selectedPage?.parameters?.height && ' m'
        },
        {
            icon: Thermometer,
            label: 'Température',
            value: selectedPage?.parameters?.temperature ? parseFloat(selectedPage.parameters.temperature) : '-',
            unit: selectedPage?.parameters?.temperature && '°C'
        },
        {
            icon: Activity,
            label: 'Tension Artérielle',
            value: selectedPage?.parameters?.bloodPressure || '-',
            unit: selectedPage?.parameters?.bloodPressure && ' mmHg'
        },
        {
            icon: Heart,
            label: 'Fréquence Cardiaque',
            value: selectedPage?.parameters?.heartRate ? parseInt(selectedPage.parameters.heartRate) : '-',
            unit: selectedPage?.parameters?.heartRate && ' bpm'
        },
        {
            icon: AlertTriangle,
            label: 'Allergies',
            value: selectedPage?.parameters?.allergies || '-'
        },
        {
            icon: Pill,
            label: 'Antécédents Familiaux',
            value: selectedPage?.parameters?.familyMedicalHistory || '-'
        },
        {
            icon: FileText,
            label: 'Médicaments Actuels',
            value: selectedPage?.parameters?.currentMedication || '-'
        }
    ] : [];

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar />
            
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                <User className="w-12 h-12 text-black"/>
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex justify-between">
                                    <h1 className="text-3xl font-bold text-white">
                                        DOSSIER MÉDICAL - {patient?.firstName || ''} {patient?.lastName || ''}
                                    </h1>
                                    <p className="text-white font-bold text-xl">
                                        {medicalFolder?.folderCode || 'Aucun code'}
                                    </p>
                                </div>
                                <div className="mt-3.5 grid grid-cols-3 gap-4 font-semibold">
                                    <div className="flex items-center gap-2 text-white">
                                        <Calendar className="w-6 h-6"/>
                                        <div className="flex">
                                            <span>Né(e) le {patient?.birthDate && formatDateOnlyWithoutWeekDay(patient?.birthDate) || 'Non spécifié'}</span>
                                            <div className="flex gap-1 mt-0.5">
                                                <span className="ml-2 text-white text-sm">({ageValue}</span>
                                                <span className="text-white text-sm">{ageUnit})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="w-6 h-6"/>
                                        <span>{patient?.address || 'Non spécifié'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Phone className="w-6 h-6"/>
                                        <span>{patient?.phoneNumber || 'Non spécifié'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 shadow-md rounded-lg mb-5 p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex justify-start">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="text-secondary text-xl transition-all duration-300 font-bold flex gap-2 items-center"
                                >
                                    <div className="w-8 h-8 border-2 rounded-full flex justify-center items-center border-secondary">
                                        <ArrowLeft/>
                                    </div>
                                    <p className="text-[17px] mt-0.5">Retour à la liste</p>
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="bg-secondary font-bold duration-300 text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all"
                                >
                                    <Printer size={20} className="inline mr-2"/>
                                    Imprimer le dossier
                                </button>
                            </div>
                        </div>
                    </div>

                    {medicalFolder?.pages && medicalFolder.pages.length > 0 && (
                        <div className="bg-gray-100 rounded-lg p-4 mb-5">
                            <h3 className="font-bold text-lg mb-3 text-secondary">Pages du dossier ({medicalFolder.pages.length})</h3>
                            <div className="flex gap-2 flex-wrap">
                                {medicalFolder.pages.map((page, index) => (
                                    <button
                                        key={page.id}
                                        onClick={() => setSelectedPage(page)}
                                        className={`px-4 py-2 rounded-md font-semibold transition-all ${
                                            selectedPage?.id === page.id
                                                ? 'bg-primary-end text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Page {page.pageNumber || index + 1}
                                        <span className="ml-2 text-xs">
                                            ({page.addDate ? formatDateOnly(page.addDate) : 'Sans date'})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedPage && selectedPage.parameters && (
                        <div className="w-full mx-auto mb-6">
                            <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg p-6 border border-blue-100">
                                <p className="font-bold text-xl text-secondary mb-6">Paramètres Médicaux - Page {selectedPage.pageNumber}</p>
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
                    )}

                    {selectedPage ? (
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                            {selectedPage.nurseNote && (
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                        <ClipboardList className="h-5 w-5 mr-2 text-blue-500"/>
                                        Notes Infirmières
                                    </h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedPage.nurseNote}</p>
                                    </div>
                                </div>
                            )}

                            {selectedPage.doctorNote && (
                                <div className="border-l-4 border-green-500 pl-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                        <Stethoscope className="h-5 w-5 mr-2 text-green-500"/>
                                        Notes du Médecin
                                    </h3>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedPage.doctorNote}</p>
                                    </div>
                                </div>
                            )}

                            {selectedPage.diagnostic && (
                                <div className="border-l-4 border-red-500 pl-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                        <Stethoscope className="h-5 w-5 mr-2 text-red-500"/>
                                        Diagnostic
                                    </h3>
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                        <p className="text-gray-800 font-semibold text-lg whitespace-pre-wrap">{selectedPage.diagnostic}</p>
                                    </div>
                                </div>
                            )}

                            {selectedPage.prescriptions && selectedPage.prescriptions.length > 0 && (
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <Pill className="h-5 w-5 mr-2 text-purple-500"/>
                                        Prescriptions ({selectedPage.prescriptions.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedPage.prescriptions.map((prescription, idx) =>
                                            prescription?.prescriptionDrug?.map((drugInfo, drugIdx) => (
                                                <div key={`${idx}-${drugIdx}`} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <Pill className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-800 text-sm">
                                                                {drugInfo?.medicament?.name || 'Médicament inconnu'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-sm text-gray-700 bg-white bg-opacity-50 rounded p-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Dosage:</span>
                                                            <span>{drugInfo?.dosage || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Fréquence:</span>
                                                            <span>{drugInfo?.frequency || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Durée:</span>
                                                            <span>{drugInfo?.duration || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedPage.examRequests && selectedPage.examRequests.length > 0 && (
                                <div className="border-l-4 border-orange-500 pl-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <Microscope className="h-5 w-5 mr-2 text-orange-500"/>
                                        Examens Prescrits ({selectedPage.examRequests.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedPage.examRequests.map((exam, index) => (
                                            <div key={index} className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <Microscope className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">
                                                            {exam?.idExam?.examName || 'Examen inconnu'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {exam?.notes && (
                                                    <div className="bg-white bg-opacity-50 rounded p-3 text-sm text-gray-700">
                                                        <p className="font-semibold mb-1">Instructions:</p>
                                                        <p>{exam.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPage.examResults && selectedPage.examResults.length > 0 && (
                                <div className="border-l-4 border-teal-500 pl-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-teal-500"/>
                                        Résultats d'Examens ({selectedPage.examResults.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedPage.examResults.map((result, index) => (
                                            <div key={index} className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <p className="text-gray-800 font-medium whitespace-pre-wrap">{result.result || 'Non spécifié'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-8 text-center">
                            <FileText className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune page sélectionnée</h3>
                            <p className="text-gray-500">
                                {medicalFolder?.pages && medicalFolder.pages.length > 0 
                                    ? "Sélectionnez une page ci-dessus pour afficher son contenu"
                                    : "Le dossier médical de ce patient ne contient aucune page"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </CustomDashboard>
    );
}

export default PatientMedicalFolder;
