import { Alert } from "../models/alert.model.js";
import { Consultation } from "../models/consultation.model.js";
import { Patient } from "../models/patient.model.js";

// Règles d'alertes définies selon les standards médicaux
export const ALERT_RULES = {
    // Alertes critiques - Situation d'urgence
    critical: {
        creatinine: {
            condition: (value, patient) => value > 4.0,
            title: 'Créatinine très élevée',
            message: 'Créatinine > 4.0 mg/dL - Risque d\'insuffisance rénale aiguë',
            category: 'laboratory'
        },
        gfr: {
            condition: (value) => value < 15,
            title: 'DFG critique',
            message: 'DFG < 15 mL/min/1.73m² - Stade 5 d\'IRC, dialyse urgente à considérer',
            category: 'laboratory'
        },
        potassium: {
            condition: (value) => value > 6.0 || value < 2.5,
            title: 'Potassium critique',
            message: 'Potassium dangereux - Risque d\'arythmie cardiaque',
            category: 'laboratory'
        },
        bloodPressure: {
            condition: (bp) => bp.systolic > 180 || bp.diastolic > 120,
            title: 'Hypertension sévère',
            message: 'TA > 180/120 mmHg - Crise hypertensive possible',
            category: 'clinical',
            getValue: (data) => ({ systolic: data.systolic, diastolic: data.diastolic })
        },
        hemoglobin: {
            condition: (value) => value < 7.0,
            title: 'Anémie sévère',
            message: 'Hémoglobine < 7.0 g/dL - Transfusion à considérer',
            category: 'laboratory'
        }
    },

    // Alertes d'avertissement - Surveillance rapprochée
    warning: {
        creatinine: {
            condition: (value, patient, previousValue) => {
                if (!previousValue) return value > 1.5;
                return (value - previousValue) / previousValue > 0.5; // Augmentation > 50%
            },
            title: 'Créatinine élevée',
            message: 'Augmentation significative de la créatinine - Surveillance nécessaire',
            category: 'laboratory'
        },
        gfr: {
            condition: (value, patient) => {
                const stage = getStageFromGFR(value);
                return stage > patient.ckdStage;
            },
            title: 'Dégradation de la fonction rénale',
            message: 'DFG indique une progression de l\'IRC',
            category: 'laboratory'
        },
        proteinuria: {
            condition: (value) => value > 0.5,
            title: 'Protéinurie significative',
            message: 'Protéinurie > 0.5 g/24h - Signe de lésion rénale',
            category: 'laboratory'
        },
        weightLoss: {
            condition: (weight, patient, previousWeight) => {
                if (!previousWeight) return false;
                const loss = previousWeight - weight;
                return loss > 5; // Perte > 5kg
            },
            title: 'Perte de poids importante',
            message: 'Perte de poids > 5kg - Malnutrition possible',
            category: 'clinical'
        },
        phosphorus: {
            condition: (value) => value > 5.5,
            title: 'Hyperphosphatémie',
            message: 'Phosphore > 5.5 mg/dL - Risque osseux et cardiovasculaire',
            category: 'laboratory'
        },
        calcium: {
            condition: (value) => value < 8.5 || value > 10.5,
            title: 'Trouble du métabolisme calcique',
            message: 'Calcium anormal - Surveillance des complications osseuses',
            category: 'laboratory'
        }
    },

    // Alertes d'information - Suivi de routine
    info: {
        bloodPressure: {
            condition: (bp) => bp.systolic > 140 || bp.diastolic > 90,
            title: 'Hypertension',
            message: 'TA > 140/90 mmHg - Ajustement thérapeutique à considérer',
            category: 'clinical',
            getValue: (data) => ({ systolic: data.systolic, diastolic: data.diastolic })
        },
        hemoglobin: {
            condition: (value, patient) => {
                if (patient.gender === 'M') return value < 13;
                return value < 12;
            },
            title: 'Anémie légère',
            message: 'Hémoglobine basse - Supplémentation en fer à évaluer',
            category: 'laboratory'
        },
        nextAppointment: {
            condition: (date) => {
                if (!date) return true;
                const daysDiff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
                return daysDiff > 90; // > 3 mois
            },
            title: 'Rendez-vous distant',
            message: 'Prochain RDV dans plus de 3 mois - Suivi rapproché recommandé',
            category: 'appointment'
        }
    }
};

// Fonction pour déterminer le stade CKD selon le DFG
function getStageFromGFR(gfr) {
    if (gfr >= 90) return 1;
    if (gfr >= 60) return 2;
    if (gfr >= 45) return 3;
    if (gfr >= 30) return 4;
    return 5;
}

// Fonction pour récupérer les valeurs précédentes d'un patient
async function getPreviousValues(patientId, currentConsultationId) {
    // const Consultation = require('../models/Consultation');

    const previousConsultation = await Consultation.findOne({
        patient: patientId,
        _id: { $ne: currentConsultationId }
    }).sort({ consultationDate: -1 });

    return previousConsultation || {};
}

// Fonction principale de vérification des alertes
export async function checkAlerts(consultation) {
    const triggeredAlerts = [];
    const patient = await Patient.findById(consultation.patient);

    if (!patient) return triggeredAlerts;

    // Récupérer les valeurs précédentes pour comparaison
    const previousConsultation = await getPreviousValues(consultation.patient, consultation._id);
    const previousClinical = previousConsultation.clinicalData || {};
    const previousLab = previousConsultation.laboratoryResults || {};

    // Vérifier chaque type d'alerte
    for (const [alertType, rules] of Object.entries(ALERT_RULES)) {
        for (const [parameter, rule] of Object.entries(rules)) {
            let currentValue;
            let previousValue;
            let shouldTrigger = false;

            try {
                // Extraire les valeurs selon le paramètre
                switch (parameter) {
                    case 'creatinine':
                    case 'urea':
                    case 'gfr':
                    case 'proteinuria':
                    case 'hemoglobin':
                    case 'phosphorus':
                    case 'calcium':
                    case 'potassium':
                    case 'sodium':
                        currentValue = consultation.laboratoryResults?.[parameter];
                        previousValue = previousLab[parameter];
                        break;

                    case 'weight':
                    case 'heartRate':
                    case 'temperature':
                        currentValue = consultation.clinicalData?.[parameter];
                        previousValue = previousClinical[parameter];
                        break;

                    case 'weightLoss':
                        currentValue = consultation.clinicalData?.weight;
                        previousValue = previousClinical.weight;
                        break;

                    case 'bloodPressure':
                        currentValue = consultation.clinicalData?.bloodPressure;
                        previousValue = previousClinical.bloodPressure;
                        break;

                    case 'nextAppointment':
                        currentValue = consultation.nextAppointment;
                        break;
                }

                // Ignorer si pas de valeur courante
                if (currentValue === null || currentValue === undefined) continue;

                // Évaluer la condition
                if (parameter === 'weightLoss') {
                    shouldTrigger = rule.condition(currentValue, patient, previousValue);
                } else if (parameter === 'bloodPressure') {
                    shouldTrigger = rule.condition(currentValue);
                } else {
                    shouldTrigger = rule.condition(currentValue, patient, previousValue);
                }

                // Créer l'alerte si nécessaire
                if (shouldTrigger) {
                    const alert = new Alert({
                        patient: consultation.patient,
                        consultation: consultation._id,
                        type: alertType,
                        category: rule.category,
                        title: rule.title,
                        message: rule.message,
                        value: {
                            current: rule.getValue ? rule.getValue(currentValue) : currentValue,
                            normal: getNormalRange(parameter, patient),
                            unit: getUnit(parameter)
                        },
                        priority: getPriority(alertType)
                    });

                    await alert.save();
                    triggeredAlerts.push(alert);
                }

            } catch (error) {
                console.error(`Erreur lors de la vérification de l'alerte ${parameter}:`, error);
            }
        }
    }

    return triggeredAlerts;
}

// Fonction pour obtenir les valeurs normales
function getNormalRange(parameter, patient) {
    const ranges = {
        creatinine: patient.gender === 'M' ? '0.7-1.3 mg/dL' : '0.6-1.1 mg/dL',
        urea: '7-20 mg/dL',
        gfr: '> 60 mL/min/1.73m²',
        proteinuria: '< 0.15 g/24h',
        hemoglobin: patient.gender === 'M' ? '13.5-17.5 g/dL' : '12-16 g/dL',
        phosphorus: '2.5-4.5 mg/dL',
        calcium: '8.5-10.5 mg/dL',
        potassium: '3.5-5.0 mEq/L',
        sodium: '136-145 mEq/L',
        weight: 'Stable',
        bloodPressure: '< 140/90 mmHg',
        heartRate: '60-100 bpm',
        temperature: '36.1-37.2°C'
    };

    return ranges[parameter] || 'Variable';
}

// Fonction pour obtenir l'unité
function getUnit(parameter) {
    const units = {
        creatinine: 'mg/dL',
        urea: 'mg/dL',
        gfr: 'mL/min/1.73m²',
        proteinuria: 'g/24h',
        hemoglobin: 'g/dL',
        phosphorus: 'mg/dL',
        calcium: 'mg/dL',
        potassium: 'mEq/L',
        sodium: 'mEq/L',
        weight: 'kg',
        bloodPressure: 'mmHg',
        heartRate: 'bpm',
        temperature: '°C'
    };

    return units[parameter] || '';
}

// Fonction pour obtenir la priorité
function getPriority(alertType) {
    const priorities = {
        critical: 5,
        warning: 3,
        info: 1
    };

    return priorities[alertType] || 3;
}

// Fonction pour marquer une alerte comme lue
export async function markAlertAsRead(alertId, userId) {
    try {
        const alert = await Alert.findByIdAndUpdate(
            alertId,
            { isRead: true, readBy: userId, readAt: new Date() },
            { new: true }
        );
        return alert;
    } catch (error) {
        console.error('Erreur marquage alerte comme lue:', error);
        throw error;
    }
}

// Fonction pour résoudre une alerte
export async function resolverAlert(alertId, userId, resolution) {
    try {
        const alert = await Alert.findByIdAndUpdate(
            alertId,
            {
                isResolved: true,
                resolvedBy: userId,
                resolvedAt: new Date(),
                resolution: resolution
            },
            { new: true }
        );
        return alert;
    } catch (error) {
        console.error('Erreur résolution alerte:', error);
        throw error;
    }
}

// Fonction pour obtenir les alertes critiques récentes
export async function getCriticalAlerts(doctorId, limit = 10) {
    try {
        // const Patient = require('../models/Patient');

        // Trouver les patients du médecin
        const patientIds = await Patient.find({ assignedDoctor: doctorId })
            .select('_id')
            .then(patients => patients.map(p => p._id));

        const alerts = await Alert.find({
            patient: { $in: patientIds },
            type: 'critical',
            isResolved: false
        })
            .populate('patient', 'firstName lastName patientId')
            .populate('consultation', 'consultationDate')
            .sort({ createdAt: -1 })
            .limit(limit);

        return alerts;
    } catch (error) {
        console.error('Erreur récupération alertes critiques:', error);
        throw error;
    }
}

// Fonction pour obtenir les statistiques d'alertes
// export async function getAlertStatistics(doctorId, period = 30) {
//     try {
//         const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
//         // const Patient = require('../models/Patient');

//         // Trouver les patients du médecin
//         const patientIds = await Patient.find({ assignedDoctor: doctorId })
//             .select('_id')
//             .then(patients => patients.map(p => p._id));

//         const stats = await Alert.aggregate([
//             {
//                 $match: {
//                     patient: { $in: patientIds },
//                     createdAt: { $gte: startDate }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$type',
//                     count: { $sum: 1 },
//                     resolved: { $sum: { $cond: ['$isResolved', 1, 0] } },
//                     unresolved: { $sum: { $cond: ['$isResolved', 0, 1] } }
//                 }
//             }
//         ]);

//         return stats;
//     } catch (error) {
//         console.error('Erreur statistiques alertes:', error);
//         throw error;
//     }
// }

export async function getAlertStatistics(doctorId, period = 30) {
    try {
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

        // Récupérer les IDs des patients du médecin
        const patientIds = await Patient.find({ assignedDoctor: doctorId })
            .select('_id')
            .then(patients => patients.map(p => p._id));

        // Récupérer toutes les alertes concernées
        const alerts = await Alert.find({
            patient: { $in: patientIds },
            createdAt: { $gte: startDate }
        });

        // Regrouper les stats manuellement
        const statsMap = {};

        alerts.forEach(alert => {
            const type = alert.type;
            if (!statsMap[type]) {
                statsMap[type] = {
                    _id: type,
                    count: 0,
                    resolved: 0,
                    unresolved: 0
                };
            }
            statsMap[type].count += 1;
            if (alert.isResolved) {
                statsMap[type].resolved += 1;
            } else {
                statsMap[type].unresolved += 1;
            }
        });

        // Retourner sous forme de tableau
        return Object.values(statsMap);
    } catch (error) {
        console.error('Erreur statistiques alertes:', error);
        throw error;
    }
}
