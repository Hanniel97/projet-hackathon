import { User } from "../models/user.model.js";
import { Patient } from "../models/patient.model.js";
import { Consultation } from "../models/consultation.model.js";
import { Alert } from "../models/alert.model.js";
import Joi from "joi";
import jwt from "jsonwebtoken";

// Schéma de validation pour la création/modification d'un patient
const patientSchema = Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('M', 'F').required(),
    phone: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    address: Joi.object({
        street: Joi.string().allow(''),
        city: Joi.string().allow(''),
        zipCode: Joi.string().allow(''),
        country: Joi.string().default('Bénin')
    }),
    medicalHistory: Joi.object({
        diabetes: Joi.boolean().default(false),
        hypertension: Joi.boolean().default(false),
        cardiovascularDisease: Joi.boolean().default(false),
        familyHistoryKidneyDisease: Joi.boolean().default(false),
        allergies: Joi.array().items(Joi.string()),
        currentMedications: Joi.array().items(Joi.string()),
        otherConditions: Joi.array().items(Joi.string())
    }),
    ckdStage: Joi.number().min(1).max(5).default(1),
    notes: Joi.string().allow('')
});

// Fonction pour générer un ID patient unique
const generatePatientId = async () => {
    const year = new Date().getFullYear();
    const count = await Patient.countDocuments();
    return `PAT${year}${String(count + 1).padStart(4, '0')}`;
};

export const getPatientsList = async (req, res) => {
    try {

        const patients = await Patient.find({isActive: true})
            .populate('assignedDoctor', 'firstName lastName email')
            .sort({ createdAt: -1 })

        const total = await Patient.countDocuments();

        // console.log(patients)

        res.status(200).json({
            success: true,
            data: patients,
            total
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getPatients = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', ckdStage, isActive = true } = req.query;

        // Construction du filtre
        let filter = {};

        // Les admins voient tous les patients, les autres seulement leurs patients assignés
        if (req.user.role !== 'admin') {
            filter.assignedDoctor = req.user.userId;
        }

        // console.log(req.user.role)

        if (isActive !== 'all') {
            filter.isActive = isActive === 'true';
        }

        if (ckdStage) {
            filter.ckdStage = ckdStage;
        }

        // Recherche textuelle
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { patientId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const patients = await Patient.find()
            .populate('assignedDoctor', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Patient.countDocuments();

        // console.log(patients)

        res.status(200).json({
            success: true,
            data: patients,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('assignedDoctor', 'firstName lastName email speciality');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé'
            });
        }

        // Vérifier les droits d'accès
        if (req.user.role !== 'admin' && patient.assignedDoctor._id.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Ce patient ne vous est pas assigné.'
            });
        }

        // Récupérer les consultations récentes
        const recentConsultations = await Consultation.find({ patient: patient._id })
            .populate('doctor', 'firstName lastName')
            .sort({ consultationDate: -1 })
            .limit(5);

        // Récupérer les alertes actives
        const activeAlerts = await Alert.find({
            patient: patient._id,
            isResolved: false
        })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            patient,
            recentConsultations,
            activeAlerts,
            statistics: {
                totalConsultations: await Consultation.countDocuments({ patient: patient._id }),
                totalAlerts: await Alert.countDocuments({ patient: patient._id }),
                unresolvedAlerts: activeAlerts.length
            }
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const addPatient = async (req, res) => {
    try {
        console.log(req.body)
        // Validation des données
        // const { error, value } = patientSchema.validate(req.body);
        // if (error) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Données invalides',
        //         details: error.details[0].message
        //     });
        // }

        // Générer un ID patient unique
        const patientId = await generatePatientId();

        // Créer le patient
        const patient = new Patient({
            ...req.body,
            patientId,
            assignedDoctor: req.user.userId
        });

        await patient.save();
        await patient.populate('assignedDoctor', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Patient créé avec succès',
            patient
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { error, value } = patientSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                details: error.details[0].message
            });
        }

        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { ...value, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('assignedDoctor', 'firstName lastName email');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Patient mis à jour avec succès',
            data: patient
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Patient désactivé avec succès',
            data: patient
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
}

export const getPatientHistory = async (req, res) => {
    try {
        const { startDate, endDate, limit = 50 } = req.query;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.consultationDate = {};
            if (startDate) dateFilter.consultationDate.$gte = new Date(startDate);
            if (endDate) dateFilter.consultationDate.$lte = new Date(endDate);
        }

        const consultations = await Consultation.find({
            patient: req.params.id,
            ...dateFilter
        })
            .populate('doctor', 'firstName lastName speciality')
            .populate('alertsTriggered')
            .sort({ consultationDate: -1 })
            .limit(limit);

        const alerts = await Alert.find({
            patient: req.params.id,
            ...dateFilter
        })
            .populate('consultation', 'consultationDate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            consultations,
            alerts,
            summary: {
                totalConsultations: consultations.length,
                totalAlerts: alerts.length,
                criticalAlerts: alerts.filter(a => a.type === 'critical').length,
                unresolvedAlerts: alerts.filter(a => !a.isResolved).length
            }
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
}

export const getGlobalStats = async (req, res) => {
    try {
        let filter = {};

        // Les médecins voient seulement leurs patients
        if (req.user.role !== 'admin') {
            filter.assignedDoctor = req.user.userId;
        }

        const totalPatients = await Patient.countDocuments(filter);
        const activePatients = await Patient.countDocuments({ ...filter, isActive: true });

        // Répartition par stade CKD
        const ckdDistribution = await Patient.aggregate([
            { $match: filter },
            { $group: { _id: '$ckdStage', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Alertes récentes
        const recentAlerts = await Alert.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            isResolved: false
        });

        // Consultations cette semaine
        const consultationsThisWeek = await Consultation.countDocuments({
            consultationDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        res.status(200).json({
            success: true,
            totalPatients,
            activePatients,
            inactivePatients: totalPatients - activePatients,
            ckdDistribution,
            recentAlerts,
            consultationsThisWeek
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
}