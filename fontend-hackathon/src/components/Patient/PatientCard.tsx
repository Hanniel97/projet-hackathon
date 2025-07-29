import React from 'react';
import { User, Calendar, Phone, MapPin, Download } from 'lucide-react';
import { Patient } from '../../types';
import moment from 'moment';
import { API_BASE_URL } from '@/services/api';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';


interface PatientCardProps {
    patient: Patient;
    onClick?: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
    const { token } = useStore()

    const handleDownload = async () => {
        const loadingToast = toast.loading("Téléchargement en cours...");
        try {
            const response = await fetch(`${API_BASE_URL}/pdf/generate/${patient._id}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf',
                    Authorization: `Bearer ${token}`
                },
            });

            if (!response.ok) {
                // throw new Error('Erreur lors du téléchargement');
                toast.dismiss(loadingToast);
                toast.error("Erreur lors du téléchargement")
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `Dossier_${patient.lastName}_${patient.firstName}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.dismiss(loadingToast);
            toast.success("Dossier téléchargé")
        } catch (error) {
            console.error("Erreur téléchargement PDF:", error);
            // alert("Échec du téléchargement du dossier.");
            toast.dismiss(loadingToast);
            toast.error("Échec du téléchargement du dossier.")
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative"
        >
            <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {patient.firstName} {patient.lastName}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{moment(patient.dateOfBirth).format("DD/MM/YYYY")}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="h-4 w-4 flex items-center justify-center">
                                {patient.gender === 'M' ? '♂' : '♀'}
                            </span>
                            <span>{patient.gender === 'M' ? 'Homme' : 'Femme'}</span>
                        </div>

                        {patient.phone && (
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{patient.phone}</span>
                            </div>
                        )}

                        {patient.address && (
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{patient.address.street}</span>
                                <span className="truncate">{patient.address.city}</span>
                                <span className="truncate">{patient.address.zipCode}</span>
                                <span className="truncate">{patient.address.country}</span>
                            </div>
                        )}
                    </div>

                    {patient.antecedents && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Antécédents:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                                {patient.antecedents}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔽 Bouton Télécharger */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // évite de déclencher le onClick de la carte
                    handleDownload();
                }}
                className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1"
            >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
            </button>
        </div>
    );
};
