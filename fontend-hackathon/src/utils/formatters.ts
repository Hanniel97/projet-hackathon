import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatString: string = 'dd/MM/yyyy') => {
    try {
        return format(new Date(date), formatString, { locale: fr });
    } catch (error) {
        console.log(error)
        return 'Date invalide';
    }
};

export const formatDateTime = (date: string | Date) => {
    return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatAge = (birthDate: string | Date) => {
    try {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return `${age} ans`;
    } catch (error) {
        console.log(error)
        return 'Âge inconnu';
    }
};

export const formatPhoneNumber = (phone: string) => {
    // Simple French phone number formatting
    if (phone.length === 10) {
        return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phone;
};