import{r as o,j as e}from"./index-V_9YcWOP.js";import{C as w}from"./CustomDashboard-B38J2DWi.js";import{P as v}from"./PharmacyNavBar-B16tWkSP.js";import{p as N}from"./pharmacyNavLink-ZbG8Tg50.js";import{a as y}from"./axiosInstance-BxkT1Ut4.js";import{L as k}from"./Loader-C6AWtkZt.js";import{P as S}from"./printer-B81BStd8.js";import{P as I}from"./package-JdBB-T0o.js";import{A as P}from"./activity-C4Xf0tVm.js";import{T as x}from"./triangle-alert-BDtoutx7.js";import{C as m}from"./calendar-thZ7hoW6.js";import{C as h}from"./circle-check-big-C-2J1MS5.js";import"./AccessDenied-CwSTd4OV.js";import"./chevron-up-DcQIb2BW.js";import"./createLucideIcon-B4kdqFkT.js";import"./index-0H-yoKMz.js";import"./userIcon-HaeyWv4Z.js";import"./reactNode-D4IkgGug.js";import"./UserProfileModal-CMBn3Dby.js";import"./PurePanel-BiLa3PMN.js";import"./LoadingOutlined-D8ETSqdD.js";import"./index-CQWxpdNt.js";import"./index-B5LuyYQh.js";import"./index-IS5k_7bc.js";function Y(){const[t,p]=o.useState({totalItems:0,lowStockItems:[],expiringItems:[],totalValue:0}),[b,n]=o.useState(!0);o.useEffect(()=>{g()},[]);const g=async()=>{n(!0);try{const s=await y.get("/product/"),r=s.data.results||s.data||[],a=r.filter(l=>l.current_stock<=l.min_stock_level),d=new Date,c=new Date;c.setDate(d.getDate()+30);const u=r.filter(l=>{if(!l.expiry_date)return!1;const i=new Date(l.expiry_date);return i>=d&&i<=c}),j=r.reduce((l,i)=>l+i.price*i.current_stock,0);p({totalItems:r.length,lowStockItems:a,expiringItems:u,totalValue:j})}catch(s){console.error("Error fetching stock data:",s)}finally{n(!1)}},f=()=>{const s=`
            <html>
                <head>
                    <title>Rapport de Stock - Fultang Pharmacy</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                        h1 { color: #1e293b; text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
                        .summary { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
                        .summary-item { background: #f8fafc; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
                        .summary-item h4 { margin: 0; font-size: 10px; color: #64748b; text-transform: uppercase; }
                        .summary-item p { margin: 5px 0 0 0; font-size: 18px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th { background-color: #3b82f6; color: white; text-align: left; padding: 12px 8px; }
                        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
                        .low-stock th { background-color: #ef4444; }
                        .expiring th { background-color: #f59e0b; }
                        tr:nth-child(even) { background-color: #f1f5f9; }
                        .meta { text-align: right; font-size: 10px; color: #94a3b8; margin-top: 5px; }
                    </style>
                </head>
                <body>
                    <h1>RAPPORT DE STOCK PHARMACIE</h1>
                    <div class="meta">Généré le: ${new Date().toLocaleString()}</div>
                    
                    <div class="summary">
                        <div class="summary-item"><h4>Total Produits</h4><p>${t.totalItems}</p></div>
                        <div class="summary-item"><h4>Valeur Stock</h4><p>${t.totalValue.toLocaleString()} FCFA</p></div>
                        <div class="summary-item"><h4>Stock Faible</h4><p>${t.lowStockItems.length}</p></div>
                        <div class="summary-item"><h4>Périme Bientôt</h4><p>${t.expiringItems.length}</p></div>
                    </div>

                    ${t.lowStockItems.length>0?`
                        <h2 style="color: #ef4444; font-size: 16px; margin-top: 30px;">Alertes Stock Faible</h2>
                        <table class="low-stock">
                            <thead>
                                <tr><th>Produit</th><th>Stock Actuel</th><th>Seuil Min</th><th>État</th></tr>
                            </thead>
                            <tbody>
                                ${t.lowStockItems.map(a=>`
                                    <tr>
                                        <td>${a.name}</td>
                                        <td style="text-align: center; font-weight: bold;">${a.current_stock}</td>
                                        <td style="text-align: center;">${a.min_stock_level}</td>
                                        <td style="text-align: center; color: #ef4444; font-weight: bold;">CRITIQUE</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    `:""}

                    ${t.expiringItems.length>0?`
                        <h2 style="color: #f59e0b; font-size: 16px; margin-top: 30px;">Produits Périmant Bientôt (30 Jours)</h2>
                        <table class="expiring">
                            <thead>
                                <tr><th>Produit</th><th>Stock</th><th>Date d'expiration</th></tr>
                            </thead>
                            <tbody>
                                ${t.expiringItems.map(a=>`
                                    <tr>
                                        <td>${a.name}</td>
                                        <td style="text-align: center;">${a.current_stock}</td>
                                        <td style="text-align: right; font-weight: bold;">${a.expiry_date}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    `:""}

                    <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
                        Fultang Health Management System - Module Pharmacie
                    </div>
                </body>
            </html>
        `,r=window.open("","_blank");r.document.write(s),r.document.close(),r.onload=()=>{r.focus(),r.print()}};return e.jsxs(w,{linkList:N,requiredRole:"Pharmacist",children:[e.jsx(v,{}),e.jsxs("div",{className:"p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans",children:[e.jsxs("div",{className:"flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-black text-slate-800 tracking-tight",children:"Rapport de Stock"}),e.jsx("p",{className:"text-slate-500 font-medium",children:"État de l'inventaire et alertes santé"})]}),e.jsxs("button",{onClick:f,className:"flex items-center gap-3 px-6 py-3 bg-secondary text-white rounded-xl hover:bg-primary-start transition-all font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95",children:[e.jsx(S,{size:20})," Exporter Rapport PDF"]})]}),b?e.jsx("div",{className:"flex justify-center items-center h-64",children:e.jsx(k,{})}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[e.jsx("div",{className:"bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all",children:e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-slate-400 text-xs font-bold uppercase tracking-wider",children:"Total Produits"}),e.jsx("h3",{className:"text-3xl font-black text-slate-800 mt-2",children:t.totalItems})]}),e.jsx("div",{className:"w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center",children:e.jsx(I,{size:24})})]})}),e.jsx("div",{className:"bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all",children:e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-slate-400 text-xs font-bold uppercase tracking-wider",children:"Valeur Stock"}),e.jsx("h3",{className:"text-3xl font-black text-slate-800 mt-2",children:t.totalValue.toLocaleString()})]}),e.jsx("div",{className:"w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center",children:e.jsx(P,{size:24})})]})}),e.jsx("div",{className:"bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all",children:e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-slate-400 text-xs font-bold uppercase tracking-wider",children:"Stock Faible"}),e.jsx("h3",{className:"text-3xl font-black text-rose-500 mt-2",children:t.lowStockItems.length})]}),e.jsx("div",{className:"w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center animate-pulse",children:e.jsx(x,{size:24})})]})}),e.jsx("div",{className:"bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all",children:e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-slate-400 text-xs font-bold uppercase tracking-wider",children:"Périme Bientôt"}),e.jsx("h3",{className:"text-3xl font-black text-amber-500 mt-2",children:t.expiringItems.length})]}),e.jsx("div",{className:"w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center",children:e.jsx(m,{size:24})})]})})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"p-5 border-b border-slate-100 bg-rose-50/50 flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center",children:e.jsx(x,{size:16})}),e.jsx("h3",{className:"font-bold text-slate-800 text-lg",children:"Alertes Stock Faible"})]}),e.jsx("div",{className:"overflow-x-auto flex-1",children:e.jsxs("table",{className:"w-full text-left text-sm",children:[e.jsx("thead",{className:"bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-4",children:"Produit"}),e.jsx("th",{className:"p-4 text-center",children:"Stock"}),e.jsx("th",{className:"p-4 text-center",children:"Min"}),e.jsx("th",{className:"p-4 text-center",children:"Statut"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100",children:t.lowStockItems.length>0?t.lowStockItems.map(s=>e.jsxs("tr",{className:"hover:bg-slate-50 transition-colors",children:[e.jsx("td",{className:"p-4 font-bold text-slate-700",children:s.name}),e.jsx("td",{className:"p-4 text-center font-black text-rose-500 bg-rose-50/30",children:s.current_stock}),e.jsx("td",{className:"p-4 text-center text-slate-400 font-medium",children:s.min_stock_level}),e.jsx("td",{className:"p-4 text-center",children:e.jsx("span",{className:"px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-wide",children:"CRITIQUE"})})]},s.id)):e.jsx("tr",{children:e.jsxs("td",{colSpan:"4",className:"p-8 text-center text-slate-400 flex flex-col items-center gap-2",children:[e.jsx(h,{size:32,className:"text-emerald-300"}),e.jsx("span",{children:"Aucun produit en rupture. Excellent !"})]})})})]})})]}),e.jsxs("div",{className:"bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"p-5 border-b border-slate-100 bg-amber-50/50 flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center",children:e.jsx(m,{size:16})}),e.jsx("h3",{className:"font-bold text-slate-800 text-lg",children:"Périme Bientôt (30 Jours)"})]}),e.jsx("div",{className:"overflow-x-auto flex-1",children:e.jsxs("table",{className:"w-full text-left text-sm",children:[e.jsx("thead",{className:"bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-4",children:"Produit"}),e.jsx("th",{className:"p-4 text-center",children:"Stock"}),e.jsx("th",{className:"p-4 text-right",children:"Date Expiration"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100",children:t.expiringItems.length>0?t.expiringItems.map(s=>e.jsxs("tr",{className:"hover:bg-slate-50 transition-colors",children:[e.jsx("td",{className:"p-4 font-bold text-slate-700",children:s.name}),e.jsx("td",{className:"p-4 text-center font-medium",children:s.current_stock}),e.jsx("td",{className:"p-4 text-right text-amber-600 font-mono font-bold bg-amber-50/30",children:s.expiry_date})]},s.id)):e.jsx("tr",{children:e.jsxs("td",{colSpan:"3",className:"p-8 text-center text-slate-400 flex flex-col items-center gap-2",children:[e.jsx(h,{size:32,className:"text-emerald-300"}),e.jsx("span",{children:"Aucun produit ne périme bientôt."})]})})})]})})]})]})]})]})]})}export{Y as PharmacyStockReport};
