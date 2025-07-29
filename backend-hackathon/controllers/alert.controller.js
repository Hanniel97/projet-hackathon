import { Alert } from "../models/alert.model.js";
import { Patient } from "../models/patient.model.js";
import { markAlertAsRead, resolverAlert, getAlertStatistics, getCriticalAlerts } from "../utils/alert.system.utils.js";
import mongoose from "mongoose";

export const getAlerts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 100,
            type,
            category,
            isRead,
            isResolved,
            patientId,
            priority
        } = req.query;

        // Construire le filtre
        let filter = {};

        // Les médecins voient seulement les alertes de leurs patients
        if (req.user.role !== 'admin') {
            const patientIds = await Patient.find({ assignedDoctor: req.user.userId })
                .select('_id')
                .then(patients => patients.map(p => p._id));
            filter.patient = { $in: patientIds };
        }

        // Filtres optionnels
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        if (isResolved !== undefined) filter.isResolved = isResolved === 'true';
        if (patientId) filter.patient = patientId;
        if (priority) filter.priority = priority;

        const alerts = await Alert.find(filter)
            .populate('patient', 'firstName lastName patientId ckdStage')
            .populate('consultation', 'consultationDate')
            .populate('resolvedBy', 'firstName lastName')
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Alert.countDocuments(filter);

        // Statistiques rapides
        const quickStats = await Alert.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$_id',
                    total: { $sum: 1 },
                    unread: { $sum: { $cond: ['$isRead', 0, 1] } },
                    unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } },
                    critical: { $sum: { $cond: [{ $eq: ['$type', 'critical'] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: alerts,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total,
            statistics: quickStats[0] || { total: 0, unread: 0, unresolved: 0, critical: 0 }
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getCriticalRecentAlerts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const criticalAlerts = await getCriticalAlerts(req.user.userId, parseInt(limit));

        res.status(200).json({
            success: true,
            alerts: criticalAlerts,
            count: criticalAlerts.length
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getDashboardAlert = async (req, res) => {
    try {
        const { period = 7 } = req.query; // Période en jours

        // Alertes récentes par type
        const recentAlerts = await Alert.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } }
                }
            }
        ]);

        // Alertes par catégorie
        const alertsByCategory = await Alert.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Évolution des alertes par jour
        const dailyTrend = await Alert.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        type: '$type'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Top 5 des patients avec le plus d'alertes
        const topPatientsWithAlerts = await Alert.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: '$patient',
                    alertCount: { $sum: 1 },
                    criticalCount: { $sum: { $cond: [{ $eq: ['$type', 'critical'] }, 1, 0] } }
                }
            },
            { $sort: { alertCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'patients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            { $unwind: '$patient' },
            {
                $project: {
                    patientId: '$patient.patientId',
                    fullName: { $concat: ['$patient.firstName', ' ', '$patient.lastName'] },
                    alertCount: 1,
                    criticalCount: 1
                }
            }
        ]);

        res.json({
            summary: {
                byType: recentAlerts,
                byCategory: alertsByCategory
            },
            trends: {
                daily: dailyTrend
            },
            topPatients: topPatientsWithAlerts
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate('patient', 'firstName lastName patientId ckdStage dateOfBirth')
            .populate('consultation', 'consultationDate clinicalData laboratoryResults')
            .populate('resolvedBy', 'firstName lastName');

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerte non trouvée'
            });
        }

        // Vérifier les droits d'accès
        const patient = await Patient.findById(alert.patient._id);
        if (req.user.role !== 'admin' && patient.assignedDoctor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const markAlertReaded = async (req, res) => {
    try {
        const alert = await markAlertAsRead(req.params.id, req.user.userId);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerte non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Alerte marquée comme lue',
            alert
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const resolveAlert = async (req, res) => {
    try {
        const { resolution } = req.body;

        if (!resolution || resolution.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Une note de résolution est requise'
            });
        }

        const alert = await resolverAlert(req.params.id, req.user.userId, resolution);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerte non trouvée'
            });
        }

        await alert.populate([
            { path: 'patient', select: 'firstName lastName patientId' },
            { path: 'resolvedBy', select: 'firstName lastName' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Alerte résolue avec succès',
            alert
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const markManyAlertReaded = async (req, res) => {
    try {
        const { alertIds } = req.body;

        if (!alertIds || !Array.isArray(alertIds)) {
            return res.status(400).json({
                success: false,
                message: 'Liste d\'IDs d\'alertes requise'
            });
        }

        // Vérifier que toutes les alertes appartiennent aux patients du médecin
        if (req.user.role !== 'admin') {
            const patientIds = await Patient.find({ assignedDoctor: req.user.userId })
                .select('_id')
                .then(patients => patients.map(p => p._id));

            const alertsToUpdate = await Alert.find({
                _id: { $in: alertIds },
                patient: { $in: patientIds }
            });

            if (alertsToUpdate.length !== alertIds.length) {
                return res.status(403).json({
                    success: false,
                    message: 'Certaines alertes ne vous sont pas accessibles'
                });
            }
        }

        const result = await Alert.updateMany(
            { _id: { $in: alertIds } },
            {
                isRead: true,
                readBy: req.user.userId,
                readAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} alertes marquées comme lues`,
            updated: result.modifiedCount
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getAlertsByPatient = async (req, res) => {
    try {
        const { limit = 20, type, isResolved } = req.query;

        // Vérifier l'accès au patient
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé'
            });
        }

        if (req.user.role !== 'admin' && patient.assignedDoctor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // Construire le filtre
        let filter = { patient: req.params.patientId };
        if (type) filter.type = type;
        if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

        const alerts = await Alert.find(filter)
            .populate('consultation', 'consultationDate')
            .populate('resolvedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Statistiques pour ce patient
        const patientStats = await Alert.aggregate([
            { $match: { patient: mongoose.Types.ObjectId(req.params.patientId) } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    resolved: { $sum: { $cond: ['$isResolved', 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: alerts,
            patient: {
                id: patient._id,
                fullName: patient.fullName,
                patientId: patient.patientId
            },
            statistics: patientStats
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getCriticalAndUnresolvedAlerts = async (req, res) => {
    try {
        const [criticalCount, unresolvedCount] = await Promise.all([
            Alert.countDocuments({ type: "critical" }),
            Alert.countDocuments({ isResolved: false })
        ]);

        res.status(200).json({
            success: true,
            data: {
                criticalCount,
                unresolvedCount
            }

        });
    } catch (error) {
        console.error("Erreur lors du calcul des alertes:", error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors du calcul des statistiques"
        });
    }
};

export const getAlertsGlobalStats = async (req, res) => {
    try {
        const { period = 30 } = req.query;
        const doctorId = mongoose.Types.ObjectId(req.user.userId);

        const statistics = await getAlertStatistics(doctorId, parseInt(period));

        // Tendances sur 7 jours (alertes créées récemment)
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyAlerts = await Alert.find({
            createdAt: { $gte: oneWeekAgo }
        });

        // Grouper par date (YYYY-MM-DD)
        const trendMap = {};
        weeklyAlerts.forEach(alert => {
            const day = alert.createdAt.toISOString().split('T')[0];
            trendMap[day] = (trendMap[day] || 0) + 1;
        });

        // Formater le tableau trié par date
        const weeklyTrend = Object.entries(trendMap)
            .map(([date, count]) => ({ _id: date, count }))
            .sort((a, b) => new Date(a._id) - new Date(b._id));

        const totalAlerts = statistics.reduce((sum, stat) => sum + stat.count, 0);
        const resolvedRate = statistics.reduce((sum, stat) => sum + stat.resolved, 0) / Math.max(totalAlerts, 1);

        res.status(200).json({
            success: true,
            periodStats: statistics,
            weeklyTrend,
            summary: {
                totalAlerts,
                resolvedRate
            }
        });
    } catch (error) {
        console.error("Erreur statistiques:", error);
        res.status(500).json({ success: false, error: error, message: error });
    }
};


// export const getAlertsGlobalStats = async (req, res) => {
//     try {
//         const { period = 30 } = req.query;

//         const statistics = await getAlertStatistics(mongoose.Types.ObjectId(req.user.userId), parseInt(period));

//         // Tendances des 7 derniers jours
//         const weeklyTrend = await Alert.aggregate([
//             {
//                 $match: {
//                     createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { _id: 1 } }
//         ]);

//         res.status(200).json({
//             success: true,
//             // periodStats: statistics,
//             weeklyTrend,
//             summary: {
//                 totalAlerts: statistics.reduce((sum, stat) => sum + stat.count, 0),
//                 resolvedRate: statistics.reduce((sum, stat) => sum + stat.resolved, 0) /
//                     Math.max(statistics.reduce((sum, stat) => sum + stat.count, 0), 1)
//             }
//         });
//     } catch (error) {
//         console.error("Erreur Stats alerts:", error);
//         res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
//     }
// };