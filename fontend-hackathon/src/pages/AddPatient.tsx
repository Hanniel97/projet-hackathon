import { apiRequest } from '@/services/api';
import { useStore } from '@/store/useStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { usePatientStore } from '../store/patientStore';
// import { useAuthStore } from '../store/authStore';

export const AddPatient: React.FC = () => {
    const navigate = useNavigate();
    const {token} = useStore()
    // const { createPatient } = usePatientStore();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'M',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            zipCode: '',
            country: 'Bénin'
        },
        medicalHistory: {
            diabetes: false,
            hypertension: false,
            cardiovascularDisease: false,
            familyHistoryKidneyDisease: false,
            allergies: [],
            currentMedications: [],
            otherConditions: []
        },
        ckdStage: 1,
        // assignedDoctor: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('address.')) {
            const key = name.split('.')[1];
            setForm({ ...form, address: { ...form.address, [key]: value } });
        } else if (name in form.medicalHistory) {
            setForm({
                ...form,
                medicalHistory: {
                    ...form.medicalHistory,
                    [name]: type === 'checkbox' ? checked : value
                }
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await apiRequest({
                method: "POST",
                endpoint: "/patients",
                token,
                data: form,
            });

            if(res.success){
                navigate('/patients');
            }else{
                console.log()
            }
        } catch (error) {
            console.error('Erreur ajout patient:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6">Ajouter un Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
                        <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-2">Adresse</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="address.street" placeholder="Rue" value={form.address.street} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input name="address.city" placeholder="Ville" value={form.address.city} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input name="address.zipCode" placeholder="Code postal" value={form.address.zipCode} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input name="address.country" placeholder="Pays" value={form.address.country} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-2">Antécédents médicaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(form.medicalHistory).map(([key, value]) =>
                            typeof value === 'boolean' ? (
                                <label key={key} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={value}
                                        onChange={handleChange}
                                        className="form-checkbox"
                                    />
                                    <span>{key}</span>
                                </label>
                            ) : null
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stade IRC</label>
                        <input type="number" name="ckdStage" min={1} max={5} value={form.ckdStage} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Médecin assigné</label>
                        <select name="assignedDoctor" value={form.assignedDoctor} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            {newDoctors.map((item) => (
                                <option key={item._id} value={item._id} >{item.lastName} {item.firstName}</option>
                            ))}
                            
                            <option value="F">Féminin</option>
                        </select>
                        <input name="assignedDoctor" value={form.assignedDoctor} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div> */}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={4} />
                </div>

                <div className="pt-4">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Ajouter le Patient
                    </button>
                </div>
            </form>
        </div>
    );
};
