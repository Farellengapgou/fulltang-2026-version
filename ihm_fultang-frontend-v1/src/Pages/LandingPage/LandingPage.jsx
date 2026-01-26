import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Pill,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-secondary">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"}`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-start to-primary-end rounded-lg flex items-center justify-center shadow-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span
              className={`text-2xl font-bold tracking-tight transition-colors duration-500 ease-in-out ${scrolled ? "text-secondary" : "text-white"}`}
            >
              FULTANG
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {["About", "Modules", "Actors", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`text-sm font-semibold transition-colors duration-500 ease-in-out hover:text-primary-end ${scrolled ? "text-gray-600" : "text-white/90"}`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="bg-secondary text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out"
            >
              Accès Portail
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={scrolled ? "text-secondary" : "text-white"} />
            ) : (
              <Menu className={scrolled ? "text-secondary" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {["About", "Modules", "Actors", "Contact"].map((item) => (
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
                  className="bg-secondary text-white py-3 rounded-lg font-bold mt-2 hover:bg-[#3d9d94] transition-colors duration-500 ease-in-out"
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary-end to-primary-start opacity-90"></div>
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
                Gérez votre <span className="text-white">Polyclinique</span>{" "}
                avec Excellence
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
                FULTANG est une plateforme intégrée révolutionnaire conçue pour
                moderniser la gestion hospitalière, la comptabilité OHADA et le
                suivi en temps réel d'un patient.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => scrollToSection("modules")}
                  className="px-8 py-4 bg-white text-secondary hover:bg-gray-100 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-500 ease-in-out flex items-center justify-center gap-2"
                >
                  Découvrir nos modules <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white text-white rounded-lg font-bold transition-all duration-500 ease-in-out"
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
              <div className="relative z-10 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl overflow-hidden group">
                <img
                  src="/welcomeImage.png"
                  alt="Platform Preview"
                  className="rounded-2xl shadow-inner transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
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
                  <p className="text-xs text-secondary/50 font-bold">
                    Optimisation
                  </p>
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
                  <p className="text-xs text-secondary/50 font-bold">
                    Temps Réel
                  </p>
                  <p className="text-xl font-black text-secondary">24/7</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50 overflow-hidden">
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
                  className="rounded-2xl shadow-sm border border-gray-100 relative z-10"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-primary-end font-bold tracking-widest uppercase mb-4">
                À propos de Fultang
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-secondary leading-tight mb-6">
                Une Solution Holistique pour la Gestion Moderne
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Fultang Polyclinic n'est pas qu'un simple centre de soins. C'est
                une architecture technologique pensée pour l'efficacité. Notre
                plateforme intègre tous les aspects de la vie d'une entreprise
                de santé.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: ShieldCheck, text: "Conformité OHADA de pointe" },
                  {
                    icon: CheckCircle2,
                    text: "Suivi du patient en temps réel",
                  },
                  {
                    icon: CheckCircle2,
                    text: "Gestion de tout le staff médical",
                  },
                  { icon: ShieldCheck, text: "Sécurité des données patients" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="bg-primary-end/10 p-2 rounded-lg">
                      <item.icon className="text-primary-end w-5 h-5" />
                    </div>
                    <span className="font-semibold text-secondary">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-primary-end font-bold tracking-widest uppercase mb-4">
              Nos Modules
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Un Écosystème Connecté
            </h3>
            <p className="text-lg text-gray-600">
              Chaque module communique avec les autres pour garantir une
              cohérence totale de vos données.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Gestion du Staff Medical",
                desc: "Suivi des tâches, messagerie en temps réel, et monitoring de performance opérationnelle.",
                color: "bg-blue-500",
                features: [
                  "Tableaux de bord",
                  "Attribution des tâches",
                  "Suivi budget",
                ],
              },
              {
                icon: Calculator,
                title: "Comptabilité Financière",
                desc: "Totalement conforme aux normes OHADA. Gestion des journaux, bilans et comptes de résultats.",
                color: "bg-green-500",
                features: ["Journalisation", "États Financiers", "Grand Livre"],
              },
              {
                icon: Boxes,
                title: "Comptabilité Matière",
                desc: "Gestion rigoureuse des stocks, inventaires périodiques et valorisation des actifs.",
                color: "bg-purple-500",
                features: [
                  "Gestion de stock",
                  "Immobilisations",
                  "Valorisation",
                ],
              },
              {
                icon: HeartPulse,
                title: "Suite Médicale",
                desc: "Gestion complète du parcours patient, de la consultation à la pharmacie et au laboratoire.",
                color: "bg-red-500",
                features: ["Dossier Médical", "Pharmacie", "Laboratoire"],
              },
            ].map((module, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-lg transition-all duration-500 ease-in-out"
              >
                <div
                  className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform duration-500 ease-in-out group-hover:scale-110`}
                >
                  <module.icon className="text-white w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-secondary mb-4">
                  {module.title}
                </h4>
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                  {module.desc}
                </p>
                <ul className="space-y-2">
                  {module.features.map((feat, fidx) => (
                    <li
                      key={fidx}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-500"
                    >
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
      <section
        id="actors"
        className="py-24 bg-gradient-to-r from-primary-end to-primary-start text-white relative overflow-hidden"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
            <div className="lg:w-2/3">
              <h2 className="text-white font-bold tracking-widest uppercase mb-4">
                Nos Acteurs
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                Une Interface Dédiée pour Chaque Expertise
              </h3>
            </div>
            <p className="lg:w-1/3 text-white/80 text-lg">
              Parce que chaque rôle est unique, Fultang offre des vues
              personnalisées.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Stethoscope, label: "Docteur" },
              { icon: Activity, label: "Infirmier" },
              { icon: Users, label: "Réceptioniste" },
              { icon: Calculator, label: "Comptable" },
              { icon: FlaskConical, label: "Laborantin" },
              { icon: Pill, label: "Pharmacien" },
            ].map((actor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col items-center hover:bg-white/20 transition-all duration-500 ease-in-out group cursor-default"
              >
                <actor.icon className="w-10 h-10 text-white mb-4 transition-transform duration-500 ease-in-out group-hover:scale-110" />
                <span className="font-semibold text-sm text-center">
                  {actor.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-white/10 p-8 md:p-12 rounded-2xl border border-white/20 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="md:w-1/2">
              <h4 className="text-2xl font-bold mb-4">
                Gagnez en efficacité dès aujourd'hui
              </h4>
              <p className="text-white/70 mb-8">
                Rejoignez des centaines de professionnels qui utilisent Fultang
                pour automatiser les tâches répétitives.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-gray-100 transition-all duration-500 ease-in-out flex items-center gap-2"
              >
                Se connecter au système <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/10 rounded-2xl border border-white/20 text-center">
                <p className="text-3xl font-black text-white mb-1">99%</p>
                <p className="text-xs text-white/70 uppercase font-semibold">
                  Disponibilité
                </p>
              </div>
              <div className="p-6 bg-white/10 rounded-2xl border border-white/20 text-center">
                <p className="text-3xl font-black text-white mb-1">0%</p>
                <p className="text-xs text-white/70 uppercase font-semibold">
                  Erreur Papier
                </p>
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
              <h2 className="text-primary-end font-bold tracking-widest uppercase mb-4">
                Contactez-nous
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Une Question ? Un Problème ?
              </h3>
              <p className="text-lg text-gray-600 mb-12">
                Notre équipe technique et notre support client sont à votre
                disposition.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center transition-all duration-500 ease-in-out group-hover:bg-secondary group-hover:text-white text-secondary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Localisation
                    </p>
                    <p className="font-bold text-secondary">
                      Nkongsamba, Cameroun
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center transition-all duration-500 ease-in-out group-hover:bg-secondary group-hover:text-white text-secondary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Facebook
                    </p>
                    <p className="font-bold text-secondary text-sm">
                      Fultang Polyclinic
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center transition-all duration-500 ease-in-out group-hover:bg-secondary group-hover:text-white text-secondary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Email
                    </p>
                    <p className="font-bold text-secondary">
                      fultangpolyclinic.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 bg-white"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 bg-white"
                      placeholder="jean@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Sujet
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 bg-white">
                    <option>Support Technique</option>
                    <option>Demande de formation</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 bg-white"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>
                <button className="w-full py-4 bg-secondary text-white font-bold rounded-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out shadow-md hover:shadow-lg">
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
              <div className="w-8 h-8 bg-gradient-to-r from-primary-start to-primary-end rounded-lg flex items-center justify-center shadow-md">
                <Activity className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-secondary">FULTANG</span>
            </div>

            <div className="flex gap-8">
              <a
                href="#"
                className="font-semibold text-gray-400 hover:text-primary-end transition-colors duration-500 ease-in-out"
              >
                Confidentialité
              </a>
              <a
                href="#"
                className="font-semibold text-gray-400 hover:text-primary-end transition-colors duration-500 ease-in-out"
              >
                Conditions
              </a>
              <a
                href="#"
                className="font-semibold text-gray-400 hover:text-primary-end transition-colors duration-500 ease-in-out"
              >
                Support
              </a>
            </div>

            <p className="text-gray-400 font-medium text-sm">
              © {new Date().getFullYear()} Fultang ERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
