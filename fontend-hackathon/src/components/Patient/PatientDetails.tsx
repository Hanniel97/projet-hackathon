import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { apiRequest } from '@/services/api';
import { Patient } from '@/types';
import moment from 'moment';
import { AlertBadge } from '../Alert/AlertBadge';

export const PatientDetails: React.FC = () => {
    const { token } = useStore();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});

    const { id } = useParams();
    const navigate = useNavigate();

    const getPatient = useCallback(async () => {
        setLoading(true);
        const res = await apiRequest({
            method: "GET",
            endpoint: "/patients/" + id,
            token,
        });

        if (res.success) {
            setPatient(res.patient);
            setConsultations(res.recentConsultations);
            setAlerts(res.activeAlerts);
            setStats(res.statistics);
        }

        setLoading(false);
    }, [id, token]);

    useEffect(() => {
        getPatient();
    }, [getPatient]);

    if (!id && loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Aucune info trouvée</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Détails du Patient</h1>
                    <p className="text-gray-600">Informations personnelles et médicales</p>
                </div>
                <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800">
                    <ArrowLeft className="mr-1 h-5 w-5" /> Retour
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>ID:</strong> {patient.patientId}</p>
                    <p><strong>Nom:</strong> {patient.firstName} {patient.lastName}</p>
                    <p><strong>Date de naissance:</strong> {moment(patient.dateOfBirth).format("DD/MM/YYYY")}</p>
                    <p><strong>Sexe:</strong> {patient.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                    <p><strong>Téléphone:</strong> {patient.phone}</p>
                    <p><strong>Email:</strong> {patient.email}</p>
                    <p><strong>Stade IRC:</strong> {patient.ckdStage}</p>
                    <p><strong>Médecin Assigné:</strong> {patient.assignedDoctor?.firstName}</p>
                    <p><strong>Statut:</strong> {patient.isActive ? 'Actif' : 'Inactif'}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Adresse</h3>
                    <p>{patient.address?.street}, {patient.address?.city}, {patient.address?.zipCode}, {patient.address?.country}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Antécédents Médicaux</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {Object.entries(patient.medicalHistory).map(([key, value]) => (
                            Array.isArray(value)
                                ? value.length > 0 && (
                                    <li key={key}><strong>{key}:</strong> {value.join(', ')}</li>
                                )
                                : value && <li key={key}><strong>{key}</strong></li>
                        ))}
                    </ul>
                </div>

                {patient.notes && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-line">{patient.notes}</p>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Consultations Récentes</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {consultations.map((c, i) => (
                            <li key={i}>{moment(c.consultationDate).format('DD/MM/YYYY')} - {c.doctor?.firstName} {c.doctor?.lastName}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Alertes Actives</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {alerts.map((a, i) => (
                            // <li key={i}><strong>{a.title}</strong>: {a.message}</li>
                            <AlertBadge
                                key={a._id}
                                alert={a}
                                showPatient={true}
                                // onClick={() => navigate('/alerts')}
                            />
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Statistiques</h3>
                    <p><strong>Total des consultations:</strong> {stats.totalConsultations}</p>
                    <p><strong>Total des alertes:</strong> {stats.totalAlerts}</p>
                    <p><strong>Alertes non résolues:</strong> {stats.unresolvedAlerts}</p>
                </div>
            </div>
        </div>
    );
};
