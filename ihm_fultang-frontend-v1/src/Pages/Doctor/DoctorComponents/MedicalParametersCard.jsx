// import PropTypes from "prop-types";

// export default function MedicalParametersCard ({ icon : Icon, label, value, unit = '' }) {

//     MedicalParametersCard.propTypes = {
//         icon: PropTypes.element.isRequired,
//         label: PropTypes.string.isRequired,
//         value: PropTypes.number.isRequired,
//         unit: PropTypes.string
//     }

//     return (
//         <div className="bg-white p-3 rounded-lg">
//             <div className="flex items-center text-gray-600">
//                 <Icon className="h-5 w-5 mr-2 text-blue-500"/>
//                 <span className="text-sm">{label}</span>
//             </div>
//             <p className="text-lg font-semibold mt-1 ml-8">{value}{unit}</p>
//         </div>
//     )
// }
import PropTypes from "prop-types";

export default function MedicalParametersCard({ icon, label, value, unit = '' }) {

    MedicalParametersCard.propTypes = {
        icon: PropTypes.node.isRequired,  // ✅ Changé pour accepter les éléments JSX rendus
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        unit: PropTypes.string
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            {/* En-tête avec icône */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                    {icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {label}
                </span>
            </div>

            {/* Valeur et unité */}
            <div className="pl-13">
                <p className="text-2xl font-bold text-blue-600">
                    {value}
                    {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
                </p>
            </div>
        </div>
    )
}
