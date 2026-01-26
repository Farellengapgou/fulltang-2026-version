import {FaEnvelope, FaSignOutAlt} from "react-icons/fa";
import {Tooltip} from "antd";
import {useAuthentication} from "../Utils/Provider.jsx";
import userIcon from "../assets/userIcon.png"
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import axiosInstance from "../Utils/axiosInstance.js";
import { AppRoutesPaths } from "../Router/appRouterPaths.js";
import ChatWindow from "../GlobalComponents/ChatWindow.jsx";

export function HelpCenter () {
    const {logout , userData} = useAuthentication();
    const navigate = useNavigate(); 
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // State for the support form
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
            console.error("Error while fetching categories", error);
            // Fallback categories if the API fails
            setCategories([
                {
                    title: "Consultations & Appointments",
                    description: "Guide to schedule or cancel an appointment",
                    link: AppRoutesPaths.consultationAppointments,
                },
                {
                    title: "Payments & Billing",
                    description: "Information about payments and refunds",
                    link: AppRoutesPaths.paymentsBilling,
                },
                {
                    title: "Technical Issues",
                    description: "Troubleshooting technical issues",
                    link: AppRoutesPaths.technicalIssues,
                },
                {
                    title: "FAQ",
                    description: "Answers to frequently asked questions",
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

    // Submit the support form
    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        
        if (!supportForm.topic || !supportForm.message) {
            setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
            return;
        }

        try {
            // Send to your support API here
            await axiosInstance.post('/medical/support/', {
                topic: supportForm.topic,
                message: supportForm.message,
                userId: userData?.id
            });

            setSubmitStatus({ 
                type: 'success', 
                message: 'Your message was sent successfully! We will reply soon.' 
            });
            setSupportForm({ topic: '', message: '' });
            
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            console.error("Support error:", error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Error while sending. Please try again or contact us directly.' 
            });
        }
    };

    // Popular articles with real links
    const popularArticles = [
        { 
            title: "How to schedule an appointment?", 
            link: AppRoutesPaths.consultationAppointments,
            description: "Step-by-step guide to create an appointment"
        },
        { 
            title: "How to check payment history?", 
            link: AppRoutesPaths.paymentsBilling,
            description: "Access and manage patient payments"
        },
        { 
            title: "What to do if there is a technical issue?", 
            link: AppRoutesPaths.technicalIssues,
            description: "Solutions to common issues"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="border-b-2 m-3 border-b-gray-300">
                <div className="w-full h-[70px] flex justify-between">
                    <h1 className="ml-3 text-4xl text-secondary mt-3.5 font-bold">
                        Help Center
                    </h1>
                    <div className="flex gap-3 mt-3.5 mb-4 mr-5">
                        <Tooltip placement={"top"} title={"Notifications"}>
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
                {/* Back arrow */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#50c2b9] hover:text-[#3aa99f] mt-4 ml-6"
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
                    Back
                </button>

                {/* Search bar */}
                <div className="container mx-auto mt-8 px-6">
                    <input
                        type="text"
                        placeholder="Search help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                </div>

                {/* Help Categories */}
                <div className="container mx-auto mt-8 px-6">
                    <h2 className="text-xl font-semibold mb-4">Help Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories
                            .filter(cat => 
                                cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                cat.description.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((category, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
                                    onClick={() => {
                                        const target = normalizeHelpLink(category.link);
                                        console.log("Navigating to:", target);
                                        navigate(target);
                                    }}
                                >
                                    <h3 className="text-lg font-medium mb-2">
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
                    <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
                    <div className="space-y-4">
                        {popularArticles.map((article, index) => (
                            <div 
                                key={index}
                                className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
                                onClick={() => navigate(article.link)}
                            >
                                <h3 className="text-lg font-medium mb-1">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-gray-600">{article.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Support */}
                <div className="container mx-auto mt-8 px-6 pb-8">
                    <h2 className="text-xl font-semibold mb-4">Customer Support</h2>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-medium mb-4">Contact Us</h3>
                        
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
                                <option value="">Select a topic</option>
                                <option value="technical">Technical issue</option>
                                <option value="billing">Billing</option>
                                <option value="account">User account</option>
                                <option value="other">Other</option>
                            </select>
                            
                            <textarea
                                placeholder="Describe your issue..."
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                value={supportForm.message}
                                onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                            ></textarea>
                            
                            <button
                                type="submit"
                                className="bg-[#50c2b9] text-white px-6 py-2 rounded-lg hover:bg-[#3aa99f] transition"
                            >
                                Send
                            </button>
                        </form>
                        
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-gray-600 mb-2">Other ways to contact us:</p>
                            <ul className="space-y-1 text-gray-700">
                                <li>📧 Email: support@fultang.cm</li>
                                <li>📞 Phone: +237 XXX XXX XXX</li>
                                <li>⏰ Available: Mon-Fri 8am-6pm</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-primary-end text-white mt-8 py-6">
                    <div className="container mx-auto px-6">
                        <div className="flex justify-between items-center">
                            <p>© 2025 Fultang Clinic. All rights reserved.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="hover:text-gray-200">Privacy Policy</a>
                                <a href="#" className="hover:text-gray-200">Terms of Use</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <ChatWindow />
        </div>
    );
}
