import axiosInstance from "../../Utils/axiosInstance.js";

export function StatisticsReport({ annualStats: initialAnnual, monthlyStats: initialMonthly, dailyStats: initialDaily }) {

    const [selectedTab, setSelectedTab] = useState("annual");
    const [customFilter, setCustomFilter] = useState({});
    const [customFilteredStats, setCustomFilteredStats] = useState([]);
    
    const [stats, setStats] = useState({
        annual: initialAnnual,
        monthly: initialMonthly,
        daily: initialDaily
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchGlobalStats() {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get("/accounting/statistics/");
                if (response.status === 200) {
                    const data = response.data;
                    // Adapt backend data to the component structure
                    setStats(prev => ({
                        ...prev,
                        annual: {
                            consultations: data.bills.accounted,
                            exams: data.bills.total - data.bills.accounted,
                            medications: 0,
                            revenue: data.bills.total * 5000 
                        }
                    }));
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchGlobalStats();
    }, []);

    const handleCustomFilter = async (filter) => {
        const { startDate, endDate, category } = filter;
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/accounting/statistics/", {
                params: { start_date: startDate, end_date: endDate }
            });
            if (response.status === 200) {
                const data = response.data;
                const result = [{
                    date: `${startDate} to ${endDate}`,
                    consultations: data.bills.accounted,
                    exams: data.bills.total - data.bills.accounted,
                    medications: 0,
                    revenue: data.bills.total * 5000
                }];
                setCustomFilteredStats(result);
            }
        } catch (err) {
            console.error("Error filtering stats:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStats = () => {
        if (isLoading) return <div className="animate-pulse flex items-center justify-center p-20">Loading statistics...</div>;

        if (selectedTab === "annual") {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <StatCard
                        icon={<FaUserMd className="text-3xl text-green-600" />}
                        label="Consultations"
                        value={stats.annual.consultations}
                    />
                    <StatCard
                        icon={<FaFileMedical className="text-3xl text-blue-600" />}
                        label="Examens"
                        value={stats.annual.exams}
                    />
                    <StatCard
                        icon={<FaPrescriptionBottle className="text-3xl text-orange-600" />}
                        label="Médicaments"
                        value={stats.annual.medications}
                    />
                    <StatCard
                        icon={<FaChartPie className="text-3xl text-red-600" />}
                        label="Revenus"
                        value={`${stats.annual.revenue} FCFA`}
                    />
                </div>
            );
        } else if (selectedTab === "monthly") {
            return (
                <TableStats title="Statistiques mensuelles" stats={stats.monthly} />
            );
        } else if (selectedTab === "daily") {
            return (
                <TableStats title="Statistiques journalières" stats={stats.daily} />
            );
        } else if (selectedTab === "custom") {
            return (
                <div className="mt-6">
                    <h3 className="text-lg font-bold mb-4">Bilan personnalisé</h3>
                    <CustomReportFilter onFilter={handleCustomFilter} />
                    {customFilteredStats.length > 0 ? (
                        <TableStats title="Résultats filtrés" stats={customFilteredStats} />
                    ) : (
                        <p className="mt-4 text-gray-600">Aucun résultat trouvé selon les critères.</p>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Rapport Statistique de l'Hôpital</h2>
            <div className="flex space-x-4 mb-6">
                {[
                    { tab: "annual", label: "Annuel" },
                    { tab: "monthly", label: "Mensuel" },
                    { tab: "daily", label: "Journalier" },
                    { tab: "custom", label: "Personnalisé" },
                ].map(({ tab, label }) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 rounded ${
                            selectedTab === tab
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            {renderStats()}
        </div>
    );
}


function StatCard({ icon, label, value }) {
    return (
        <div className="bg-white shadow-lg p-4 rounded-lg flex items-center">
            {icon}
            <div className="ml-4">
                <p className="text-gray-600">{label}</p>
                <h2 className="text-2xl font-bold">{value}</h2>
            </div>
        </div>
    );
}

StatCard.propTypes = {
    icon: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

function TableStats({ title, stats }) {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="border-b p-2">Period</th>
                        <th className="border-b p-2">Consultations</th>
                        <th className="border-b p-2">Exams</th>
                        <th className="border-b p-2">Medicine</th>
                        <th className="border-b p-2">Income (FCFA)</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((stat, index) => (
                        <tr key={index} className="odd:bg-gray-100">
                            <td className="p-2">{stat.period || stat.date || stat.month}</td>
                            <td className="p-2 font-bold">{stat.consultations}</td>
                            <td className="p-2 font-bold">{stat.exams}</td>
                            <td className="p-2 font-bold">{stat.medications}</td>
                            <td className="p-2 font-bold">{stat.revenue}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

TableStats.propTypes = {
    title: PropTypes.string.isRequired,
    stats: PropTypes.arrayOf(
        PropTypes.shape({
            period: PropTypes.string,
            date: PropTypes.string,
            month: PropTypes.string,
            consultations: PropTypes.number.isRequired,
            exams: PropTypes.number.isRequired,
            medications: PropTypes.number.isRequired,
            revenue: PropTypes.number.isRequired,
        })
    ).isRequired,
};

function CustomReportFilter({ onFilter }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [category, setCategory] = useState("all");

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter({ startDate, endDate, category });
    };

    return (
        <form className="bg-white p-4 shadow rounded" onSubmit={handleSubmit}>
            <div className="flex space-x-4 mb-4">
                <div>
                    <label className="block text-gray-600 mb-2">Date de début</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 mb-2">Date de fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 mb-2">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 rounded w-full"
                        >
                            <option value="all">All categories</option>
                            <option value="consultations">Consultations</option>
                            <option value="exams">Exams</option>
                            <option value="medications">Medicines</option>
                            <option value="revenue">Income</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                    >
                        Filter
                    </button>
                </div>
            </form>
        );
    }
    
    CustomReportFilter.propTypes = {
        onFilter: PropTypes.func.isRequired,
    };
    
