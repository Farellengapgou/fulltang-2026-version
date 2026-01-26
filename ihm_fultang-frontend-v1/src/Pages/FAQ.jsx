import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: "Général",
            questions: [
                {
                    q: "Qu'est-ce que Fultang ?",
                    a: "Fultang est une application de gestion hospitalière développée pour la Fultang Clinic. Elle permet de gérer les patients, consultations, rendez-vous, facturation, inventaire de médicaments et bien plus encore."
                },
                {
                    q: "Qui peut utiliser cette application ?",
                    a: "L'application est destinée au personnel médical : réceptionnistes, infirmières, médecins, administrateurs. Chaque rôle a des permissions spécifiques."
                },
                {
                    q: "Comment obtenir un compte ?",
                    a: "Seul l'administrateur système peut créer des comptes. Contactez votre superviseur pour obtenir vos identifiants."
                }
            ]
        },
        {
            category: "Patients",
            questions: [
                {
                    q: "Comment créer un nouveau dossier patient ?",
                    a: "Allez dans 'Patients' > 'Nouveau Patient', remplissez les informations obligatoires (nom, prénom, date de naissance, sexe) et sauvegardez. Un dossier médical sera automatiquement créé."
                },
                {
                    q: "Peut-on modifier les informations d'un patient ?",
                    a: "Oui, recherchez le patient, cliquez sur son dossier et sélectionnez 'Modifier'. Les modifications sont enregistrées avec l'horodatage et l'identifiant du personnel qui les a effectuées."
                },
                {
                    q: "Comment rechercher un patient ?",
                    a: "Utilisez la barre de recherche avec le nom, prénom, numéro de téléphone ou numéro CNI du patient. Le système affichera tous les résultats correspondants."
                }
            ]
        },
        {
            category: "Consultations",
            questions: [
                {
                    q: "Quelle est la différence entre un rendez-vous et une consultation ?",
                    a: "Un rendez-vous (Appointment) est une planification future. Une consultation est l'acte médical effectif avec examen, diagnostic et prescription."
                },
                {
                    q: "Comment créer une consultation ?",
                    a: "À partir d'un rendez-vous confirmé ou directement depuis le dossier patient. Sélectionnez le type de consultation, le médecin, et complétez les notes médicales."
                },
                {
                    q: "Les prix des consultations sont-ils fixes ?",
                    a: "Les prix sont configurés par type de consultation (Généraliste, Spécialiste, Dentiste, Ophtalmologue) et peuvent être modifiés par l'administrateur."
                }
            ]
        },
        {
            category: "Facturation",
            questions: [
                {
                    q: "Comment fonctionne la facturation ?",
                    a: "Les factures sont générées automatiquement et incluent : consultations, examens, médicaments prescrits, et hospitalisation. Chaque élément est détaillé avec son prix unitaire."
                },
                {
                    q: "Peut-on faire des paiements partiels ?",
                    a: "Oui, le système permet d'enregistrer des paiements partiels. Le statut de la facture sera mis à jour en conséquence (Invalid, Partial, Valid)."
                },
                {
                    q: "Comment imprimer une facture ?",
                    a: "Ouvrez la facture et cliquez sur 'Imprimer' ou 'Print'. Le système génère automatiquement un PDF avec tous les détails."
                }
            ]
        }
    ];

    const toggleQuestion = (categoryIdx, questionIdx) => {
        const key = `${categoryIdx}-${questionIdx}`;
        setOpenIndex(openIndex === key ? null : key);
    };

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
                        Questions Fréquemment Posées (FAQ)
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Trouvez rapidement des réponses à vos questions
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6">
                {faqs.map((category, catIdx) => (
                    <div key={catIdx} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-900 pb-2">
                            {category.category}
                        </h2>
                        <div className="space-y-3">
                            {category.questions.map((item, qIdx) => {
                                const key = `${catIdx}-${qIdx}`;
                                const isOpen = openIndex === key;
                                
                                return (
                                    <div key={qIdx} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <button
                                            onClick={() => toggleQuestion(catIdx, qIdx)}
                                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                        >
                                            <span className="font-semibold text-gray-800">{item.q}</span>
                                            {isOpen ? (
                                                <FaChevronUp className="text-blue-900 flex-shrink-0" />
                                            ) : (
                                                <FaChevronDown className="text-blue-900 flex-shrink-0" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 py-4 bg-gray-50 border-t">
                                                <p className="text-gray-700">{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;