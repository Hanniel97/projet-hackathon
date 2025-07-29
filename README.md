# projet-hackathon

# Nom: EKPELIKPEZE
# Prénom: Hanniel Ephraïm K.
# Filière: Génie Logiciel
# Matricule: 17294418

## 🎯 Description

Ceci est un projet réaliser dans le cadre des activités universitaire pour validation de note.
Le projet consiste à créer une plateforme de gestion des patients atteints de maladie rénale chronique (MRC). Ce projet intègre l'authentification, la gestion des patients, consultations, système d'alertes intelligentes et génération de PDF

## 🚀 Fonctionnalités Principales

### ✅ Authentification et Autorisation

- Inscription/Connexion des utilisateurs (médecins, infirmiers, admin)
- Authentification JWT sécurisée
- Middleware de protection des routes

### 👥 Gestion des Patients

- Ajout de patient
- Ajout des données de consultation d'un client
- Optention du rapport PDF

### 🏥 Consultations Médicales

- Enregistrement des consultations
- Données cliniques et laboratoire
- Suivi des symptômes et traitements
- Historique complet des consultations

### 🚨 Système d'Alertes Intelligent

- **Alertes Critiques**: Situations d'urgence (créatinine > 4.0, DFG < 15, etc.)
- **Alertes d'Avertissement**: Surveillance rapprochée nécessaire
- **Alertes d'Information**: Suivi de routine
- Règles médicales automatisées
- Gestion du statut des alertes (lu/non lu, résolu/non résolu)

### 📄 Génération PDF

- Export complet du dossier patient
- Template professionnel avec CSS
- Informations patients, consultations, alertes
- Statistiques et résumés médicaux

## 🛠️ Technologies Utilisées

- **Backend**: Node.js, Express.js
- **Base de données**: MongoDB + Mongoose
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: Joi
- **PDF**: Puppeteer + Handlebars
- **Sécurité**: Helmet, bcryptjs, CORS, rate limiting
- **Dates**: Moment.js

## 📦 Installation backend

### Prérequis

- Node.js (version 16+)
- MongoDB (local ou Atlas)
- Git

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone https://github.com/Hanniel97/projet-hackathon.git
cd projet-hackathon/backend-hackathon
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration environnement**

```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Variables d'environnement requises**

```env
PORT=5000
DB_USER_PASS=<Votre mot de passe>
JWT_EXPIRE = 4d
REFRESH_JWT_EXPIRES=30d
JWT_SECRET=1234560987654321074125830de789654123ze7489654123s03218796452fg7458941547gd84z7748946319vhezh566d75z67858sdq8sve65qd48s62s4d5e8qs48cs56dv458e4fd8
```

5. **Démarrer MongoDB**

```bash
# Si MongoDB local
mongod

# Ou utiliser MongoDB Atlas (cloud)
```

6. **Lancer le serveur**

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 📁 Structure du Projet Backend

```
backend-hackathon/
├── models/                 # Modèles Mongoose
│   ├── user.model.js            # Utilisateurs (médecins, admins)
│   ├── patient.model.js         # Patients
│   ├── consultation.model.js    # Consultations médicales
│   └── alert.model.js          # Alertes système
├── controllers/                # Controller API
│   ├── user.controller.js           # Authentification
│   ├── patient.controlle.js       # Gestion patients
│   ├── consultation.controller.js  # Consultations
│   ├── alert.controller.js         # Alertes
│   └── pdf.controller.js           # Génération PDF
├── routes/                # Routes API
│   ├── user.routes.js           # Authentification
│   ├── patient.routes.js       # Gestion patients
│   ├── consultation.routes.js  # Consultations
│   ├── alert.routes.js         # Alertes
│   └── pdf.routes.js           # Génération PDF
├── middleware/            # Middlewares
│   └── auth.middleware.js          # Authentification & autorisation
├── utils/                # Utilitaires
│   └── alertSystem.utils.js   # Système d'alertes intelligent
|   └── pdfTemplate.js           # Template PDF
├── app.js            # Point d'entrée
└── package.json
```

## 🚨 Système d'Alertes

Le système d'alertes surveille automatiquement les paramètres critiques :

### Alertes Critiques (Priorité 5)
- **Créatinine > 4.0 mg/dL** - Insuffisance rénale aiguë
- **DFG < 15 mL/min/1.73m²** - Stade 5 IRC, dialyse urgente
- **Potassium > 6.0 ou < 2.5 mEq/L** - Risque d'arythmie
- **TA > 180/120 mmHg** - Crise hypertensive
- **Hémoglobine < 7.0 g/dL** - Anémie sévère

### Alertes d'Avertissement (Priorité 3-4)
- Augmentation de créatinine > 50%
- Dégradation du DFG
- Protéinurie > 0.5 g/24h
- Perte de poids > 5kg
- Troubles électrolytiques

### Alertes d'Information (Priorité 1-2)
- Hypertension modérée
- Anémie légère
- Rendez-vous distant (> 3 mois)

