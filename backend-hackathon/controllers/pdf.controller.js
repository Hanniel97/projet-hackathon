import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import moment from "moment";
import { Patient } from "../models/patient.model.js";
import { Consultation } from "../models/consultation.model.js";
import { Alert } from "../models/alert.model.js";
import { pdfTemplate } from "../utils/pdtTemplate.js"

// Helpers Handlebars
Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});

Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
});

export const generatePDF = async (req, res) => {
    let browser;

    try {
        const { limit = 10, includeResolved = false } = req.query;

        // Récupérer les données du patient
        const patient = await Patient.findById(req.params.patientId)
            .populate('assignedDoctor', 'firstName lastName speciality');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé'
            });
        }

        // Récupérer les consultations récentes
        const consultations = await Consultation.find({ patient: patient._id })
            .populate('doctor', 'firstName lastName speciality')
            .populate('alertsTriggered')
            .sort({ consultationDate: -1 })
            .limit(parseInt(limit));

        // Récupérer les alertes actives
        const alertFilter = {
            patient: patient._id,
            ...(includeResolved === 'false' ? { isResolved: false } : {})
        };

        const alerts = await Alert.find(alertFilter)
            .sort({ createdAt: -1 })
            .limit(20);

        // Calculer les statistiques
        const totalConsultations = await Consultation.countDocuments({ patient: patient._id });
        const totalAlerts = await Alert.countDocuments({ patient: patient._id });
        const criticalAlerts = await Alert.countDocuments({
            patient: patient._id,
            type: 'critical'
        });
        const unresolvedAlerts = await Alert.countDocuments({
            patient: patient._id,
            isResolved: false
        });

        // Préparer les données pour le template
        const templateData = {
            patient: {
                ...patient.toObject(),
                fullName: patient.fullName,
                age: patient.age,
                formattedBirthDate: moment(patient.dateOfBirth).format('DD/MM/YYYY'),
                genderLabel: patient.gender === 'M' ? 'Masculin' : 'Féminin'
            },
            consultations: consultations.map(consultation => ({
                ...consultation.toObject(),
                formattedDate: moment(consultation.consultationDate).format('DD/MM/YYYY à HH:mm')
            })),
            activeAlerts: alerts.map(alert => ({
                ...alert.toObject(),
                formattedDate: moment(alert.createdAt).format('DD/MM/YYYY à HH:mm')
            })),
            statistics: {
                totalConsultations,
                totalAlerts,
                criticalAlerts,
                unresolvedAlerts
            },
            doctor: patient.assignedDoctor?.toObject?.(), // ✅ corrigé ici
            generationDate: moment().format('DD/MM/YYYY à HH:mm'),
            hasConditions: patient.medicalHistory.diabetes ||
                patient.medicalHistory.hypertension ||
                patient.medicalHistory.cardiovascularDisease ||
                patient.medicalHistory.familyHistoryKidneyDisease
        };

        // Compiler le template
        const template = Handlebars.compile(pdfTemplate);
        const html = template(templateData);

        // Générer le PDF avec Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                            <span>Kidney Health - Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
                        </div>
                    `
        });

        await browser.close();

        // Définir les headers pour le téléchargement
        const filename = `dossier_${patient.patientId}_${moment().format('YYYY-MM-DD')}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const previewPDF = async (req, res) => {
    try {
        // Cette route est utile pour le développement/debug
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                message: 'Prévisualisation disponible uniquement en développement'
            });
        }

        const { limit = 10 } = req.query;

        const patient = await Patient.findById(req.params.patientId)
            .populate('assignedDoctor', 'firstName lastName speciality');

        const consultations = await Consultation.find({ patient: patient._id })
            .populate('doctor', 'firstName lastName speciality')
            .populate('alertsTriggered')
            .sort({ consultationDate: -1 })
            .limit(parseInt(limit));

        const alerts = await Alert.find({
            patient: patient._id,
            isResolved: false
        }).sort({ createdAt: -1 });

        const templateData = {
            patient: {
                ...patient.toObject(),
                fullName: patient.fullName,
                age: patient.age,
                formattedBirthDate: moment(patient.dateOfBirth).format('DD/MM/YYYY'),
                genderLabel: patient.gender === 'M' ? 'Masculin' : 'Féminin'
            },
            consultations: consultations.map(consultation => ({
                ...consultation.toObject(),
                formattedDate: moment(consultation.consultationDate).format('DD/MM/YYYY à HH:mm')
            })),
            activeAlerts: alerts.map(alert => ({
                ...alert.toObject(),
                formattedDate: moment(alert.createdAt).format('DD/MM/YYYY à HH:mm')
            })),
            doctor: patient.assignedDoctor,
            generationDate: moment().format('DD/MM/YYYY à HH:mm')
        };

        const template = Handlebars.compile(pdfTemplate);
        const html = template(templateData);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};