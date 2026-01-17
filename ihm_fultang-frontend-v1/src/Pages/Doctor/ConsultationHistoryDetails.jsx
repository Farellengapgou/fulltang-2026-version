import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { doctorNavLink } from "./lib/doctorNavLink.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useCalculateAge } from "../../Utils/compute.js";
import { formatDateOnly, formatDateOnlyWithoutWeekDay, formatDateToTime } from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "./DoctorComponents/MedicalParametersCard.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
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

    // Inject print stylesheet to produce clean, full-width PDF (hide side nav, UI chrome, preserve important content)
    useEffect(() => {
        const printCss = `
            @media print {
                @page { size: A4 portrait; margin: 10mm; }
                html, body { background: #fff !important; color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                /* hide app chrome and sidebars */
                nav, header, aside, .DoctorNavBar, .sidebar, .left-sidebar, .navbar, .no-print, [role="navigation"], .ant-layout-sider { display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
                /* ensure main content occupies full width */
                main, [role="main"], .print-area { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; left: 0 !important; right: 0 !important; display: block !important; }
                /* simplify visuals for print */
                * { box-shadow: none !important; text-shadow: none !important; }
                .bg-gradient-to-br, .bg-gradient-to-b, .bg-gradient-to-r { background: transparent !important; }
                .text-white { color: #000 !important; }
                svg { color: #000 !important; stroke: currentColor !important; fill: none !important; }
                /* avoid breaking important blocks across pages */
                .avoid-break, .prescription-card, .exam-card, .MedicalParametersCard, .rounded-lg, .rounded-xl { page-break-inside: avoid !important; break-inside: avoid !important; -webkit-column-break-inside: avoid !important; }
                /* tweak spacing for print */
                .p-4 { padding: 6pt !important; }
                .p-6 { padding: 8pt !important; }
                .mb-6 { margin-bottom: 8pt !important; }
                h1, h2, h3 { color: #000 !important; page-break-after: avoid !important; }
                p { orphans: 3 !important; widows: 3 !important; }
                img { max-width: 100% !important; height: auto !important; page-break-inside: avoid !important; }
            }
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

    // helper to build path robustly depending on axios baseURL
    const buildLastParamsPath = (id) => {
        try {
            const base = axiosInstance?.defaults?.baseURL || "";
            const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
            const hasMedical = normalized.endsWith("/medical") || normalized.includes("/api/v1/medical") || normalized.includes("/v1/medical");
            return hasMedical ? `/medical-folder/${id}/last-params/` : `/medical/medical-folder/${id}/last-params/`;
        } catch {
            return `/medical/medical-folder/${id}/last-params/`;
        }
    };

    // --- RÉCUPÉRATION DES PARAMÈTRES MÉDICAUX ---
    const fetchMedicalParams = async () => {
        if (!medicalFolderPageInfos?.id) {
            setMedicalParams(medicalFolderPageInfos?.parameters || {});
            return;
        }
        setIsLoadingParams(true);
        try {
            const path = buildLastParamsPath(medicalFolderPageInfos.id);
            const response = await axiosInstance.get(path);
            if (response?.status === 200 && response.data) setMedicalParams(response.data);
            else setMedicalParams(medicalFolderPageInfos?.parameters || {});
        } catch {
            setMedicalParams(medicalFolderPageInfos?.parameters || {});
        } finally {
            setIsLoadingParams(false);
        }
    };

    useEffect(() => { if (medicalFolderPageInfos?.id) fetchMedicalParams(); }, [medicalFolderPageInfos?.id]);

    const displayParams = medicalParams || medicalFolderPageInfos?.parameters || {};

    const MedicalParametersInfos = [
        { icon: Weight, label: "Poids", value: displayParams?.weight ? parseFloat(displayParams.weight) : "-", unit: displayParams?.weight ? " Kg" : "" },
        { icon: Ruler, label: "Taille", value: displayParams?.height ? parseFloat(displayParams.height) : "-", unit: displayParams?.height ? " m" : "" },
        { icon: Thermometer, label: "Température", value: displayParams?.temperature ? parseFloat(displayParams.temperature) : "-", unit: displayParams?.temperature ? "°C" : "" },
        { icon: Activity, label: "Tension Artérielle", value: displayParams?.bloodPressure || "-", unit: displayParams?.bloodPressure ? " mmHg" : "" },
        { icon: Heart, label: "Fréquence Cardiaque", value: displayParams?.heartRate ? parseInt(displayParams.heartRate) : "-", unit: displayParams?.heartRate ? " bpm" : "" },
        { icon: AlertTriangle, label: "Allergies", value: displayParams?.allergies || "Aucune" },
        { icon: Pills, label: "Antécédents Familiaux", value: displayParams?.familyMedicalHistory || "N/A" },
        { icon: FileText, label: "Médicaments Actuels", value: displayParams?.currentMedication || "Aucun" },
    ];

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            {/* keep nav visible on screen but hidden in print */}
            <div className="no-print"><DoctorNavBar /></div>

            {/* printable area — CSS forces this to full page width for print */}
            <div className="print-area">
                <div className="space-y-6 p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 avoid-break">

                        <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-xl shadow-lg p-6 mb-6 avoid-break">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <User className="w-12 h-12 text-primary-start" />
                                </div>
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white uppercase">
                                                Consultation — {patientInfos?.firstName || ""} {patientInfos?.lastName || ""}
                                            </h1>
                                            <p className="text-white text-sm mt-1 opacity-90">ID Dossier: {medicalFolderPageInfos?.id || "N/A"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-lg">{consultation?.consultationDate ? formatDateOnly(consultation.consultationDate) : "Date non spécifiée"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold text-white text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            <span>Né(e) le {patientInfos?.birthDate ? formatDateOnlyWithoutWeekDay(patientInfos.birthDate) : "Non spécifié"} ({ageValue} {ageUnit})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            <span>{patientInfos?.address || "Non spécifié"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-5 h-5" />
                                            <span>{patientInfos?.phoneNumber || "Non spécifié"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm rounded-lg mb-6 p-4 border border-gray-200 no-print">
                            <div className="flex justify-between items-center">
                                <button onClick={() => navigate(-1)} className="text-secondary font-bold flex gap-2 items-center">
                                    <div className="w-8 h-8 border-2 border-secondary rounded-full flex justify-center items-center"><ArrowLeft/></div>
                                    <span className="text-sm">Retour</span>
                                </button>

                                <div className="flex gap-3">
                                    <button onClick={() => setCanOpenEditConsultationModal(true)} className="bg-secondary text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                                        <FaEdit size={14}/> Modifier
                                    </button>
                                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                                        <Printer size={14}/> Imprimer
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Paramètres médicaux */}
                        <div className="w-full mb-6 avoid-break">
                            <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-6 border border-blue-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-secondary uppercase tracking-wide">Paramètres médicaux</h2>
                                    {isLoadingParams && <Spin size="small" />}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {MedicalParametersInfos.map((info, idx) => {
                                        const Icon = info.icon;
                                        return <MedicalParametersCard key={idx} icon={<Icon size={20} className="text-primary-start"/>} label={info.label} value={info.value} unit={info.unit} />;
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Notes, diagnostic, prescriptions, exams, appointments */}
                        <div className="bg-white rounded-xl space-y-6 p-6 border border-gray-100">
                            {/* Nurse notes */}
                            {(medicalFolderPageInfos?.nurseNotes || consultation?.consultationNotes) && (
                                <section className="border-l-4 border-blue-500 pl-4 avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><ClipboardList className="mr-2"/> Notes infirmier</h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{medicalFolderPageInfos?.nurseNotes || consultation?.consultationNotes}</p>
                                    </div>
                                </section>
                            )}

                            {/* Doctor notes */}
                            {medicalFolderPageInfos?.doctorNote && (
                                <section className="border-l-4 border-green-500 pl-4 avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><ClipboardList className="mr-2"/> Notes médecin</h3>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{medicalFolderPageInfos.doctorNote}</p>
                                    </div>
                                </section>
                            )}

                            {/* Diagnostic */}
                            {medicalFolderPageInfos?.diagnostic && (
                                <section className="border-l-4 border-red-500 pl-4 avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><Stethoscope className="mr-2"/> Diagnostic</h3>
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{medicalFolderPageInfos.diagnostic}</p>
                                    </div>
                                </section>
                            )}

                            {/* Prescriptions */}
                            {medicalFolderPageInfos?.prescriptions?.length > 0 && (
                                <section className="border-l-4 border-purple-500 pl-4 avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><GiMedicines className="mr-2"/> Prescriptions ({medicalFolderPageInfos.prescriptions.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {medicalFolderPageInfos.prescriptions.map((prescription, pIdx) =>
                                            (prescription?.prescriptionDrug || []).map((drug, dIdx) => (
                                                <article key={`${pIdx}-${dIdx}`} className="prescription-card rounded-lg p-4">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <Pill className="text-purple-600" size={18}/>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{drug?.medicament?.name || "Médicament inconnu"}</p>
                                                            <p className="text-xs text-gray-600">{drug?.note || ""}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 text-sm text-gray-700">
                                                        {drug?.dosage && <div className="flex justify-between"><span className="font-semibold">Dosage</span><span>{drug.dosage}</span></div>}
                                                        {drug?.frequency && <div className="flex justify-between"><span className="font-semibold">Fréquence</span><span>{drug.frequency}</span></div>}
                                                        {drug?.duration && <div className="flex justify-between"><span className="font-semibold">Durée</span><span>{drug.duration}</span></div>}
                                                    </div>
                                                </article>
                                            ))
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Exam requests */}
                            {medicalFolderPageInfos?.examRequests?.length > 0 && (
                                <section className="border-l-4 border-orange-500 pl-4 avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Microscope className="mr-2"/> Examens prescrits ({medicalFolderPageInfos.examRequests.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {medicalFolderPageInfos.examRequests.map((exam, idx) => (
                                            <div key={idx} className="exam-card rounded-lg p-4">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <Microscope className="text-orange-600" size={18}/>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{exam?.idExam?.examName || "Examen inconnu"}</p>
                                                    </div>
                                                </div>
                                                {exam?.notes && <div className="bg-white rounded p-2 text-sm text-gray-700"><p className="whitespace-pre-wrap">{exam.notes}</p></div>}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Appointments */}
                            {consultation?.appointments?.length > 0 && (
                                <section className="border-l-4 border-teal-500 pl-4 avoid-break">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Clock className="mr-2"/> Rendez-vous ({consultation.appointments.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {consultation.appointments.map((appointment, i) => (
                                            <div key={i} className="rounded-lg p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar size={16}/>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                                                            <p className="font-bold text-gray-800">{appointment?.atDate ? formatDateOnly(appointment.atDate) : "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Clock size={16}/>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase">Heure</p>
                                                            <p className="font-bold text-gray-800">{appointment?.atDate ? formatDateToTime(appointment.atDate) : "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    {appointment?.reason && <div className="bg-white rounded p-2 mt-2"><p className="text-gray-700 whitespace-pre-wrap">{appointment.reason}</p></div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EditConsultationModal isOpen={canOpenEditConsultationModal} onClose={() => setCanOpenEditConsultationModal(false)} consultation={consultation} onSave={() => setCanOpenEditConsultationModal(false)} />
        </CustomDashboard>
    );
}

export default ConsultationHistoryDetails;
