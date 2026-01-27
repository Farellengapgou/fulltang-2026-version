import{r as l,j as t}from"./index-V_9YcWOP.js";import{F as u,V as y,a0 as b,j,X as N}from"./index-0H-yoKMz.js";import{a as w}from"./axiosInstance-BxkT1Ut4.js";import{f as v}from"./formatDateMethods-DOJs3z4n.js";import{C}from"./circle-alert-D_O84NHc.js";function D(){const[i,m]=l.useState([]),[d,c]=l.useState([]),[h,x]=l.useState(!1),[o,p]=l.useState("");l.useEffect(()=>{g()},[]),l.useEffect(()=>{const e=o.toLowerCase(),n=i.filter(s=>{var a,r;return((a=s.billCode)==null?void 0:a.toLowerCase().includes(e))||((r=s.patientName)==null?void 0:r.toLowerCase().includes(e))});c(n)},[o,i]);const g=async()=>{x(!0);try{const e=await w.get("/bill/"),n=e.data.results||e.data,s=(Array.isArray(n)?n:[]).map(a=>{var r;return{id:a.id,billCode:a.billCode,date:a.date,amount:a.amount,patientName:a.patient?`${a.patient.firstName||""} ${a.patient.lastName||""} `:"External Patient / Anonymous",operator:(r=a.operator)==null?void 0:r.username,items:a.bill_items||[]}});s.sort((a,r)=>new Date(r.date)-new Date(a.date)),m(s),c(s)}catch(e){console.error(e)}finally{x(!1)}},f=e=>{const n=`
            <html>
                <head>
                    <title>History - Invoice ${e.billCode}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                        h2 { text-align: center; color: #1A73A3; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>FULTANG CLINIC - DUPLICATE</h2>
                    <p><strong>Invoice:</strong> ${e.billCode}</p>
                    <p><strong>Date:</strong> ${new Date(e.date).toLocaleString()}</p>
                    <p><strong>Patient:</strong> ${e.patientName}</p>
                    <table>
                        <thead>
                            <tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">U.P</th><th style="text-align:right">Total</th></tr>
                        </thead>
                        <tbody>
                            ${e.items.map(a=>`<tr><td>${a.designation}</td><td style="text-align:right">${a.quantity}</td><td style="text-align:right">${(a.unityPrice||0).toLocaleString()}</td><td style="text-align:right">${(a.total||0).toLocaleString()}</td></tr>`).join("")}
                        </tbody>
                    </table>
                    <h3 style="text-align:right; margin-top:20px;">TOTAL: ${(e.amount||0).toLocaleString()} FCFA</h3>
                </body>
            </html>
        `,s=window.open("","_blank");s.document.write(n),s.document.close(),s.print()};return t.jsxs("div",{className:"mt-5 flex flex-col relative p-5",children:[t.jsxs("div",{className:"flex justify-between mb-5",children:[t.jsx("p",{className:"font-bold text-xl mt-2",children:"Historique des Ventes"}),t.jsxs("div",{className:"flex w-[350px] h-10 border-2 border-secondary rounded-lg bg-white",children:[t.jsx(u,{className:"text-xl text-secondary m-2"}),t.jsx("input",{type:"text",placeholder:"Rechercher facture, patient...",value:o,onChange:e=>p(e.target.value),className:"border-none focus:outline-none focus:ring-0 w-full bg-transparent"})]})]}),h?t.jsx("div",{className:"flex justify-center p-10",children:t.jsx("span",{className:"loading loading-spinner text-primary-end"})}):d.length===0?t.jsxs("div",{className:"flex flex-col items-center justify-center py-10 bg-white rounded-lg shadow-sm border border-gray-200",children:[t.jsx(C,{className:"h-12 w-12 text-gray-400 mb-4"}),t.jsx("p",{className:"text-lg font-semibold text-gray-600",children:"Aucune vente trouvée"})]}):t.jsx("div",{className:"overflow-hidden",children:t.jsxs("table",{className:"w-full border-separate border-spacing-y-2",children:[t.jsx("thead",{children:t.jsxs("tr",{className:"bg-gradient-to-l from-primary-start to-primary-end",children:[t.jsx("th",{className:"text-center text-white p-4 text-xl font-bold rounded-l-lg",children:"Date"}),t.jsx("th",{className:"text-center text-white p-4 text-xl font-bold",children:"Code Facture"}),t.jsx("th",{className:"text-center text-white p-4 text-xl font-bold",children:"Patient"}),t.jsx("th",{className:"text-center text-white p-4 text-xl font-bold",children:"Montant"}),t.jsx("th",{className:"text-center text-white p-4 text-xl font-bold rounded-r-lg",children:"Action"})]})}),t.jsx("tbody",{children:d.map(e=>t.jsxs("tr",{className:"bg-gray-100 hover:bg-gray-200 transition-colors",children:[t.jsx("td",{className:"p-4 text-center font-bold text-blue-900 rounded-l-lg",children:t.jsxs("div",{className:"flex items-center justify-center gap-2",children:[t.jsx(y,{className:"text-gray-400"}),v(e.date)]})}),t.jsx("td",{className:"p-4 text-center font-bold text-gray-900",children:t.jsxs("div",{className:"flex items-center justify-center gap-2",children:[t.jsx(b,{className:"text-gray-400"}),e.billCode]})}),t.jsx("td",{className:"p-4 text-center font-semibold text-gray-700",children:t.jsxs("div",{className:"flex items-center justify-center gap-2",children:[t.jsx(j,{className:"text-gray-400"}),e.patientName]})}),t.jsxs("td",{className:"p-4 text-center font-black text-primary-end",children:[e.amount.toLocaleString()," FCFA"]}),t.jsx("td",{className:"p-4 text-center rounded-r-lg",children:t.jsxs("button",{onClick:()=>f(e),className:"bg-white border text-secondary px-4 py-2 rounded-full font-bold hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 mx-auto",children:[t.jsx(N,{})," Duplicata"]})})]},e.id))})]})})]})}export{D as S};
