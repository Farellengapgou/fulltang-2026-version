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
    ShieldCheck
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
                "Accountant": appRouterPaths.financialAccountantHome,
                "MaterialAccountant": appRouterPaths.materialAccountingDashboard
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 font-sans text-gray-800">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 ">
                 <img 
                    src={loginBackground} 
                    alt="Background Pattern" 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info Side - Matching Login gradient */}
                            <div className="relative mb-[50rem] ml-[2rem]">
                              <Link to="/">
                                <span className="text-3xl  text-white font-bold">FULTANG</span>
                              </Link>
                            </div>
                
                            <div className="relative w-[80rem] z-10 ml-[1rem] text-white">
                
                              <h2 className="text-5xl text-secondary text-black font-semibold mb-10 leading-tight">
                                Bienvenue sur FULTANG
                              </h2>
                
                              <p className="text-black text-secondary text-3xl mb-8 leading-relaxed">
                                Polyclinic Fultang est une application de gestion hospitalière assurant 
                                la prise en charge et le suivi des patients de leur arrivée à leur sortie, 
                                via la plateforme. 
                             </p>
                            </div>

            
            <div className="container mx-auto px-6 relative z-10 ">
                    {/* Login Form Side */}
                    <div className="ml-[13rem] mr-[10rem]  p-10 bg-white flex flex-col justify-center rounded-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-secondary mb-2">Connexion</h2>
                            <p className="text-gray-600 text-xl">Entrez vos identifiants pour continuer</p>
                        </div>

                        {isLoginErrorPresent && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
                            >
                                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm font-semibold">{loginError}</p>
                            </motion.div>
                        )}

                        <form className="space-y-5" onSubmit={handleLogin}>
                            <div className="space-y-1.5">
                                <label className="text-xl font-semibold text-gray-600 mb-1 block">Nom d'utilisateur</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="text-gray-400 w-5 h-5 transition-colors duration-500 ease-in-out group-focus-within:text-secondary" />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-md bg-white focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 text-gray-800"
                                        placeholder="Votre identifiant"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xl font-semibold text-gray-600 mb-1 block">Mot de passe</label>
                                    <Link to={appRouterPaths.forgottenPasswordPage} className="text-sm font-bold text-secondary hover:underline transition-colors duration-300">
                                        Mot de Passe Oublié ?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="text-gray-400 w-5 h-5 transition-colors duration-500 ease-in-out group-focus-within:text-secondary" />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-md bg-white focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 text-gray-800"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-500 ease-in-out"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-xl py-4 bg-secondary text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? "Connexion en cours..." : "S'identifier"}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-secondary transition-colors duration-500 ease-in-out text-md font-semibold">
                                <ArrowLeft className="w-4 h-4" />
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
            
            </div>

            {isLoading && <Wait />}
        </div>
    );
}

export default LoginPage;