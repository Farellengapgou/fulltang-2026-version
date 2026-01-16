import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

export function LandingPage() {
    const navigate = useNavigate();


    function StatCard({ number, label, variant = 'white' }) {
        return (
            <div
                className={`flex flex-col items-center justify-center p-6 rounded-2xl 
                shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 
                hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20
                ${variant === 'white' ? 'bg-white' : 'bg-primary-end'}
            `}
            >
                <span className={`text-3xl md:text-4xl font-bold 
                    ${variant === 'white' ? 'text-gray-800' : 'text-white'}
                `}>
                    {number}
                </span>

                <span className={`mt-2 text-sm md:text-base 
                    ${variant === 'white' ? 'text-gray-600' : 'text-white'}
                `}>
                    {label}
                </span>
            </div>
        );
    }

    StatCard.propTypes = {
        number: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        variant: PropTypes.string
    };

    function ServiceCard({ icon, title }) {
        return (
            <div className="flex flex-col items-center bg-primary-end p-6 md:p-8 
                rounded-2xl shadow-lg shadow-black/10 transition-all duration-300 
                backdrop-blur-sm hover:scale-[1.03] hover:shadow-black/20">
                <img src={icon} alt={title} className="w-12 h-12 md:w-16 md:h-16" />
                <span className="mt-4 text-center text-black font-medium text-sm md:text-base">{title}</span>
            </div>
        );
    }

    ServiceCard.propTypes = {
        icon: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired
    };

    function DoctorCard({ name, speciality }) {
        return (
            <div className="flex flex-col items-center bg-white p-4 rounded-2xl 
                shadow-lg shadow-black/10 transition-all duration-300 
                hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 backdrop-blur-sm">
                
                <div className="w-full aspect-square overflow-hidden rounded-xl">
                    <img
                        src="/doctorimage.png"
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <h3 className="mt-3 font-medium text-gray-800 text-base md:text-lg">
                    {name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">{speciality}</p>
            </div>
        );
    }

    DoctorCard.propTypes = {
        name: PropTypes.string.isRequired,
        speciality: PropTypes.string.isRequired
    };

    const stats = [
        { number: "50+", label: "Doctor", variant: 'white' },
        { number: "50+", label: "Patients", variant: 'green' },
        { number: "20+", label: "Expert", variant: 'white' },
        { number: "5+", label: "Specializations", variant: 'green' }
    ];

    const services = [
        { icon: "/hospital.png", title: "Specialized Services" },
        { icon: "/injection.png", title: "Vaccination" },
        { icon: "/doctor.png", title: "Diagnostics" },
        { icon: "/heart.png", title: "Dental Care" },
        { icon: "/helpcenter.png", title: "Pharmacy" }
    ];


    return (
        <div className="min-h-screen">

            <div className="relative bg-gradient-to-br from-primary-start to-primary-end pb-20 md:pb-28">

                <div className="absolute inset-0">
                    <img
                        src="/welcomeImage.png"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-start/50 to-primary-end/50" />
                </div>

                <div className="container mx-auto px-6 pt-14 md:pt-20 relative z-10">
                    <div className="max-w-xl animate-fadein">
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                            Welcome to<br />Fultang Polyclinic
                        </h1>

                        <p className="text-white/80 text-base md:text-lg mb-6 md:mb-8">
                            The hospital to trust to care about those you love
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 md:px-8 py-3 bg-white text-gray-800 rounded-full font-medium 
                            hover:bg-opacity-90 transition shadow-lg shadow-black/10 hover:shadow-black/20"
                        >
                            Log In Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-10 md:-mt-14">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            <div className="bg-white mt-16 md:mt-24">
                <div className="container mx-auto px-6">

                    <section className="py-16 md:py-20">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Our Services</h2>

                        <p className="text-gray-600 mt-2 max-w-lg">
                            We bring a fresh and exciting service to the care we provide best diagnosis and treatment.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10">
                            {services.map((service, index) => (
                                <ServiceCard key={index} {...service} />
                            ))}
                        </div>
                    </section>

                    <section className="py-16 md:py-20">
                        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-10">
                            Meet Some of Our Doctors
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <DoctorCard
                                    key={i}
                                    name="Dr. James Lambert"
                                    speciality="Dentist"
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <div className="bg-emerald-800 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <section className="py-16 md:py-20 relative">
                        <div className="relative z-10 max-w-xl">
                            <h2 className="text-3xl font-bold text-white">About us</h2>

                            <p className="text-white/90 mt-4 leading-relaxed">
                                Fultang Polyclinic is committed to providing exceptional healthcare
                                services through innovative medical solutions and compassionate care...
                            </p>
                        </div>

                        <img
                            src="/endpicture.png"
                            alt="About background"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                        />
                    </section>
                </div>
            </div>

            <footer className="bg-emerald-800 py-4 text-center text-white text-sm md:text-base">
                © {new Date().getFullYear()} Fultang Polyclinic
            </footer>
        </div>
    );
}

export default LandingPage;
