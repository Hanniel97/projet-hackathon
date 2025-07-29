import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    consultationDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    clinicalData: {
        weight: { type: Number, min: 0 }, // kg
        height: { type: Number, min: 0 }, // cm
        bloodPressure: {
            systolic: { type: Number, min: 0, max: 300 },
            diastolic: { type: Number, min: 0, max: 200 }
        },
        heartRate: { type: Number, min: 0, max: 250 }, // bpm
        temperature: { type: Number, min: 30, max: 45 }, // °C
    },
    laboratoryResults: {
        creatinine: { type: Number, min: 0 }, // mg/dL
        urea: { type: Number, min: 0 }, // mg/dL
        gfr: { type: Number, min: 0 }, // mL/min/1.73m²
        proteinuria: { type: Number, min: 0 }, // g/24h
        hemoglobin: { type: Number, min: 0 }, // g/dL
        phosphorus: { type: Number, min: 0 }, // mg/dL
        calcium: { type: Number, min: 0 }, // mg/dL
        potassium: { type: Number, min: 0 }, // mEq/L
        sodium: { type: Number, min: 0 } // mEq/L
    },
    symptoms: [String],
    diagnosis: String,
    treatment: {
        medications: [String],
        dosages: [String],
        recommendations: [String]
    },
    nextAppointment: Date,
    notes: String,
    alertsTriggered: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert'
    }]
}, {
    timestamps: true
});

// Index pour améliorer les performances
consultationSchema.index({ patient: 1, consultationDate: -1 });
consultationSchema.index({ doctor: 1, consultationDate: -1 });

consultationSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

consultationSchema.set('toJSON', {
    virtuals: true
});

export const Consultation = mongoose.model("Consultation", consultationSchema);