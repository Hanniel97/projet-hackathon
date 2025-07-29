export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean,
    lastLogin: date,
}

export interface Patient {
    _id: string;
    patientId: string,
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F';
    phone?: string;
    email?: string,
    address?: {
        street: string,
        city: string,
        zipCode: string,
        country: string
    };
    medicalHistory: {
        diabetes: boolean,
        hypertension: boolean,
        cardiovascularDisease: boolean,
        familyHistoryKidneyDisease: boolean,
        allergies: string[],
        currentMedications: string[],
        otherConditions: string[],
    },
    ckdStage: number,
    assignedDoctor: User,
    isActive: boolean,
    antecedents?: string;
    notes?: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface Consultation {
    _id: string;
    patient: string | Patient;
    doctor: User,
    consultationDate: Date;
    clinicalData: {
        weight: number,
        height: number,
        bloodPressure: {
            systolic: number,
            diastolic: number
        },
        heartRate: number,
        temperature: number,
    },
    motifConsultation?: string;
    symptoms?: string[],
    resultatsLabo?: {
        creatinine: number, // mg/dL
        urea: number, // mg/dL
        gfr: number, // mL/min/1.73m²
        proteinuria: number, // g/24h
        hemoglobin: number, // g/dL
        phosphorus: number, // mg/dL
        calcium: number, // mg/dL
        potassium: number, // mEq/L
        sodium: number // mEq/L
    };
    diagnosis?: string;
    traitement?: {
        medications: string[],
        dosages: string[],
        recommendations: string[]
    };
    nextAppointment: Date,
    notes: string,
    alertsTriggered: Alert[]
    createdAt: Date,
    updatedAt: Date,
}

export interface Alert {
    _id: string;
    patient: string | Patient;
    consultation: string | Consultation;
    type: string;
    title: string,
    message: string;
    value: string,
    category: 'laboratory' | 'clinical' | 'medication' | 'appointment';
    isRead: boolean;
    isResolved: boolean,
    resolvedBy: User,
    resolvedAt: Date,
    priority: number,
    createdAt: Date,
    updatedAt: Date,
}

export interface AuthState {
    loading: boolean,
    user: User | null;
    // token: string;
    isAuthenticated: boolean;
    // doctors: User[]
    // login: (email: string, password: string) => Promise<void>;
    // register: (userData: User) => Promise<void>;
    // logout: () => void;
    // fetchDoctor: () => void;
    // setUser: (user: User, token: string) => void;
}

export interface PatientState {
    patients: Patient[];
    selectedPatient: Patient | null;
    loading: boolean;
    fetchPatients: () => Promise<void>;
    createPatient: (patient: Omit<Patient, '_id' | 'dateCreation'>) => Promise<void>;
    updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    setSelectedPatient: (patient: Patient | null) => void;
    searchPatients: (query: string) => Promise<Patient[]>;
}

export interface ConsultationState {
    consultations: Consultation[];
    loading: boolean;
    fetchConsultations: (patientId?: string) => Promise<void>;
    createConsultation: (consultation: Omit<Consultation, '_id' | 'dateCreation'>) => Promise<void>;
    updateConsultation: (id: string, consultation: Partial<Consultation>) => Promise<void>;
    deleteConsultation: (id: string) => Promise<void>;
}

export interface AlertState {
    alerts: Alert[];
    unreadCount: number;
    loading: boolean;
    fetchAlerts: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    deleteAlert: (id: string) => Promise<void>;
}

export interface RegisterData {
    email: string,
    password: string,
    confirmPassword: string,
    lastName: string,
    firstName: string,
    role: string,
    speciality: string
}