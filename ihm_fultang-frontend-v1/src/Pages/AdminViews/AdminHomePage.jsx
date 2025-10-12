import { Users, Stethoscope, Calendar, ClipboardList, Building2, FileText, ShieldCheck, UserCog, Settings, FileSpreadsheet, UserPlus, Hospital } from 'lucide-react';
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";
import {useNavigate} from "react-router-dom";
import {AppRoutesPaths as AppRouterPaths} from "../../Router/appRouterPaths.js";
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";


export function AdminHomePage() {


    const navigate = useNavigate();

    const stats = {
        patients: 5,
        medicalStaff: 6,
        consultations: 0,
        appointments: 0,
        scheduledExams: 0,
        totalRooms: 12
    };


    const adminPrivileges = [
        {
            icon: UserCog,
            title: "Personnel Management",
            description: "Add, edit, or delete medical staff members"
        },
        {
            icon: Settings,
            title: "System Configuration",
            description: "Manage clinic settings and permissions"
        },
        {
            icon: FileSpreadsheet,
            title: "Reports & Analysis",
            description: "Access detailed reports and statistics"
        },
        {
            icon: UserPlus,
            title: "Access Management",
            description: "Manage user accounts and access levels"
        }
    ];


    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the admin dashboard</h1>
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
                        icon={Stethoscope}
                        title="Medical Staff"
                        value={stats?.medicalStaff}
                        description="Staff members"
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Consultations"
                        value={stats?.consultations}
                        description="Consultations this month"
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
                        description="Scheduled exams"
                        color="bg-red-500"
                    />
                    <StatCard
                        icon={Building2}
                        title="Rooms"
                        value={stats?.totalRooms}
                        description="Available rooms"
                        color="bg-teal-500"
                    />
                </div>

                <div className=" rounded-lg  p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-6 h-6 text-[#4DB6AC]"/>
                        <h2 className="text-xl font-bold text-gray-800">Administrator Privileges</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {adminPrivileges.map((privilege, index) => (
                            <div
                                key={index}
                                className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#4DB6AC] transition-colors"
                            >
                                <privilege.icon className="w-8 h-8 text-[#4DB6AC] shrink-0"/>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">{privilege?.title}</h3>
                                    <p className="text-gray-600 text-sm">{privilege?.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                <div className="rounded-lg  p-6">
                  
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={UserPlus}
                            label="Manage Patient"
                            onClick={() => navigate(AppRouterPaths.adminPatientListPage)}
                        />
                        <QuickActionButton
                            icon={Stethoscope}
                            label="Manage Medical Staff"
                            onClick={() => navigate(AppRouterPaths.adminMedicalStaffListPage)}
                        />
                        {/*  <QuickActionButton
                            icon={Calendar}
                            label="View Appointments List"
                            onClick={() => navigate(AppRouterPaths.adminAppointmentsListPage)}
                        />*/}
                        <QuickActionButton
                            icon={Hospital}
                            label="Manage Rooms"
                            onClick={() => navigate(AppRouterPaths.adminHospitalRoomPage)}
                        />
                        <QuickActionButton
                            icon={FileSpreadsheet}
                            label="View Consultations List"
                            onClick={() => navigate(AppRouterPaths.adminConsultationListPage)}
                        />
                        {/*  <QuickActionButton
                            icon={FileSpreadsheet}
                            label="Manage Medicine"
                            onClick={() => alert("Manage Medicine")}
                        />
                        <QuickActionButton
                            icon={FileSpreadsheet}
                            label="Financial Reports"
                            onClick={() => navigate(AppRouterPaths.adminFinancialReportsPage)}
                        />*/}
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}





