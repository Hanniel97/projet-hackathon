export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ALERT_LEVELS = {
    low: {
        label: 'Faible',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
    },
    medium: {
        label: 'Moyen',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
    },
    high: {
        label: 'Élevé',
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-200'
    },
    critical: {
        label: 'Critique',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
    }
};

export const PATIENT_SEXES = {
    M: 'Homme',
    F: 'Femme'
};

export const USER_ROLES = {
    'Médecin': 'Médecin',
    'Néphrologue': 'Néphrologue',
    'Infirmier': 'Infirmier'
};