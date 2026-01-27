import React from 'react';
import { CustomDashboard } from "../../../GlobalComponents/CustomDashboard";
import { PharmacyNavbar } from "../PharmacyNavBar";
import { pharmacyNavLink } from "../lib/pharmacyNavLink";
import { OTCSales } from './OTCSales';

export function OTCSalesPage() {
    return (
        <CustomDashboard linkList={pharmacyNavLink} requiredRole={"Pharmacist"}>
            <PharmacyNavbar />
            <div className="p-8 h-[calc(100vh-100px)] flex flex-col bg-slate-50/50 space-y-8 font-sans">
                <OTCSales />
            </div>
        </CustomDashboard>
    );
}
