import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaReceipt, FaHistory } from 'react-icons/fa';

const PaymentsBilling = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Create an invoice",
            icon: <FaReceipt className="text-blue-900 text-2xl" />,
            content: [
                "Go to the 'Billing' menu",
                "Click 'New Invoice'",
                "Select the patient",
                "Add billable items:",
                "  • Consultations (automatically at the configured price)",
                "  • Requested exams",
                "  • Prescribed medications",
                "  • Hospitalization (if applicable)",
                "The total amount is calculated automatically",
                "Review and confirm the invoice",
                "A unique code is generated (format: YYYYMMDD-OperationID-CNI-UniqueID)"
            ]
        },
        {
            title: "Record a payment",
            icon: <FaMoneyBillWave className="text-green-600 text-2xl" />,
            content: [
                "Find the patient's invoice",
                "Click 'Record Payment'",
                "Enter the amount received",
                "Select the payment method (Cash, Mobile Money, Card, etc.)",
                "Confirm the payment",
                "The invoice status is updated automatically",
                "A receipt can be printed for the patient"
            ]
        },
        {
            title: "View payment history",
            icon: <FaHistory className="text-purple-600 text-2xl" />,
            content: [
                "Go to the 'Payment History' section",
                "Use the available filters:",
                "  • By patient",
                "  • By date",
                "  • By payment method",
                "  • By status (Paid/Unpaid)",
                "Export reports if needed",
                "Review related accounting operations"
            ]
        }
    ];

    const billStatuses = [
        { status: "Invalid", color: "text-red-600", description: "Unpaid invoice" },
        { status: "Valid", color: "text-green-600", description: "Fully paid invoice" },
        { status: "Partial", color: "text-yellow-600", description: "Partial payment made" }
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
                        Payments & Billing
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage patient payments and invoices
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
                        <div className="space-y-2">
                            {section.content.map((item, i) => (
                                <p key={i} className={`text-gray-700 ${item.startsWith('  ') ? 'ml-8' : ''}`}>
                                    {item}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Invoice statuses
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {billStatuses.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <p className={`font-bold ${item.color} text-lg`}>
                                    {item.status}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsBilling;
