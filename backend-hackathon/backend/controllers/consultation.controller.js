import { Patient } from "../models/patient.model.js";
import { Consultation } from "../models/consultation.model.js";
import { checkAlerts } from "../utils/alert.system.utils.js";
import { Alert } from "../models/alert.model.js";
import Joi from "joi";

// Schéma de validation pour les consultations
const consultationSchema = Joi.object({
    patient: Joi.string().required(),
    consultationDate: Joi.date().default(Date.now),
    clinicalData: Joi.object({
        weight: Joi.number().min(0).max(500),
        height: Joi.number().min(0).max(300),
        bloodPressure: Joi.object({
            systolic: Joi.number().min(0).max(300),
            diastolic: Joi.number().min(0).max(200)
        }),
        heartRate: Joi.number().min(0).max(250),
        temperature: Joi.number().min(30).max(45)
    }),
    laboratoryResults: Joi.object({
        creatinine: Joi.number().min(0),
        urea: Joi.number().min(0),
        gfr: Joi.number().min(0),
        proteinuria: Joi.number().min(0),
        hemoglobin: Joi.number().min(0),
        phosphorus: Joi.number().min(0),
        calcium: Joi.number().min(0),
        potassium: Joi.number().min(0),
        sodium: Joi.number().min(0)
    }),
    symptoms: Joi.array().items(Joi.string()),
    diagnosis: Joi.string().allow(''),
    treatment: Joi.object({
        medications: Joi.array().items(Joi.string()),
        dosages: Joi.array().items(Joi.string()),
        recommendations: Joi.array().items(Joi.string())
    }),
    nextAppointment: Joi.date(),
    notes: Joi.string().allow('')
});

export const getConsultations = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            patientId,
            startDate,
            endDate,
            hasAlerts
        } = req.query;

        // Construction du filtre
        let filter = {};

        // Les médecins voient seulement leurs consultations
        if (req.user.role !== 'admin') {
            filter.doctor = req.user.userId;
        }

        if (patientId) {
            filter.patient = patientId;
        }

        // Filtre par date
        if (startDate || endDate) {
            filter.consultationDate = {};
            if (startDate) filter.consultationDate.$gte = new Date(startDate);
            if (endDate) filter.consultationDate.$lte = new Date(endDate);
        }

        // Filtre par présence d'alertes
        if (hasAlerts === 'true') {
            filter.alertsTriggered = { $exists: true, $not: { $size: 0 } };
        }

        const consultations = await Consultation.find(filter)
            .populate('patient', 'firstName lastName patientId ckdStage')
            .populate('doctor', 'firstName lastName speciality')
            .populate('alertsTriggered')
            .sort({ consultationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Consultation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: consultations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getConsultationById = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id)
            .populate('patient', 'firstName lastName patientId ckdStage dateOfBirth gender')
            .populate('doctor', 'firstName lastName speciality')
            .populate('alertsTriggered');

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation non trouvée'
            });
        }

        // Vérifier les droits d'accès
        if (req.user.role !== 'admin' && consultation.doctor._id.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                message: 'Accès refusé'
            });
        }

        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const addConsultation = async (req, res) => {
    try {
        // Validation des données
        const { error, value } = consultationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                details: error.details[0].message
            });
        }

        // Vérifier que le patient existe et appartient au médecin
        const patient = await Patient.findById(value.patient);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé'
            });
        }

        if (req.user.role !== 'admin' && patient.assignedDoctor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Ce patient ne vous est pas assigné.'
            });
        }

        // Créer la consultation
        const consultation = new Consultation({
            ...value,
            doctor: req.user.userId
        });

        await consultation.save();

        // Vérifier les alertes après sauvegarde
        const triggeredAlerts = await checkAlerts(consultation);

        // Mettre à jour la consultation avec les alertes
        if (triggeredAlerts.length > 0) {
            consultation.alertsTriggered = triggeredAlerts.map(alert => alert._id);
            await consultation.save();
        }

        // Peupler les données pour la réponse
        await consultation.populate([
            { path: 'patient', select: 'firstName lastName patientId ckdStage' },
            { path: 'doctor', select: 'firstName lastName speciality' },
            { path: 'alertsTriggered' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Consultation créée avec succès',
            data: consultation,
            alertsCount: triggeredAlerts.length
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const updateConsultation = async (req, res) => {
    try {
        // Validation des données
        const { error, value } = consultationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                details: error.details[0].message
            });
        }

        // Trouver la consultation existante
        const existingConsultation = await Consultation.findById(req.params.id);
        if (!existingConsultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation non trouvée'
            });
        }

        // Vérifier les droits d'accès
        if (req.user.role !== 'admin' && existingConsultation.doctor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // Mettre à jour la consultation
        const consultation = await Consultation.findByIdAndUpdate(
            req.params.id,
            { ...value, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        // Revérifier les alertes après mise à jour
        const triggeredAlerts = await checkAlerts(consultation);

        // Supprimer les anciennes alertes de cette consultation
        await Alert.deleteMany({ consultation: consultation._id });

        // Mettre à jour avec les nouvelles alertes
        if (triggeredAlerts.length > 0) {
            consultation.alertsTriggered = triggeredAlerts.map(alert => alert._id);
            await consultation.save();
        } else {
            consultation.alertsTriggered = [];
            await consultation.save();
        }

        await consultation.populate([
            { path: 'patient', select: 'firstName lastName patientId ckdStage' },
            { path: 'doctor', select: 'firstName lastName speciality' },
            { path: 'alertsTriggered' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Consultation mise à jour avec succès',
            consultation,
            alertsCount: triggeredAlerts.length
        });

    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const deleteConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation non trouvée'
            });
        }

        // Vérifier les droits d'accès
        if (req.user.role !== 'admin' && consultation.doctor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // Supprimer les alertes associées
        await Alert.deleteMany({ consultation: consultation._id });

        // Supprimer la consultation
        await Consultation.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Consultation supprimée avec succès'
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getPatientConsultations = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;

        const consultations = await Consultation.find({ patient: req.params.patientId })
            .populate('doctor', 'firstName lastName speciality')
            .populate('alertsTriggered')
            .sort({ consultationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Consultation.countDocuments({ patient: req.params.patientId });

        // Calculer quelques statistiques
        const stats = await Consultation.aggregate([
            { $match: { patient: mongoose.Types.ObjectId(req.params.patientId) } },
            {
                $group: {
                    _id: null,
                    totalConsultations: { $sum: 1 },
                    avgWeight: { $avg: '$clinicalData.weight' },
                    avgSystolic: { $avg: '$clinicalData.bloodPressure.systolic' },
                    avgDiastolic: { $avg: '$clinicalData.bloodPressure.diastolic' },
                    avgCreatinine: { $avg: '$laboratoryResults.creatinine' },
                    avgGfr: { $avg: '$laboratoryResults.gfr' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            consultations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            statistics: stats[0] || {}
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getConsultationStats = async (req, res) => {
    try {
        const { period = '30' } = req.query; // Période en jours
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

        let matchFilter = { consultationDate: { $gte: startDate } };

        // Les médecins voient seulement leurs consultations
        if (req.user.role !== 'admin') {
            matchFilter.doctor = mongoose.Types.ObjectId(req.user.userId);
        }

        const stats = await Consultation.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalConsultations: { $sum: 1 },
                    patientsConsulted: { $addToSet: '$patient' },
                    alertsGenerated: { $sum: { $size: '$alertsTriggered' } },
                    avgConsultationsPerDay: {
                        $avg: {
                            $divide: [
                                { $sum: 1 },
                                { $divide: [{ $subtract: [new Date(), startDate] }, 1000 * 60 * 60 * 24] }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    totalConsultations: 1,
                    uniquePatients: { $size: '$patientsConsulted' },
                    alertsGenerated: 1,
                    avgConsultationsPerDay: { $round: ['$avgConsultationsPerDay', 2] }
                }
            }
        ]);

        // Consultations par jour pour le graphique
        const dailyStats = await Consultation.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$consultationDate' } },
                    count: { $sum: 1 },
                    alerts: { $sum: { $size: '$alertsTriggered' } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            overview: stats[0] || {
                totalConsultations: 0,
                uniquePatients: 0,
                alertsGenerated: 0,
                avgConsultationsPerDay: 0
            },
            dailyTrend: dailyStats
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};