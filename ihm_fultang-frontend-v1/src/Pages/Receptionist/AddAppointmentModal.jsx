import { XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";

export function AddAppointmentModal({ isOpen, onClose, setCanOpenSuccessModal, setSuccessMessage, setIsLoading }) {
    AddAppointmentModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
        setSuccessMessage: PropTypes.func.isRequired,
        setIsLoading: PropTypes.func.isRequired
    };

    const [formData, setFormData] = useState({
        idPatient: '',
        idMedicalStaff: '',
        consultationDate: '',
        reason: '',
        requirements: '',
        state: 'Pending'
    });
    const [error, setError] = useState("");
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch patients and doctors
    useEffect(() => {
        if (isOpen) {
            fetchPatientsAndDoctors();
        }
    }, [isOpen]);

    async function fetchPatientsAndDoctors() {
        setLoadingData(true);
        setError("");

        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                axiosInstance.get("/patient/"),
                axiosInstance.get("/medical-staff/")
            ]);

            // ✅ PATIENTS
            if (patientsRes.status === 200) {
                const patientData = patientsRes.data?.results || [];
                setPatients(patientData);
            }

            // ✅ DOCTORS
            if (doctorsRes.status === 200) {
                const doctorData = doctorsRes.data?.results || [];
                setDoctors(doctorData);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load patients or doctors. Please try again.");
        } finally {
            setLoadingData(false);
        }
    }


    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validation
        if (!formData.idPatient || !formData.idMedicalStaff || !formData.consultationDate) {
            setError("Please fill in all required fields");
            setIsLoading(false);
            return;
        }

        // Check if consultation date is in the future
        const selectedDate = new Date(formData.consultationDate);
        const now = new Date();
        if (selectedDate <= now) {
            setError("Appointment date must be in the future");
            setIsLoading(false);
            return;
        }

        try {
            const appointmentData = {
                idPatient: Number(formData.idPatient),
                idMedicalStaff: Number(formData.idMedicalStaff),
                atDate: formData.consultationDate, // ✅ BON NOM
                reason: formData.reason,
                requirements: formData.requirements,
                state: "Pending"
            };

            console.log("Submitting appointment:", appointmentData);

            const response = await axiosInstance.post("/appointment/", appointmentData);
            
            if (response.status === 201) {
                setIsLoading(false);
                setSuccessMessage("Appointment scheduled successfully!");
                setCanOpenSuccessModal(true);
                resetForm();
                onClose();
            }
        } catch (error) {
            console.error("Error creating appointment");

            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Backend error data:", error.response.data);
            } else {
                console.error(error);
            }
        }

    }

    function resetForm() {
        setFormData({
            idPatient: '',
            idMedicalStaff: '',
            consultationDate: '',
            reason: '',
            requirements: '',
            state: 'Pending'
        });
        setError("");
    }

    function applyFormStyle() {
        return "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end";
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-3xl font-bold text-white">Schedule New Appointment</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                {error && (
                    <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {loadingData ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Loading data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="idPatient" className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="idPatient"
                                    name="idPatient"
                                    value={formData.idPatient}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required
                                >
                                    <option value="">Select a patient</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.firstName} {patient.lastName} - {patient.phoneNumber}
                                        </option>
                                    ))}
                                </select>
                                {patients.length === 0 && (
                                    <p className="text-sm text-red-500 mt-1">No patients available</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="idMedicalStaff" className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="idMedicalStaff"
                                    name="idMedicalStaff"
                                    value={formData.idMedicalStaff}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.first_name || doctor.username} {doctor.last_name || ''}
                                            {doctor.speciality ? ` - ${doctor.speciality}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {doctors.length === 0 && (
                                    <p className="text-sm text-red-500 mt-1">No doctors available</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="consultationDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Appointment Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="consultationDate"
                                name="consultationDate"
                                value={formData.consultationDate}
                                onChange={handleChange}
                                min={new Date().toISOString().slice(0, 16)}
                                className={applyFormStyle()}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Visit
                            </label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Enter the reason for appointment"
                                rows="3"
                                className={applyFormStyle()}
                            />
                        </div>

                        <div>
                            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                                Special Requirements
                            </label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="Enter any special requirements (e.g., fasting required, bring previous results)"
                                rows="3"
                                className={applyFormStyle()}
                            />
                        </div>

                        <div className="flex justify-center space-x-6 pt-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-end hover:bg-primary-start text-md text-white rounded-lg font-bold transition-all duration-300"
                            >
                                Schedule Appointment
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                className="px-6 py-2 border bg-red-400 text-md hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}