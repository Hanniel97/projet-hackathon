import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['M', 'F'],
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        zipCode: String,
        country: { type: String, default: 'Bénin' }
    },
    medicalHistory: {
        diabetes: { type: Boolean, default: false },
        hypertension: { type: Boolean, default: false },
        cardiovascularDisease: { type: Boolean, default: false },
        familyHistoryKidneyDisease: { type: Boolean, default: false },
        allergies: [String],
        currentMedications: [String],
        otherConditions: [String]
    },
    ckdStage: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: String
}, {
    timestamps: true
});

// Virtual pour l'âge
patientSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;

    return Math.floor(
        (Date.now() - new Date(this.dateOfBirth).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );
});

// patientSchema.virtual('age').get(function () {
//     if (!this.dateOfBirth) return null;

//     const today = new Date();
//     const dob = new Date(this.dateOfBirth);

//     let age = today.getFullYear() - dob.getFullYear();
//     const monthDiff = today.getMonth() - dob.getMonth();

//     if (
//         monthDiff < 0 ||
//         (monthDiff === 0 && today.getDate() < dob.getDate())
//     ) {
//         age--;
//     }

//     return age;
// });

// Virtual pour le nom complet
patientSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

patientSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

patientSchema.set('toJSON', {
    virtuals: true
});

export const Patient = mongoose.model("Patient", patientSchema);