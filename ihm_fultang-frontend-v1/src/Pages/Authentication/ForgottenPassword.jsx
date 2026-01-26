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
  Activity,
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
        "http://127.0.0.1:8009/api/v1/auth/reset-password/",
        {
          email: email,
          password: password,
          password_confirmation: confirmPassword,
        },
        { headers: { "Content-Type": "application/json" } },
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
                <span className="text-3xl  text-white font-bold">FULTANG</span>
              </Link>
            </div>

            <div className="relative z-10 ml-[1rem] text-white">

              <h2 className="text-6xl text-secondary text-black font-semibold mb-10 leading-tight">
                Sécurité du Compte
              </h2>

              <p className="text-black text-secondary text-3xl mb-8 leading-relaxed">
                Réinitialisez votre mot de passe en toute sécurité. Utilisez un
                mot de passe fort pour protéger vos accès.
              </p>

              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, text: "Au moins 8 caractères" },
                  { icon: ShieldCheck, text: "Lettres, chiffres et symboles" },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-black"
                  >
                    <tip.icon className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-secondary text-3xl">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

      <div className="container mx-auto px-6 relative z-10">
          {/* Form Side */}
          <div className="ml-[13rem] mr-[10rem] p-10 bg-white flex flex-col justify-center rounded-2xl">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-md bg-white focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300 text-gray-800"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-secondary text-md text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out flex items-center justify-center gap-2 mt-4"
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
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">
                    Succès !
                  </h3>
                  <p className="text-gray-600 font-semibold mb-8">
                    Votre mot de passe a été mis à jour. Vous pouvez maintenant
                    vous connecter.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out shadow-md hover:shadow-lg"
                  >
                    Se Connecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex text-md items-center gap-2 text-gray-400 hover:text-secondary transition-colors duration-500 ease-in-out font-semibold"
              >
                <ArrowLeft className="w-4 h-4"/>
                Retour à la connexion
              </Link>
            </div>
          </div>
      </div>
    </div>
  );
}

export default ForgottenPassword;
