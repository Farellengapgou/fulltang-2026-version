import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaReceipt, FaHistory } from 'react-icons/fa';

const PaymentsBilling = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Créer une facture",
            icon: <FaReceipt className="text-blue-900 text-2xl" />,
            content: [
                "Allez dans le menu 'Billing' ou 'Facturation'",
                "Cliquez sur 'Nouvelle facture' ou 'New Bill'",
                "Sélectionnez le patient concerné",
                "Ajoutez les éléments à facturer :",
                "  • Consultations (automatiquement au prix configuré)",
                "  • Examens demandés",
                "  • Médicaments prescrits",
                "  • Hospitalisation (si applicable)",
                "Le montant total est calculé automatiquement",
                "Vérifiez et confirmez la facture",
                "Un code unique est généré (format: YYYYMMDD-OperationID-CNI-UniqueID)"
            ]
        },
        {
            title: "Enregistrer un paiement",
            icon: <FaMoneyBillWave className="text-green-600 text-2xl" />,
            content: [
                "Trouvez la facture du patient",
                "Cliquez sur 'Enregistrer un paiement' ou 'Record Payment'",
                "Entrez le montant reçu",
                "Sélectionnez le mode de paiement (Cash, Mobile Money, Carte, etc.)",
                "Confirmez le paiement",
                "Le statut de la facture est mis à jour automatiquement",
                "Un reçu peut être imprimé pour le patient"
            ]
        },
        {
            title: "Consulter l'historique des paiements",
            icon: <FaHistory className="text-purple-600 text-2xl" />,
            content: [
                "Accédez à la section 'Historique des paiements'",
                "Utilisez les filtres disponibles :",
                "  • Par patient",
                "  • Par date",
                "  • Par mode de paiement",
                "  • Par statut (Payé/Non payé)",
                "Exportez les rapports si nécessaire",
                "Vérifiez les opérations comptables associées"
            ]
        }
    ];

    const billStatuses = [
        { status: "Invalid", color: "text-red-600", description: "Facture non payée" },
        { status: "Valid", color: "text-green-600", description: "Facture payée complètement" },
        { status: "Partial", color: "text-yellow-600", description: "Paiement partiel effectué" }
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
                        Paiements & Facturation
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Gérez les paiements et factures des patients
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            {section.icon}
                            <h2 className="text-xl font-semibold text-gray-800">
                                {section.title}
                            </h2>
                        </div>
                        <div className="space-y-2">
                            {section.content.map((item, i) => (
                                <p key={i} className={`text-gray-700 ${item.startsWith('  ') ? 'ml-8' : ''}`}>
                                    {item}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Statuts des factures
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {billStatuses.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <p className={`font-bold ${item.color} text-lg`}>
                                    {item.status}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsBilling;