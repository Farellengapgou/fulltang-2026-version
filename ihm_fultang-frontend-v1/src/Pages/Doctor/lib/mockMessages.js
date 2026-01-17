// Mock data pour les messages du médecin
export const mockMessages = [
  {
    id: 1,
    subject: "Résultats d'analyse urgents",
    content: "Les résultats de l'analyse sanguine du patient Martin montrent des anomalies importantes. Veuillez consulter le dossier dès que possible.",
    senderName: "Dr. Sophie Laurent",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Il y a 2 heures
  },
  {
    id: 2,
    subject: "Demande de consultation",
    content: "Un patient souhaite prendre rendez-vous pour une consultation de suivi. Merci de confirmer votre disponibilité.",
    senderName: "Secrétariat Médical",
    priority: "medium",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // Il y a 5 heures
  },
  {
    id: 3,
    subject: "Rappel: Réunion d'équipe",
    content: "N'oubliez pas la réunion d'équipe prévue demain à 14h00 en salle de conférence.",
    senderName: "Administration",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Il y a 1 jour
  },
  {
    id: 4,
    subject: "Nouvelle prescription à valider",
    content: "Une nouvelle prescription pour Mme Dubois est en attente de validation. Le patient attend la confirmation.",
    senderName: "Pharmacie Centrale",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // Il y a 30 minutes
  },
  {
    id: 5,
    subject: "Mise à jour du protocole",
    content: "Le protocole de traitement pour les patients diabétiques a été mis à jour. Veuillez consulter la nouvelle version dans l'espace documentaire.",
    senderName: "Direction Médicale",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Il y a 2 jours
  },
  {
    id: 6,
    subject: "Demande d'avis médical",
    content: "Le Dr. Bernard sollicite votre avis sur un cas complexe de cardiologie. Merci de le contacter dès que possible.",
    senderName: "Dr. Jean Bernard",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // Il y a 1 heure
  },
  {
    id: 7,
    subject: "Confirmation de rendez-vous",
    content: "Le rendez-vous avec M. Petit pour demain 10h00 a été confirmé.",
    senderName: "Secrétariat",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // Il y a 3 jours
  },
  {
    id: 8,
    subject: "Alerte: Stock médicaments",
    content: "Le stock de certains médicaments essentiels est faible. Veuillez vérifier vos prescriptions.",
    senderName: "Gestion des Stocks",
    priority: "medium",
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // Il y a 6 heures
  },
  {
    id: 9,
    subject: "Formation continue",
    content: "Inscription ouverte pour la formation sur les nouvelles techniques chirurgicales. Places limitées.",
    senderName: "Service Formation",
    priority: "low",
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // Il y a 4 jours
  },
  {
    id: 10,
    subject: "Urgence: Patient en salle d'attente",
    content: "Un patient présente des symptômes inquiétants en salle d'attente. Intervention requise immédiatement.",
    senderName: "Infirmerie",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // Il y a 15 minutes
  }
];
