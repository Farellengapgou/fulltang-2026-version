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
import { LaboratoryNavBar } from "./LaboratoryNavBar.jsx";
import { laboratoryNavLink } from "./LaboratoryNavLink.js";
import { useAuthentication } from "../../Utils/Provider.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { useCalculateAge } from "../../Utils/compute.js";
import { formatDateOnly, formatDateOnlyWithoutWeekDay } from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "../Doctor/DoctorComponents/MedicalParametersCard.jsx";

export function PatientMedicalFolder() {
    const { id: patientId } = useParams();
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

    const loadMedicalFolder = useCallback(async () => {
        if (!patientId) {
            message.error("ID patient manquant");
            return;
        }

        setIsLoading(true);
        console.log("🔄 Chargement dossier pour patient:", patientId);

        try {
            let folderId = null;

            // 1. Vérifier si on a déjà les données patient avec idMedicalFolder
            if (patient?.idMedicalFolder) {
                console.log("✅ Utilisation des données patient existantes");
                folderId = patient.idMedicalFolder;
            } else {
                // 2. Fallback: recharger la liste des patients du docteur
                console.log("→ Rechargement de la liste des patients du laborantin");
                const patientsRes = await axiosInstance.get(`/patient/doctor/${userData.id}/`);
                const currentPatient = patientsRes.data.find(p => p.id === parseInt(patientId));

                if (!currentPatient) {
                    message.error("Patient non trouvé dans votre liste");
                    setIsLoading(false);
                    return;
                }

                folderId = currentPatient.idMedicalFolder;
            }

            // 3. Vérifier qu'on a bien un ID de dossier
            if (!folderId) {
                console.warn("⚠️ Pas de dossier médical associé au patient");
                message.warning("Ce patient n'a pas encore de dossier médical");
                setMedicalFolder({ pages: [] });
                setIsLoading(false);
                return;
            }

            // 4. Charger le dossier médical
            console.log("→ Chargement du dossier médical ID:", folderId);
            const folderRes = await axiosInstance.get(`/medical-folder/${folderId}/`);

            if (folderRes.status === 200) {
                console.log("✅ Dossier chargé:", folderRes.data);
                setMedicalFolder(folderRes.data);
                setErrorStatus(null);

                // Sélectionner la première page par défaut
                if (folderRes.data?.pages && folderRes.data.pages.length > 0) {
                    const sortedPages = [...folderRes.data.pages].sort((a, b) => a.pageNumber - b.pageNumber);
                    setSelectedPage(sortedPages[0]);
                } else {
                    setSelectedPage(null);
                }
            }

        } catch (error) {
            console.error("❌ Erreur chargement dossier:", error);
            const status = error?.response?.status;

            if (status === 404) {
                message.warning("Dossier médical non trouvé");
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
    }, [patientId, patient, userData, navigate]);

    useEffect(() => {
        loadMedicalFolder();
    }, [loadMedicalFolder]);

    // Print styles
    useEffect(() => {
        const printCss = `
            @media print {
                /* RESET GLOBAL LAYOUT */
                html, body, #root, .ant-layout, .ant-layout-content, main, .main-content {
                    height: auto !important;
                    min-height: 0 !important;
                    overflow: visible !important;
                    display: block !important;
                    position: static !important;
                    background: white !important;
                }

                /* Neutraliser les conteneurs scrollables ou limités en hauteur */
                [class*="h-screen"], [class*="max-h-screen"], [class*="overflow-"], [class*="scroll"] {
                    height: auto !important;
                    max-height: none !important;
                    overflow: visible !important;
                }

                /* MASQUAGE AGRESSIF DES ÉLÉMENTS FLOTTANTS/FIXES */
                nav, header, aside, .ant-layout-sider, .sidebar, .DoctorNavBar, .no-print, .ant-drawer, .ant-modal-mask, .ant-layout-header, [class*="fixed"], [class*="sticky"] { 
                    display: none !important; 
                    width: 0 !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                
                /* Masquer les boutons */
                button { 
                    display: none !important; 
                }
                
                /* SUPPRESSION DES FONDS COLORÉS ET DÉGRADÉS */
                .print-area, .print-area * {
                    background: white !important;
                    background-image: none !important;
                    box-shadow: none !important;
                    border-color: #eee !important;
                }

                /* Forcer le texte en noir */
                * {
                    color: black !important;
                    text-shadow: none !important;
                }

                /* Layout structure */
                .print-area { 
                    display: block !important;
                    visibility: visible !important;
                    width: 100% !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    opacity: 1 !important;
                    position: relative !important;
                }

                @page { 
                    size: A4 portrait; 
                    margin: 20mm 15mm; 
                }

                /* Header style */
                .print-header {
                    display: block !important;
                    width: 100% !important;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                }

                .print-header h1 {
                    font-size: 24pt !important;
                    margin-bottom: 5px !important;
                    color: #000 !important;
                }

                .print-header p {
                    font-size: 11pt !important;
                    color: #444 !important;
                }

                .screen-header {
                    display: none !important;
                }

                /* Section styling */
                .avoid-break { 
                    page-break-inside: avoid !important; 
                    break-inside: avoid !important; 
                    margin-bottom: 25px !important;
                }

                h2, h3 {
                    page-break-after: avoid !important;
                    border-bottom: 1px solid #ccc !important;
                    padding-bottom: 5px !important;
                    margin-top: 20px !important;
                }

                /* Parameters grid for print */
                .print-params-grid {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 15px !important;
                    border: 1px solid #eee !important;
                    padding: 15px !important;
                    border-radius: 8px !important;
                }

                /* Notes blocks */
                .note-block {
                    background-color: #f9f9f9 !important;
                    border: 1px solid #eee !important;
                    padding: 15px !important;
                    border-radius: 6px !important;
                    margin-left: 0 !important;
                }

                .diagnostic-block {
                    border: 2px solid #555 !important;
                    padding: 15px !important;
                    background-color: #fff !important;
                    font-size: 13pt !important;
                }

                /* Prescription cards */
                .prescription-grid {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 15px !important;
                }

                .prescription-card {
                    border: 1px solid #ddd !important;
                    padding: 12px !important;
                    border-radius: 6px !important;
                }

                /* Exam cards */
                .exam-grid {
                    display: grid !important;
                    grid-template-columns: 1fr !important;
                    gap: 10px !important;
                }
            }
            
            /* Masquer header impression à l'écran */
            .print-header { display: none; }
        `;
        const style = document.createElement("style");
        style.setAttribute("data-print-styles", "true");
        style.innerHTML = printCss;
        document.head.appendChild(style);
        return () => {
            const el = document.querySelector('style[data-print-styles="true"]');
            if (el) el.remove();
        };
    }, []);

    // Navigation entre les pages du dossier
    const handleNextPage = () => {
        if (!medicalFolder?.pages || medicalFolder.pages.length === 0 || !selectedPage) return;

        const sortedPages = [...medicalFolder.pages].sort((a, b) => a.pageNumber - b.pageNumber);
        const currentIndex = sortedPages.findIndex(p => p.id === selectedPage.id);

        if (currentIndex !== -1 && currentIndex < sortedPages.length - 1) {
            setSelectedPage(sortedPages[currentIndex + 1]);
        }
    };

    const handlePrevPage = () => {
        if (!medicalFolder?.pages || medicalFolder.pages.length === 0 || !selectedPage) return;

        const sortedPages = [...medicalFolder.pages].sort((a, b) => a.pageNumber - b.pageNumber);
        const currentIndex = sortedPages.findIndex(p => p.id === selectedPage.id);

        if (currentIndex > 0) {
            setSelectedPage(sortedPages[currentIndex - 1]);
        }
    };

    const getCurrentPageNumber = () => {
        if (!medicalFolder?.pages || !selectedPage) return { current: 0, total: 0 };

        const sortedPages = [...medicalFolder.pages].sort((a, b) => a.pageNumber - b.pageNumber);
        const currentIndex = sortedPages.findIndex(p => p.id === selectedPage.id);

        return {
            current: currentIndex + 1,
            total: sortedPages.length
        };
    };


    if (isLoading) {
        return (
            <CustomDashboard linkList={laboratoryNavLink} requiredRole={"Doctor"}>
                <LaboratoryNavBar />
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
        <CustomDashboard linkList={laboratoryNavLink} requiredRole={"Doctor"}>
            <div className="no-print"><LaboratoryNavBar /></div>

            {/* --- HEADER IMPRESSION (Visible uniquement à l'impression) --- */}
            <div className="print-header">
                <div className="flex justify-between items-start">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold uppercase tracking-tighter">Centre Hospitalier Fultang</h1>
                        <p className="text-sm italic">"Votre santé, notre priorité absolue"</p>
                        <p className="text-xs mt-1">BP: 4500, Yaoundé, Cameroun | Tél: (+237) 600 000 000</p>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-dashed border-gray-400">
                    <h2 className="text-center text-xl font-bold underline mb-4">RAPPORT DE DOSSIER MÉDICAL</h2>
                    <div className="grid grid-cols-2 gap-8 text-sm text-left">
                        <div className="space-y-1">
                            <p className="font-bold border-b border-gray-200 pb-1 mb-2">INFORMATION PATIENT</p>
                            <p><strong>Nom complet:</strong> {patient?.firstName} {patient?.lastName}</p>
                            <p><strong>Né(e) le:</strong> {patient?.birthDate && formatDateOnlyWithoutWeekDay(patient?.birthDate)} ({ageValue} {ageUnit})</p>
                            <p><strong>Sexe:</strong> {patient?.gender || 'N/A'}</p>
                            <p><strong>Code Dossier:</strong> <span className="p-1 border border-black font-mono">{medicalFolder?.folderCode || 'N/A'}</span></p>
                            <p><strong>Adresse:</strong> {patient?.address || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold border-b border-gray-200 pb-1 mb-2">DÉTAILS DU RAPPORT</p>
                            <p><strong>Date d'émission:</strong> {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p><strong>Médecin Traitant:</strong> Dr. {userData?.firstName} {userData?.lastName}</p>
                            <p><strong>Spécialité:</strong> Médecine Générale</p>
                            <p><strong>Page Rapport:</strong> {getCurrentPageNumber().current} / {getCurrentPageNumber().total}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 print-area">
                {/* Patient Information (Header Écran - Masqué à l'impression) */}
                <div className="bg-white rounded-lg shadow-sm p-6 screen-header no-print">
                    <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                <User className="w-12 h-12 text-black" />
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
                                        <Calendar className="w-6 h-6" />
                                        <div className="flex">
                                            <span>Né(e) le {patient?.birthDate && formatDateOnlyWithoutWeekDay(patient?.birthDate) || 'Non spécifié'}</span>
                                            <div className="flex gap-1 mt-0.5">
                                                <span className="ml-2 text-white text-sm">({ageValue}</span>
                                                <span className="text-white text-sm">{ageUnit})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="w-6 h-6" />
                                        <span>{patient?.address || 'Non spécifié'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Phone className="w-6 h-6" />
                                        <span>{patient?.phoneNumber || 'Non spécifié'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 shadow-md rounded-lg mb-5 p-4 no-print">
                        <div className="flex justify-between items-center">
                            <div className="flex justify-start">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="text-secondary text-xl transition-all duration-300 font-bold flex gap-2 items-center"
                                >
                                    <div className="w-8 h-8 border-2 rounded-full flex justify-center items-center border-secondary">
                                        <ArrowLeft />
                                    </div>
                                    <p className="text-[17px] mt-0.5">Retour à la liste</p>
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="bg-secondary font-bold duration-300 text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all"
                                >
                                    <Printer size={20} className="inline mr-2" />
                                    Imprimer le dossier
                                </button>
                            </div>
                        </div>
                    </div>

                    {medicalFolder?.pages && medicalFolder.pages.length > 0 && (
                        <div className="bg-gray-100 rounded-lg p-4 mb-5 no-print">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-lg text-secondary">
                                    Pages du dossier ({medicalFolder.pages.length})
                                    {selectedPage && (
                                        <span className="ml-2 text-sm font-normal text-gray-600">
                                            - Page {getCurrentPageNumber().current} sur {getCurrentPageNumber().total}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={!selectedPage || getCurrentPageNumber().current === 1}
                                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Précédent
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!selectedPage || getCurrentPageNumber().current === getCurrentPageNumber().total}
                                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                                {[...medicalFolder.pages]
                                    .sort((a, b) => a.pageNumber - b.pageNumber)
                                    .map((page, index) => (
                                        <button
                                            key={page.id}
                                            onClick={() => setSelectedPage(page)}
                                            className={`px-4 py-2 rounded-md font-semibold transition-all ${selectedPage?.id === page.id
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
                        <div className="w-full mx-auto mb-6 avoid-break">
                            <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg p-6 border border-blue-100 print-params-grid">
                                <p className="font-bold text-xl text-secondary mb-6 no-print">Paramètres Médicaux - Page {selectedPage.pageNumber}</p>
                                <p className="hidden print:block font-bold text-lg mb-4 underline">CONSTANTES VITALES</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
                                    {MedicalParametersInfos.map((info, index) => (
                                        <MedicalParametersCard
                                            key={index}
                                            icon={info.icon}
                                            label={info.label}
                                            value={info.value}
                                            unit={info.unit}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedPage ? (
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8 print:space-y-4">
                            <h2 className="text-2xl font-bold text-gray-800 no-print">Détails de la consultation</h2>

                            {/* Nurse Notes */}
                            <div className="mb-10 avoid-break">
                                <h3 className="text-lg font-bold mb-4 flex items-center border-b border-gray-200 pb-2">
                                    <ClipboardList className="h-5 w-5 mr-2 text-blue-500 print:text-black" />
                                    Observations Infirmières
                                </h3>
                                <div className="ml-0 md:ml-10 p-4 bg-gray-50 rounded note-block">
                                    <p className="text-gray-700 whitespace-pre-wrap text-justify leading-relaxed">{selectedPage?.nurseNotes || selectedPage?.nurseNote || 'Aucune observation enregistrée'}</p>
                                </div>
                            </div>

                            {/* Doctor Notes */}
                            <div className="mb-10 avoid-break">
                                <h3 className="text-lg font-bold mb-4 flex items-center border-b border-gray-200 pb-2">
                                    <ClipboardList className="h-5 w-5 mr-2 text-blue-500 print:text-black" />
                                    Observations Médicales
                                </h3>
                                <div className="ml-0 md:ml-10 p-4 bg-gray-50 rounded note-block">
                                    <p className="text-gray-700 whitespace-pre-wrap text-justify leading-relaxed">{selectedPage?.doctorNote || 'Aucune note médicale enregistrée'}</p>
                                </div>
                            </div>

                            {/* Diagnostic */}
                            <div className="mb-8 avoid-break">
                                <h3 className="text-lg font-bold mb-4 flex items-center border-b border-gray-200 pb-2">
                                    <Stethoscope className="h-5 w-5 mr-2 text-blue-500 print:text-black" />
                                    Diagnostic Final
                                </h3>
                                <div className="ml-0 md:ml-10 p-5 bg-red-50 border-l-4 border-red-500 rounded diagnostic-block">
                                    <p className="text-gray-900 font-bold text-xl whitespace-pre-wrap">{selectedPage?.diagnostic || 'Non spécifié'}</p>
                                </div>
                            </div>

                            {selectedPage.prescriptions && selectedPage.prescriptions.length > 0 && (
                                <div className="avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2">
                                        <Pill className="h-5 w-5 mr-2 text-purple-500 print:text-black" />
                                        ORDONNANCE MÉDICALE
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 prescription-grid">
                                        {selectedPage.prescriptions.map((prescription, idx) =>
                                            prescription?.prescriptionDrug?.map((drugInfo, drugIdx) => (
                                                <div key={`${idx}-${drugIdx}`} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 prescription-card">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <Pill className="text-purple-600 print:text-black flex-shrink-0 mt-1" size={20} />
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 text-sm underline uppercase">
                                                                {drugInfo?.medicament?.name || 'Médicament inconnu'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-sm text-gray-700 bg-white/50 rounded p-3 font-medium">
                                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                                            <span>Posologie:</span>
                                                            <span className="font-bold">{drugInfo?.dosage || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                                            <span>Fréquence:</span>
                                                            <span className="font-bold">{drugInfo?.frequency || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Durée:</span>
                                                            <span className="font-bold">{drugInfo?.duration || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedPage.examRequests && selectedPage.examRequests.length > 0 && (
                                <div className="avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2">
                                        <Microscope className="h-5 w-5 mr-2 text-orange-500 print:text-black" />
                                        DEMANDE D'EXAMENS
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 exam-grid">
                                        {selectedPage.examRequests.map((exam, index) => (
                                            <div key={index} className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <Microscope className="text-orange-600 print:text-black flex-shrink-0 mt-1" size={20} />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 uppercase">
                                                            {exam?.idExam?.examName || 'Examen inconnu'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {exam?.notes && (
                                                    <div className="bg-white/50 rounded p-3 text-sm text-gray-700 italic border-l-2 border-gray-300">
                                                        <p><strong>Note:</strong> {exam.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPage.examResults && selectedPage.examResults.length > 0 && (
                                <div className="avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2">
                                        <FileText className="h-5 w-5 mr-2 text-teal-500 print:text-black" />
                                        RÉSULTATS DE LABORATOIRE
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedPage.examResults.map((result, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                                                <p className="text-gray-900 font-medium whitespace-pre-wrap leading-relaxed">{result.result || 'Résultat non spécifié'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Signature space for print */}
                            <div className="hidden print:block mt-12 pt-12">
                                <div className="flex justify-end">
                                    <div className="text-center w-64 border-t border-black pt-2">
                                        <p className="font-bold">Cachet et Signature du Médecin</p>
                                        <p className="text-xs mt-1">Fait à Yaoundé, le {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
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