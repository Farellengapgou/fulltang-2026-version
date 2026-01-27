import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import loginBackground from "../../assets/logIn.png";

export function ConfirmPasswordReset() {
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useParams(); // Récupérer le token depuis l'URL

  useEffect(() => {
    const confirmReset = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de réinitialisation manquant");
        return;
      }

      try {
        const response = await axios.post(
          "http://127.0.0.1:8009/api/v1/auth/password-reset/confirm/",
          { token: token },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 200) {
          setStatus("success");
          setMessage(
            response.data.message ||
              "Votre mot de passe a été réinitialisé avec succès"
          );
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        if (err.response?.data) {
          const errors = err.response.data;
          if (errors.token) {
            setMessage(errors.token[0] || errors.token);
          } else if (errors.error) {
            setMessage(errors.error);
          } else {
            setMessage("Une erreur s'est produite lors de la confirmation");
          }
        } else {
          setMessage("Erreur de connexion au serveur");
        }
      }
    };

    confirmReset();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 font-sans text-gray-800">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBackground}
          alt="Confirmation Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Side */}
      <div className="relative mb-[50rem] ml-[2rem]">
        <Link to="/">
          <span className="text-3xl text-white font-bold">FULTANG</span>
        </Link>
      </div>

      <div className="relative z-10 ml-[1rem] text-white">
        <h2 className="text-6xl text-secondary font-semibold mb-10 leading-tight">
          Confirmation
        </h2>

        <p className="text-secondary text-3xl mb-8 leading-relaxed">
          Confirmation de la réinitialisation de votre mot de passe
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-black">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-secondary text-3xl">
              Sécurisé et crypté
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Confirmation Card */}
        <div className="ml-[13rem] mr-[10rem] p-10 bg-white flex flex-col justify-center rounded-2xl min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            {status === "loading" && (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  Confirmation en cours...
                </h3>
                <p className="text-gray-600 font-semibold">
                  Veuillez patienter pendant que nous confirmons votre demande
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  Succès !
                </h3>
                <p className="text-gray-600 font-semibold mb-8">{message}</p>
                <p className="text-gray-500 text-sm mb-8">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot
                  de passe.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out shadow-md hover:shadow-lg"
                >
                  Se Connecter
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">
                  Erreur de confirmation
                </h3>
                <p className="text-gray-600 font-semibold mb-8">{message}</p>
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8">
                  <p className="text-sm text-gray-700">
                    Le lien a peut-être expiré ou a déjà été utilisé. Veuillez
                    effectuer une nouvelle demande de réinitialisation.
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate("/forgotten-password")}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-[#3d9d94] transition-all duration-500 ease-in-out shadow-md hover:shadow-lg"
                  >
                    Nouvelle demande
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all duration-500 ease-in-out"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPasswordReset;