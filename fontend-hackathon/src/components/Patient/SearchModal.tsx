import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar } from 'lucide-react';
// import { usePatientStore } from '../../store/patientStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '@/store/useStore';

interface SearchModalProps {
    onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
    const {patients} = useStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // const { searchPatients, setSelectedPatient } = usePatientStore();
    const navigate = useNavigate();

    useEffect(() => {
        const searchTimer = setTimeout(async () => {
            if (query.trim().length > 2) {
                setLoading(true);
                try {
                    // const patients = await searchPatients(query);
                    setResults(patients);
                } catch (error) {
                    console.error('Erreur de recherche:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(searchTimer);
    }, [patients, query]);

    const handleSelectPatient = (patient: any) => {
        // setSelectedPatient(patient);
        navigate(`/patients/${patient._id}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Rechercher un patient</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nom, prénom ou numéro de patient..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-gray-500">
                            Recherche en cours...
                        </div>
                    )}

                    {!loading && query.length > 2 && results.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                            Aucun patient trouvé
                        </div>
                    )}

                    {results.map((patient) => (
                        <button
                            key={patient._id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center space-x-3"
                        >
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                    {patient.prenom} {patient.nom}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {format(new Date(patient.dateNaissance), 'dd/MM/yyyy', { locale: fr })}
                                    </span>
                                    <span>{patient.sexe === 'M' ? 'Homme' : 'Femme'}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};