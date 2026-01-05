import {FaCog, FaEnvelope, FaSignOutAlt, FaPaperPlane} from "react-icons/fa";
import {Tooltip} from "antd";
import {useAuthentication} from "../Utils/Provider.jsx";
import userIcon from "../assets/userIcon.png"
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import axiosInstance from "../Utils/axiosInstance.js";
import { AppRoutesPaths } from "../Router/appRouterPaths.js";

export function HelpCenter () {
    const {logout , userData} = useAuthentication();
    const navigate = useNavigate(); 
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // États pour le chatbot
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: '👋 Bonjour! Je suis votre assistant Fultang. Comment puis-je vous aider aujourd\'hui?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // États pour le formulaire de support
    const [supportForm, setSupportForm] = useState({
        topic: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState(null);
    const helpLinkMap = {
        "/help/consultations": AppRoutesPaths.consultationAppointments,
        "/help/payments": AppRoutesPaths.paymentsBilling,
        "/help/technical": AppRoutesPaths.technicalIssues,
        "/help/faq": AppRoutesPaths.faq,
    };

    const normalizeHelpLink = (link) => {
        if (!link) return link;
        if (helpLinkMap[link]) return helpLinkMap[link];
        return link;
    };

    useEffect(() => {
        const fetchCategories = async () => {
          try {
            const response = await axiosInstance.get("/help-center/categories/");
            setCategories(response.data);
            console.log("Categories loaded:", response.data);
          } catch (error) {
            console.error("Erreur lors de la récupération des catégories", error);
            // Catégories de secours si l'API échoue
            setCategories([
                {
                    title: "Consultations & Rendez-vous",
                    description: "Guide pour planifier ou annuler un rendez-vous",
                    link: AppRoutesPaths.consultationAppointments,
                },
                {
                    title: "Paiements & Facturation",
                    description: "Informations sur les paiements et remboursements",
                    link: AppRoutesPaths.paymentsBilling,
                },
                {
                    title: "Problèmes Techniques",
                    description: "Résolution des problèmes techniques",
                    link: AppRoutesPaths.technicalIssues,
                },
                {
                    title: "FAQ",
                    description: "Réponses aux questions fréquemment posées",
                    link: AppRoutesPaths.faq,
                }
            ]);
          }
        };
    
        fetchCategories();
    }, []);

    const applyNavLinkBtnStyle = () => {
        return " w-12 h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-xl hover:text-white transition-all duration-300";
    }

    // Fonction pour envoyer un message au chatbot
    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const newMessage = { sender: 'user', text: userInput };
        setChatMessages(prev => [...prev, newMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/chatbot/', {
                question: userInput
            });

            const botResponse = { 
                sender: 'bot', 
                text: response.data.response || "Désolé, je n'ai pas pu traiter votre demande." 
            };
            setChatMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Erreur chatbot:", error);
            const errorMessage = { 
                sender: 'bot', 
                text: "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter le support." 
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour soumettre le formulaire de support
    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        
        if (!supportForm.topic || !supportForm.message) {
            setSubmitStatus({ type: 'error', message: 'Veuillez remplir tous les champs' });
            return;
        }

        try {
            // Ici, vous pouvez envoyer à votre API de support
            await axiosInstance.post('/medical/support/', {
                topic: supportForm.topic,
                message: supportForm.message,
                userId: userData?.id
            });

            setSubmitStatus({ 
                type: 'success', 
                message: 'Votre message a été envoyé avec succès! Nous vous répondrons bientôt.' 
            });
            setSupportForm({ topic: '', message: '' });
            
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            console.error("Erreur support:", error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Erreur lors de l\'envoi. Réessayez ou contactez-nous directement.' 
            });
        }
    };

    // Articles populaires avec des liens réels
    const popularArticles = [
        { 
            title: "Comment prendre un rendez-vous?", 
            link: AppRoutesPaths.consultationAppointments,
            description: "Guide étape par étape pour créer un rendez-vous"
        },
        { 
            title: "Comment vérifier l'historique des paiements?", 
            link: AppRoutesPaths.paymentsBilling,
            description: "Accéder et gérer les paiements des patients"
        },
        { 
            title: "Que faire en cas de problème technique?", 
            link: AppRoutesPaths.technicalIssues,
            description: "Solutions aux problèmes courants"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* En-tête */}
            <div className="border-b-2 m-3 border-b-gray-300">
                <div className="w-full h-[70px] flex justify-between">
                    <h1 className="ml-3 text-4xl text-secondary mt-3.5 font-bold">
                        Help Center
                    </h1>
                    <div className="flex gap-3 mt-3.5 mb-4 mr-5">
                        <Tooltip placement={"top"} title={"settings"}>
                            <button className={applyNavLinkBtnStyle()}>
                                <FaCog/>
                            </button>
                        </Tooltip>

                        <Tooltip placement={"top"} title={"Messages"}>
                            <button className={applyNavLinkBtnStyle()}>
                                <FaEnvelope/>
                            </button>
                        </Tooltip>
                        
                        <Tooltip placement={"top"} title={"LogOut"}>
                            <button
                                onClick={() => {logout()}}
                                className={" w-12 h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-xl hover:text-red-500 transition-all duration-300"}>
                                <FaSignOutAlt/>
                            </button>
                        </Tooltip>
                        
                        <Tooltip placement={"top"} title={"Profile"}>
                            <button className="ml-3 flex">
                                <p className="font-bold text-secondary text-xl mt-2">
                                    {"Hello " + userData?.username + "!"}
                                </p>
                                <img src={userIcon} alt={"user-icon"} className="w-12 h-12 ml-2 mr-3"/>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gray-100">
                {/* Flèche de retour */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-800 hover:text-blue-900 mt-4 ml-6"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Retour
                </button>

                {/* Barre de recherche */}
                <div className="container mx-auto mt-8 px-6">
                    <input
                        type="text"
                        placeholder="Rechercher dans l'aide..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                </div>

                {/* Help Categories */}
                <div className="container mx-auto mt-8 px-6">
                    <h2 className="text-xl font-semibold mb-4">Catégories d'aide</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories
                            .filter(cat => 
                                cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                cat.description.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((category, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                                    onClick={() => {
                                        const target = normalizeHelpLink(category.link);
                                        console.log("Navigating to:", target);
                                        navigate(target);
                                    }}
                                >
                                    <h3 className="text-lg font-medium mb-2 text-blue-900">
                                        {category.title}
                                    </h3>
                                    <p className="text-gray-600">{category.description}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Popular Articles */}
                <div className="container mx-auto mt-8 px-6">
                    <h2 className="text-xl font-semibold mb-4">Articles Populaires</h2>
                    <div className="space-y-4">
                        {popularArticles.map((article, index) => (
                            <div 
                                key={index}
                                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => navigate(article.link)}
                            >
                                <h3 className="text-lg font-medium text-blue-900 mb-1">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-gray-600">{article.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chatbot Section */}
                <div className="container mx-auto mt-8 px-6">
                    <h2 className="text-xl font-semibold mb-4">Assistant Virtuel</h2>
                    <div className="bg-white rounded-lg shadow-md">
                        <div 
                            className="p-4 bg-blue-900 text-white rounded-t-lg cursor-pointer flex justify-between items-center"
                            onClick={() => setIsChatOpen(!isChatOpen)}
                        >
                            <h3 className="font-medium">💬 Discutez avec notre assistant</h3>
                            <span>{isChatOpen ? '▼' : '▶'}</span>
                        </div>
                        
                        {isChatOpen && (
                            <>
                                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
                                    {chatMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-lg ${
                                                    msg.sender === 'user'
                                                        ? 'bg-blue-900 text-white'
                                                        : 'bg-white border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-200 p-3 rounded-lg">
                                                <p className="text-sm text-gray-500">En train d'écrire...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4 border-t flex gap-2">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Posez votre question..."
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !userInput.trim()}
                                        className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Customer Support */}
                <div className="container mx-auto mt-8 px-6 pb-8">
                    <h2 className="text-xl font-semibold mb-4">Support Client</h2>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-medium mb-4">Contactez-nous</h3>
                        
                        {submitStatus && (
                            <div className={`p-4 mb-4 rounded-lg ${
                                submitStatus.type === 'success' 
                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                    : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                                {submitStatus.message}
                            </div>
                        )}
                        
                        <form className="space-y-4" onSubmit={handleSupportSubmit}>
                            <select 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={supportForm.topic}
                                onChange={(e) => setSupportForm({...supportForm, topic: e.target.value})}
                            >
                                <option value="">Sélectionnez un sujet</option>
                                <option value="technical">Problème technique</option>
                                <option value="billing">Facturation</option>
                                <option value="account">Compte utilisateur</option>
                                <option value="other">Autre</option>
                            </select>
                            
                            <textarea
                                placeholder="Décrivez votre problème..."
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                value={supportForm.message}
                                onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                            ></textarea>
                            
                            <button
                                type="submit"
                                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                            >
                                Envoyer
                            </button>
                        </form>
                        
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-gray-600 mb-2">Autres moyens de nous contacter:</p>
                            <ul className="space-y-1 text-gray-700">
                                <li>📧 Email: support@fultang.cm</li>
                                <li>📞 Téléphone: +237 XXX XXX XXX</li>
                                <li>⏰ Disponible: Lun-Ven 8h-18h</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-800 text-white mt-8 py-6">
                    <div className="container mx-auto px-6">
                        <div className="flex justify-between items-center">
                            <p>© 2025 Fultang Clinic. Tous droits réservés.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="hover:text-blue-500">Politique de confidentialité</a>
                                <a href="#" className="hover:text-blue-500">Conditions d'utilisation</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
