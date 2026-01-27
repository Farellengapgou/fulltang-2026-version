
import { useEffect, useState } from "react"
import { DentistNavBar } from "./DentistComponents/DentistNavBar.jsx"
import { dentistNavLink } from "./lib/dentistNavLink.js"
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx"
import { Bell, Trash2, Mail } from "lucide-react"
import { useAuthentication } from "../../Utils/Provider.jsx"
import { Modal } from "antd"
import axiosInstance from "../../Utils/axiosInstance.js"
import Loader from "../../GlobalComponents/Loader.jsx"
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx"
import { useNotificationSocket } from "../../Utils/useNotificationSocket.js"

// PAGINATION: Actuellement SimplePagination (frontend), passer à Pagination (backend) quand l'API sera prête
import SimplePagination from "../../GlobalComponents/SimplePagination.jsx"
// import Pagination from "../../GlobalComponents/Pagination.jsx" // Décommenter pour pagination backend


export function DentistMessagePage({
  DashboardComponent = CustomDashboard,
  NavBarComponent = DentistNavBar,
  navLink = dentistNavLink,
  requiredRole = "Dentist",
  showComposer = false,
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const messagesPerPage = 9
  const [messageList, setMessageList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorStatus, setErrorStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState("")
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [isStaffLoading, setIsStaffLoading] = useState(false)
  const [composeRole, setComposeRole] = useState("ALL")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeMessage, setComposeMessage] = useState("")
  const [sendStatus, setSendStatus] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([])

  // PAGINATION BACKEND: Décommenter ces états quand vous passerez à la pagination backend
  // const [nextUrl, setNextUrl] = useState(null)
  // const [previousUrl, setPreviousUrl] = useState(null)
  // const [totalPages, setTotalPages] = useState(1)

  const { userData } = useAuthentication()

  const normalizeNotification = (notification) => {
    const priority = (notification?.computed_priority || notification?.priority || "GREEN").toUpperCase()
    return {
      id: notification?.id,
      title: notification?.event_type || "Notification",
      message: notification?.message || "",
      date: notification?.created_at || new Date().toISOString(),
      priority,
      senderName: notification?.data?.senderName || notification?.data?.sender_name || "System",
      isRead: false,
    }
  }

  // Récupérer les notifications internes du médecin (API)
  async function retrieveDoctorNotifications() {
    setIsNotificationsLoading(true)
    setNotificationsError("")
    try {
      const response = await axiosInstance.get("/notification/")
      const results = response.data?.results ?? response.data ?? []
      const normalized = results.map(normalizeNotification)
      setNotifications(normalized)
    } catch (error) {
      console.log(error)
      setNotificationsError("Erreur lors de la récupération des notifications.")
    } finally {
      setIsNotificationsLoading(false)
    }
  }

  const normalizeMessage = (message) => {
    const priorityMap = {
      REPORT_PROBLEM: "high",
      HOSPITALISATION_REQUEST: "high",
      CONSULTATION_REQUEST: "medium",
      ACCESS_REQUEST: "medium",
      INFO: "low",
    }
    return {
      id: message?.id,
      subject: message?.reason || "Notification",
      senderName: "Administration",
      content: message?.message || "",
      createdAt: message?.addAt || new Date().toISOString(),
      isRead: false,
      priority: priorityMap[message?.messageType] || "low",
    }
  }

  async function retrieveDoctorMessages() {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get("/message/")
      const results = response.data?.results ?? response.data ?? []
      const normalized = results.map(normalizeMessage)
      setMessageList(normalized)
      if (userData?.role && userData.role !== "Admin") {
        const welcomeKey = `fultang_welcome_message_${userData.id}`
        if (!localStorage.getItem(welcomeKey) && normalized.length === 0) {
          const displayName = userData?.username || "Utilisateur"
          const welcomeMessage = {
            id: `welcome-${userData.id}`,
            subject: "Bienvenue sur Fultang",
            senderName: "Fultang",
            content: `Bonjour ${displayName}, bienvenue sur Fultang. Nous sommes heureux de vous compter parmi nous.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            priority: "low",
          }
          setMessageList([welcomeMessage])
          localStorage.setItem(welcomeKey, "true")
        }
      }
      setErrorStatus(null)
      setErrorMessage("")
    } catch (error) {
      setErrorStatus(error.status)
      setErrorMessage("Erreur lors de la récupération de vos notifications !")
    } finally {
      setIsLoading(false)
    }
  }

  /* VERSION API AVEC PAGINATION BACKEND - À utiliser quand l'endpoint sera prêt
  async function retrieveDoctorMessages(doctorId, page = 1) {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(`/messages/doctor/${doctorId}/?page=${page}`)
      setIsLoading(false)
      if (response.status === 200) {
        // L'API doit retourner: { results: [...], next: "url", previous: "url", count: total }
        setMessageList(response.data.results)
        setNextUrl(response.data.next)
        setPreviousUrl(response.data.previous)
        setTotalPages(Math.ceil(response.data.count / messagesPerPage))
        setErrorStatus(null)
        setErrorMessage("")
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
      setErrorStatus(error.status)
      setErrorMessage("Erreur lors de la récupération de vos notifications !")
    }
  }

  // Fonction pour charger la page suivante/précédente
  async function fetchNextOrPreviousMessages(url) {
    if (!url) return
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(url)
      setIsLoading(false)
      if (response.status === 200) {
        setMessageList(response.data.results)
        setNextUrl(response.data.next)
        setPreviousUrl(response.data.previous)
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
    }
  }
  */

  // Marquer un message comme lu (VERSION MOCK)
  function markAsRead(messageId) {
    setMessageList(prev =>
      prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg)
    )
  }

  /* VERSION API
  async function markAsRead(messageId) {
    try {
      await axiosInstance.patch(`/messages/${messageId}/`, { isRead: true })
      setMessageList(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg)
      )
    } catch (error) {
      console.log("Erreur lors du marquage du message", error)
    }
  }
  */

  // Supprimer un message (VERSION MOCK)
  function deleteMessage(messageId) {
    if (typeof messageId === "string" && messageId.startsWith("welcome-")) {
      setMessageList(prev => prev.filter(msg => msg.id !== messageId))
      if (selectedMessage?.id === messageId) {
        setIsModalOpen(false)
        setSelectedMessage(null)
      }
      return
    }
    const performDelete = async () => {
      try {
        await axiosInstance.delete(`/message/${messageId}/`)
        setMessageList(prev => prev.filter(msg => msg.id !== messageId))
        if (selectedMessage?.id === messageId) {
          setIsModalOpen(false)
          setSelectedMessage(null)
        }
      } catch (error) {
        console.log("Erreur lors de la suppression", error)
      }
    }
    performDelete()
  }

  /* VERSION API
  async function deleteMessage(messageId) {
    try {
      await axiosInstance.delete(`/messages/${messageId}/`)
      setMessageList(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      console.log("Erreur lors de la suppression", error)
    }
  }
  */

  // Ouvrir le message dans une modal
  function openMessage(message) {
    setSelectedMessage(message)
    setEditedContent(message?.content || "")
    setIsEditingMessage(false)
    setIsModalOpen(true)
    if (!message.isRead) {
      markAsRead(message.id)
    }
  }

  // Fermer la modal
  function closeModal() {
    setIsModalOpen(false)
    setSelectedMessage(null)
    setIsEditingMessage(false)
    setEditedContent("")
  }

  function openNotification(notification) {
    setSelectedNotification(notification)
    setIsNotificationModalOpen(true)
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      )
    }
  }

  function closeNotificationModal() {
    setIsNotificationModalOpen(false)
    setSelectedNotification(null)
  }

  function handleSaveEdit() {
    if (!selectedMessage) return
    setMessageList(prev =>
      prev.map(msg =>
        msg.id === selectedMessage.id ? { ...msg, content: editedContent } : msg
      )
    )
    setSelectedMessage(prev => prev ? { ...prev, content: editedContent } : prev)
    setIsEditingMessage(false)
  }

  async function deleteAllMessages() {
    if (messageList.length === 0) return
    try {
      const deletable = messageList.filter((msg) => !(typeof msg.id === "string" && msg.id.startsWith("welcome-")))
      await Promise.all(deletable.map((msg) => axiosInstance.delete(`/message/${msg.id}/`)))
      setMessageList(messageList.filter((msg) => typeof msg.id === "string" && msg.id.startsWith("welcome-")))
      setIsModalOpen(false)
      setSelectedMessage(null)
    } catch (error) {
      console.log("Erreur lors de la suppression de tous les messages", error)
    }
  }

  useEffect(() => {
    retrieveDoctorNotifications()
    retrieveDoctorMessages()
    // VERSION API BACKEND PAGINATION: 
    // if (userData.id) {
    //   retrieveDoctorMessages(userData.id, currentPage)
    // }
  }, [])

  useEffect(() => {
    if (!showComposer) return
    let isMounted = true
    const fetchAllStaff = async () => {
      setIsStaffLoading(true)
      setSendStatus("")
      try {
        let nextUrl = "/medical-staff/?page_size=50"
        const collected = []
        while (nextUrl) {
          const response = await axiosInstance.get(nextUrl)
          const data = response.data?.results ?? response.data ?? []
          collected.push(...data)
          nextUrl = response.data?.next
          if (nextUrl && nextUrl.startsWith("http")) {
            nextUrl = nextUrl.replace(import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL, "")
          }
        }
        if (isMounted) {
          setStaffList(collected)
        }
      } catch (error) {
        console.log(error)
        if (isMounted) {
          setSendStatus("Impossible de charger les utilisateurs.")
        }
      } finally {
        if (isMounted) {
          setIsStaffLoading(false)
        }
      }
    }
    fetchAllStaff()
    return () => {
      isMounted = false
    }
  }, [showComposer])

  useNotificationSocket((payload) => {
    if (!payload?.id) return
    const incoming = normalizeNotification(payload)
    setNotifications((prev) => {
      const exists = prev.find((item) => item.id === incoming.id)
      if (exists) {
        return prev.map((item) => (item.id === incoming.id ? { ...item, ...incoming } : item))
      }
      return [incoming, ...prev]
    })
  })

  useEffect(() => {
    setSelectedRecipientIds([])
  }, [composeRole])

  const roleOptions = [
    { value: "ALL", label: "Tous les acteurs" },
    { value: "Doctor", label: "Médecins" },
    { value: "Nurse", label: "Infirmiers" },
    { value: "Labtech", label: "Laborantins" },
    { value: "Receptionist", label: "Réceptionnistes" },
    { value: "Pharmacist", label: "Pharmaciens" },
    { value: "Cashier", label: "Caissiers" },
    { value: "Accountant", label: "Comptables" },
    { value: "Admin", label: "Admins" },
  ]

  const filteredStaff = staffList.filter((staff) => {
    if (composeRole === "ALL") return true
    return staff.role === composeRole
  })

  const doctorRoles = new Set(["Doctor", "Specialist", "Ophtalmologist", "Dentist"])
  const roleLabelMap = {
    Doctor: "Médecins",
    Nurse: "Infirmiers",
    Labtech: "Laborantins",
    Receptionist: "Réceptionnistes",
    Pharmacist: "Pharmaciens",
    Cashier: "Caissiers",
    Accountant: "Comptables",
    Admin: "Admins",
  }

  const roleStaff = staffList.filter((staff) => {
    if (composeRole === "Doctor") {
      return doctorRoles.has(staff.role)
    }
    if (composeRole === "ALL") return false
    return staff.role === composeRole
  })

  const selectedRecipients = roleStaff.filter((staff) => selectedRecipientIds.includes(staff.id))

  const toggleRecipient = (staffId) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    )
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!composeSubject.trim() || !composeMessage.trim()) {
      setSendStatus("Veuillez remplir le sujet et le contenu de la notification.")
      return
    }
    if (composeRole !== "ALL" && selectedRecipientIds.length === 0) {
      const roleLabel = roleLabelMap[composeRole] || "destinataire"
      setSendStatus(`Veuillez sélectionner au moins un ${roleLabel.toLowerCase()}.`)
      return
    }
    const recipientsToSend = composeRole === "ALL" ? filteredStaff : selectedRecipients
    if (recipientsToSend.length === 0) {
      setSendStatus("Aucun destinataire trouvé.")
      return
    }
    setIsSending(true)
    setSendStatus("")
    try {
      await Promise.all(
        recipientsToSend.map((staff) =>
          axiosInstance.post("/message/", {
            idMedicalStaff: staff.id,
            reason: composeSubject,
            message: composeMessage,
            messageType: "INFO",
          })
        )
      )
      setSendStatus("Notification(s) envoyée(s) avec succès.")
      setComposeSubject("")
      setComposeMessage("")
    } catch (error) {
      console.log(error)
      setSendStatus("Erreur lors de l'envoi des notifications.")
    } finally {
      setIsSending(false)
    }
  }

  // FILTRAGE DES MESSAGES
  // NOTE: Avec pagination backend, les filtres devront être envoyés comme paramètres à l'API
  // Exemple: /messages/doctor/${doctorId}/?page=${page}&priority=${priorityFilter}&status=${statusFilter}&search=${searchTerm}
  const filteredMessages = messageList.filter((message) => {
    const matchesSearch =
      message?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message?.senderName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "all" || message?.priority === priorityFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !message?.isRead) ||
      (statusFilter === "read" && message?.isRead)
    return matchesSearch && matchesPriority && matchesStatus
  })

  // PAGINATION FRONTEND (SimplePagination)
  // NOTE: Avec pagination backend, supprimer ces lignes car l'API retourne déjà la page demandée
  const indexOfLastMessage = currentPage * messagesPerPage
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage)
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Fonction pour obtenir le style selon la priorité
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-white",
          border: "border-l-4 border-red-500",
          badge: "bg-red-500",
          text: "text-red-700"
        }
      case "medium":
        return {
          bg: "bg-white",
          border: "border-l-4 border-yellow-500",
          badge: "bg-yellow-500",
          text: "text-yellow-700"
        }
      case "low":
        return {
          bg: "bg-white",
          border: "border-l-4 border-green-500",
          badge: "bg-green-500",
          text: "text-green-700"
        }
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high": return "Urgent"
      case "medium": return "Alerte"
      case "low": return "Info"
      case "RED": return "Urgent"
      case "YELLOW": return "Alerte"
      case "GREEN": return "Info"
    }
  }

  return (
    <DashboardComponent linkList={navLink} requiredRole={requiredRole}>
      <NavBarComponent messageCount={messageList.filter(m => !m.isRead).length + notifications.filter(n => !n.isRead).length} />
      <div className="mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Notifications
          </h1>
        </div>

        {showComposer && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Envoyer une notification</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destinataires
                  </label>
                  <select
                    value={composeRole}
                    onChange={(e) => setComposeRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-end focus:border-transparent bg-white"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {composeRole !== "ALL" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {roleLabelMap[composeRole] || "Destinataires"}
                    </label>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-auto space-y-2">
                      {isStaffLoading ? (
                        <p className="text-sm text-gray-500">Chargement des utilisateurs...</p>
                      ) : roleStaff.length > 0 ? (
                        roleStaff.map((staff) => (
                          <label key={staff.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={selectedRecipientIds.includes(staff.id)}
                              onChange={() => toggleRecipient(staff.id)}
                              className="h-4 w-4 text-primary-end border-gray-300 rounded"
                            />
                            <span>
                              {composeRole === "Dentist" ? "Dr. " : ""}
                              {staff.first_name} {staff.last_name}
                              {staff.role ? ` (${staff.role})` : ""}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Aucun utilisateur disponible.</p>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-end focus:border-transparent"
                    placeholder="Sujet de la notification"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification
                </label>
                <textarea
                  rows={4}
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-end focus:border-transparent"
                  placeholder="Ecrivez votre notification..."
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSending || isStaffLoading}
                  className="px-6 py-2 bg-primary-end text-white rounded-lg hover:bg-primary-start transition-colors disabled:opacity-60"
                >
                  {isSending ? "Envoi..." : "Envoyer"}
                </button>
                {sendStatus && (
                  <span className="text-sm text-gray-600">{sendStatus}</span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Rechercher
      </label>
      <input
        type="text"
        placeholder="Rechercher une notification..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-primary-end focus:border-transparent
                   transition-all duration-200 hover:border-gray-400
                   placeholder:text-gray-400"
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Priorité
      </label>
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-primary-end focus:border-transparent
                   transition-all duration-200 hover:border-gray-400
                   bg-white cursor-pointer appearance-none"
      >
        <option value="all">Toutes les priorités</option>
        <option value="high">Urgent</option>
        <option value="medium">Alerte</option>
        <option value="low">Info</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Statut
      </label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-primary-end focus:border-transparent
                   transition-all duration-200 hover:border-gray-400
                   bg-white cursor-pointer appearance-none"
      >
        <option value="all">Tous les statuts</option>
        <option value="unread">Non lus</option>
        <option value="read">Lus</option>
      </select>
    </div>
  </div>
</div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Notifications internes</h2>
          {isNotificationsLoading ? (
            <div className="h-[200px] w-full flex justify-center items-center">
              <Loader size={"medium"} color={"primary-end"} />
            </div>
          ) : notificationsError ? (
            <p className="text-red-600">{notificationsError}</p>
          ) : notifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {notifications.map((notification) => {
                const style = getPriorityStyle(notification.priority === "RED" ? "high" : notification.priority === "YELLOW" ? "medium" : "low")
                return (
                  <div
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                    className={`${style.bg} ${style.border} rounded-lg p-4 shadow hover:shadow-lg transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`${style.badge} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                          {getPriorityLabel(notification.priority)}
                        </span>
                      </div>
                      {!notification.isRead && (
                        <span className="bg-gradient-to-t from-primary-start to-primary-end text-white text-xs px-2 py-1 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                      {notification.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2">
                      De: <span className="font-semibold">{notification.senderName}</span>
                    </p>

                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-600">Aucune notification pour le moment.</p>
          )}
        </div>

        {/* Liste des messages - Cards cliquables */}
        {isLoading ? (
          <div className="h-[400px] w-full flex justify-center items-center">
            <Loader size={"medium"} color={"primary-end"} />
          </div>
        ) : errorStatus ? (
          <ServerErrorPage errorStatus={errorStatus} message={errorMessage} />
        ) : filteredMessages.length > 0 ? (
          <div className="grid grid-cols-1  gap-4">
            {currentMessages.map((message) => {
              const style = getPriorityStyle(message.priority)
              return (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`${style.bg} ${style.border} rounded-lg p-4 shadow hover:shadow-lg transition-all cursor-pointer transform hover:scale-85 duration-200 `}           >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`${style.badge} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                        {getPriorityLabel(message.priority)}
                      </span>
                    </div>
                    {!message.isRead && (
                      <span className="bg-gradient-to-t from-primary-start to-primary-end text-white text-xs px-2 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {message.subject}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    De: <span className="font-semibold">{message.senderName}</span>
                  </p>

                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                    {message.content}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMessage(message.id)
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 mt-8 flex items-center justify-center">
            <div className="flex flex-col">
              <Bell className="h-16 w-16 text-primary-end mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">
                Aucune notification
              </h2>
              <p className="text-gray-600 mb-4 mx-auto">
                Il n'y a actuellement aucune notification.
              </p>
              <button
                className="px-4 hover:bg-primary-start duration-300 mx-auto py-2 bg-primary-end text-white rounded-lg transition-all"
                onClick={() => window.location.reload()}
              >
                Actualiser
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredMessages.length > messagesPerPage && (
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />

          /* PAGINATION BACKEND - Remplacer SimplePagination par Pagination quand l'API sera prête:
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            fetchNextOrPreviousPatientList={fetchNextOrPreviousMessages}
            nextUrlForRenderPatientList={nextUrl}
            previousUrlForRenderPatientList={previousUrl}
          />
          
          IMPORTANT: Avec pagination backend:
          1. Supprimer le filtrage local (lignes 156-167)
          2. Supprimer le slicing local (lignes 170-173)
          3. Utiliser directement messageList au lieu de currentMessages
          4. Les filtres doivent être envoyés comme paramètres à l'API
          5. Appeler retrieveDoctorMessages à chaque changement de filtre
          */
        )}
      </div>

      {/* Modal pour afficher le message complet */}
      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={700}
        centered
      >
        {selectedMessage && (
          <div className="p-4">
            <div className={`${getPriorityStyle(selectedMessage.priority).border} border-l-8 pl-4 mb-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Mail className={`h-6 w-6 ${getPriorityStyle(selectedMessage.priority).text}`} />
                  <span className={`${getPriorityStyle(selectedMessage.priority).badge} text-white text-sm px-3 py-1 rounded-full font-semibold`}>
                    {getPriorityLabel(selectedMessage.priority)}
                  </span>
                  {!selectedMessage.isRead && (
                    <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                      Nouveau
                    </span>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedMessage.subject}
              </h2>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">De:</span> {selectedMessage.senderName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(selectedMessage.createdAt).toLocaleString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notification:</h3>
                {isEditingMessage ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-end"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={deleteAllMessages}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer tout
                </button>
                <button
                  onClick={() => {
                    if (isEditingMessage) {
                      handleSaveEdit()
                    } else {
                      setIsEditingMessage(true)
                    }
                  }}
                  className="px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-primary-start transition-colors"
                >
                  {isEditingMessage ? "Enregistrer" : "Modifier"}
                </button>
                <button
                  onClick={() => {
                    deleteMessage(selectedMessage.id)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isNotificationModalOpen}
        onCancel={closeNotificationModal}
        footer={null}
        width={700}
        centered
      >
        {selectedNotification && (
          <div className="p-4">
            <div className={`${getPriorityStyle(selectedNotification.priority === "RED" ? "high" : selectedNotification.priority === "YELLOW" ? "medium" : "low").border} border-l-8 pl-4 mb-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`${getPriorityStyle(selectedNotification.priority === "RED" ? "high" : selectedNotification.priority === "YELLOW" ? "medium" : "low").badge} text-white text-sm px-3 py-1 rounded-full font-semibold`}>
                    {getPriorityLabel(selectedNotification.priority)}
                  </span>
                  {!selectedNotification.isRead && (
                    <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                      Nouveau
                    </span>
                  )}
                </div>
                <button
                  onClick={closeNotificationModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedNotification.title}
              </h2>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">De:</span> {selectedNotification.senderName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(selectedNotification.date).toLocaleString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notification:</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={closeNotificationModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardComponent>
  )
}
 
// import { DoctorMessagePage } from "../Doctor/DoctorMessagePage.jsx";
// import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
// import { dentistNavLink } from "./DentistNavLink.js";
// import { DentistNavBar } from "./DentistNavBar.jsx";

// export function DentistMessagePage() {
//   return (
//     <DoctorMessagePage
//       DashboardComponent={CustomDashboard}
//       NavBarComponent={DentistNavBar}
//       navLink={dentistNavLink}
//       requiredRole="Dentist"
//     />
//   );
// }
 
