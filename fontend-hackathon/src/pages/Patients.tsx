import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
// import { usePatientStore } from '../store/patientStore';
import { PatientCard } from '../components/Patient/PatientCard';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { apiRequest } from '@/services/api';

export const Patients: React.FC = () => {
    const {token, setPatient} = useStore();
    const { patients } = useStore();
    const navigate = useNavigate();
    // const { patients, fetchPatients, loading } = usePatientStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState(patients);
    const [loading, setLaoding] = useState(false)

    const getPatients = useCallback(async () => {
        setLaoding(true)
        const res = await apiRequest({
            method: "GET",
            endpoint: "/patients",
            token,
        });

        if(res.success){
            setLaoding(false)
            setPatient(res.data)
        }else{
            setLaoding(false)
        }
    }, [setPatient, token])

    useEffect(() => {
        getPatients();
    }, [getPatients]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = patients.filter(patient =>
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone?.includes(searchTerm)
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [patients, searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // console.log("fbefbvdv", filteredPatients.data)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-600">Gérer les dossiers patients</p>
                </div>
                <button
                    onClick={() => navigate('/patients/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>Nouveau Patient</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, prénom ou téléphone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {/* <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filtres</span>
                    </button> */}
                    {/* <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Download className="h-5 w-5" />
                        <span>Exporter</span>
                    </button> */}
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} trouvé{filteredPatients.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <PatientCard
                                key={patient._id}
                                patient={patient}
                                onClick={() => navigate(`/patients/details/${patient._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm
                                ? 'Essayez de modifier vos critères de recherche'
                                : 'Commencez par ajouter votre premier patient'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => navigate('/patients/new')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Ajouter un patient
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};