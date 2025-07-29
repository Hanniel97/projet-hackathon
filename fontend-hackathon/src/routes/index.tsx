import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "@/components/PublicRoute";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { PatientDetails } from "@/components/Patient/PatientDetails";
import { AddConsultation } from "@/pages/AddConsultation";
import { AddPatient } from "@/pages/AddPatient";
import { Alerts } from "@/pages/Alerts";
import { Dashboard } from "@/pages/Dashboard";
import { Patients } from "@/pages/Patients";
import Layout from "@/components/Layout/Layout";
import Consultations from "@/pages/Consultations";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/patients/new" element={<AddPatient />} />
                    <Route path="/patients/details/:id" element={<PatientDetails />} />
                    <Route path="/consultation/new" element={<AddConsultation />} />
                    <Route path="/consultations" element={<Consultations />} />
                    <Route path="/reports" element={<div className="p-8 text-center text-gray-500">Page Rapports - En développement</div>} />
                    <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Page Paramètres - En développement</div>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>

            </Routes>
        </BrowserRouter>
    )
}