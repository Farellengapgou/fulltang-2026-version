import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaClock, FaUser } from 'react-icons/fa';

const ConsultationAppointments = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "How to schedule an appointment",
            icon: <FaCalendar className="text-blue-900 text-2xl" />,
            steps: [
                "Log in with your receptionist credentials",
                "Go to the 'Appointments' menu",
                "Click 'New Appointment'",
                "Select or create the patient file",
                "Choose the consultation type (General, Specialist, Dentist, etc.)",
                "Select an available doctor",
                "Choose the appointment date and time",
                "Add a reason for the consultation if needed",
                "Confirm and save the appointment"
            ]
        },
        {
            title: "How to cancel an appointment",
            icon: <FaClock className="text-red-600 text-2xl" />,
            steps: [
                "Find the appointment in the appointments list",
                "Click the appointment to cancel",
                "Select the 'Cancel' option",
                "Add a reason for the cancellation (optional)",
                "Confirm the cancellation",
                "The patient will be automatically notified if an email is provided"
            ]
        },
        {
            title: "How to edit an appointment",
            icon: <FaUser className="text-green-600 text-2xl" />,
            steps: [
                "Find the appointment in the calendar or list",
                "Click 'Edit'",
                "Change the needed information (date, time, doctor)",
                "Save the changes",
                "Verify the status is updated"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-md mb-6">
                <div className="container mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-900 hover:text-blue-700 mb-4"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-blue-900">
                        Consultations & Appointments
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Complete guide to manage consultations and appointments in Fultang
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            {section.icon}
                            <h2 className="text-xl font-semibold text-gray-800">
                                {section.title}
                            </h2>
                        </div>
                        <ol className="space-y-3">
                            {section.steps.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-700 pt-0.5">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                ))}

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important</h3>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1">
                        <li>Always check the doctor's availability before scheduling an appointment</li>
                        <li>Appointments can be marked as "Payable" or "Not Payable"</li>
                        <li>Make sure patient information is up to date</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ConsultationAppointments;
