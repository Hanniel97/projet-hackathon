// import { create } from 'zustand';
// import type { PatientState } from '../types';
// import { patientsAPI } from '../services/api';

// export const usePatientStore = create<PatientState>((set, get) => ({
//     patients: [],
//     selectedPatient: null,
//     loading: false,

//     fetchPatients: async () => {
//         set({ loading: true });
//         try {
//             const response = await patientsAPI.getAll();
//             console.log('all patient', response.data)
//             set({ patients: response.data, loading: false });
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     createPatient: async (patient) => {
//         try {
//             const response = await patientsAPI.create(patient);
//             const newPatient = response.data;
//             set(state => ({ patients: [...state.patients, newPatient] }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     updatePatient: async (id, patient) => {
//         try {
//             const response = await patientsAPI.update(id, patient);
//             const updatedPatient = response.data;
//             set(state => ({
//                 patients: state.patients.map(p => p._id === id ? updatedPatient : p),
//                 selectedPatient: state.selectedPatient?._id === id ? updatedPatient : state.selectedPatient
//             }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     deletePatient: async (id) => {
//         try {
//             await patientsAPI.delete(id);
//             set(state => ({
//                 patients: state.patients.filter(p => p._id !== id),
//                 selectedPatient: state.selectedPatient?._id === id ? null : state.selectedPatient
//             }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     setSelectedPatient: (patient) => {
//         set({ selectedPatient: patient });
//     },

//     searchPatients: async (query) => {
//         try {
//             const response = await patientsAPI.search(query);
//             return response.data;
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },
// }));