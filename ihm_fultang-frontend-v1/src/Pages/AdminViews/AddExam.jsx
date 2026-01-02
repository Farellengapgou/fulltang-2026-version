import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { adminNavLink } from "./adminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import { ErrorModal } from "../Modals/ErrorModal.jsx";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";
import Loader from "../../GlobalComponents/Loader.jsx";

export function AddExam() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        examName: "",
        examCost: "",
        examDescription: ""
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/exam/", {
                examName: formData.examName,
                examCost: parseFloat(formData.examCost),
                examDescription: formData.examDescription
            });

            if (response.status === 201) {
                setSuccessMessage("Exam added successfully!");
                setCanOpenSuccessModal(true);
            }
        } catch (error) {
            console.error("Error adding exam:", error);
            let message = "Something went wrong while adding the exam.";
            if (error.response?.data) {
                // If the error data is an object with field-specific errors, join them
                if (typeof error.response.data === 'object') {
                    message = Object.entries(error.response.data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
                        .join("\n");
                } else {
                    message = error.response.data.detail || error.response.data;
                }
            }
            setErrorMessage(message);
            setCanOpenErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    }

    const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-end focus:ring-1 focus:ring-primary-end transition-colors";
    const labelStyle = "block text-sm font-semibold text-gray-700 mb-2";

    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar />

            <div className="flex flex-col mt-10 mx-5 sm:mx-10 md:mx-20 lg:mx-40 mb-10">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-start to-primary-end p-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                            Add New Exam
                        </h2>
                        <p className="text-white/80 text-center mt-2">
                            Enter the details of the new medical examination
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Exam Name */}
                            <div>
                                <label htmlFor="examName" className={labelStyle}>
                                    Exam Name
                                </label>
                                <input
                                    type="text"
                                    id="examName"
                                    name="examName"
                                    value={formData.examName}
                                    onChange={handleChange}
                                    placeholder="e.g. General Consultation"
                                    className={inputStyle}
                                    required
                                />
                            </div>

                            {/* Cost */}
                            <div>
                                <label htmlFor="examCost" className={labelStyle}>
                                    Cost (FCFA)
                                </label>
                                <input
                                    type="number"
                                    id="examCost"
                                    name="examCost"
                                    value={formData.examCost}
                                    onChange={handleChange}
                                    placeholder="e.g. 5000"
                                    min="0"
                                    step="0.01"
                                    className={inputStyle}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="examDescription" className={labelStyle}>
                                    Description
                                </label>
                                <textarea
                                    id="examDescription"
                                    name="examDescription"
                                    value={formData.examDescription}
                                    onChange={handleChange}
                                    placeholder="Brief description of the exam..."
                                    rows="4"
                                    className={`${inputStyle} resize-none`}
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                    {formData.examDescription.length} characters
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(AppRoutesPaths.adminExamsListPage)}
                                    className="px-6 py-3 rounded-lg border-2 border-red-400 text-red-400 font-bold hover:bg-red-50 transition-colors w-full sm:w-1/2"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-start to-primary-end text-white font-bold hover:opacity-90 transition-opacity w-full sm:w-1/2 flex justify-center items-center shadow-md disabled:opacity-70"
                                >
                                    {isLoading ? <Loader size="small" color="white" /> : "Add Exam"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <SuccessModal
                isOpen={canOpenSuccessModal}
                message={successMessage}
                canOpenSuccessModal={setCanOpenSuccessModal}
                makeAction={() => navigate(AppRoutesPaths.adminExamsListPage)}
            />

            <ErrorModal
                isOpen={canOpenErrorModal}
                message={errorMessage}
                onCloseErrorModal={() => setCanOpenErrorModal(false)}
            />

        </CustomDashboard>
    );
}