import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard";
import { PharmacyNavbar } from "../PharmacyNavBar";
import { pharmacyNavLink } from "../lib/pharmacyNavLink";
import { PrescriptionSales } from './PrescriptionSales';
import { OTCSales } from './OTCSales';
import { SalesHistory } from './SalesHistory';
import { FileText, ShoppingBag, History, Star, ShoppingCart, LayoutGrid } from 'lucide-react';

export function PharmacySales() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get("tab") || "prescription";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = queryParams.get("tab");
        if (tab) setActiveTab(tab);
    }, [location.search]);

    const tabs = [
        { id: 'prescription', label: 'Sur Ordonnance', icon: FileText, desc: 'Recettes médicales' },
        { id: 'otc', label: 'Vente Directe', icon: ShoppingBag, desc: 'Ventes comptoir' },
        { id: 'history', label: 'Historique', icon: History, desc: 'Journal des ventes' },
    ];

    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
            <PharmacyNavbar />
            <div className="p-8 h-[calc(100vh-100px)] flex flex-col bg-slate-50/50 space-y-8 font-sans">

                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Terminal de Vente</h1>
                        </div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] ml-5">Gestion de la Pharmacie Centrale</p>
                    </div>

                    {/* Premium Tabs Navigation */}
                    <div className="flex p-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 items-center">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 font-black text-xs uppercase tracking-widest ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-2xl scale-105'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-400' : ''} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Dynamic Surface */}
                <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] -mr-32 -mt-32 pointer-events-none" />

                    <div className="w-full h-full relative z-10 overflow-hidden">
                        {activeTab === 'prescription' && <PrescriptionSales />}
                        {activeTab === 'otc' && <OTCSales />}
                        {activeTab === 'history' && <SalesHistory />}
                    </div>
                </div>

                {/* Quick Info / Footer Stats (Optional but premium) */}
                <div className="flex justify-between px-4 pb-2">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2">
                            <Star className="text-amber-400 fill-amber-400" size={14} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opérateur Connecté: <span className="text-slate-900">{sessionStorage.getItem('username') || 'Pharmacien'}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="text-indigo-500" size={14} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone: <span className="text-slate-900">PHARMACIE CENTRALE</span></span>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Système de gestion hospitalière FULTANG v1.0</p>
                </div>
            </div>
        </CustomDashboard>
    );
}
