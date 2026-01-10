import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Calendar,
  Activity,
  Users,
  Download,
  DollarSign,
} from "lucide-react";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { cashierNavLink } from "./cashierNavLink.js";
import { CashierNavBar } from "./CashierNavBar.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";

// Utilitaire: génère une liste de mois affichables entre deux dates (inclus)
const generateMonthsRange = (startDate, endDate) => {
  const result = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (current <= end) {
    result.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return result;
};

export function FinancialReport() {
  const [filterType, setFilterType] = useState("currentMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total: 0,
    monthTotal: 0,
    examTotal: 0,
    consultationTotal: 0,
  });

  useEffect(() => {
    // Récupérer les factures et statistiques côté backend et construire les séries mensuelles
    async function fetchData() {
      try {
        // Récupérer les bills (demander une grande page_size pour avoir plus d'items)
        const billsResp = await axiosInstance.get(`/bill/?page_size=1000`);
        const bills = billsResp?.data?.results || billsResp?.data || [];

        // Calculer la période selon le filtre
        const today = new Date();
        let start, end;
        if (filterType === "currentMonth") {
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (filterType === "year") {
          start = new Date(today.getFullYear(), 0, 1);
          end = new Date(today.getFullYear(), 11, 1);
        } else if (filterType === "yearToDate") {
          start = new Date(today.getFullYear(), 0, 1);
          end = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (filterType === "custom" && startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          // fallback to current month
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        // Normaliser end pour inclure le mois entier
        start = new Date(start.getFullYear(), start.getMonth(), 1);
        end = new Date(end.getFullYear(), end.getMonth(), 1);

        const months = generateMonthsRange(start, end);

        // Préparer un tableau d'objets pour chaque mois
        const monthlyData = months.map((d) => ({
          month: d.toLocaleDateString("fr-FR", {
            month: "short",
            year: "numeric",
          }),
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          consultations: 0,
          examens: 0,
          total: 0,
        }));

        // Agréger les bills par mois
        bills.forEach((bill) => {
          // bill.date attendu au format ISO
          const billDate = new Date(bill.date);
          const billMonth = new Date(
            billDate.getFullYear(),
            billDate.getMonth(),
            1
          );

          // Ignore bills hors période
          if (billMonth < start || billMonth > end) return;

          // Trouver l'index correspondant
          const key = billMonth.toLocaleDateString("fr-FR", {
            month: "short",
            year: "numeric",
          });
          const idx = monthlyData.findIndex((m) => m.month === key);
          if (idx === -1) return;

          // Si bill_items fournis, sommer par type sinon utiliser bill.amount
          let consultSum = 0;
          let examSum = 0;
          if (Array.isArray(bill.bill_items) && bill.bill_items.length > 0) {
            bill.bill_items.forEach((item) => {
              // coerce values to numbers (backend may return strings)
              const itemTotal = Number(item.total || 0);
              // Si l'item est lié à une consultation
              if (item.consultation) {
                consultSum += itemTotal;
              } else if (
                item.examRequest ||
                (item.designation &&
                  item.designation.toLowerCase().includes("exam")) ||
                (item.designation &&
                  item.designation.toLowerCase().includes("examen"))
              ) {
                examSum += itemTotal;
              } else {
                // autres items -> répartir au total (compte comme 'autre')
              }
            });
          } else {
            // Si pas de détail, on estime tout dans total
            // Nous n'avons pas la granularité -> ajoute tout au total
          }

          const billAmount =
            Number(bill.amount || 0) || consultSum + examSum || 0;

          monthlyData[idx].consultations += consultSum;
          monthlyData[idx].examens += examSum;
          // Si bill_items manquants et billAmount présent, répartir sur total
          monthlyData[idx].total += Number(billAmount || 0);
        });

        // Si consultations/exams n'ont pas rempli total (ex: bill_items existent), recalculer total
        monthlyData.forEach((m) => {
          if (!m.total || m.total === 0) {
            m.total = (m.consultations || 0) + (m.examens || 0);
          }
        });

        // Calcul des totaux
        const totals = monthlyData.reduce(
          (acc, curr) => ({
            total: acc.total + (curr.total || 0),
            examTotal: acc.examTotal + (curr.examens || 0),
            consultationTotal:
              acc.consultationTotal + (curr.consultations || 0),
          }),
          { total: 0, examTotal: 0, consultationTotal: 0 }
        );

        setData(monthlyData);
        setSummaryData({
          ...totals,
          monthTotal: monthlyData[monthlyData.length - 1]?.total || 0,
        });
      } catch (error) {
        console.error("Erreur récupération données financières", error);
      }
    }

    fetchData();
  }, [filterType, startDate, endDate]);

  // Remplacer l'ancienne fonction par celle-ci
  const handleGeneratePDF = (periodItem = null) => {
    try {
      const title = periodItem
        ? `Rapport - ${periodItem.month}`
        : `Rapport - ${filterType}`;
      // Construire les lignes du tableau
      const rowsHtml = data
        .map(
          (d) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${
          d.month
        }</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${(
          d.consultations || 0
        ).toLocaleString()} FCFA</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${(
          d.examens || 0
        ).toLocaleString()} FCFA</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${(
          d.total || 0
        ).toLocaleString()} FCFA</td>
      </tr>
    `
        )
        .join("");

      const summaryHtml = `
      <div style="margin-bottom:20px">
        <h2 style="margin:0 0 8px 0">${title}</h2>
        <div>Total: <strong>${summaryData.total.toLocaleString()} FCFA</strong></div>
        <div>Ce mois: <strong>${summaryData.monthTotal.toLocaleString()} FCFA</strong></div>
        <div>Examens: <strong>${summaryData.examTotal.toLocaleString()} FCFA</strong></div>
        <div>Consultations: <strong>${summaryData.consultationTotal.toLocaleString()} FCFA</strong></div>
      </div>
    `;

      const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111 }
            table { border-collapse: collapse; width: 100%; font-size: 12px }
            th, td { padding: 8px; border: 1px solid #ddd; }
            th { background: #f3f4f6; }
            h2 { font-size: 18px }
            .meta { font-size: 12px; color: #555; margin-bottom: 10px }
          </style>
        </head>
        <body>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <h1 style="margin:0">Fultang - Rapport financier</h1>
              <div class="meta">Période: ${filterType} - Généré le: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          ${summaryHtml}
          <table>
            <thead>
              <tr>
                <th style="text-align:center">Période</th>
                <th style="text-align:right">Consultations (FCFA)</th>
                <th style="text-align:right">Examens (FCFA)</th>
                <th style="text-align:right">Total (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

      const win = window.open("", "_blank", "width=900,height=700");
      if (!win) {
        alert(
          "Impossible d'ouvrir une nouvelle fenêtre. Désactive le bloqueur de popups ou autorise le site."
        );
        return;
      }
      win.document.write(html);
      win.document.close();
      // Attendre le rendu avant print()
      win.onload = () => {
        win.focus();
        win.print();
      };
    } catch (err) {
      console.error("Erreur génération PDF", err);
      alert(
        "Erreur lors de la génération du PDF. Voir la console pour détails."
      );
    }
  };

  return (
    <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>
      <CashierNavBar />

      <div className="mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            General Hospital Statistics
          </h1>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Générer PDF
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="currentMonth">Mois en cours</option>
            <option value="year">Année complète</option>
            <option value="yearToDate">Année en cours</option>
            <option value="custom">Période personnalisée</option>
          </select>

          {filterType === "custom" && (
            <div className="flex gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Cartes de résumé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          <div className="p-4 bg-green-100 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Total des entrées
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {summaryData.total.toLocaleString()} FCFA
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="p-4 bg-red-100 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  Entrées totales du mois
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {summaryData.monthTotal.toLocaleString()} FCFA
                </p>
              </div>
              <Calendar className="h-6 w-6 text-red-500" />
            </div>
          </div>

          <div className="p-4 bg-blue-100 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Entrées des examens
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {summaryData.examTotal.toLocaleString()} FCFA
                </p>
              </div>
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="p-4 bg-purple-100 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Entrées des consultations
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {summaryData.consultationTotal.toLocaleString()} FCFA
                </p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tableau détaillé */}
        <table className="w-full  rounded-lg mb-14">
          <thead className="bg-primary-end">
            <tr>
              <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-l-lg ">
                Period
              </th>
              <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                Consultations
              </th>
              <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                Exams
              </th>
              <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                Total
              </th>
              <th className="px-6 py-5 text-center text-md font-bold text-white uppercase  rounded-r-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-md text-center font-bold text-gray-900">
                  {item.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-center text-gray-900">
                  {item.consultations.toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-center text-gray-900">
                  {item.examens.toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md  text-center text-gray-900">
                  {item.total.toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-center text-gray-900">
                  <button
                    onClick={() => handleGeneratePDF()}
                    className="flex justify-center mx-auto items-center text-indigo-600 hover:text-indigo-900"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Generate PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Graphique */}
        <div className="mb-5  p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Évolution des entrées</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="consultations"
                name="Entrées des Consultations"
                stroke="#9333ea"
              />
              <Line
                type="monotone"
                dataKey="examens"
                name="Entrées des Examens"
                stroke="#3b82f6"
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total des Entrées"
                stroke="#22c55e"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashBoard>
  );
}
