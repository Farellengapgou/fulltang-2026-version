import {
    Stethoscope,
    Weight,
    Thermometer,
    Activity,
    Heart,
    FileText,
    Ruler,
    AlertTriangle,
    PillIcon as Pills,
    Hospital,
    CalendarCheck,
    User, Calendar, MapPin, Phone, Printer, ArrowLeft,
    ChevronRight
} from 'lucide-react';
import {useLocation, useNavigate} from "react-router-dom";
// On réutilise les liens du docteur ou on en crée de nouveaux si besoin
import {doctorNavLink} from "../Doctor/lib/doctorNavLink.js";
import { DoctorNavBar } from '../Doctor/DoctorComponents/DoctorNavBar.jsx';
import {useEffect, useState} from "react";
import {useCalculateAge} from "../../Utils/compute.js";
import {combineToISOString, formatDateOnly, formatDateOnlyWithoutWeekDay} from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "../Doctor/DoctorComponents/MedicalParametersCard.jsx";
import MedicationPrescriptionCard from "../Doctor/DoctorComponents/MedicationPrescriptionCard.jsx";
import ExamPrescriptionCard from "../Doctor/DoctorComponents/ExamPrescriptionCard.jsx";
import AppointmentPrescriptionCard from "../Doctor/DoctorComponents/AppointmentPrescriptionCard.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import Wait from "../Modals/wait.jsx";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {useAuthentication} from "../../Utils/Provider.jsx";

const consultationSteps = [
    { id: 0, name: 'diagnostic', label: 'Dental Diagnostic', icon: Stethoscope },
    { id: 1, name: 'prescriptions', label: 'Prescriptions', icon: Pills },
    { id: 2, name: 'exams', label: 'Exams', icon: Hospital },
    { id: 4, name: 'appointment', label: 'Schedule an appointment', icon: CalendarCheck }
];

export function DentistConsultationDetails() {
    const navigate = useNavigate();
    const {state} = useLocation();
    const consultation = state?.consultation || {};
    const patientInfo = consultation?.idPatient;
    const medicalPageInfo = consultation?.idMedicalFolderPage;
    
    const [availableMedications, setAvailableMedication] = useState([]);
    const [availableExams, setAvailableExams]  = useState([]);
    const [isUpdatingConsultation, setIsUpdatingConsultation] = useState(false);
    const [isPrescribing, setIsPrescribing] = useState(false);
    const [isPrescribingExam, setIsPrescribingExams] = useState(false);
    const [isEndingConsultation, setIsEndingConsultation] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [transactionErrorMessage, setTransactionErrorMessage] = useState("");
    const [isPrescribingAppointment, setIsPrescribingAppointment] = useState(false);

    const [activeTab, setActiveTab] = useState("diagnostic");
    
    // Specific Dental State
    const [diagnostic, setDiagnostic] = useState("");
    const [doctorNote, setDoctorNote] = useState("");
    const [affectedTeeth, setAffectedTeeth] = useState("");
    const [careType, setCareType] = useState("");
    const [prosthesis, setProsthesis] = useState("");
    const [selectedXrays, setSelectedXrays] = useState([]);

    const [prescriptions, setPrescriptions] = useState(
        consultation?.prescriptions && consultation.prescriptions.length > 0
            ? consultation.prescriptions.map(p => ({ id: p.id, ...p.prescriptionDrug[0] }))
            : [{ id: Date.now(), medicament: "", dosage: "", frequency: "", duration: "", instructions: "", quantity: "" }]
    );

    const [exams, setExams] = useState(
        consultation?.exam_requests && consultation.exam_requests.length > 0
            ? consultation.exam_requests.map(e => ({
                id: e.id, examName: e.idExam?.examName || e.examName, idExam: e.idExam?.id || "another",
                notes: e.notes, isCustom: !e.idExam, idConsultation: consultation?.id,
                idPatient: patientInfo?.id, idMedicalStaff: consultation?.idMedicalStaffGiver?.id
            }))
            : [{ id: Date.now(), examName: "", idExam: "", notes: "", isCustom: false, idConsultation: consultation?.id, idPatient: patientInfo?.id, idMedicalStaff: consultation?.idMedicalStaffGiver?.id }]
    );

    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [appointmentTime, setAppointmentTime] = useState(new Date());
    const [requirements, setRequirements] = useState("");
    const [appointmentReason, setAppointmentReason] = useState("");

    const {calculateAge} = useCalculateAge();
    const { value: ageValue, unit: ageUnit } = calculateAge(patientInfo?.birthDate);

    const MedicalParametersInfos = [
        { icon: Weight, label: 'Weight', value: medicalPageInfo?.parameters?.weight || '-', unit: medicalPageInfo?.parameters?.weight && ' Kg' },
        { icon: Ruler, label: 'Height', value: medicalPageInfo?.parameters?.height || '-', unit: medicalPageInfo?.parameters?.height && ' m²' },
        { icon: Thermometer, label: 'Temperature', value: medicalPageInfo?.parameters?.temperature || '-', unit: medicalPageInfo?.parameters?.temperature && '°C' },
        { icon: Activity, label: 'Blood Pressure', value: medicalPageInfo?.parameters?.bloodPressure || '-', unit: medicalPageInfo?.parameters?.bloodPressure && ' mmHg' },
        { icon: Heart, label: 'Heart Rate', value: medicalPageInfo?.parameters?.heartRate || '-', unit: medicalPageInfo?.parameters?.heartRate && ' bpm' },
        { icon: AlertTriangle, label: 'Allergies', value: medicalPageInfo?.parameters?.allergies || '-' },
        { icon: Pills, label: 'Family Medical History', value: medicalPageInfo?.parameters?.familyMedicalHistory || '-' },
        { icon: FileText, label: 'Current Medication', value: medicalPageInfo?.parameters?.currentMedication || '-' }
    ];

    const xraysOptions = ["Panoramique dentaire", "Rétro-alvéolaire", "Téléradiographie de profil", "Scanner 3D (CBCT)"];

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [medRes, examRes] = await Promise.all([
                    axiosInstance.get("/product/?page_size=100"),
                    axiosInstance.get("/exam/?page_size=100")
                ]);
                if (medRes.status === 200) setAvailableMedication(medRes.data.results);
                if (examRes.status === 200) setAvailableExams(examRes.data.results);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        loadInitialData();
    }, []);

    const addPrescription = () => setPrescriptions([...prescriptions, { id: Date.now(), medicament: "", dosage: "", frequency: "", duration: "", instructions: "", quantity:"" }]);
    const removePrescription = (id) => setPrescriptions(prescriptions.filter(p => p.id !== id));
    const updatePrescription = (id, field, value) => setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, [field]: value } : p));
    const addExam = () => setExams([...exams, { id: Date.now(), examName: "", notes: "", isCustom: false, idConsultation: consultation?.id, idPatient: patientInfo?.id, idMedicalStaff: consultation?.idMedicalStaffGiver?.id }]);
    const removeExam = (id) => setExams(exams.filter(e => e.id !== id));
    const applyInputStyle = () => "w-full p-3 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-primary-end focus:border-2 transition-all duration-500 text-gray-800";

    const handleXrayToggle = (xray) => {
        setSelectedXrays(prev => prev.includes(xray) ? prev.filter(x => x !== xray) : [...prev, xray]);
    };

    const updateConsultation = async (e) => {
        if(e) e.preventDefault();
        setIsUpdatingConsultation(true);
        // On combine les notes dentaires dans doctorNote pour la compatibilité backend
        const dentalNotes = `
Affected Teeth: ${affectedTeeth}
Care Type: ${careType}
Prosthesis: ${prosthesis}
X-Rays: ${selectedXrays.join(', ')}
--------------------
Additional Notes: ${doctorNote}
        `.trim();

        let medicalFolderPageData = { diagnostic, doctorNote: dentalNotes };
        try {
            const res = await axiosInstance.put(`/medical-folder/${medicalPageInfo?.idMedicalFolder}/update-page/${medicalPageInfo?.id}/`, medicalFolderPageData);
            setIsUpdatingConsultation(false);
            if (res.status === 200) {
                setTransactionErrorMessage("");
                // On garde les valeurs pour permettre d'autres modifs
            }
        } catch (error) {
            setIsUpdatingConsultation(false);
            setTransactionErrorMessage("Error updating dental diagnostic.");
        }
    };

    const endConsultation = async () => {
        setIsEndingConsultation(true);
        try {
            await updateConsultation();
            
            // Prescriptions
            const validPrescr = prescriptions.filter(p => p.medicament && p.medicament.trim() !== "");
            if (validPrescr.length > 0) {
                await axiosInstance.post("/prescription/", {
                    prescription_drugs: validPrescr.map(p => { const {id, ...rest} = p; return rest; }),
                    note: '', idConsultation: consultation?.id, idPatient: patientInfo?.id, idMedicalStaff: consultation?.idMedicalStaffGiver?.id
                });
            }

            // Exams
            const validExams = exams.filter(e => e.examName && e.examName.trim() !== "");
            if (validExams.length > 0) {
                await axiosInstance.post("/exam-request/", validExams.map(e => {
                    const {id, isCustom, ...rest} = e;
                    if(rest.idExam === "another" || rest.idExam === "") delete rest.idExam;
                    return rest;
                }));
            }

            // Appointment
            if (appointmentReason) {
                await axiosInstance.post("/appointment/", {
                    atDate: combineToISOString(appointmentDate, appointmentTime),
                    reason: appointmentReason, requirements, idConsultation: consultation?.id, idPatient: patientInfo?.id, idMedicalStaff: consultation?.idMedicalStaffGiver?.id
                });
            }

            await axiosInstance.patch(`/consultation/${consultation?.id}/`, { state: 'InProgress' });
            setSuccessMessage("Dental consultation finalized successfully!");
            setCanOpenSuccessModal(true);
        } catch (error) {
            setErrorMessage("Error finalizing consultation.");
            setCanOpenErrorMessageModal(true);
        } finally {
            setIsEndingConsultation(false);
        }
    };

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Dentist"}>
            <DoctorNavBar />
            <div className="flex flex-col min-h-screen p-8 bg-slate-50">
                <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <User className="w-14 h-14 text-white"/>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-4xl font-bold tracking-tight">DENTAL CONSULTATION</h1>
                                <p className="bg-white/20 px-4 py-2 rounded-lg font-mono text-lg">{formatDateOnly(new Date())}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-6 opacity-90">
                                <div className="flex items-center gap-3"><Calendar className="w-5 h-5"/><span>{patientInfo?.firstName} {patientInfo?.lastName} ({ageValue} {ageUnit})</span></div>
                                <div className="flex items-center gap-3"><MapPin className="w-5 h-5"/><span>{patientInfo?.address || 'N/A'}</span></div>
                                <div className="flex items-center gap-3"><Phone className="w-5 h-5"/><span>{patientInfo?.phoneNumber || 'N/A'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-slate-200 rounded-xl mb-8 p-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-primary-end font-semibold transition-colors">
                        <ArrowLeft className="w-5 h-5"/> Back to list
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
                        <Printer className="w-5 h-5"/> Print Record
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-4 space-y-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-cyan-600"/> Patient Parameters
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {MedicalParametersInfos.map((info, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">{info.label}</p>
                                        <p className="text-lg font-black text-slate-700">{info.value}{info.unit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-600"/> Nurse Notes
                            </h2>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-slate-700 italic">
                                {consultation?.consultationNotes || 'No note from the nurse'}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="flex border-b border-slate-100 bg-slate-50/50">
                                {consultationSteps.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.name)}
                                        className={`px-8 py-5 text-sm font-bold flex items-center gap-3 transition-all relative ${
                                            activeTab === tab.name ? 'text-primary-end bg-white font-black' : 'text-slate-500 hover:bg-white/50'
                                        }`}
                                    >
                                        <tab.icon className={`w-5 h-5 ${activeTab === tab.name ? 'text-primary-end' : 'text-slate-400'}`}/>
                                        {tab.label}
                                        {activeTab === tab.name && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-end rounded-t-full"/>}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8">
                                {transactionErrorMessage && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-semibold flex items-center gap-2 border border-red-100"><AlertTriangle className="w-5 h-5"/>{transactionErrorMessage}</div>}
                                
                                {activeTab === "diagnostic" && (
                                    <form onSubmit={updateConsultation} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Final Diagnostic</label>
                                                <textarea required rows={2} value={diagnostic} onChange={(e) => setDiagnostic(e.target.value)} className={applyInputStyle()} placeholder="Enter main dental diagnosis..."/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Affected Teeth</label>
                                                <input type="text" value={affectedTeeth} onChange={(e) => setAffectedTeeth(e.target.value)} className={applyInputStyle()} placeholder="Ex: 16, 27, 48..."/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Care Type</label>
                                                <select value={careType} onChange={(e) => setCareType(e.target.value)} className={applyInputStyle()}>
                                                    <option value="">Select Care...</option>
                                                    <option value="Extraction">Extraction</option>
                                                    <option value="Obturation">Obturation (Carie)</option>
                                                    <option value="Détartrage">Détartrage</option>
                                                    <option value="Dévitalisation">Dévitalisation (Endodontie)</option>
                                                    <option value="Couronne/Bridge">Couronne/Bridge</option>
                                                    <option value="Chirurgie">Chirurgie buccale</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Prosthesis Requirements</label>
                                                <textarea rows={2} value={prosthesis} onChange={(e) => setProsthesis(e.target.value)} className={applyInputStyle()} placeholder="Describe prosthesis if needed..."/>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Requested X-Rays</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {xraysOptions.map(xr => (
                                                        <label key={xr} className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedXrays.includes(xr) ? 'border-primary-end bg-cyan-50 text-cyan-900 font-bold' : 'border-slate-100 bg-slate-50'}`}>
                                                            <input type="checkbox" className="hidden" checked={selectedXrays.includes(xr)} onChange={() => handleXrayToggle(xr)}/>
                                                            {xr}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Additional Dentist Notes</label>
                                                <textarea rows={3} value={doctorNote} onChange={(e) => setDoctorNote(e.target.value)} className={applyInputStyle()} placeholder="Other clinical observations..."/>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-4 pt-4">
                                            <button disabled={isUpdatingConsultation} type="submit" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                                                {isUpdatingConsultation ? "Saving..." : "Save Progress"}
                                            </button>
                                            <button type="button" onClick={endConsultation} className="bg-primary-end hover:bg-primary-start text-white font-black px-10 py-3 rounded-xl shadow-lg shadow-cyan-200 transition-all flex items-center gap-2">
                                                Complete Consultation <ChevronRight className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {activeTab === "prescriptions" && <MedicationPrescriptionCard prescriptions={prescriptions} availableMedications={availableMedications} updatePrescription={updatePrescription} removePrescription={removePrescription} addPrescription={addPrescription} applyInputStyle={applyInputStyle} handlePrescribe={() => {}} endConsultation={endConsultation} isPrescribing={isPrescribing}/>}
                                {activeTab === "exams" && <ExamPrescriptionCard exams={exams} availableExams={availableExams} setExams={setExams} removeExam={removeExam} addExam={addExam} applyInputStyle={applyInputStyle} handlePrescribeExam={() => {}} endConsultation={endConsultation} isPrescribingExam={isPrescribingExam}/>}
                                {activeTab === "appointment" && <AppointmentPrescriptionCard applyInputStyle={applyInputStyle} setAppointmentReason={setAppointmentReason} appointmentReason={appointmentReason} setRequirements={setRequirements} setAppointmentDate={setAppointmentDate} setAppointmentTime={setAppointmentTime} requirements={requirements} appointmentDate={appointmentDate} appointmentTime={appointmentTime} endConsultation={endConsultation} onSubmit={() => {}} isPrescribingAppointment={isPrescribingAppointment}/>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEndingConsultation && <Wait/>}
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setCanOpenSuccessModal} message={successMessage} makeAction={() => navigate(-1)}/>
            <ErrorModal isOpen={canOpenErrorMessageModal} onCloseErrorModal={setCanOpenErrorMessageModal} message={errorMessage}/>
        </CustomDashboard>
    );
}

export default DentistConsultationDetails;
