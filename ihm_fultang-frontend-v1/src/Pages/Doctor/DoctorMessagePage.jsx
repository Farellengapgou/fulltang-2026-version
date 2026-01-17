import { useEffect, useState } from "react"
import { DoctorNavBar } from "./DoctorComponents/DoctorNavBar.jsx"
import { doctorNavLink } from "./lib/doctorNavLink.js"
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx"
import { Bell, Trash2, Mail } from "lucide-react"
import { useAuthentication } from "../../Utils/Provider.jsx"
import { Modal } from "antd"
// import axiosInstance from "../../Utils/axiosInstance.js"
import Loader from "../../GlobalComponents/Loader.jsx"
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx"

// PAGINATION: Actuellement SimplePagination (frontend), passer à Pagination (backend) quand l'API sera prête
import SimplePagination from "../../GlobalComponents/SimplePagination.jsx"
// import Pagination from "../../GlobalComponents/Pagination.jsx" // Décommenter pour pagination backend

import { mockMessages } from "./lib/mockMessages.js"

export function DoctorMessagePage() {
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

  // PAGINATION BACKEND: Décommenter ces états quand vous passerez à la pagination backend
  // const [nextUrl, setNextUrl] = useState(null)
  // const [previousUrl, setPreviousUrl] = useState(null)
  // const [totalPages, setTotalPages] = useState(1)

  const { userData } = useAuthentication()


  // Récupérer les messages du médecin (VERSION MOCK)
  function retrieveDoctorMessages() {
    setIsLoading(true)
    // Simuler un délai de chargement
    setTimeout(() => {
      setMessageList(mockMessages)
      setIsLoading(false)
      setErrorStatus(null)
      setErrorMessage("")
    }, 500)
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
      setErrorMessage("Erreur lors de la récupération de vos messages !")
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
    setMessageList(prev => prev.filter(msg => msg.id !== messageId))
    if (selectedMessage?.id === messageId) {
      setIsModalOpen(false)
      setSelectedMessage(null)
    }
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
    setIsModalOpen(true)
    if (!message.isRead) {
      markAsRead(message.id)
    }
  }

  // Fermer la modal
  function closeModal() {
    setIsModalOpen(false)
    setSelectedMessage(null)
  }

  useEffect(() => {
    retrieveDoctorMessages()
    // VERSION API BACKEND PAGINATION: 
    // if (userData.id) {
    //   retrieveDoctorMessages(userData.id, currentPage)
    // }
  }, [])

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
    }
  }

  return (
    <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
      <DoctorNavBar messageCount={messageList.filter(m => !m.isRead).length} />
      <div className="mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Messages
          </h1>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Rechercher
      </label>
      <input
        type="text"
        placeholder="Rechercher un message..."
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
                      <Mail className={`h-5 w-5 ${style.text}`} />
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
          <div className="p-8 mt-24 flex items-center justify-center">
            <div className="flex flex-col">
              <Bell className="h-16 w-16 text-primary-end mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">
                Aucun message
              </h2>
              <p className="text-gray-600 mb-4 mx-auto">
                Il n'y a actuellement aucun message.
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Message:</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
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
    </CustomDashboard>
  )
}