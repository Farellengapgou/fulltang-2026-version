import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaClock, FaUser } from 'react-icons/fa';

const ConsultationAppointments = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Comment prendre un rendez-vous",
            icon: <FaCalendar className="text-blue-900 text-2xl" />,
            steps: [
                "Connectez-vous au système avec vos identifiants de réceptionniste",
                "Allez dans le menu 'Appointments' ou 'Rendez-vous'",
                "Cliquez sur 'Nouveau rendez-vous' ou 'New Appointment'",
                "Sélectionnez ou créez le dossier patient",
                "Choisissez le type de consultation (Généraliste, Spécialiste, Dentiste, etc.)",
                "Sélectionnez le médecin disponible",
                "Choisissez la date et l'heure du rendez-vous",
                "Ajoutez une raison pour la consultation si nécessaire",
                "Confirmez et enregistrez le rendez-vous"
            ]
        },
        {
            title: "Comment annuler un rendez-vous",
            icon: <FaClock className="text-red-600 text-2xl" />,
            steps: [
                "Recherchez le rendez-vous dans la liste des appointments",
                "Cliquez sur le rendez-vous à annuler",
                "Sélectionnez l'option 'Annuler' ou 'Cancel'",
                "Ajoutez une raison pour l'annulation (optionnel)",
                "Confirmez l'annulation",
                "Le patient sera automatiquement notifié si un email est renseigné"
            ]
        },
        {
            title: "Comment modifier un rendez-vous",
            icon: <FaUser className="text-green-600 text-2xl" />,
            steps: [
                "Trouvez le rendez-vous dans le calendrier ou la liste",
                "Cliquez sur 'Modifier' ou 'Edit'",
                "Changez les informations nécessaires (date, heure, médecin)",
                "Sauvegardez les modifications",
                "Vérifiez que le statut est mis à jour"
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
                        <FaArrowLeft /> Retour
                    </button>
                    <h1 className="text-3xl font-bold text-blue-900">
                        Consultations & Rendez-vous
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Guide complet pour gérer les consultations et rendez-vous dans Fultang
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
                        <li>Vérifiez toujours la disponibilité du médecin avant de fixer un rendez-vous</li>
                        <li>Les rendez-vous peuvent être marqués comme "Payable" ou "Not Payable"</li>
                        <li>Assurez-vous que les informations du patient sont à jour</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ConsultationAppointments;