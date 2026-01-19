import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Briefcase, 
    Calculator, 
    Boxes, 
    Users, 
    ShieldCheck, 
    Mail, 
    Phone, 
    MapPin, 
    ChevronRight, 
    Menu, 
    X,
    TrendingUp,
    Clock,
    CheckCircle2,
    HeartPulse,
    Stethoscope,
    FlaskConical,
    Pill
} from 'lucide-react';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-secondary">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-start to-primary-end rounded-lg flex items-center justify-center shadow-lg">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-secondary' : 'text-white'}`}>
                            FULTANG
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {['About', 'Modules', 'Actors', 'Contact'].map((item) => (
                            <button 
                                key={item} 
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className={`text-sm font-semibold transition-colors hover:text-primary-end ${scrolled ? 'text-gray-600' : 'text-white/90'}`}
                            >
                                {item}
                            </button>
                        ))}
                        <button 
                            onClick={() => navigate("/login")}
                            className="bg-primary-start text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-primary-end transition-all transform hover:-translate-y-1"
                        >
                            Accès Portail
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className={scrolled ? 'text-secondary' : 'text-white'} /> : <Menu className={scrolled ? 'text-secondary' : 'text-white'} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                        >
                            <div className="flex flex-col p-6 gap-4">
                                {['About', 'Modules', 'Actors', 'Contact'].map((item) => (
                                    <button 
                                        key={item} 
                                        onClick={() => scrollToSection(item.toLowerCase())}
                                        className="text-left py-2 text-secondary/70 font-medium border-b border-secondary/5"
                                    >
                                        {item}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => navigate("/login")}
                                    className="bg-primary-start text-white py-3 rounded-lg font-bold mt-2"
                                >
                                    Se Connecter
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/welcomeImage.png" 
                        alt="Fultang Background" 
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary-start to-primary-end opacity-90"></div>
                </div>

                {/* Animated Background Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            x: [0, 50, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-end/20 rounded-full blur-3xl"
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 text-white text-center lg:text-left"
                        >
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-6 tracking-wide"
                            >
                                NEXT GEN ERP SOLUTION
                            </motion.span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                                Gérez votre <span className="text-primary-end">Polyclinique</span> avec Excellence
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
                                FULTANG est une plateforme intégrée révolutionnaire conçue pour moderniser la gestion hospitalière, la comptabilité OHADA et le suivie en temps reel d'un patient.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button 
                                    onClick={() => scrollToSection('modules')}
                                    className="px-8 py-4 bg-white text-secondary hover:bg-primary-end hover:text-white rounded-full font-bold shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    Découvrir nos modules <ChevronRight className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => navigate("/login")}
                                    className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white text-white rounded-full font-bold transition-all"
                                >
                                    Portail Employé
                                </button>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="relative z-10 bg-white/10 backdrop-blur-md p-2 rounded-3xl border border-white/20 shadow-2xl overflow-hidden group">
                                <img 
                                    src="/welcomeImage.png" 
                                    alt="Platform Preview" 
                                    className="rounded-2xl shadow-inner transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent pointer-events-none"></div>
                            </div>
                            
                            {/* Floating Stats */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-20 -right-6 md:right-0 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                            >
                                <div className="w-12 h-12 bg-primary-end/10 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="text-primary-end w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-secondary/50 font-bold">Optimisation</p>
                                    <p className="text-xl font-black text-secondary">+40%</p>
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute -bottom-15 -left-6 md:left-0 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                            >
                                <div className="w-12 h-12 bg-primary-start/10 rounded-xl flex items-center justify-center">
                                    <Clock className="text-primary-start w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-secondary/50 font-bold">Temps Reel</p>
                                    <p className="text-xl font-black text-secondary">24/7</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-secondary/5 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:w-1/2"
                        >
                            <div className="relative">
                                <img 
                                    src="/endpicture.png" 
                                    alt="About Fultang" 
                                    className="rounded-3xl shadow-2xl relative z-10"
                                />
                                <div className="absolute -bottom-6 -right-6 w-full h-full border-4 border-primary-end rounded-3xl -z-0"></div>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:w-1/2"
                        >
                            <h2 className="text-primary-end font-bold tracking-widest uppercase mb-4">À propos de Fultang</h2>
                            <h3 className="text-3xl md:text-5xl font-black text-secondary leading-tight mb-8">
                                Une Solution Holistique pour la Gestion Moderne
                            </h3>
                            <p className="text-lg text-secondary/60 mb-8 leading-relaxed">
                                Fultang Polyclinic n'est pas qu'un simple centre de soins. C'est une architecture technologique pensée pour l'efficacité. Notre plateforme intègre tous les aspects de la vie d'une entreprise de santé : de l'accueil du patient à la clôture de l'exercice comptable, en passant par la gestion rigoureuse du processus de suivi du patient.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: ShieldCheck, text: "Conformité OHADA de pointe" },
                                    { icon: CheckCircle2, text: "Suivi du patient en temps réel" },
                                    { icon: CheckCircle2, text: "Gestion de tout le staff medical" },
                                    { icon: ShieldCheck, text: "Sécurité des données patients" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="bg-primary-end/10 p-2 rounded-lg">
                                            <item.icon className="text-primary-end w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-secondary">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section id="modules" className="py-24 bg-white relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-start/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary-end/5 blur-[120px] rounded-full"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-primary-end font-bold tracking-widest uppercase mb-4"
                        >
                            Nos Modules
                        </motion.h2>
                        <motion.h3 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-secondary mb-6"
                        >
                            Un Écosystèm Connecté
                        </motion.h3>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-secondary/60"
                        >
                            Chaque module communique avec les autres pour garantir une cohérence totale de vos données techniques, médicales et financières.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Briefcase,
                                title: "Gestion du Staff Medical",
                                desc: "Suivi des tâches, Messagerie en temps reel, et monitoring de performance opérationnelle.",
                                color: "bg-primary-start",
                                features: ["Tableaux de bord", "Attribution des tâches", "Suivi budget"]
                            },
                            {
                                icon: Calculator,
                                title: "Comptabilité Financière",
                                desc: "Totalement conforme aux normes OHADA. Gestion des journaux, bilans et comptes de résultats.",
                                color: "bg-primary-end",
                                features: ["Journalisation", "États Financiers", "Grand Livre"]
                            },
                            {
                                icon: Boxes,
                                title: "Comptabilité Matière",
                                desc: "Gestion rigoureuse des stocks, inventaires périodiques et valorisation des actifs immobilisés.",
                                color: "bg-secondary",
                                features: ["Gestion de stock", "Immobilisations", "Valorisation"]
                            },
                            {
                                icon: HeartPulse,
                                title: "Suite Médicale",
                                desc: "Gestion complète du parcours patient, de la consultation à la pharmacie et au laboratoire.",
                                color: "bg-primary-start",
                                features: ["Dossier Médical", "Pharmacie", "Laboratoire"]
                            }
                        ].map((module, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 flex flex-col h-full group"
                            >
                                <div className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg transform transition-transform group-hover:rotate-12`}>
                                    <module.icon className="text-white w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-black text-secondary mb-4">{module.title}</h4>
                                <p className="text-secondary/70 text-sm mb-8 flex-grow leading-relaxed">
                                    {module.desc}
                                </p>
                                <ul className="space-y-3">
                                    {module.features.map((feat, fidx) => (
                                        <li key={fidx} className="flex items-center gap-2 text-xs font-bold text-secondary/40">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-end"></div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Actors Section */}
            <section id="actors" className="py-24 bg-secondary text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
                        <div className="lg:w-2/3">
                            <h2 className="text-primary-end font-bold tracking-widest uppercase mb-4 italic">Nos Acteurs</h2>
                            <h3 className="text-3xl md:text-5xl font-extrabold leading-tight">
                                Une Interface Dédiée pour Chaque Expertise
                            </h3>
                        </div>
                        <p className="lg:w-1/3 text-white/60 text-lg">
                            Parce que chaque rôle est unique, Fultang offre des vues personnalisées pour maximiser la productivité.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { icon: Stethoscope, label: "Docteur" },
                            { icon: Activity, label: "Infirmier" },
                            { icon: Users, label: "Réceptioniste" },
                            { icon: Calculator, label: "Comptable" },
                            { icon: FlaskConical, label: "Laborantin" },
                            { icon: Pill, label: "Pharmacien" }
                        ].map((actor, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center hover:bg-white/10 transition-colors group cursor-default"
                            >
                                <actor.icon className="w-10 h-10 text-primary-end mb-4 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-sm text-center tracking-wide">{actor.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Dashboard Preview Section */}
                    <motion.div 
                         initial={{ opacity: 0, y: 50 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         className="mt-20 bg-gradient-to-r from-primary-start to-primary-end p-1 rounded-3xl"
                    >
                        <div className="bg-secondary p-8 md:p-12 rounded-[calc(1.5rem-1px)] flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2">
                                <h4 className="text-2xl font-bold mb-4">Gagnez en efficacité dès aujourd'hui</h4>
                                <p className="text-white/70 mb-8">
                                    Rejoignez des centaines de professionnels qui utilisent Fultang pour automatiser les tâches répétitives et se concentrer sur l'essentiel : le patient et la performance.
                                </p>
                                <button 
                                    onClick={() => navigate("/login")}
                                    className="px-8 py-3 bg-white text-secondary font-black rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
                                >
                                    Se connecter au système <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="md:w-1/2 grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                                    <p className="text-3xl font-black text-primary-end mb-1">99%</p>
                                    <p className="text-xs text-white/50 uppercase font-bold">Disponibilité</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                                    <p className="text-3xl font-black text-primary-end mb-1">0%</p>
                                    <p className="text-xs text-white/50 uppercase font-bold">Erreur Papier</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div>
                            <h2 className="text-primary-end font-bold tracking-widest uppercase mb-4">Contactez-nous</h2>
                            <h3 className="text-3xl md:text-5xl font-black text-secondary mb-8">
                                Une Question ? Un Problème ?
                            </h3>
                            <p className="text-lg text-secondary/60 mb-12">
                                Notre équipe technique et notre support client sont à votre disposition pour vous accompagner dans l'utilisation de la plateforme.
                            </p>
                            
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary-start group-hover:text-white transition-all text-secondary">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-1">Localisation</p>
                                        <p className="font-bold text-secondary">Nkongsamba, Cameroun</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary-start group-hover:text-white transition-all text-secondary">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-1">Fecebook</p>
                                        <p className="font-bold text-secondary">https://www.facebook.com/FultangPolyclinic/?locale=fr_FR</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary-start group-hover:text-white transition-all text-secondary">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-1">Email</p>
                                        <p className="font-bold text-secondary">fultangpolyclinic.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary/5 p-8 md:p-12 rounded-3xl border border-secondary/10 shadow-xl">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-secondary/80">Nom Complet</label>
                                        <input type="text" className="w-full px-5 py-4 rounded-xl border-none ring-1 ring-secondary/20 focus:ring-2 focus:ring-primary-start outline-none transition-all bg-white" placeholder="Jean Dupont" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-secondary/80">Email</label>
                                        <input type="email" className="w-full px-5 py-4 rounded-xl border-none ring-1 ring-secondary/20 focus:ring-2 focus:ring-primary-start outline-none transition-all bg-white" placeholder="jean@email.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary/80">Sujet</label>
                                    <select className="w-full px-5 py-4 rounded-xl border-none ring-1 ring-secondary/20 focus:ring-2 focus:ring-primary-start outline-none transition-all appearance-none cursor-pointer bg-white">
                                        <option>Support Technique</option>
                                        <option>Demande de formation</option>
                                        <option>Autre</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-secondary/80">Message</label>
                                    <textarea rows="4" className="w-full px-5 py-4 rounded-xl border-none ring-1 ring-secondary/20 focus:ring-2 focus:ring-primary-start outline-none transition-all bg-white" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                                </div>
                                <button className="w-full py-4 bg-secondary text-white font-black rounded-xl hover:bg-primary-start transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Envoyer le message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-start to-primary-end rounded-lg flex items-center justify-center shadow-md">
                                <Activity className="text-white w-4 h-4" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-secondary">
                                FULTANG
                            </span>
                        </div>
                        
                        <div className="flex gap-8">
                            <a href="#" className="font-bold text-secondary/40 hover:text-primary-end transition-colors capitalize">Confidentialité</a>
                            <a href="#" className="font-bold text-secondary/40 hover:text-primary-end transition-colors capitalize">Conditions</a>
                            <a href="#" className="font-bold text-secondary/40 hover:text-primary-end transition-colors capitalize">Support</a>
                        </div>

                        <p className="text-secondary/40 font-medium">
                            © {new Date().getFullYear()} Fultang ERP. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;