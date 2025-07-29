import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
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
    role: {
        type: String,
        enum: ['doctor', 'nurse', 'admin'],
        default: 'doctor'
    },
    speciality: {
        type: String,
        default: 'Néphrologie'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash du password avant sauvegarde
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode pour comparer les passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id, role: this.role, }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

userSchema.methods.getJWTRefreshToken = function() {
    return jwt.sign({_id: this._id, role: this.role,},  process.env.JWT_SECRET, {
        expiresIn: process.env.REFRESH_JWT_EXPIRES,
    })
};

userSchema.set('toJSON', {
    virtuals: true
});

export const User = mongoose.model("User", userSchema);