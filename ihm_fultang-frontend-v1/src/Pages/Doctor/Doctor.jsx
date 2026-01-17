import { Users, Calendar, ClipboardList, FileSpreadsheet, UserPlus, FileText, Stethoscope, Clock } from 'lucide-react';
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
        patients: 0,
        consultations: 0,
        appointments: 0,
        scheduledExams: 0
    });

    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [loading, setLoading] = useState(true);

    // Mettre à jour l'heure et la date en temps réel
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            
            // Formater l'heure
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Formater la date
            const dateString = now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            setCurrentTime(timeString);
            setCurrentDate(dateString);
        };

        // Mettre à jour immédiatement
        updateDateTime();
        
        // Mettre à jour toutes les secondes
        const timeInterval = setInterval(updateDateTime, 1000);
        
        return () => clearInterval(timeInterval);
    }, []);

    // Configuration Axios par défaut
    const api = axios.create({
        baseURL: 'http://localhost:8009/api/v1',
        timeout: 10000,
    });

    // Intercepteur pour ajouter le token automatiquement
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token_key_fultang");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Fonction pour décoder le JWT
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem("token_key_fultang");
            if (!token) return null;

            const payload = token.split('.')[1];
            if (!payload) return null;

            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload.user_id || decodedPayload.userId || decodedPayload.sub;
        } catch (error) {
            console.error("Erreur décodage token:", error);
            return null;
        }
    };

    // Fonction pour extraire le count de la réponse API
    const extractCount = (data) => {
        if (!data) return 0;
        
        if (Array.isArray(data)) {
            return data.length;
        } else if (data.count !== undefined) {
            // Réponse paginée
            return data.count;
        } else if (data.results && Array.isArray(data.results)) {
            // Autre format de pagination
            return data.results.length;
        } else if (typeof data === 'object') {
            // Compter les clés si c'est un objet
            return Object.keys(data).length;
        }
        return 0;
    };

    // Récupérer les statistiques du docteur
    useEffect(() => {
        const fetchDoctorStats = async () => {
            const doctorId = getUserIdFromToken();
            
            if (!doctorId) {
                console.error("ID docteur non trouvé");
                setLoading(false);
                return;
            }

            console.log(`Chargement stats pour docteur ID: ${doctorId}`);
            
            try {
                // Exécuter toutes les requêtes en parallèle
                const [appointmentsRes, consultationsRes, patientsRes, examsRes] = await Promise.allSettled([
                    api.get(`/medical/appointment/doctor/${doctorId}/`),
                    api.get(`/medical/consultation/doctor/${doctorId}/`),
                    api.get(`/medical/patient/doctor/${doctorId}/`),
                    // Pour les examens, vous devriez vérifier si un endpoint spécifique existe
                    // Sinon, filtrez les examens par docteur côté frontend
                    api.get('/medical/exam-request/')
                ]);

                // Traiter les résultats
                const newStats = {
                    appointments: appointmentsRes.status === 'fulfilled' 
                        ? extractCount(appointmentsRes.value.data) 
                        : 0,
                    consultations: consultationsRes.status === 'fulfilled' 
                        ? extractCount(consultationsRes.value.data) 
                        : 0,
                    patients: patientsRes.status === 'fulfilled' 
                        ? extractCount(patientsRes.value.data) 
                        : 0,
                    scheduledExams: examsRes.status === 'fulfilled' 
                        ? extractCount(examsRes.value.data) 
                        : 0
                };

                // Si vous avez besoin de filtrer les examens par docteur
                if (examsRes.status === 'fulfilled' && Array.isArray(examsRes.value.data)) {
                    const examsForDoctor = examsRes.value.data.filter(
                        exam => exam.idMedicalStaff == doctorId
                    );
                    newStats.scheduledExams = examsForDoctor.length;
                }

                setStats(newStats);
                console.log("Statistiques chargées:", newStats);

            } catch (error) {
                console.error("Erreur lors du chargement des stats:", error);
                // Utiliser des valeurs par défaut en cas d'erreur
                setStats({
                    patients: 12,
                    consultations: 8,
                    appointments: 15,
                    scheduledExams: 6
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorStats();
    }, []);

    // Icônes pour les cartes de statistiques
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
            description: "Total consultations",
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
        },
        //{
        //   icon: Stethoscope,
        //    label: "Add Consultation",
        //    onClick: () => navigate(AppRouterPaths.doctorAddConsultation)
       // },
        // NOUVEAU QUICK ACCESS POUR LES EXAMENS
        {
            icon: FileText,
            label: "View Prescribed Exams",
            onClick: () => navigate(AppRouterPaths.doctorExamList ) // Assurez-vous que cette route existe
        }
    ];

    if (loading) {
        return (
            <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
                <DoctorNavBar/>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <div className="mt-4 text-lg text-gray-600">Loading dashboard...</div>
                        </div>
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome to the Doctor dashboard</h1>
                            <p className="opacity-90 font-semibold text-xl">
                                Manage your clinic efficiently and monitor all activities from this centralized interface.
                            </p>
                        </div>
                        {/* Cadre pour l'heure et la date */}
                        <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-6 h-6" />
                                <div className="text-right">
                                    <div className="text-2xl font-bold tracking-tight">{currentTime}</div>
                                    <div className="text-sm opacity-80">{currentDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    {/* Mise à jour de la grille pour accommoder les 5 boutons */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
