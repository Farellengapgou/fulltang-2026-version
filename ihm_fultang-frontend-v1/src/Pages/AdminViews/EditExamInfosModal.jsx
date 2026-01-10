import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";


export function EditExamInfosModal({ isOpen, onClose, setCanOpenSuccessModal, setSuccessMessage, setIsLoading, examData }) {
    EditExamInfosModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
        setSuccessMessage: PropTypes.func.isRequired,
        setIsLoading: PropTypes.func.isRequired,
        examData: PropTypes.object.isRequired
    };


    const [formData, setFormData] = useState({
        examName: '',
        examCost: 0.0,
        examDescription: '',
    });

    const [error, setError] = useState("");
    const [checkedFields, setCheckedFields] = useState({

        examName: false,
        examCost: false,
        examDescription: false,

    });

    useEffect(() => {
        if (examData) {
            setFormData({
                examName: examData.examName || '',
                examCost: examData.examCost || 0.0,
                examDescription: examData.examDescription || ''
            });
        }
    }, [examData]);



    function handleChange(e) {
        const { name, value } = e.target;

        setFormData(prevData => ({ ...prevData, [name]: value }));

    }


    function handleCheckboxChange(e) {
        const { name, checked } = e.target;
        setCheckedFields(prev => ({ ...prev, [name]: checked }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        const updatedData = Object.keys(checkedFields).reduce((acc, key) => {
            if (checkedFields[key]) {
                acc[key] = formData[key];
            }
            return acc;
        }, {});

        try {
            const response = await axiosInstance.patch(`/exam/${examData.id}/`, updatedData);
            if (response.status === 200) {
                setIsLoading(false);
                setSuccessMessage(`${formData.examName} 's information has been updated successfully!`);
                setCanOpenSuccessModal(true);
                onClose();
            }
        } catch (error) {
            setIsLoading(false);
            setSuccessMessage("");
            setCanOpenSuccessModal(false);
            setError("Something went wrong, please try again later!");
            console.log(error);
        }
        setIsLoading(false);
    }

    function applyFormStyle() {
        return "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end";
    }


    function applyCheckboxStyle() {
        return "form-checkbox h-3 w-3 mt-4 text-primary-end";
    }


    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                    <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex-col flex justify-center items-center">
                        <h3 className="text-4xl font-bold text-white">Edit Exam Information</h3>
                        <div className="flex mt-3">
                            <p className="text-white font-semibold ml-3 italic">(Please check the fields you want to modify)</p>
                        </div>
                    </div>
                    {error && <p className="text-red-500 font-bold text-md ml-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="p-4 space-y-6">
                        <div className="flex space-x-3">
                            <div className="w-2/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="examName"
                                    name="examName"
                                    checked={checkedFields.examName}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="examName"
                                        className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        id="examName"
                                        name="examName"
                                        placeholder="Enter exam's name"
                                        value={formData.examName}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.examName}
                                        disabled={!checkedFields.examName}
                                    />
                                </div>
                            </div>

                            <div className="w-2/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="examCost"
                                    name="examCost"
                                    checked={checkedFields.examCost}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="examCost"
                                        className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                                    <input
                                        type="number"
                                        id="examCost"
                                        name="examCost"
                                        placeholder="Enter exam's cost"
                                        value={formData.examCost}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.examCost}
                                        disabled={!checkedFields.examCost}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-2/3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="examDescription"
                                name="examDescription"
                                checked={checkedFields.examDescription}
                                onChange={handleCheckboxChange}
                                className={applyCheckboxStyle()}
                            />
                            <div className="flex-1">
                                <label htmlFor="examDescription"
                                    className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    id="examDescription"
                                    name="examDescription"
                                    placeholder="Enter exam's description"
                                    value={formData.examDescription}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={checkedFields.examDescription}
                                    disabled={!checkedFields.examDescription}
                                />
                            </div>
                        </div>



                        <div className="px-6 py-1 flex justify-center space-x-6">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-end hover:text-xl text-md text-white rounded-lg font-bold transition-all duration-300"
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setError(""),
                                        onClose()
                                }}
                                className="px-4 py-2 border bg-red-400 text-md hover:text-xl hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}