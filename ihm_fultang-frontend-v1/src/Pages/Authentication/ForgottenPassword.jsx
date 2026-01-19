"use client";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Send, 
    Lock, 
    ShieldCheck, 
    AlertCircle, 
    CheckCircle2,
    Activity
} from "lucide-react";
import axios from "axios";
import loginBackground from "../../assets/logIn.png";
import { AppRoutesPaths as appRouterPaths } from "../../Router/appRouterPaths.js";

export function ForgottenPassword() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        const commonPasswords = ["password", "123456", "12345678", "qwerty", "abc123", "letmein"];
        if (commonPasswords.includes(password.toLowerCase())) {
            setError("Ce mot de passe est trop commun. Veuillez en choisir un plus robuste.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                "http://127.0.0.1:8009/api/v1/auth/reset-password/",
                {
                    email: email,
                    password: password,
                    password_confirmation: confirmPassword,
                },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200 || response.status === 201) {
                setIsSubmitted(true);
            }
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la réinitialisation. Vérifiez l'adresse email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-secondary font-sans text-secondary">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={loginBackground} 
                    alt="Reset Background" 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-primary-start/70 to-primary-end/50 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-5xl mx-auto flex flex-col lg:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Info Side */}
                    <div className="lg:w-1/2 p-12 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5">
                        <div>
                            <Link to="/" className="flex items-center gap-2 mb-12 group">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md group-hover:bg-primary-end transition-colors">
                                    <Activity className="text-white w-6 h-6" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">FULTANG</span>
                            </Link>
                            
                            <h2 className="text-4xl font-black mb-6 leading-tight">
                                Sécurité <br />
                                du Compte
                            </h2>
                            
                            <p className="text-white/70 text-lg mb-8 leading-relaxed">
                                Réinitialisez votre mot de passe en toute sécurité. Utilisez un mot de passe fort pour protéger vos accès.
                            </p>

                            <div className="space-y-4 pt-4">
                                {[
                                    { icon: ShieldCheck, text: "Au moins 8 caractères" },
                                    { icon: ShieldCheck, text: "Lettres, chiffres et symboles" },
                                ].map((tip, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-white/60">
                                        <tip.icon className="w-5 h-5 text-primary-end" />
                                        <span className="font-medium text-sm">{tip.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-12">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <Lock className="w-12 h-12 text-primary-end mb-4 animate-pulse" />
                                <p className="text-sm font-semibold opacity-60">Protégez vos données patients avec un mot de passe unique.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="mb-10 text-center lg:text-left">
                                        <h3 className="text-3xl font-black text-secondary mb-2">Réinitialisation</h3>
                                        <p className="text-secondary/60 font-medium">Mettez à jour vos identifiants</p>
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                                            <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                                            <p className="text-red-700 text-sm font-bold">{error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-secondary tracking-widest uppercase ml-1">Adresse Email</label>
                                            <input 
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-6 py-4 bg-secondary/5 border-none ring-1 ring-secondary/10 rounded-2xl focus:ring-2 focus:ring-primary-start outline-none transition-all font-medium text-secondary"
                                                placeholder="votre@email.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-secondary tracking-widest uppercase ml-1">Nouveau Mot de passe</label>
                                            <input 
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-6 py-4 bg-secondary/5 border-none ring-1 ring-secondary/10 rounded-2xl focus:ring-2 focus:ring-primary-start outline-none transition-all font-medium text-secondary"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-secondary tracking-widest uppercase ml-1">Confirmer le Mot de passe</label>
                                            <input 
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-6 py-4 bg-secondary/5 border-none ring-1 ring-secondary/10 rounded-2xl focus:ring-2 focus:ring-primary-start outline-none transition-all font-medium text-secondary"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-secondary text-white font-black rounded-2xl shadow-xl shadow-secondary/20 hover:bg-primary-start hover:shadow-primary-start/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                            {loading ? "Traitement..." : "Réinitialiser"}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-primary-end/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-primary-end" />
                                    </div>
                                    <h3 className="text-3xl font-black text-secondary mb-4">Succès !</h3>
                                    <p className="text-secondary/60 font-medium mb-8">
                                        Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.
                                    </p>
                                    <button 
                                        onClick={() => navigate("/login")}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white font-black rounded-2xl hover:bg-primary-start transition-all"
                                    >
                                        Se Connecter
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-10 pt-8 border-t border-secondary/5 flex justify-center">
                            <Link to="/login" className="flex items-center gap-2 text-secondary/40 hover:text-secondary transition-colors text-sm font-bold">
                                <ArrowLeft className="w-4 h-4" />
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default ForgottenPassword;
