import PropTypes from "prop-types";
import userIcon from "../../assets/userIcon.png";
import { Mail, Phone, MapPin, Calendar, CreditCard, User } from 'lucide-react';


export function ViewPatientDetailsModal({isOpen, patient, onClose})
{
    ViewPatientDetailsModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        patient: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired
    };

    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl w-[600px] ">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-row">
                        {/* Left Section - Avatar and Name */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col items-center text-center w-1/3">
                            <div className="w-40 h-40 rounded-full bg-sky-200 overflow-hidden mb-4">
                                <img
                                    src = {userIcon}
                                    alt="Profile avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-navy-900 mb-1">{patient.lastName}</h1>
                            <h2 className="text-xl text-navy-700 mb-4">{patient.firstName}</h2>
                            <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2"/>
                                <p className="text-xl font-bold">{patient.gender}</p>
                            </div>
                        </div>

                        {/* Right Section - Personal Information */}
                        <div className="p-6 md:w-2/3">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <MapPin className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-md text-gray-500 font-medium">Address</p>
                                        <p className="text-gray-700 font-bold">{patient.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Mail className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Email</p>
                                        <p className="text-gray-700 font-bold">{patient.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CreditCard className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">CNI Number</p>
                                        <p className="text-gray-700 font-bold">{patient.cniNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Phone className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                                        <p className="text-gray-700 font-bold">{patient.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Calendar className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                                        <p className="text-gray-700 font-bold">{patient.birthDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-1 bg-primary-end text-md hover:text-xl font-bold text-md text-white rounded-md transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



// import PropTypes from "prop-types";
// import { Mail, Phone, MapPin, Calendar, CreditCard, User } from 'lucide-react';

// // Import des avatars par défaut
// import maleAvatar from "../../assets/male-avatar.png";  // À ajouter
// import femaleAvatar from "../../assets/female-avatar.png";  // À ajouter

// <<<<<<< HEAD
// export function ViewPatientDetailsModal({ isOpen, patient, onClose }) {
// =======
// export function ViewPatientDetailsModal({isOpen, patient, onClose}) {
// >>>>>>> origin/mofif_receptionist
//     ViewPatientDetailsModal.propTypes = {
//         isOpen: PropTypes.bool.isRequired,
//         patient: PropTypes.object.isRequired,
//         onClose: PropTypes.func.isRequired
//     };

// <<<<<<< HEAD
//     if (!isOpen) return null;
// =======
//     // Fonction pour obtenir l'avatar approprié selon le sexe
//     const getAvatarImage = (gender) => {
//         if (gender === 'Male') {
//             return maleAvatar;
//         } else {
//             return femaleAvatar;
//         }
//     };

//     // Fonction pour obtenir la couleur de fond selon le sexe
//     const getBackgroundColor = (gender) => {
//         return gender === 'Male' ? 'from-blue-50 to-blue-100' : 'from-pink-50 to-pink-100';
//     };

//     // Fonction pour obtenir la couleur du badge selon le sexe
//     const getGenderBadgeColor = (gender) => {
//         return gender === 'Male' 
//             ? 'bg-blue-100 text-blue-800' 
//             : 'bg-pink-100 text-pink-800';
//     };

//     if (!isOpen) return null;

// >>>>>>> origin/mofif_receptionist
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
//             <div className="bg-white rounded-lg shadow-xl w-[650px] max-h-[90vh] overflow-y-auto">
//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                     <div className="flex flex-row">
//                         {/* Left Section - Avatar and Name */}
// <<<<<<< HEAD
//                         <div className={`p-6 flex flex-col items-center text-center w-1/3 ${patient.gender === "Female" ? "bg-gradient-to-br from-pink-50 to-pink-100" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}>
//                             <div className={`w-40 h-40 rounded-full overflow-hidden mb-4 ${patient.gender === "Female" ? "bg-pink-200 border-4 border-pink-100" : "bg-sky-200 border-4 border-blue-100"}`}>
//                                 <img
//                                     src={userIcon}
//                                     alt="Profile avatar"
// =======
//                         <div className={`bg-gradient-to-br ${getBackgroundColor(patient.gender)} p-6 flex flex-col items-center text-center w-1/3`}>
//                             {/* Avatar image */}
//                             <div className="w-40 h-40 rounded-full overflow-hidden bg-white shadow-lg mb-4">
//                                 <img
//                                     src={getAvatarImage(patient.gender)}
//                                     alt={`${patient.gender} avatar`}
// >>>>>>> origin/mofif_receptionist
//                                     className="w-full h-full object-cover"
//                                     onError={(e) => {
//                                         // Fallback si l'image ne charge pas
//                                         e.target.style.display = 'none';
//                                         e.target.parentElement.innerHTML = `
//                                             <div class="w-full h-full flex items-center justify-center bg-gray-200">
//                                                 <svg class="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                                                     <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
//                                                 </svg>
//                                             </div>
//                                         `;
//                                     }}
//                                 />

//                             </div>
                            
//                             <h1 className="text-2xl font-bold text-navy-900 mb-1">{patient.lastName}</h1>
//                             <h2 className="text-xl text-navy-700 mb-4">{patient.firstName}</h2>
// <<<<<<< HEAD
//                             <div className="flex items-center text-gray-600">
//                                 <User className="w-4 h-4 mr-2" />
//                                 <p className="text-xl font-bold">{patient.gender}</p>
// =======
                            
//                             <div className={`flex items-center px-3 py-1 rounded-full ${getGenderBadgeColor(patient.gender)}`}>
//                                 <User className="w-4 h-4 mr-2"/>
//                                 <p className="text-sm font-bold">{patient.gender}</p>
// >>>>>>> origin/mofif_receptionist
//                             </div>
//                         </div>

//                         {/* Right Section - Personal Information */}
//                         <div className="p-6 md:w-2/3">
//                             <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
//                                 Personal Information
//                             </h3>
                            
//                             <div className="space-y-4">
// <<<<<<< HEAD
//                                 <div className="flex items-start">
//                                     <MapPin className="w-7 h-7 text-primary-start mt-1 mr-3" />
//                                     <div>
//                                         <p className="text-md text-gray-500 font-medium">Address</p>
//                                         <p className="text-gray-700 font-bold">{patient.address}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start">
//                                     <Mail className="w-7 h-7 text-primary-start mt-1 mr-3" />
//                                     <div>
//                                         <p className="text-sm text-gray-500 font-medium">Email</p>
//                                         <p className="text-gray-700 font-bold">{patient.email}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start">
//                                     <CreditCard className="w-7 h-7 text-primary-start mt-1 mr-3" />
//                                     <div>
//                                         <p className="text-sm text-gray-500 font-medium">CNI Number</p>
//                                         <p className="text-gray-700 font-bold">{patient.cniNumber}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start">
//                                     <Phone className="w-7 h-7 text-primary-start mt-1 mr-3" />
//                                     <div>
//                                         <p className="text-sm text-gray-500 font-medium">Phone Number</p>
//                                         <p className="text-gray-700 font-bold">{patient.phoneNumber}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start">
//                                     <Calendar className="w-7 h-7 text-primary-start mt-1 mr-3" />
//                                     <div>
//                                         <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
//                                         <p className="text-gray-700 font-bold">{patient.birthDate}</p>
// =======
//                                 <div className="flex items-start hover:bg-gray-50 p-2 rounded-lg transition-all">
//                                     <MapPin className="w-6 h-6 text-primary-start mt-1 mr-3 flex-shrink-0"/>
//                                     <div className="flex-1">
//                                         <p className="text-xs text-gray-500 font-medium uppercase">Address</p>
//                                         <p className="text-gray-800 font-semibold">{patient.address || 'Not provided'}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start hover:bg-gray-50 p-2 rounded-lg transition-all">
//                                     <Mail className="w-6 h-6 text-primary-start mt-1 mr-3 flex-shrink-0"/>
//                                     <div className="flex-1">
//                                         <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
//                                         <p className="text-gray-800 font-semibold">{patient.email || 'Not provided'}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start hover:bg-gray-50 p-2 rounded-lg transition-all">
//                                     <Phone className="w-6 h-6 text-primary-start mt-1 mr-3 flex-shrink-0"/>
//                                     <div className="flex-1">
//                                         <p className="text-xs text-gray-500 font-medium uppercase">Phone Number</p>
//                                         <p className="text-gray-800 font-semibold">{patient.phoneNumber}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start hover:bg-gray-50 p-2 rounded-lg transition-all">
//                                     <Calendar className="w-6 h-6 text-primary-start mt-1 mr-3 flex-shrink-0"/>
//                                     <div className="flex-1">
//                                         <p className="text-xs text-gray-500 font-medium uppercase">Date of Birth</p>
//                                         <p className="text-gray-800 font-semibold">{patient.birthDate}</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-start hover:bg-gray-50 p-2 rounded-lg transition-all">
//                                     <CreditCard className="w-6 h-6 text-primary-start mt-1 mr-3 flex-shrink-0"/>
//                                     <div className="flex-1">
//                                         <p className="text-xs text-gray-500 font-medium uppercase">CNI Number</p>
//                                         <p className="text-gray-800 font-semibold">{patient.cniNumber || 'Not provided'}</p>
// >>>>>>> origin/mofif_receptionist
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end mt-6 pt-4 border-t">
//                                 <button
//                                     onClick={onClose}
//                                     className="px-6 py-2 bg-primary-end text-md hover:bg-primary-start font-bold text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
