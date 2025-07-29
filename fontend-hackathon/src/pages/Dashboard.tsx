import React, { useCallback, useEffect, useState } from 'react';
import { Users, FileText, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import { AlertBadge } from '../components/Alert/AlertBadge';
import { PatientCard } from '../components/Patient/PatientCard';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/services/api';
import { useStore } from '@/store/useStore';
import { Alert, Patient } from '@/types';

export const Dashboard: React.FC = () => {
    const { token, } = useStore()
    const navigate = useNavigate();
    // const { patients, fetchPatients } = usePatientStore();
    // const { alerts, fetchAlerts } = useAlertStore();
    const [loading, setLoading] = useState(true);
    const [patients, setPatient] = useState<Patient[]>([]);
    const [alerts, setAlerts] = useState({
        data: [],
        statistics: {
            total: 0, unread: 0, unresolved: 0, critical: 0
        }
    });
    const [consultation, setConsultations] = useState({
        data: [],
        total: 0
    });
    const [dataPatients, setDataPatient] = useState({
        totalPatients: 0,
        activePatients: 0,
        inactivePatients: 0,
        ckdDistribution: [],
        recentAlerts: 0,
        consultationsThisWeek: 0
    })
    const [dataConsultation, setDataConsultation] = useState(0)
    const [dataAlert, setDataAlert] = useState({
        criticalCount: 0,
        unresolvedCount: 0
    })

    const getPatients = useCallback(async () => {
        // setLaoding(true)
        const res = await apiRequest({
            method: "GET",
            endpoint: "/patients",
            token,
        });

        if (res.success) {
            // setLaoding(false)
            setPatient(res.data)
        } else {
            // setLaoding(false)
        }
    }, [token])

    const getAlerts = useCallback(async () => {
        // setLaoding(true)
        const res = await apiRequest({
            method: "GET",
            endpoint: "/alerts",
            token,
        });

        console.log("dfbfbjkl dfv", res)

        if (res.success) {
            // setLaoding(false)
            setAlerts(res)
        } else {
            // setLaoding(false)
        }
    }, [token])

    const getConsultation = useCallback(async () => {
        // setLaoding(true)
        const res = await apiRequest({
            method: "GET",
            endpoint: "/consultations",
            token,
        });

        console.log(res)

        if (res.success) {
            // setLaoding(false)
            setConsultations(res)
        } else {
            // setLaoding(false)
        }
    }, [token])

    useEffect(() => {
        getPatients();
        getAlerts();
        getConsultation();
    }, [getAlerts, getConsultation, getPatients]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [patientsRes, 
                    // consultationsRes, alertsRes

                ] = await Promise.all([
                    apiRequest({
                        method: "GET",
                        endpoint: "/patients/stats/overview",
                        token,
                    }),
                    // apiRequest({
                    //     method: "GET",
                    //     endpoint: "/consultations/count",
                    //     token,
                    // }),
                    // apiRequest({
                    //     method: "GET",
                    //     endpoint: "/alerts/count",
                    //     token,
                    // }),
                ])

                // console.log("Mes statrt", patientsRes, consultationsRes, alertsRes)

                if (patientsRes.success) {
                    setDataPatient(patientsRes)
                }
                // if (consultationsRes.success) {
                //     setDataConsultation(consultationsRes);
                // } else {
                //     // Si erreur ou pas de succès, on remet un objet avec valeurs par défaut
                //     setDataConsultation(consultationsRes.data);
                // }

                // if (alertsRes.success) {
                //     setDataAlert({
                //         criticalCount: alertsRes.data.criticalCount,
                //         unresolvedCount: alertsRes.data.unresolvedCount,
                //     });
                // }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token]);

    const stats = [
        {
            title: 'Total Patients',
            value: dataPatients.totalPatients,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+5 ce mois'
        },
        {
            title: 'Consultations',
            value: consultation.total,
            icon: FileText,
            color: 'bg-green-500',
            trend: '+12 cette semaine'
        },
        {
            title: 'Alertes Total',
            value: alerts.data.length,
            icon: Bell,
            color: 'bg-yellow-500',
            trend: alerts.data.length > 0 ? `${alerts.data.filter((a) => a.type === "critical").length} critique(s)` : 'Aucune critique'
        },
        {
            title: 'Alertes Critiques',
            value: alerts.data.length > 0 ? `${alerts.data.filter((a) => a.type === "critical").length}` : 0,
            icon: AlertTriangle,
            color: 'bg-red-500',
            trend: 'Attention requise'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Vue d'ensemble de votre pratique clinique</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.trend}</p>
                            </div>
                            <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Alerts */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Alertes Récentes</h2>
                        <button
                            onClick={() => navigate('/alerts')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Voir tout
                        </button>
                    </div>

                    <div className="space-y-3">
                        {alerts.data.length > 0 ? (
                            alerts.data.slice(0, 3).map((alert) => (
                                <AlertBadge
                                    key={alert._id}
                                    alert={alert}
                                    showPatient={true}
                                    onClick={() => navigate('/alerts')}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucune alerte récente</p>
                        )}
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Patients Récents</h2>
                        <button
                            onClick={() => navigate('/patients')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Voir tout
                        </button>
                    </div>

                    <div className="space-y-4">
                        {patients.length > 0 ? (
                            patients.slice(0, 2).map((patient) => (
                                <PatientCard
                                    key={patient._id}
                                    patient={patient}
                                    onClick={() => navigate(`/patients/details/${patient._id}`)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucun patient enregistré</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/patients/new')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-medium text-gray-700">Nouveau Patient</p>
                    </button>

                    <button
                        onClick={() => navigate('/consultation/new')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                    >
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-medium text-gray-700">Nouvelle Consultation</p>
                    </button>

                    <button
                        onClick={() => navigate('/reports')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
                    >
                        <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-medium text-gray-700">Générer Rapport</p>
                    </button>
                </div>
            </div>
        </div>
    );
};