import { useStore } from '@/store/useStore';
// import axios from 'axios';

export const API_BASE_URL = 'http://192.168.100.4:5000/api';
// export const API_BASE_URL = 'https://backend-hackathon-ky2j.onrender.com/api';

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    method?: Method;
    endpoint: string;
    data?: any;
    token?: string;
    headers?: Record<string, string>;
    retry?: boolean;
    silentSuccess?: boolean;
}

export const apiRequest = async <T = any>({
    method = "GET",
    endpoint,
    data,
    token,
    headers = {},
    retry = true,
}: RequestOptions): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const store = useStore.getState();

    console.log("les endpoint", endpoint)

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    };

    if (data && method !== "GET") {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const responseData = isJson ? await response.json() : await response.text();

    if (response.status === 401 && retry && store.refresh_token) {
        try {
            // Rafraîchir le token
            const refreshRes = await fetch(`${API_BASE_URL}/refresh-token`, {
                // Utilise apiUrl pour le refresh token
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token: store.refresh_token }),
            });

            const refreshData = await refreshRes.json();

            if (!refreshRes.ok) {
                // store.setLogout(); // Décommenter si tu veux déconnecter l'utilisateur si le rafraîchissement échoue
                throw new Error(refreshData.message || "Session expirée");
            }

            store.setToken(refreshData.token);
            return await apiRequest({
                method,
                endpoint,
                data,
                token: refreshData.token,
                headers,
                retry: false, // ne pas re-réessayer encore après le rafraîchissement
            });
        } catch (err) {
            console.error("Refresh failed:", err);
            // Tu pourrais vouloir déconnecter l'utilisateur ici aussi si la session est vraiment finie
            // store.setLogout();
            throw err;
        }
    }

    return responseData;
};

// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Add token to requests
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// // Handle auth errors
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// export const authAPI = {
//     // login: (email: string, password: string) => api.post('/auth/login', { email, password }),
//     // register: (userData: any) => api.post('/auth/register', userData),
//     getProfile: () => api.get('/auth/me'),
//     update: (user: any) => api.put('/profile', user),
//     doctorList: () => api.get('/doctor/list'),
//     logout: () => api.put('/logout'),
// };

// export const patientsAPI = {
//     getAll: () => api.get('/patients'),
//     getById: (id: string) => api.get(`/patients/${id}`),
//     create: (patient: any) => api.post('/patients', patient),
//     update: (id: string, patient: any) => api.put(`/patients/${id}`, patient),
//     delete: (id: string) => api.delete(`/patients/${id}`),
//     search: (query: string) => api.get(`/patients/search?q=${query}`),
//     patientHistory: (id: string) => api.get(`/patients/${id}/history`),
//     patientStats: () => api.get(`/patients/stats/overview`),
// };

// export const consultationsAPI = {
//     getAll: () => api.get(`/consultations`),
//     getPatientAll: (patientId?: string) => api.get(`/consultations/patient/${patientId}`),
//     getById: (id: string) => api.get(`/consultations/${id}`),
//     create: (consultation: any) => api.post('/consultations', consultation),
//     update: (id: string, consultation: any) => api.put(`/consultations/${id}`, consultation),
//     delete: (id: string) => api.delete(`/consultations/${id}`),
//     consultationStats: () => api.get(`/consultations/stats/owerview`),
// };

// export const alertsAPI = {
//     getAll: () => api.get('/alerts'),
//     getById: (id: string) => api.get(`/alerts/${id}`),
//     getAlertDashboard: () => api.get('/alerts/dashboard'),
//     getCriticalAlerts: () => api.get('/alerts/critical'),
//     markAsRead: (id: string) => api.put(`/alerts/${id}/read`),
//     delete: (id: string) => api.delete(`/alerts/${id}`),
//     resolve: (id: string) => api.put(`/alerts/${id}/resolve`),
//     getPatientAlerts: (id: string) => api.get(`/alerts/patient/${id}`),
//     getAlertSatats: () => api.get(`/alerts/stats`),
// };

// export const pdfAPI = {
//     generatePatientReport: (patientId: string) =>
//         api.get(`/pdf/patient/gerenate/${patientId}`, { responseType: 'blob' }),
// };

// export default api;