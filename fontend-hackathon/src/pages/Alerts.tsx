import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, BookCheckIcon, CheckCircle, Trash2 } from 'lucide-react';
// import { useAlertStore } from '../store/alertStore';
import { AlertBadge } from '../components/Alert/AlertBadge';
import { useStore } from '@/store/useStore';
import { apiRequest } from '@/services/api';
import toast from 'react-hot-toast';

export const Alerts: React.FC = () => {
    const { alerts, token, setAlerts } = useStore();
    // const { alerts, fetchAlerts, markAsRead, deleteAlert, loading } = useAlertStore();
    const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
    const [loading, setLaoding] = useState(true)

    // useEffect(() => {
    //     fetchAlerts();
    // }, [fetchAlerts]);

    const getAlerts = useCallback(async () => {
        setLaoding(true)
        const res = await apiRequest({
            method: "GET",
            endpoint: "/alerts",
            token,
        });

        if (res.success) {
            setLaoding(false)
            setAlerts(res.data)
        } else {
            setLaoding(false)
        }
    }, [setAlerts, token])

    useEffect(() => {
        getAlerts();
    }, [getAlerts]);

    const filteredAlerts = Array.isArray(alerts)
        ? alerts.filter(alert => {
            switch (filter) {
                case 'unread':
                    return !alert.isRead;
                case 'critical':
                    return alert.type === "critical";
                default:
                    return true;
            }
        })
        : [];

    const handleMarkAsRead = async (alertId: string) => {
        try {
            const loadingToast = toast.loading("En cours...");
            const res = await apiRequest({
                method: "PUT",
                endpoint: "/alerts/" + alertId + "/read",
                token,
            });

            if (res.success) {
                setLaoding(false)
                toast.dismiss(loadingToast);
                toast.success(res.message)
                getAlerts()
            } else {
                toast.dismiss(loadingToast);
                toast.error(res.message)
                setLaoding(false)
            }
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    const handleResolve = async (alertId: string) => {
        // if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {

        // }
        try {
            const loadingToast = toast.loading("En cours...");
            const res = await apiRequest({
                method: "PUT",
                endpoint: "/alerts/" + alertId + "/resolve",
                token,
            });

            if (res.success) {
                setLaoding(false)
                toast.dismiss(loadingToast);
                toast.success(res.message)
                getAlerts()
            } else {
                toast.dismiss(loadingToast);
                toast.error(res.message)
                setLaoding(false)
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Alertes Cliniques</h1>
                    <p className="text-gray-600">Surveillance des paramètres critiques</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Toutes
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'unread'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Non lues
                        </button>
                        <button
                            onClick={() => setFilter('critical')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'critical'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Critiques
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {alerts.length} alerte
                            {/* {filteredAlerts.length !== 1 ? 's' : ''} */}
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                                <span>Critique</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                                <span>Élevé</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                                <span>Moyen</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                <span>Faible</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map((alert) => (
                            <div key={alert._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <AlertBadge alert={alert} showPatient={true} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {!alert.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(alert._id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Marquer comme lu"
                                            >
                                                <BookCheckIcon className="h-5 w-5" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleResolve(alert._id)}
                                            className="p-2 text-yellow-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Aucune alerte
                            </h3>
                            <p className="text-gray-600">
                                {filter === 'all'
                                    ? 'Aucune alerte pour le moment'
                                    : filter === 'unread'
                                        ? 'Aucune alerte non lue'
                                        : 'Aucune alerte critique'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};