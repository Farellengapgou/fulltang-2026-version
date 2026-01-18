import { Users, UserPlus, FileSpreadsheet, Calendar, ClipboardList, FileText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../Router/appRouterPaths.js";
import { OphthalmologistNavBar } from "./OphthalmologistComponents/OphthalmologistNavBar.jsx"
import { ophthaNavLink } from "./lib/OphthalmologistNavLink.js"
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import axios from 'axios';
import { useState, useEffect } from "react";

export function Ophthalmologist() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        patients: 12,
        consultations: 8,
        appointments: 15,
        scheduledExams: 6
    });

    const [loading, setLoading] = useState(false);

    // Récupérer le token
    const getToken = () => localStorage.getItem("token_key_fultang");

    // Fonction pour décoder le JWT et récupérer l'ID utilisateur
    const getUserIdFromToken = () => {
        try {
            const token = getToken();
            if (!token) {
                console.log("Aucun token trouvé");
                return null;
            }

            // Décoder le JWT (la partie payload est entre les deux points)
            const payload = token.split('.')[1];
            if (!payload) {
                console.log("Token JWT invalide");
                return null;
            }

            // Decoder base64 et parser le JSON
            const decodedPayload = JSON.parse(atob(payload));
            console.log("Payload JWT décodé:", decodedPayload);
            
            // Récupérer l'ID utilisateur (peut être user_id ou userId selon le backend)
            const userId = decodedPayload.user_id || decodedPayload.userId || decodedPayload.sub;
            
            if (userId) {
                console.log(`ID utilisateur trouvé dans le token: ${userId}`);
                return userId;
            } else {
                console.log("Aucun ID utilisateur trouvé dans le token");
                return null;
            }

        } catch (error) {
            console.error("Erreur lors du décodage du token:", error);
            return null;
        }
    };

    // Icônes correctement passées en tant que composants React
    const statCards = [
        {
            icon: Users,
            title: "My Patients",
            value: stats.patients,
            description: "Registered patients",
            color: "bg-blue-500"
        },
        {
            icon: ClipboardList,
            title: "Consultations",
            value: stats.consultations,
            description: "Today's consultations ",
            color: "bg-purple-500"
        },
        {
            icon: Calendar,
            title: "Appointments",
            value: stats.appointments,
            description: "Scheduled appointments",
            color: "bg-orange-500"
        },
        {
            icon: FileText,
            title: "Exams",
            value: stats.scheduledExams,
            description: "Prescribed exams",
            color: "bg-red-500"
        }
    ];

    const quickActions = [
        {
            icon: UserPlus,
            label: "Manage Patient",
            onClick: () => navigate(AppRouterPaths.ophthaPatientList)
        },
        {
            icon: Calendar,
            label: "View Appointments List",
            onClick: () => navigate(AppRouterPaths.opthaAppointment)
        },
        {
            icon: FileSpreadsheet,
            label: "View Consultations List",
            onClick: () => navigate(AppRouterPaths.ophthaConsultationList)
        }
    ];

    // Afficher le loading si nécessaire
    if (loading) {
        return (
            <CustomDashboard linkList={ophthaNavLink} requiredRole={"Ophthalmologist"}>
                <OphthalmologistNavBar/>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading dashboard...</div>
                    </div>
                </div>
            </CustomDashboard>
        );
    }

    return (        
        <CustomDashboard linkList={ophthaNavLink} requiredRole={"Ophthalmologist"}>
            <OphthalmologistNavBar />
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Ophthalmologist dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this
                        centralized interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((card, index) => (
                        <StatCard
                            key={index}
                            icon={card.icon}
                            title={card.title}
                            value={card.value}
                            description={card.description}
                            color={card.color}
                        />
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <QuickActionButton
                                key={index}
                                icon={action.icon}
                                label={action.label}
                                onClick={action.onClick}
                            />
                        ))}
                    </div>
                </div>
            </div>

            
        
        </CustomDashboard>
    );
}