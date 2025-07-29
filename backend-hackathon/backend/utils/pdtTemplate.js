// Template HTML pour le PDF
export const pdfTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dossier Patient - {{patient.fullName}}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        
        .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .patient-info h2 {
            margin-top: 0;
            color: #1e40af;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #ddd;
        }
        
        .info-label {
            font-weight: bold;
            color: #374151;
        }
        
        .info-value {
            color: #6b7280;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section h3 {
            color: #1e40af;
            border-left: 4px solid #2563eb;
            padding-left: 15px;
            margin-bottom: 20px;
        }
        
        .medical-history {
            background: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
        }
        
        .medical-history ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .consultation {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background: white;
        }
        
        .consultation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .consultation-date {
            font-weight: bold;
            color: #1e40af;
            font-size: 16px;
        }
        
        .consultation-doctor {
            color: #6b7280;
            font-style: italic;
        }
        
        .clinical-data {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        
        .data-group {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
        }
        
        .data-group h5 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 14px;
            font-weight: bold;
        }
        
        .data-item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 13px;
        }
        
        .alerts-section {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .alert {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid;
        }
        
        .alert.critical {
            background: #fef2f2;
            border-left-color: #dc2626;
            color: #991b1b;
        }
        
        .alert.warning {
            background: #fffbeb;
            border-left-color: #f59e0b;
            color: #92400e;
        }
        
        .alert.info {
            background: #eff6ff;
            border-left-color: #3b82f6;
            color: #1e40af;
        }
        
        .alert-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .alert-message {
            font-size: 13px;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-card {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
        }
        
        .stat-label {
            font-size: 12px;
            color: #64748b;
            margin-top: 5px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background: #f8fafc;
            font-weight: bold;
            color: #374151;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .no-data {
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            padding: 20px;
        }
        
        @media print {
            body { margin: 0; }
            .page-break { page-break-after: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">AI4CKD - Suivi Maladie Rénale Chronique</div>
        <div class="subtitle">Dossier médical généré le {{generationDate}}</div>
    </div>

    <div class="patient-info">
        <h2>Informations Patient</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">ID Patient:</span>
                <span class="info-value">{{patient.patientId}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Nom complet:</span>
                <span class="info-value">{{patient.fullName}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Date de naissance:</span>
                <span class="info-value">{{patient.formattedBirthDate}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Âge:</span>
                <span class="info-value">{{patient.age}} ans</span>
            </div>
            <div class="info-item">
                <span class="info-label">Sexe:</span>
                <span class="info-value">{{patient.genderLabel}}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Stade IRC:</span>
                <span class="info-value">Stade {{patient.ckdStage}}</span>
            </div>
            {{#if patient.phone}}
            <div class="info-item">
                <span class="info-label">Téléphone:</span>
                <span class="info-value">{{patient.phone}}</span>
            </div>
            {{/if}}
            {{#if patient.email}}
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">{{patient.email}}</span>
            </div>
            {{/if}}
        </div>
        
        {{#if patient.address}}
        <div style="margin-top: 15px;">
            <span class="info-label">Adresse:</span>
            <div class="info-value" style="margin-top: 5px;">
                {{#if patient.address.street}}{{patient.address.street}}<br>{{/if}}
                {{#if patient.address.city}}{{patient.address.city}}{{/if}}
                {{#if patient.address.zipCode}} {{patient.address.zipCode}}{{/if}}
                {{#if patient.address.country}}<br>{{patient.address.country}}{{/if}}
            </div>
        </div>
        {{/if}}
    </div>

    <div class="section">
        <h3>Antécédents Médicaux</h3>
        <div class="medical-history">
            <strong>Conditions existantes:</strong>
            <ul>
                {{#if patient.medicalHistory.diabetes}}<li>Diabète</li>{{/if}}
                {{#if patient.medicalHistory.hypertension}}<li>Hypertension artérielle</li>{{/if}}
                {{#if patient.medicalHistory.cardiovascularDisease}}<li>Maladie cardiovasculaire</li>{{/if}}
                {{#if patient.medicalHistory.familyHistoryKidneyDisease}}<li>Antécédents familiaux de maladie rénale</li>{{/if}}
                {{#unless hasConditions}}<li>Aucune condition particulière signalée</li>{{/unless}}
            </ul>
            
            {{#if patient.medicalHistory.allergies.length}}
            <strong>Allergies:</strong>
            <ul>
                {{#each patient.medicalHistory.allergies}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
            {{/if}}
            
            {{#if patient.medicalHistory.currentMedications.length}}
            <strong>Médicaments actuels:</strong>
            <ul>
                {{#each patient.medicalHistory.currentMedications}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
            {{/if}}
            
            {{#if patient.medicalHistory.otherConditions.length}}
            <strong>Autres conditions:</strong>
            <ul>
                {{#each patient.medicalHistory.otherConditions}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
            {{/if}}
        </div>
    </div>

    <div class="section">
        <h3>Résumé Statistiques</h3>
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">{{statistics.totalConsultations}}</div>
                <div class="stat-label">Consultations</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{statistics.totalAlerts}}</div>
                <div class="stat-label">Alertes générées</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{statistics.criticalAlerts}}</div>
                <div class="stat-label">Alertes critiques</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{statistics.unresolvedAlerts}}</div>
                <div class="stat-label">Alertes non résolues</div>
            </div>
        </div>
    </div>

    {{#if consultations.length}}
    <div class="section">
        <h3>Historique des Consultations ({{consultations.length}} dernières)</h3>
        
        {{#each consultations}}
        <div class="consultation">
            <div class="consultation-header">
                <div class="consultation-date">{{this.formattedDate}}</div>
                <div class="consultation-doctor">Dr. {{this.doctor.firstName}} {{this.doctor.lastName}}</div>
            </div>
            
            {{#if this.clinicalData}}
            <div class="clinical-data">
                <div class="data-group">
                    <h5>Données Cliniques</h5>
                    {{#if this.clinicalData.weight}}
                    <div class="data-item">
                        <span>Poids:</span>
                        <span>{{this.clinicalData.weight}} kg</span>
                    </div>
                    {{/if}}
                    {{#if this.clinicalData.height}}
                    <div class="data-item">
                        <span>Taille:</span>
                        <span>{{this.clinicalData.height}} cm</span>
                    </div>
                    {{/if}}
                    {{#if this.clinicalData.bloodPressure}}
                    <div class="data-item">
                        <span>TA:</span>
                        <span>{{this.clinicalData.bloodPressure.systolic}}/{{this.clinicalData.bloodPressure.diastolic}} mmHg</span>
                    </div>
                    {{/if}}
                    {{#if this.clinicalData.heartRate}}
                    <div class="data-item">
                        <span>FC:</span>
                        <span>{{this.clinicalData.heartRate}} bpm</span>
                    </div>
                    {{/if}}
                </div>
                
                {{#if this.laboratoryResults}}
                <div class="data-group">
                    <h5>Résultats Laboratoire</h5>
                    {{#if this.laboratoryResults.creatinine}}
                    <div class="data-item">
                        <span>Créatinine:</span>
                        <span>{{this.laboratoryResults.creatinine}} mg/dL</span>
                    </div>
                    {{/if}}
                    {{#if this.laboratoryResults.gfr}}
                    <div class="data-item">
                        <span>DFG:</span>
                        <span>{{this.laboratoryResults.gfr}} mL/min/1.73m²</span>
                    </div>
                    {{/if}}
                    {{#if this.laboratoryResults.proteinuria}}
                    <div class="data-item">
                        <span>Protéinurie:</span>
                        <span>{{this.laboratoryResults.proteinuria}} g/24h</span>
                    </div>
                    {{/if}}
                    {{#if this.laboratoryResults.hemoglobin}}
                    <div class="data-item">
                        <span>Hémoglobine:</span>
                        <span>{{this.laboratoryResults.hemoglobin}} g/dL</span>
                    </div>
                    {{/if}}
                </div>
                {{/if}}
            </div>
            {{/if}}
            
            {{#if this.symptoms.length}}
            <div style="margin: 15px 0;">
                <strong>Symptômes:</strong> {{#each this.symptoms}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
            </div>
            {{/if}}
            
            {{#if this.diagnosis}}
            <div style="margin: 15px 0;">
                <strong>Diagnostic:</strong> {{this.diagnosis}}
            </div>
            {{/if}}
            
            {{#if this.notes}}
            <div style="margin: 15px 0;">
                <strong>Notes:</strong> {{this.notes}}
            </div>
            {{/if}}
            
            {{#if this.alertsTriggered.length}}
            <div class="alerts-section">
                <strong>Alertes générées lors de cette consultation:</strong>
                {{#each this.alertsTriggered}}
                <div class="alert {{this.type}}">
                    <div class="alert-title">{{this.title}}</div>
                    <div class="alert-message">{{this.message}}</div>
                </div>
                {{/each}}
            </div>
            {{/if}}
        </div>
        {{/each}}
    </div>
    {{else}}
    <div class="section">
        <h3>Historique des Consultations</h3>
        <div class="no-data">Aucune consultation enregistrée</div>
    </div>
    {{/if}}

    {{#if activeAlerts.length}}
    <div class="page-break"></div>
    <div class="section">
        <h3>Alertes Actives Non Résolues</h3>
        {{#each activeAlerts}}
        <div class="alert {{this.type}}">
            <div class="alert-title">{{this.title}}</div>
            <div class="alert-message">{{this.message}}</div>
            <div style="font-size: 11px; margin-top: 8px; color: #6b7280;">
                Générée le {{this.formattedDate}} - Priorité: {{this.priority}}/5
            </div>
        </div>
        {{/each}}
    </div>
    {{/if}}

    <div class="footer">
        <p>Dossier généré par AI4CKD - Système de gestion des patients avec maladie rénale chronique</p>
        <p>Médecin responsable: Dr. {{doctor.firstName}} {{doctor.lastName}} ({{doctor.speciality}})</p>
        <p>Date de génération: {{generationDate}} - Document confidentiel</p>
    </div>
</body>
</html>
`;