import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Eye, 
    EyeOff, 
    User, 
    Lock, 
    ArrowLeft, 
    AlertCircle,
    Activity,
    HelpCircle
} from 'lucide-react';
import loginBackground from "../../assets/logIn.png";
import Wait from "../Modals/wait.jsx";
import { AppRoutesPaths as appRouterPaths } from "../../Router/appRouterPaths.js";
import { useAuthentication } from "../../Utils/Provider.jsx";

export function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoginErrorPresent, setIsLoginErrorPresent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { isLoading, setIsLoading, login } = useAuthentication();
    const navigate = useNavigate();

    const data = {
        username: username,
        password: password
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setIsLoginErrorPresent(false);
        setLoginError("");

        try {
            const response = await login(data);
            console.log("Login response:", response);

            const roleRoutes = {
                "Pharmacist": appRouterPaths.pharmacyPage,
                "Doctor": appRouterPaths.doctorPage,
                "Nurse": appRouterPaths.nursePage,
                "Labtech": appRouterPaths.laboratoryAssistantPage,
                "Admin": appRouterPaths.adminHomePage,
                "Receptionist": appRouterPaths.receptionistPage,
                "Cashier": appRouterPaths.cashierPage,
                "Specialist": appRouterPaths.specialistPage,
                "Accountant": appRouterPaths.financialAccountantHome
            };

            if (roleRoutes[response]) {
                navigate(roleRoutes[response]);
            } else if (response === "bad role") {
                setIsLoginErrorPresent(true);
                setLoginError("Rôle non reconnu ou invalide.");
            } else if (response === "No role") {
                setIsLoginErrorPresent(true);
                setLoginError("Vous n'avez pas de spécialisation attribuée. Contactez un administrateur.");
            } else if (response === 401) {
                setIsLoginErrorPresent(true);
                setLoginError("Nom d'utilisateur ou mot de passe incorrect.");
            } else if (response === 404) {
                setIsLoginErrorPresent(true);
                setLoginError("Utilisateur non trouvé dans le système.");
            } else {
                setIsLoginErrorPresent(true);
                setLoginError("Une erreur est survenue lors de la connexion.");
            }
        } catch (error) {
            setIsLoginErrorPresent(true);
            setLoginError("Erreur réseau ou serveur. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-secondary font-sans text-secondary">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={loginBackground} 
                    alt="Login Background" 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-primary-start/70 to-primary-end/50 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto flex flex-col lg:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Brand/Welcome Side */}
                    <div className="lg:w-1/2 p-12 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-white/10">
                        <div>
                            <Link to="/" className="flex items-center gap-2 mb-12 group">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md group-hover:bg-primary-end transition-colors">
                                    <Activity className="text-white w-6 h-6" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">FULTANG</span>
                            </Link>
                            
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-5xl font-black mb-6 leading-tight"
                            >
                                Portail <br />
                                d'Excellence <br />
                                <span className="text-primary-end">Médicale</span>
                            </motion.h1>
                            
                            <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-sm">
                                Connectez-vous pour accéder à votre espace de travail et contribuer à l'excellence des soins Fultang.
                            </p>
                        </div>

                        <div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-white/50">
                                    <div className="w-1 h-1 rounded-full bg-primary-end"></div>
                                    <span className="text-sm font-semibold tracking-wide uppercase">Système Sécurisé</span>
                                </div>
                                <button 
                                    onClick={() => navigate(appRouterPaths.helpCenterPage)}
                                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold group"
                                >
                                    <HelpCircle className="w-4 h-4 text-primary-end group-hover:rotate-12 transition-transform" />
                                    Signaler un problème technique
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Login Form Side */}
                    <div className="lg:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-black text-secondary mb-2">Connexion</h2>
                            <p className="text-secondary/60 font-medium">Veuillez entrer vos identifiants</p>
                        </div>

                        {isLoginErrorPresent && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
                            >
                                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm font-bold">{loginError}</p>
                            </motion.div>
                        )}

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary tracking-widest uppercase ml-1">Nom d'utilisateur</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-secondary/40 w-5 h-5 group-focus-within:text-primary-start transition-colors" />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-secondary/5 border-none ring-1 ring-secondary/10 rounded-2xl focus:ring-2 focus:ring-primary-start outline-none transition-all font-medium text-secondary"
                                        placeholder="votre_identifiant"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-black text-secondary tracking-widest uppercase">Mot de passe</label>
                                    <Link to={appRouterPaths.forgottenPasswordPage} className="text-xs font-bold text-primary-start hover:text-secondary transition-colors">
                                        Oublié ?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-secondary/40 w-5 h-5 group-focus-within:text-primary-start transition-colors" />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-secondary/5 border-none ring-1 ring-secondary/10 rounded-2xl focus:ring-2 focus:ring-primary-start outline-none transition-all font-medium text-secondary"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary/40 hover:text-secondary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-secondary text-white font-black rounded-2xl shadow-xl shadow-secondary/20 hover:bg-primary-start hover:shadow-primary-start/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Connexion en cours..." : "S'identifier"}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-secondary/5 flex justify-center">
                            <Link to="/" className="flex items-center gap-2 text-secondary/40 hover:text-secondary transition-colors text-sm font-bold">
                                <ArrowLeft className="w-4 h-4" />
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {isLoading && <Wait />}
        </div>
    );
}

export default LoginPage;