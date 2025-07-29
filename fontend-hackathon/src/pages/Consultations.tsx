import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Stethoscope, User2 } from "lucide-react"; // Icônes si dispo
import { useStore } from "@/store/useStore";
import { apiRequest } from "@/services/api";

export default function Consultations() {
    const {token, consultations, setConsultations} = useStore()
    const [loading, setLoading] = useState(true);

    const getConsultation = useCallback(async () => {
        setLoading(true)
        const res = await apiRequest({
            method: "GET",
            endpoint: "/consultations",
            token,
        });

        if (res.success) {
            setLoading(false)
            setConsultations(res.data)
        } else {
            setLoading(false)
        }
    }, [setConsultations, token])

    useEffect(() => {
        getConsultation();
    }, [getConsultation]);

    if (loading) return <p className="p-6">Chargement des consultations...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Consultations récentes</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-sm">
                    <thead className="bg-gray-100 text-left text-sm text-gray-600">
                        <tr>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Médecin</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Diagnostic</th>
                            <th className="px-4 py-3">Prochain RDV</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                        {consultations.map((c) => (
                            <tr key={c._id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 flex items-center gap-2">
                                    <User2 className="w-4 h-4 text-gray-500" />
                                    {c.patient?.fullName}
                                </td>
                                <td className="px-4 py-3">
                                    <Stethoscope className="inline w-4 h-4 mr-1 text-gray-500" />
                                    {c.doctor?.fullName}
                                </td>
                                <td className="px-4 py-3">
                                    <CalendarDays className="inline w-4 h-4 mr-1 text-gray-500" />
                                    {new Date(c.consultationDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">{c.diagnosis || "—"}</td>
                                <td className="px-4 py-3">
                                    {c.nextAppointment ? new Date(c.nextAppointment).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <button className="text-blue-600 hover:underline text-sm">Voir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
