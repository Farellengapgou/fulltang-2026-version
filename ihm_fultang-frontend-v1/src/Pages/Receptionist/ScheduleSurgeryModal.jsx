import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";

export function ScheduleSurgeryModal({
  isOpen,
  onClose,
  patient,
  setCanOpenSuccessModal,
  setSuccessMessage,
  setIsLoading,
}) {
  ScheduleSurgeryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    patient: PropTypes.object,
    setCanOpenSuccessModal: PropTypes.func.isRequired,
    setSuccessMessage: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
  };

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDoctors() {
      if (!isOpen) return;
      try {
        const response = await axiosInstance.get("/medical-staff/all-doctors/");
        if (response.status === 200) {
          setDoctors(response.data || []);
        }
      } catch (fetchError) {
        console.log(fetchError);
      }
    }
    fetchDoctors();
  }, [isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patient?.id) {
      setError("Please select a patient.");
      return;
    }
    if (!selectedDoctorId) {
      setError("Please select a doctor.");
      return;
    }
    if (!scheduledAt) {
      setError("Please select a surgery date and time.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token_key_fultang");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        idPatient: patient.id,
        idMedicalStaff: selectedDoctorId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        note: note || null,
      };
      const response = await axiosInstance.post("/surgery/", payload, {
        headers: authHeaders,
      });
      if (response.status === 201) {
        try {
          await axiosInstance.post(
            `/patient/${patient.id}/add-access/${selectedDoctorId}/`,
            null,
            { headers: authHeaders }
          );
        } catch (assignError) {
          console.log(assignError);
        }
        setSuccessMessage("Surgery scheduled successfully.");
        setCanOpenSuccessModal(true);
        onClose();
      }
    } catch (submitError) {
      console.log(submitError);
      setError("Failed to schedule the surgery.");
    } finally {
      setIsLoading(false);
    }
  }

  function applyFormStyle() {
    return "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex-col flex justify-center items-center">
          <h3 className="text-3xl font-bold text-white">Schedule Surgery</h3>
          {patient && (
            <p className="text-white text-sm mt-2">
              Patient: {patient.firstName} {patient.lastName}
            </p>
          )}
        </div>

        <button onClick={onClose} className="text-white hover:text-gray-200">
          <XIcon className="w-6 h-6" />
        </button>

        {error && <p className="text-red-500 font-bold text-md ml-4">{error}</p>}

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="assignedDoctor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign Doctor
              </label>
              <select
                id="assignedDoctor"
                name="assignedDoctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className={applyFormStyle()}
                required={true}
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.first_name} {doctor.last_name} ({doctor.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="scheduledAt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Surgery Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={applyFormStyle()}
                required={true}
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="note"
                name="note"
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={applyFormStyle()}
                placeholder="Optional notes for the surgery"
              />
            </div>
          </div>

          <div className="px-6 py-1 flex justify-center space-x-6">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-end text-md text-white rounded-lg font-bold transition-all duration-300"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border bg-red-400 text-md hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
