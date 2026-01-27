import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Mail,
  Clock,
} from "lucide-react";
import axios from "axios";
import loginBackground from "../../assets/logIn.png";
import { AppRoutesPaths as appRouterPaths } from "../../Router/appRouterPaths.js";

export function ForgottenPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation côté client
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    const commonPasswords = [
      "password",
      "123456",
      "12345678",
      "qwerty",
      "abc123",
      "letmein",
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      setError(
        "Ce mot de passe est trop commun. Veuillez en choisir un plus robuste.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8009/api/v1/auth/password-reset/request/",
        {
          email: email,
          password: password,
          password_confirmation: confirmPassword,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.status === 200) {
        setIsEmailSent(true);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        // Afficher les erreurs spécifiques du backend
        const errors = err.response.data;
        if (errors.email) {
          setError(errors.email[0] || errors.email);
        } else if (errors.password) {
          setError(errors.password[0] || errors.password);
        } else if (errors.password_confirmation) {
          setError(errors.password_confirmation[0] || errors.password_confirmation);
        } else {
          setError("Erreur lors de la réinitialisation. Vérifiez l'adresse email.");
        }
      } else {
        setError("Erreur de connexion au serveur. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 font-sans text-gray-800">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBackground}
          alt="Reset Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Side - Matching Login gradient */}
      <div className="relative mb-[50rem] ml-[2rem]">
        <Link to="/">
          <span className="text-3xl text-white font-bold">FULTANG</span>
        </Link>
      </div>

      <div className="relative z-10 ml-[1rem] text-white">
        <h2 className="text-6xl text-secondary font-semibold mb-10 leading-tight">
          Sécurité du Compte
        </h2>

        <p className="text-secondary text-3xl mb-8 leading-relaxed">
          Réinitialisez votre mot de passe en toute sécurité. Utilisez un mot
          de passe fort pour protéger vos accès.
        </p>

        <div className="space-y-3">
          {[
            { icon: ShieldCheck, text: "Au moins 8 caractères" },
            { icon: ShieldCheck, text: "Lettres, chiffres et symboles" },
          ].map((tip, idx) => (
            <div key={idx} className="flex items-center gap-2 text-black">
              <tip.icon className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-secondary text-3xl">
                {tip.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Form Side */}
        <div className="ml-[13rem] mr-[10rem] p-10 bg-white flex flex-col justify-center rounded-2xl">
          <AnimatePresence mode="wait">
            {!isEmailSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-secondary mb-2">
                    Réinitialisation
                  </h3>
                  <p className="text-gray-600 text-xl">
                    Créez un nouveau mot de passe
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                    <p className="text-red-700 text-sm font-semibold">
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xl font-semibold text-gray-600 mb-1 block">
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md bg-white focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 text-gray-800"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xl font-semibold text-gray-600 mb-1 block">
                      Nouveau Mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md bg-white focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 text-gray-800"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xl font-semibold text-gray-600 mb-1 block">
                      Confirmer
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md bg-white focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 text-gray-800"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-secondary text-md text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {loading ? "Traitement..." : "Réinitialiser"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="emailSent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  Email envoyé !
                </h3>
                <p className="text-gray-600 font-semibold mb-4">
                  Un email de confirmation a été envoyé à
                </p>
                <p className="text-secondary font-bold text-lg mb-8">
                  {email}
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
                  <div className="flex items-start gap-3 text-left">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-2">
                        Veuillez vérifier votre boîte de réception
                      </p>
                      <p className="text-gray-600">
                        Cliquez sur le lien dans l'email pour confirmer la
                        réinitialisation de votre mot de passe. Le lien expire
                        dans 24 heures.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out shadow-md hover:shadow-lg"
                >
                  Retour à la connexion
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isEmailSent && (
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex text-md items-center gap-2 text-gray-400 hover:text-secondary transition-colors duration-500 ease-in-out font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgottenPassword;