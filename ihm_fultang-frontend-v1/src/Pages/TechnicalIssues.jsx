import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaBug, FaQuestionCircle } from 'react-icons/fa';

const TechnicalIssues = () => {
    const navigate = useNavigate();

    const commonIssues = [
        {
            problem: "I can't log in to the system",
            icon: <FaExclamationTriangle className="text-red-600" />,
            solutions: [
                "Check that your username and password are correct",
                "Make sure CAPS LOCK is not enabled",
                "Contact the administrator if you forgot your password",
                "Check your internet connection"
            ]
        },
        {
            problem: "Data is not loading",
            icon: <FaBug className="text-orange-600" />,
            solutions: [
                "Refresh the page (F5 or Ctrl+R)",
                "Clear your browser cache",
                "Check your internet connection",
                "If the problem persists, contact technical support"
            ]
        },
        {
            problem: "Error while saving",
            icon: <FaExclamationTriangle className="text-yellow-600" />,
            solutions: [
                "Check that all required fields are filled",
                "Make sure data formats are correct (dates, numbers, etc.)",
                "Try logging out and back in",
                "Note the error message and contact support"
            ]
        },
        {
            problem: "The chatbot is not responding",
            icon: <FaQuestionCircle className="text-blue-600" />,
            solutions: [
                "Check that the chatbot service is enabled",
                "Make sure your question is clear and in English",
                "Refresh the page",
                "If the problem persists, use the support form"
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
                        Technical Issues
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Solutions to common technical issues
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Tip</h3>
                    <p className="text-blue-800">
                        Before contacting support, try the solutions below. 
                        90% of issues can be resolved quickly!
                    </p>
                </div>

                {commonIssues.map((issue, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            {issue.icon}
                            <h2 className="text-xl font-semibold text-gray-800">
                                {issue.problem}
                            </h2>
                        </div>
                        <div className="ml-8">
                            <h3 className="font-semibold text-gray-700 mb-2">Solutions:</h3>
                            <ol className="space-y-2">
                                {issue.solutions.map((solution, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                                            ✓
                                        </span>
                                        <span className="text-gray-700 pt-0.5">{solution}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ))}

                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <h3 className="font-bold text-red-800 mb-2">🆘 Emergency Support</h3>
                    <p className="text-red-700 mb-3">
                        If none of these solutions work:
                    </p>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                        <li>Contact technical support: support@fultang.cm</li>
                        <li>Call: +237 XXX XXX XXX</li>
                        <li>Use the contact form in the Help Center</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TechnicalIssues;
