import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaBug, FaQuestionCircle } from 'react-icons/fa';

const TechnicalIssues = () => {
    const navigate = useNavigate();

    const commonIssues = [
        {
            problem: "Je ne peux pas me connecter au système",
            icon: <FaExclamationTriangle className="text-red-600" />,
            solutions: [
                "Vérifiez que votre nom d'utilisateur et mot de passe sont corrects",
                "Assurez-vous que CAPS LOCK n'est pas activé",
                "Contactez l'administrateur si vous avez oublié votre mot de passe",
                "Vérifiez votre connexion internet"
            ]
        },
        {
            problem: "Les données ne se chargent pas",
            icon: <FaBug className="text-orange-600" />,
            solutions: [
                "Actualisez la page (F5 ou Ctrl+R)",
                "Videz le cache de votre navigateur",
                "Vérifiez votre connexion internet",
                "Si le problème persiste, contactez le support technique"
            ]
        },
        {
            problem: "Erreur lors de l'enregistrement",
            icon: <FaExclamationTriangle className="text-yellow-600" />,
            solutions: [
                "Vérifiez que tous les champs obligatoires sont remplis",
                "Assurez-vous que les formats de données sont corrects (dates, numéros, etc.)",
                "Essayez de vous déconnecter et reconnecter",
                "Notez le message d'erreur et contactez le support"
            ]
        },
        {
            problem: "Le chatbot ne répond pas",
            icon: <FaQuestionCircle className="text-blue-600" />,
            solutions: [
                "Vérifiez que le service chatbot est activé",
                "Assurez-vous que votre question est claire et en français",
                "Actualisez la page",
                "En cas de problème persistant, utilisez le formulaire de support"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-md mb-6">
                <div className="container mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-900 hover:text-blue-700 mb-4"
                    >
                        <FaArrowLeft /> Retour
                    </button>
                    <h1 className="text-3xl font-bold text-blue-900">
                        Problèmes Techniques
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Solutions aux problèmes techniques courants
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Conseil</h3>
                    <p className="text-blue-800">
                        Avant de contacter le support, essayez les solutions ci-dessous. 
                        90% des problèmes peuvent être résolus rapidement !
                    </p>
                </div>

                {commonIssues.map((issue, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            {issue.icon}
                            <h2 className="text-xl font-semibold text-gray-800">
                                {issue.problem}
                            </h2>
                        </div>
                        <div className="ml-8">
                            <h3 className="font-semibold text-gray-700 mb-2">Solutions :</h3>
                            <ol className="space-y-2">
                                {issue.solutions.map((solution, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                                            ✓
                                        </span>
                                        <span className="text-gray-700 pt-0.5">{solution}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ))}

                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <h3 className="font-bold text-red-800 mb-2">🆘 Support d'urgence</h3>
                    <p className="text-red-700 mb-3">
                        Si aucune de ces solutions ne fonctionne :
                    </p>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                        <li>Contactez le support technique : support@fultang.cm</li>
                        <li>Appelez le : +237 XXX XXX XXX</li>
                        <li>Utilisez le formulaire de contact dans le Help Center</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TechnicalIssues;