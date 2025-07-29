import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '@/services/api';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export const AddConsultation: React.FC = () => {
    const { token } = useStore();
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [patients, setPatients] = useState<any[]>([]);
    const [form, setForm] = useState({
        patient: patientId || '',
        consultationDate: new Date().toISOString().split('T')[0],
        clinicalData: {
            weight: '',
            height: '',
            bloodPressure: { systolic: '', diastolic: '' },
            heartRate: '',
            temperature: ''
        },
        laboratoryResults: {
            creatinine: '', urea: '', gfr: '', proteinuria: '', hemoglobin: '',
            phosphorus: '', calcium: '', potassium: '', sodium: ''
        },
        symptoms: '',
        diagnosis: '',
        treatment: {
            medications: '', dosages: '', recommendations: ''
        },
        nextAppointment: '',
        notes: ''
    });

    const fetchPatients = useCallback(async () => {
        const res = await apiRequest({ method: 'GET', endpoint: '/patients/list', token });
        if (res.success) setPatients(res.data);
    }, [token]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const keys = name.split('.');
            setForm(prev => {
                const updated = { ...prev };
                let ref: any = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    ref = ref[keys[i]];
                }
                ref[keys[keys.length - 1]] = value;
                return updated;
            });
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        const loadingToast = toast.loading("Enregistrement en cours...");
        const body = {
            ...form,
            symptoms: form.symptoms.split(',').map(s => s.trim()),
            treatment: {
                medications: form.treatment.medications.split(',').map(m => m.trim()),
                dosages: form.treatment.dosages.split(',').map(d => d.trim()),
                recommendations: form.treatment.recommendations.split(',').map(r => r.trim())
            }


        };

        const res = await apiRequest({ method: 'POST', endpoint: '/consultations', token, data: body });
        if (res.success) {
            toast.dismiss(loadingToast);
            toast.success(res.message)
            navigate(`/patients/details/${form.patient}`)
        } else {
            toast.dismiss(loadingToast);
            toast.error(res.message)
        };
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Nouvelle Consultation</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:text-blue-800"
                >Retour</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patient</label>
                        <select
                            name="patient"
                            value={form.patient}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">-- Choisir un patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.firstName} {p.lastName} (ID: {p.patientId})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date de consultation</label>
                        <input
                            type="date"
                            name="consultationDate"
                            value={form.consultationDate}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Données Cliniques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="number" placeholder="Poids (kg)" name="clinicalData.weight" value={form.clinicalData.weight} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" placeholder="Taille (cm)" name="clinicalData.height" value={form.clinicalData.height} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" placeholder="Tension Systolique" name="clinicalData.bloodPressure.systolic" value={form.clinicalData.bloodPressure.systolic} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" placeholder="Tension Diastolique" name="clinicalData.bloodPressure.diastolic" value={form.clinicalData.bloodPressure.diastolic} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="number" placeholder="Fréquence cardiaque (bpm)" name="clinicalData.heartRate" value={form.clinicalData.heartRate} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input min={10} max={38} type="number" placeholder="Température (°C)" name="clinicalData.temperature" value={form.clinicalData.temperature} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Résultats de Laboratoire</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(form.laboratoryResults).map(key => (
                            <input
                                key={key}
                                type="number"
                                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                name={`laboratoryResults.${key}`}
                                value={(form.laboratoryResults as any)[key]}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ))}
                    </div>
                </div>

                <textarea
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    placeholder="Symptômes (séparés par des virgules)"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <textarea
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    placeholder="Diagnostic"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Traitement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea name="treatment.medications" value={form.treatment.medications} onChange={handleChange} placeholder="Médicaments (virgules)" className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <textarea name="treatment.dosages" value={form.treatment.dosages} onChange={handleChange} placeholder="Dosages (virgules)" className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <textarea name="treatment.recommendations" value={form.treatment.recommendations} onChange={handleChange} placeholder="Recommandations (virgules)" className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                </div>

                <input
                    type="date"
                    name="nextAppointment"
                    value={form.nextAppointment}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Notes"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                    Enregistrer la consultation
                </button>
            </div>
        </div>
    );
};
