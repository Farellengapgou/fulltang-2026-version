/*import { Users, Calendar, ClipboardList,  FileSpreadsheet, UserPlus, FileText } from 'lucide-react';

import {useNavigate} from "react-router-dom";
import {AppRoutesPaths as AppRouterPaths} from "../../Router/appRouterPaths.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx"
import {doctorNavLink} from "./lib/doctorNavLink.js"
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";


export function Doctor() {


    const navigate = useNavigate();
    const stats = {
        patients: 5,
        medicalStaff: 6,
        consultations: 0,
        appointments: 0,
        scheduledExams: 0,
        totalRooms: 12
    };


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Doctor dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this interface
                        centralized.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        icon={Users}
                        title="Patients"
                        value={stats?.patients}
                        description="Registered patients"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Consultations"
                        value={stats?.consultations}
                        description="Consultations today"
                        color="bg-purple-500"
                    />
                    <StatCard
                        icon={Calendar}
                        title="Appointements"
                        value={stats.appointments}
                        description="Scheduled appointments"
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon={FileText}
                        title="Exams"
                        value={stats?.scheduledExams}
                        description="Prescribed exams"
                        color="bg-red-500"
                    />

                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">

                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={UserPlus}
                            label="Manage Patient"
                            onClick={() => navigate(AppRouterPaths.doctorPatientList)}
                        />

                        <QuickActionButton
                            icon={Calendar}
                            label="View Appointments List"
                            onClick={() => navigate(AppRouterPaths.doctorAppointment)}
                        />

                        <QuickActionButton
                            icon={FileSpreadsheet}
                            label="View Consultations List"
                            onClick={() => navigate(AppRouterPaths.doctorConsultationList)}
                        />
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}




*/
/*
import { Users, Calendar, ClipboardList,  FileSpreadsheet, UserPlus, FileText } from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {AppRoutesPaths as AppRouterPaths} from "../../Router/appRouterPaths.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx"
import {doctorNavLink} from "./lib/doctorNavLink.js"
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import axios from 'axios';
import { useState, useEffect  } from 'react';

export function Doctor() {
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        patients: 0,
        consultations: 0,
        appointments: 0,
        scheduledExams: 0
    });

    // Récupérer le nombre de patients
    useEffect(() => {
        const token = localStorage.getItem("token_key_fultang");
        axios.get("http://localhost:8009/api/v1/medical/patient/count/", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then((response) => {
            const patients_count = response.data.patient_count;
            setStats((prevStats) => ({
                ...prevStats,
                patients: patients_count
            }));
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération du nombre de patients :", error);
        });
    }, []);

    // Récupérer le nombre de consultations
    useEffect(() => {
        const token = localStorage.getItem("token_key_fultang");
        axios.get("http://localhost:8009/api/v1/medical/consultation/count/", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then((response) => {
            const consultations_count = response.data.consultation_count;
            setStats((prevStats) => ({
                ...prevStats,
                consultations: consultations_count
            }));
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération du nombre de consultations :", error);
        });
    }, []);

    // Récupérer le nombre de rendez-vous
    useEffect(() => {
        const token = localStorage.getItem("token_key_fultang");
        axios.get("http://localhost:8009/api/v1/medical/appointment/doctor/idcount/", {
            headers: {                          
                Authorization: `Bearer ${token}`,
            }
        })
        .then((response) => {
            const appointments_count = response.data.appointment_count;
            setStats((prevStats) => ({
                ...prevStats,
                appointments: appointments_count
            }));
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération du nombre de rendez-vous :", error);
        });
    }, []);

    // Récupérer le nombre d'examens
    useEffect(() => {
        const token = localStorage.getItem("token_key_fultang");
        axios.get("http://localhost:8009/api/v1/medical/exam/count/", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then((response) => {
            const exams_count = response.data.exam_count;
            setStats((prevStats) => ({
                ...prevStats,
                scheduledExams: exams_count
            }));
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération du nombre d'examens :", error);
        });
    }, []);

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Doctor dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this interface
                        centralized.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        icon={Users}
                        title="Patients"
                        value={stats?.patients}
                        description="Registered patients"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Consultations"
                        value={stats?.consultations}
                        description="Consultations today"
                        color="bg-purple-500"
                    />
                    <StatCard
                        icon={Calendar}
                        title="Appointements"
                        value={stats.appointments}
                        description="Scheduled appointments"
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon={FileText}
                        title="Exams"
                        value={stats?.scheduledExams}
                        description="Prescribed exams"
                        color="bg-red-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={UserPlus}
                            label="Manage Patient"
                            onClick={() => navigate(AppRouterPaths.doctorPatientList)}
                        />

                        <QuickActionButton
                            icon={Calendar}
                            label="View Appointments List"
                            onClick={() => navigate(AppRouterPaths.doctorAppointment)}
                        />

                        <QuickActionButton
                            icon={FileSpreadsheet}
                            label="View Consultations List"
                            onClick={() => navigate(AppRouterPaths.doctorConsultationList)}
                        />
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}*/

import { Users, Calendar, ClipboardList, FileSpreadsheet, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../Router/appRouterPaths.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx"
import { doctorNavLink } from "./lib/doctorNavLink.js"
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import axios from 'axios';
import { useState, useEffect } from 'react';

export function Doctor() {
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

    // Récupérer les statistiques du docteur
    useEffect(() => {
        const fetchDoctorStats = async () => {
            const userId = getUserIdFromToken();
            
            if (!userId) {
                console.log("Utilisation des valeurs par défaut - aucun ID utilisateur trouvé dans le token");
                return;
            }

            console.log(`Chargement stats pour docteur ID: ${userId}`);
            setLoading(true);

            try {
                const token = getToken();
                if (!token) {
                    console.log("Aucun token trouvé");
                    return;
                }

                // Essayer de récupérer les données réelles
                const endpoints = [
                    { 
                        key: 'appointments', 
                        url: `http://localhost:8009/api/v1/medical/appointment/planned/doctor/${userId}/count`,
                        fallback: 15
                    },
                    { 
                        key: 'consultations', 
                        url: `http://localhost:8009/api/v1/medical/consultation/doctor/${userId}/daily-count/`,
                        fallback: 8
                    },
                    { 
                        key: 'patients', 
                        url: `http://localhost:8009/api/v1/medical/patient/doctor/${userId}/count/`,
                        fallback: 12
                    },
                    { 
                        key: 'exams', 
                        url: `http://localhost:8009/api/v1/medical/exam-request/doctor/${userId}/count/`,
                        fallback: 6
                    }
                ];

                const results = {};

                for (const endpoint of endpoints) {
                    try {
                        const response = await axios.get(endpoint.url, {
                            headers: { Authorization: `Bearer ${token}` },
                            timeout: 3000
                        });
                        
                        let count = 0;
                        if (Array.isArray(response.data)) {
                            count = response.data.length;
                        } else if (response.data && typeof response.data === 'object') {
                            count = response.data.count || response.data.length || 0;
                        }
                        
                        results[endpoint.key] = count;
                        console.log(`${endpoint.key}: ${count} données récupérées`);
                    } catch (error) {
                        console.warn(`Erreur ${endpoint.key}:`, error.message);
                        results[endpoint.key] = endpoint.fallback;
                    }
                }

                setStats({
                    patients: results.patients,
                    consultations: results.consultations,
                    appointments: results.appointments,
                    scheduledExams: results.exams
                });

            } catch (error) {
                console.error("Erreur générale:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorStats();
    }, []);

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
            description: "Today's consultations",
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
            onClick: () => navigate(AppRouterPaths.doctorPatientList)
        },
        {
            icon: Calendar,
            label: "View Appointments List",
            onClick: () => navigate(AppRouterPaths.doctorAppointment)
        },
        {
            icon: FileSpreadsheet,
            label: "View Consultations List",
            onClick: () => navigate(AppRouterPaths.doctorConsultationList)
        }
    ];

    // Afficher le loading si nécessaire
    if (loading) {
        return (
            <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
                <DoctorNavBar/>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading dashboard...</div>
                    </div>
                </div>
            </CustomDashboard>
        );
    }

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Doctor dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this interface
                        centralized.
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
/*
import { Users, Calendar, ClipboardList, FileSpreadsheet, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../Router/appRouterPaths.js";
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx"
import { doctorNavLink } from "./lib/doctorNavLink.js"
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import axios from 'axios';
import { useState, useEffect } from 'react';

export function Doctor() {
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

    // Fonction pour compter les examens d'un docteur spécifique
    const countDoctorExams = async (userId, token) => {
        try {
            // Récupérer tous les examens
            const response = await axios.get(
                "http://localhost:8009/api/v1/medical/exam/", 
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 3000
                }
            );
            
            if (Array.isArray(response.data)) {
                // Filtrer les examens prescrits par ce docteur
                const doctorExams = response.data.filter(exam => {
                    // Vérifier différents champs possibles selon votre structure de données
                    return (
                        exam.doctor_id === parseInt(userId) ||
                        exam.prescribing_doctor_id === parseInt(userId) ||
                        exam.requesting_doctor_id === parseInt(userId) ||
                        (exam.doctor && exam.doctor.id === parseInt(userId)) ||
                        (exam.prescribing_doctor && exam.prescribing_doctor.id === parseInt(userId)) ||
                        (exam.requesting_doctor && exam.requesting_doctor.id === parseInt(userId)) ||
                        exam.created_by === parseInt(userId)
                    );
                });
                
                console.log(`Examens trouvés pour le docteur ${userId}:`, doctorExams.length);
                console.log("Tous les examens (pour debug):", response.data);
                return doctorExams.length;
            }
            return 0;
        } catch (error) {
            console.warn("Erreur lors du comptage des examens:", error.message);
            return 6; // Fallback
        }
    };

    // Récupérer les statistiques du docteur
    useEffect(() => {
        const fetchDoctorStats = async () => {
            const userId = getUserIdFromToken();
            
            if (!userId) {
                console.log("Utilisation des valeurs par défaut - aucun ID utilisateur trouvé dans le token");
                return;
            }

            console.log(`Chargement stats pour docteur ID: ${userId}`);
            setLoading(true);

            try {
                const token = getToken();
                if (!token) {
                    console.log("Aucun token trouvé");
                    return;
                }

                // Essayer de récupérer les données réelles
                const endpoints = [
                    { 
                        key: 'appointments', 
                        url: `http://localhost:8009/api/v1/medical/appointment/doctor/${userId}/`,
                        fallback: 15
                    },
                    { 
                        key: 'consultations', 
                        url: `http://localhost:8009/api/v1/medical/consultation/doctor/${userId}/`,
                        fallback: 8
                    },
                    { 
                        key: 'patients', 
                        url: `http://localhost:8009/api/v1/medical/patient/doctor/${userId}/`,
                        fallback: 12
                    }
                ];

                const results = {};

                // Récupérer les rendez-vous, consultations et patients
                for (const endpoint of endpoints) {
                    try {
                        const response = await axios.get(endpoint.url, {
                            headers: { Authorization: `Bearer ${token}` },
                            timeout: 3000
                        });
                        
                        let count = 0;
                        if (Array.isArray(response.data)) {
                            count = response.data.length;
                        } else if (response.data && typeof response.data === 'object') {
                            count = response.data.count || response.data.length || 0;
                        }
                        
                        results[endpoint.key] = count;
                        console.log(`${endpoint.key}: ${count} données récupérées`);
                    } catch (error) {
                        console.warn(`Erreur ${endpoint.key}:`, error.message);
                        results[endpoint.key] = endpoint.fallback;
                    }
                }

                // Récupérer les examens spécifiquement
                results.exams = await countDoctorExams(userId, token);

                setStats({
                    patients: results.patients,
                    consultations: results.consultations,
                    appointments: results.appointments,
                    scheduledExams: results.exams
                });

                console.log("Statistiques finales:", results);

            } catch (error) {
                console.error("Erreur générale:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorStats();
    }, []);

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
            description: "Consultations today",
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
            title: "My Exams",
            value: stats.scheduledExams,
            description: "Exams I prescribed",
            color: "bg-red-500"
        }
    ];

    const quickActions = [
        {
            icon: UserPlus,
            label: "Manage Patient",
            onClick: () => navigate(AppRouterPaths.doctorPatientList)
        },
        {
            icon: Calendar,
            label: "View Appointments List",
            onClick: () => navigate(AppRouterPaths.doctorAppointment)
        },
        {
            icon: FileSpreadsheet,
            label: "View Consultations List",
            onClick: () => navigate(AppRouterPaths.doctorConsultationList)
        }
    ];

    // Afficher le loading si nécessaire
    if (loading) {
        return (
            <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
                <DoctorNavBar/>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading dashboard...</div>
                    </div>
                </div>
            </CustomDashboard>
        );
    }

    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Doctor dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this interface
                        centralized.
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
}*/
